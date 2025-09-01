// pages/dashboard/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../../services/api.js';
import EmptyState from '../../components/EmptyState.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const SORT_FIELD_KEY = 'dashboard.contacts.sortField';
const SORT_ORDER_KEY = 'dashboard.contacts.sortOrder';
const VALID_FIELDS = new Set(['firstName', 'lastName']);
const VALID_ORDERS = new Set(['asc', 'desc']);

const readPersisted = (key, fallback, validSet) => {
  const v = localStorage.getItem(key);
  return v && validSet?.has(v) ? v : (v ?? fallback);
};

const Dashboard = () => {
  const { token } = useAuth();
  const [me, setMe] = useState(null);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Persisted sort state (lazy init from localStorage)
  const [sortField, setSortField] = useState(() =>
    readPersisted(SORT_FIELD_KEY, 'firstName', VALID_FIELDS)
  );
  const [sortOrder, setSortOrder] = useState(() =>
    readPersisted(SORT_ORDER_KEY, 'asc', VALID_ORDERS)
  );

  // Gate: if no token, redirect to sign-in
  if (!token && !localStorage.getItem('token')) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [{ data: meRes }, { data: groupsRes }, { data: contactsRes }] = await Promise.all([
          api.get('/users/me?include=counts'),
          api.get('/groups'),
          api.get('/contacts'),
        ]);

        if (!isMounted) return;

        setMe(meRes?.user || null);
        setGroups(Array.isArray(groupsRes) ? groupsRes : []);
        setContacts(Array.isArray(contactsRes) ? contactsRes : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Persist changes
  useEffect(() => {
    if (VALID_FIELDS.has(sortField)) localStorage.setItem(SORT_FIELD_KEY, sortField);
    if (VALID_ORDERS.has(sortOrder)) localStorage.setItem(SORT_ORDER_KEY, sortOrder);
  }, [sortField, sortOrder]);

  // derive sorted contacts with useMemo
  const sortedContacts = useMemo(() => {
    const field = VALID_FIELDS.has(sortField) ? sortField : 'firstName';
    const order = sortOrder === 'desc' ? -1 : 1;
    return [...contacts].sort((a, b) => {
      const aVal = (a?.[field] || '').toString().toLowerCase();
      const bVal = (b?.[field] || '').toString().toLowerCase();
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }, [contacts, sortField, sortOrder]);

  if (loading) {
    return (
      <section className="container">
        <p>Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container">
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section className="container">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <h1>Welcome{me?.username ? `, ${me.username}` : ''}</h1>
        <span className="badge">{new Date().toLocaleDateString()}</span>
      </header>

      <div className="grid two">
        {/* Groups panel */}
        <section>
          <SectionHeader
            title="Your Groups"
            right={<Link className="btn btn-primary" to="/groups/new">New Group</Link>}
          />
          {groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              action={<Link className="btn btn-primary" to="/groups/new">Create your first group</Link>}
              icon="👥"
            >
              Organise contacts into cohorts like Friends, Business, Sport…
            </EmptyState>
          ) : (
            <div
              className="grid"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))' }}
            >
              {groups.map((g) => (
                <div
                  key={g._id}
                  className="card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + badge side by side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{g.name}</h3>
                      <span className="badge">{g.type}</span>
                    </div>

                    {/* ✅ Only show description if present */}
                    {g.description && (
                      <p
                        className="muted"
                        style={{
                          marginTop: '.3rem',
                          marginBottom: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '40ch',
                        }}
                      >
                        {g.description}
                      </p>
                    )}
                  </div>
                  <Link className="btn" to={`/groups/${g._id}`}>View</Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contacts panel */}
        <section>
          <SectionHeader
            title="Your Contacts"
            right={<Link className="btn btn-primary" to="/contacts/new">New Contact</Link>}
          />

          {/* sort controls */}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                Sort by{' '}
                <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                </select>
              </label>
              <label>
                Order{' '}
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
              <button
                className="btn"
                onClick={() => {
                  setSortField('firstName');
                  setSortOrder('asc');
                }}
                title="Reset sort"
              >
                Reset
              </button>
            </div>
          )}

          {contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              action={<Link className="btn btn-primary" to="/contacts/new">Add a contact</Link>}
              icon="📇"
            >
              Save people you want to keep in touch with.
            </EmptyState>
          ) : (
            <div
              className="grid"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))' }}
            >
              {sortedContacts.map((c) => (
                <div
                  key={c._id}
                  className="card contact-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed'}
                  </h3>
                  <Link className="btn" to={`/contacts/${c._id}`}>View</Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default Dashboard;
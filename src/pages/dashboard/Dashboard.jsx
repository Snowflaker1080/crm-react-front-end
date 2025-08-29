import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import EmptyState from '../../components/EmptyState.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [{ data: meRes }, { data: groupsRes }, { data: contactsRes }] = await Promise.all([
          api.get('/users/me?include=counts'),
          api.get('/groups'),
          api.get('/contacts'),
        ]);
        setMe(meRes?.user || null);
        setGroups(Array.isArray(groupsRes) ? groupsRes : []);
        setContacts(Array.isArray(contactsRes) ? contactsRes : []);
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load dashboard');
      }
    })();
  }, []);

  if (error) return <section className="container"><p role="alert">{error}</p></section>;

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
                <div key={g._id} className="card">
                  <h3 style={{ marginTop: 0 }}>{g.name}</h3>
                  <span className="badge">{g.type}</span>
                  <p className="muted" style={{ marginTop: '.5rem' }}>
                    Open to view members
                  </p>
                  <Link className="btn" to={`/groups/${g._id}`} style={{ marginTop: '.6rem' }}>
                    View
                  </Link>
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
              {contacts.map((c) => (
                <div key={c._id} className="card">
                  <h3 style={{ marginTop: 0 }}>
                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed'}
                  </h3>
                  {c.email && <p className="muted">{c.email}</p>}
                  <Link className="btn" to={`/contacts/${c._id}`} style={{ marginTop: '.6rem' }}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
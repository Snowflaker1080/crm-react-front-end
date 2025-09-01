// src/pages/contacts/ContactProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import ContactForm from '../../components/forms/ContactForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const ContactProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [{ data: c }, { data: allGroups }] = await Promise.all([
          api.get(`/contacts/${id}`),
          api.get('/groups'),
        ]);
        if (!isMounted) return;
        setContact(c);
        setGroups(Array.isArray(allGroups) ? allGroups : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load contact');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Delete failed');
    }
  };

  // helpers
  const idStr = (v) => (typeof v === 'string' ? v : v?._id ? String(v._id) : String(v));
  const sameId = (a, b) => String(a) === String(b);
  const groupNameById = (gid) => {
    const g = groups.find((gg) => sameId(gg._id, gid));
    return g?.name || 'Unknown';
  };

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!contact) return <p>Contact not found.</p>;

  if (editing) {
    return (
      <section className="container">
        <button className="btn" onClick={() => setEditing(false)}>&larr; Cancel</button>
        <ContactForm
          mode="edit"
          initialData={contact}
          onSaved={(updated) => {
            setContact(updated);
            setEditing(false);
          }}
        />
      </section>
    );
  }

  // Compute displayGroupIds AFTER guards, when contact exists
  // derive ids directly on contact (handles ids OR populated docs)
  const contactGroupIds = Array.isArray(contact.groups)
    ? contact.groups.map(idStr).filter(Boolean)
    : [];

  // Derive from groups where this contact is a member
  const derivedGroupIds = groups
    .filter((g) => Array.isArray(g.members) && g.members.some((m) => sameId(m, contact._id)))
    .map((g) => String(g._id));

  // union the two sources (dedupe)
  const displayGroupIds = Array.from(new Set([...contactGroupIds, ...derivedGroupIds]));

  return (
    <section className="container" aria-labelledby="contact-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h1 id="contact-title">
          {contact.firstName || contact.lastName
            ? `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim()
            : 'Unnamed Contact'}
        </h1>
        <div className="actions" style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </header>

      <div className="grid two">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Details</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {contact.email && <li><strong>Email:</strong> {contact.email}</li>}
            {contact.phone && <li><strong>Phone:</strong> {contact.phone}</li>}
            {(contact.city || contact.country) && (
              <li>
                <strong>Location:</strong> {[contact.city, contact.country].filter(Boolean).join(', ')}
              </li>
            )}
            {contact.notes && <li><strong>Notes:</strong> {contact.notes}</li>}
            {contact.firstConnectedAt && (
              <li><strong>First connected:</strong> {new Date(contact.firstConnectedAt).toLocaleDateString()}</li>
            )}
            {contact.lastConnectedAt && (
              <li><strong>Last connected:</strong> {new Date(contact.lastConnectedAt).toLocaleDateString()}</li>
            )}
          </ul>
        </div>

        <div>
          <h2>Groups</h2>
          {displayGroupIds.length > 0 ? (
            <ul className="card" style={{ padding: '1rem', listStyle: 'none', margin: 0 }}>
              {displayGroupIds.map((gid) => (
                <li key={gid} style={{ padding: '.35rem 0' }}>
                  <Link to={`/groups/${gid}`}>{groupNameById(gid)}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Not in any group"
              action={<Link className="btn btn-primary" to="/groups/new">Create a group</Link>}
              icon="📁"
            >
              Use groups to organise contacts (Friends, Business, Sport).
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactProfile;
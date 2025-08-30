import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import GroupForm from '../../components/forms/GroupForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const GroupProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);       // contacts in this group
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Load the group
        const { data: g } = await api.get(`/groups/${id}`);
        if (!isMounted) return;
        setGroup(g);

        // Load contacts filtered by this group
        const { data: contacts } = await api.get('/contacts', { params: { group: id } });
        if (!isMounted) return;
        setMembers(Array.isArray(contacts) ? contacts : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load group');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm('Delete this group? Members will remain but lose this tag.')) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Delete failed');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!group) return <p>Group not found.</p>;

  // Edit-in-place view
  if (editing) {
    return (
      <section>
        <button className="btn" onClick={() => setEditing(false)}>&larr; Cancel</button>
        <GroupForm
          mode="edit"
          initialData={group}
          onSaved={(updated) => {
            setGroup(updated);
            setEditing(false);
          }}
        />
      </section>
    );
  }

  // Read-only view
  return (
    <section aria-labelledby="group-title">
      <header className="flex-between">
        <h1 id="group-title">{group.name}</h1>
        <div className="actions">
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </header>

      <p><strong>Type:</strong> {group.type}</p>

      <h2>Members</h2>
      {members.length === 0 ? (
        <EmptyState
          title="No members in this group"
          action={<Link className="btn btn-primary" to="/contacts/new">Add a contact</Link>}
          icon="👥"
        >
          Add contacts and assign them to <strong>{group.name}</strong>.
        </EmptyState>
      ) : (
        <ul className="card" style={{ padding: '1rem' }}>
          {members.map((c) => (
            <li
              key={c._id}
              style={{ padding: '.4rem 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}
            >
              <Link to={`/contacts/${c._id}`}>
                {[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed'}
              </Link>
              {c.email ? <span className="muted"> • {c.email}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default GroupProfile;
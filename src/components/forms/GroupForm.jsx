// src/components/forms/GroupForm.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

// Fallback list mirrors your models/Group.js enum:
const FALLBACK_GROUP_TYPES = [
  'acquaintances',
  'club',
  'cohort',
  'colleagues',
  'friends',
  'family',
  'business',
  'network',
  'team',
  'volunteers',
  'other',
];

const toLabel = (v) =>
  String(v)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

const GroupForm = ({
  mode = 'create',            // 'create' | 'edit'
  initialData = null,         // pre-fetched data if applicable
  onSaved,                    // callback(group)
}) => {
  const navigate = useNavigate();
  const params = useParams(); // expects :id if editing via route
  const groupId = useMemo(() => initialData?._id || params.id, [initialData, params]);

  const [form, setForm] = useState({ name: '', type: 'other' });
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Allowed types (from API if available, else fallback)
  const [types, setTypes] = useState(FALLBACK_GROUP_TYPES);

  // Try to fetch allowed types from /groups/meta (optional convenience endpoint)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If present, the route should return: { types: ['acquaintances', ...] }
        const { data } = await api.get('/groups/meta');
        if (!mounted) return;
        const serverTypes = Array.isArray(data?.types) && data.types.length > 0
          ? data.types
          : FALLBACK_GROUP_TYPES;
        setTypes(serverTypes);
      } catch {
        if (mounted) setTypes(FALLBACK_GROUP_TYPES);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Pre-fill (from prop) or fetch if editing by id
  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name ?? '', type: initialData.type ?? 'other' });
      setLoading(false);
      return;
    }
    if (mode === 'edit' && groupId) {
      (async () => {
        try {
          const { data } = await api.get(`/groups/${groupId}`);
          setForm({ name: data.name ?? '', type: data.type ?? 'other' });
        } catch (e) {
          setError(e?.response?.data?.error || e?.message || 'Failed to load group');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, groupId, initialData]);

  // Ensure the current value is always selectable (covers legacy values)
  const effectiveTypes = useMemo(() => {
    const list = Array.isArray(types) ? types.slice() : FALLBACK_GROUP_TYPES.slice();
    if (form.type && !list.includes(form.type)) list.push(form.type);
    return list;
  }, [types, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Group name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), type: form.type };
      const { data } =
        mode === 'edit'
          ? await api.put(`/groups/${groupId}`, payload)
          : await api.post('/groups', payload);

      onSaved?.(data);
      // If editing, prefer the id we have. If creating, use new id or go to dashboard.
      navigate(mode === 'edit' ? `/groups/${data._id || groupId}` : '/dashboard');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={handleSubmit} aria-labelledby="group-form-title">
      <h1 id="group-form-title">{mode === 'edit' ? 'Edit Group' : 'Create Group'}</h1>

      <label>
        Group Name
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
          placeholder="e.g. Product Team"
        />
      </label>

      <label>
        Group Type
        <select name="type" value={form.type} onChange={handleChange}>
          {effectiveTypes.map((t) => (
            <option key={t} value={t}>{toLabel(t)}</option>
          ))}
        </select>
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : (mode === 'edit' ? 'Update Group' : 'Create Group')}
      </button>
    </form>
  );
};

export default GroupForm;
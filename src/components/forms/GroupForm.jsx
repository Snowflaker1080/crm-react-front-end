import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

const GROUP_TYPES = ['cohort','network','friend','family','business','sport','other'];

export default function GroupForm({
  mode = 'create',                    // 'create' | 'edit'
  initialData = null,                 // pre-fetched data if applicable
  onSaved,                            // callback(group) if applicable
}) {
  const navigate = useNavigate();
  const params = useParams();         // expects :id if editing via route
  const groupId = useMemo(() => initialData?._id || params.id, [initialData, params]);

  const [form, setForm] = useState({
    name: '',
    type: 'other',
  });
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

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
          setError(e.response?.data?.error || 'Failed to load group');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, groupId, initialData]);

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
      navigate(mode === 'edit' ? `/groups/${data._id || groupId}` : '/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
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
        />
      </label>

      <label>
        Group Type
        <select name="type" value={form.type} onChange={handleChange}>
          {GROUP_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : (mode === 'edit' ? 'Update Group' : 'Create Group')}
      </button>
    </form>
  );
}
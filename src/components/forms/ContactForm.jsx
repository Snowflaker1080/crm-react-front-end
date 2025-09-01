import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

const ContactForm = ({
  mode = 'create',                    // 'create' | 'edit'
  initialData = null,                 // pre-fetched data if applicable
  onSaved,                            // callback(contact) if applicable
}) => {
  const navigate = useNavigate();
  const params = useParams();         // expects :id when editing via route
  const contactId = useMemo(() => initialData?._id || params.id, [initialData, params]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    notes: '',
    groups: [],                       // array of group _ids
  });

  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Load groups for the multi-select
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/groups');
        setAllGroups(Array.isArray(data) ? data : []);
      } catch {
        // Non-blocking for form
      }
    })();
  }, []);

  // Pre-fill (from prop) or fetch if editing by id
  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName ?? '',
        lastName:  initialData.lastName ?? '',
        email:     initialData.email ?? '',
        phone:     initialData.phone ?? '',
        city:      initialData.city ?? '',
        country:   initialData.country ?? '',
        notes:     initialData.notes ?? '',
        groups:    initialData.groups?.map(String) ?? [],
      });
      setLoading(false);
      return;
    }
    if (mode === 'edit' && contactId) {
      (async () => {
        try {
          const { data } = await api.get(`/contacts/${contactId}`);
          setForm({
            firstName: data.firstName ?? '',
            lastName:  data.lastName ?? '',
            email:     data.email ?? '',
            phone:     data.phone ?? '',
            city:      data.city ?? '',
            country:   data.country ?? '',
            notes:     data.notes ?? '',
            groups:    data.groups?.map(String) ?? [],
          });
        } catch (e) {
          setError(e?.response?.data?.error || 'Failed to load contact');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, contactId, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleGroupsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, groups: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() && !form.lastName.trim()) {
      setError('Provide at least a first or last name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim(),
        city:      form.city.trim(),
        country:   form.country.trim(),
        notes:     form.notes.trim(),
        groups:    form.groups,
      };

      const { data } =
        mode === 'edit'
          ? await api.put(`/contacts/${contactId}`, payload)
          : await api.post('/contacts', payload);

      onSaved?.(data);
      navigate(mode === 'edit' ? `/contacts/${data._id || contactId}` : '/dashboard');
    } catch (e) {
      setError(e?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={handleSubmit} aria-labelledby="contact-form-title">
      <h1 id="contact-form-title">{mode === 'edit' ? 'Edit Contact' : 'Create Contact'}</h1>

      <fieldset>
        <legend>Identity</legend>
        <label>
          First name
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </label>
        <label>
          Last name
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Contact details</legend>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={handleChange} />
        </label>
        <label>
          Country
          <input name="country" value={form.country} onChange={handleChange} />
        </label>
      </fieldset>

      <label>
        Notes
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
      </label>

      <label>
        Groups
        <select multiple value={form.groups} onChange={handleGroupsChange} aria-label="Select groups">
          {allGroups.map((g) => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : (mode === 'edit' ? 'Update Contact' : 'Create Contact')}
      </button>
    </form>
  );
};

export default ContactForm;
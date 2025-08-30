import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const InvitePage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [contactEmail, setContactEmail] = useState('');
  const [expiryPreset, setExpiryPreset] = useState('7'); // days: '7' | '14' | '30' | 'custom'
  const [customDate, setCustomDate] = useState(''); // yyyy-mm-dd

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await api.get('/invites');
        if (!isMounted) return;
        setList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load invites');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const now = Date.now();

  const computedExpiryISO = useMemo(() => {
    if (expiryPreset === 'custom' && customDate) {
      const d = new Date(customDate);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    const days = parseInt(expiryPreset, 10);
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return d.toISOString();
  }, [expiryPreset, customDate]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

  const statusOf = (invite) => {
    if (invite.acceptedAt) return 'accepted';
    if (new Date(invite.expiresAt).getTime() < now) return 'expired';
    return 'active';
  };

  const copyTokenLink = async (token) => {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Invite link copied to clipboard.');
    } catch {
      // fallback
      prompt('Copy this invite link:', url); // eslint-disable-line no-alert
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!contactEmail.trim()) {
      setError('Email is required.');
      return;
    }
    if (!computedExpiryISO) {
      setError('Please select a valid expiry.');
      return;
    }

    setSaving(true);
    try {
      const payload = { contactEmail: contactEmail.trim(), expiresAt: computedExpiryISO };
      const { data } = await api.post('/invites', payload);
      setList((prev) => [data, ...prev]);
      setContactEmail('');
      if (expiryPreset === 'custom') setCustomDate('');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create invite');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Revoke this invite?')) return;
    try {
      await api.delete(`/invites/${id}`);
      setList((prev) => prev.filter((i) => i._id !== id));
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to revoke invite');
    }
  };

  return (
    <section className="container" aria-labelledby="invite-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h1 id="invite-title" style={{ margin: 0 }}>Invite Contacts</h1>
        <span className="badge">{list.length} invite{list.length === 1 ? '' : 's'}</span>
      </header>

      {error && <p role="alert">{error}</p>}

      {/* Create invite */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <form onSubmit={onSubmit} aria-labelledby="create-invite-title">
          <h2 id="create-invite-title" style={{ marginTop: 0 }}>Create Invite</h2>

          <label>
            Contact email
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="person@example.com"
              required
              aria-required="true"
              autoComplete="email"
            />
          </label>

          <div className="grid two">
            <label>
              Expiry
              <select
                value={expiryPreset}
                onChange={(e) => setExpiryPreset(e.target.value)}
                aria-label="Invite expiry"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="custom">Custom date…</option>
              </select>
            </label>

            {expiryPreset === 'custom' && (
              <label>
                Custom expiry date
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </label>
            )}
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* List invites */}
      <h2 style={{ marginTop: 0 }}>Your Invites</h2>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <div className="card" style={{ padding: '1rem' }}>
          <p className="muted" style={{ margin: 0 }}>
            No invites yet. Use the form above to invite a contact to update their details.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))' }}>
          {list.map((inv) => {
            const st = statusOf(inv);
            const expired = st === 'expired';
            const accepted = st === 'accepted';
            return (
              <article key={inv._id} className="card" aria-label={`Invite to ${inv.contactEmail}`}>
                <h3 style={{ marginTop: 0 }}>{inv.contactEmail}</h3>
                <p className="muted" style={{ margin: '.25rem 0' }}>
                  Created: {fmtDate(inv.createdAt)}<br />
                  Expires: {fmtDate(inv.expiresAt)}
                </p>

                <p style={{ margin: '.25rem 0' }}>
                  <strong>Status: </strong>
                  <span className="badge" title={st}>
                    {accepted ? 'Accepted' : expired ? 'Expired' : 'Active'}
                  </span>
                </p>

                {accepted && (
                  <p className="muted" style={{ margin: '.25rem 0' }}>
                    Accepted at: {fmtDate(inv.acceptedAt)}
                  </p>
                )}

                <div className="flex-between" style={{ gap: '.5rem', marginTop: '.6rem' }}>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => copyTokenLink(inv.token)}
                    disabled={accepted}
                    title="Copy invite link"
                  >
                    Copy Link
                  </button>

                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => onDelete(inv._id)}
                    disabled={accepted}
                    title="Revoke invite"
                  >
                    Revoke
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default InvitePage;
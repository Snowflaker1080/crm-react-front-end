import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function SignUp() {
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);            // loading/disable state
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');                                         // clear previous error

    // FIX: trim & minimal client-side validation
    const username = form.username.trim();
    const password = form.password;

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      // NOTE: relies on api.js baseURL = VITE_API_URL (e.g. http://localhost:3000/api)
      const { data } = await api.post('/auth/sign-up', { username, password });
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard', { replace: true });          // replace for cleaner history
    } catch (err) {
      // handle both `error` and legacy `err` keys + 409 conflict nicely
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.err ||
        (err?.response?.status === 409 ? 'Username already taken' : 'Sign up failed');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    // FIX: correct ARIA link to heading id
    <section className="container" aria-labelledby="signup-title">
      <h1 id="signup-title">Sign Up</h1>

      <form onSubmit={onSubmit}>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"                   // use new-password on sign-up
            required
            minLength={8}                                 // enforce length in UI too
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating…' : 'Sign Up'}              {/* disable + label change */}
        </button>
      </form>
    </section>
  );
}
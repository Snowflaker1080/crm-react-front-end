import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js'; // axios instance with baseURL = VITE_API_URL (e.g. http://localhost:3000/api)
import { useAuth } from '../../hooks/useAuth.jsx';

const SignUp = () => {
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // helper to decode JWT if server doesn’t return a user object
  const decodeUserFromToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1])).payload;
    } catch {
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      // Axios call; relies on api.js baseURL = VITE_API_URL (e.g. http://localhost:3000/api)
      // Final URL = `${VITE_API_URL}/auth/sign-up`
      const { data } = await api.post('/auth/sign-up', { username, password });

      if (!data?.token) { // Expecting { token, user? }
        throw new Error('Invalid response from server');
      }

      setToken(data.token);

      const user = data.user ?? decodeUserFromToken(data.token); // Prefer user from server, otherwise decode from JWT
      if (user) setUser(user);

      navigate('/dashboard', { replace: true });  // replace history for a cleaner back stack
    } catch (err) {
      const status = err?.response?.status; // clearer error messages including 404 and 409
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.err ||
        err?.response?.data?.message;

      let msg = serverMsg || err?.message || 'Sign up failed';

      if (status === 404) {
        msg =
          'Endpoint not found (404). Check your API base URL and route path: expected /api/auth/sign-up.';
      } else if (status === 409) {
        msg = 'Username already taken';
      }

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container" aria-labelledby="signup-title">
      <h1 id="signup-title">Sign Up</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          autoComplete="username"
          required
          minLength={3}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
          minLength={8}
        />

        {error && (
          <p role="alert" style={{ marginTop: '0.5rem' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating…' : 'Sign Up'}
        </button>
      </form>
    </section>
  );
};

export default SignUp;
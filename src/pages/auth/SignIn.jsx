import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
// import { authContext } from '../../context/AuthContext.jsx';

const SignIn = () => {
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/sign-in', form);
      // persist immediately
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || {}));
      // sync with context
      setToken(data.token);
      setUser(data.user);
      // redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign in failed');
    }
  };

  return (
    <section aria-labelledby="signin-title">
      <h1 id="signin-title">Sign In</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="btn">Sign In</button>
      </form>
    </section>
  );
};

export default SignIn;
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function NavBar() {
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    setToken('');
    setUser(null);
    navigate('/sign-in', { replace: true });
  };

  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar__brand">
        <Link to="/" aria-label="Orbit CRM home">
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'conic-gradient(from 200deg, var(--brand), var(--brand-600))',
              display: 'inline-block',
              marginRight: 8
            }}
          />
          <span>Orbit CRM</span>
        </Link>
      </div>

      <ul className="navbar__links">
        {!user && (
          <>
            <li><Link to="/sign-up">Sign Up</Link></li>
            <li><Link to="/sign-in">Sign In</Link></li>
          </>
        )}

        {user && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/groups/new">New Group</Link></li>
            <li><Link to="/contacts/new">New Contact</Link></li>
            <li><Link to="/invite">Invite</Link></li>
            <li>
              <button className="btn" onClick={signOut} aria-label="Sign out">
                Sign Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

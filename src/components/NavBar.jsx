// src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NavBar = () => {
  const { token, setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/sign-in', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          Orbit CRM
        </Link>
      </div>

      <div className="nav-links">
{!token ? (
  <>
    <Link to="/sign-in" className="signin nav-button">Sign In</Link>
    <Link to="/sign-up" className="signup nav-button">Sign Up</Link>
  </>
) : (
  <>
    <Link to="/dashboard" className="dashboard nav-button">Dashboard</Link>
    <Link to="/groups/new" className="new-group nav-button">New Group</Link>
    <Link to="/contacts/new" className="new-contact nav-button">New Contact</Link>
    <Link to="/invite" className="invite nav-button">Invite</Link>
    <button onClick={handleSignOut} className="btn-link signout nav-button">
      Sign Out
    </button>
  </>
)}
      </div>
    </nav>
  );
};

export default NavBar;

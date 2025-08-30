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
            <Link to="/sign-in">Sign In</Link>
            <Link to="/sign-up">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/groups/new">New Group</Link>
            <Link to="/contacts/new">New Contact</Link>
            <Link to="/invite">Invite</Link>
            <button onClick={handleSignOut} className="btn-link">
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

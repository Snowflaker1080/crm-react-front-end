import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Home() {
  const { user } = useAuth();

  // If already signed in, send people straight to the dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <section className="container" aria-labelledby="home-title">
      {/* Hero */}
      <header className="card" style={{ padding: '2rem', marginBottom: '1rem' }}>
        <h1 id="home-title" style={{ marginTop: 0, marginBottom: '.4rem' }}>
          Orbit CRM
        </h1>
        <p className="muted" style={{ marginTop: 0, maxWidth: 720 }}>
          A simple personal CRM to organise your cohorts, track contacts, and keep
          networking on schedule.
        </p>
        <div style={{ display: 'flex', gap: '.6rem', marginTop: '.8rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/sign-up">Create an account</Link>
          <Link className="btn" to="/sign-in" aria-label="Sign in to Orbit CRM">Sign In</Link>
        </div>
      </header>

      {/* Feature highlights mapped to your user stories */}
      <div className="grid two">
        <article className="card" aria-labelledby="feature-groups">
          <h2 id="feature-groups" style={{ marginTop: 0 }}>Create Groups</h2>
          <p className="muted">
            Make cohorts like <em>Friends</em>, <em>Business</em>, or <em>Sport</em>. Only you can
            edit or delete your own groups.
          </p>
          <ul>
            <li>Full CRUD on groups</li>
            <li>Assign contacts to one or more groups</li>
            <li>Pre-filled edit forms</li>
          </ul>
        </article>

        <article className="card" aria-labelledby="feature-contacts">
          <h2 id="feature-contacts" style={{ marginTop: 0 }}>Manage Contacts</h2>
          <p className="muted">
            Store names, location, notes, and unique characteristics. Search and sort as you grow.
          </p>
          <ul>
            <li>Create, read, update, delete contacts</li>
            <li>Link contacts to multiple groups</li>
            <li>Add first/last connected dates</li>
          </ul>
        </article>

        <article className="card" aria-labelledby="feature-reminders">
          <h2 id="feature-reminders" style={{ marginTop: 0 }}>Stay in Touch</h2>
          <p className="muted">
            Set reminders to reconnect on a weekly, monthly, or custom cadence so nothing slips.
          </p>
          <ul>
            <li>Frequency-based reminders</li>
            <li>Next contact date tracking</li>
          </ul>
        </article>

        <article className="card" aria-labelledby="feature-invites">
          <h2 id="feature-invites" style={{ marginTop: 0 }}>Invite & Update</h2>
          <p className="muted">
            Send an invite so a contact can update their own details via a secure link.
          </p>
          <ul>
            <li>Email invite tokens</li>
            <li>Expiration handling</li>
          </ul>
        </article>
      </div>

      {/* Quick start CTA row */}
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Get started</h2>
        <ol style={{ marginTop: 0 }}>
          <li>
            <Link to="/sign-up">Create your account</Link> (JWT-secured).
          </li>
          <li>Sign in and head to the <strong>Dashboard</strong>.</li>
          <li>Create a <strong>Group</strong> and add your first <strong>Contact</strong>.</li>
        </ol>
        <div style={{ display: 'flex', gap: '.6rem', marginTop: '.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/sign-up">Sign Up Free</Link>
          <Link className="btn" to="/sign-in">I already have an account</Link>
        </div>
      </div>

      {/* Accessibility: decorative logo alt text hidden for screen readers */}
      <img
        src="data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='0' height='0'/>"
        alt=""
        className="sr-only"
      />
    </section>
  );
}
import { Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Home from './pages/Home.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import SignIn from './pages/auth/SignIn.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import GroupProfile from './pages/groups/GroupProfile.jsx';
import NewGroup from './pages/groups/NewGroup.jsx';
import ContactProfile from './pages/contacts/ContactProfile.jsx';
import NewContact from './pages/contacts/NewContact.jsx';
import InvitePage from './pages/invites/InvitePage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups/new" element={<NewGroup />} />
            <Route path="/groups/:id" element={<GroupProfile />} />
            <Route path="/contacts/new" element={<NewContact />} />
            <Route path="/contacts/:id" element={<ContactProfile />} />
            <Route path="/invite" element={<InvitePage />} />
          </Route>

          {/* Optional catch-all */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
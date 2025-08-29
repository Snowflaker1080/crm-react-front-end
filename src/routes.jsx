import { createBrowserRouter } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    element: <Layout />,       // includes NavBar
    children: [
      { path: '/', element: <Home /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/sign-in', element: <SignIn /> },

      // Protected area
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },      // “User Interface”
          { path: '/groups/new', element: <NewGroup /> },      // “Add New Group”
          { path: '/groups/:id', element: <GroupProfile /> },  // “Group Profile”
          { path: '/contacts/new', element: <NewContact /> },  // “Add New Contact”
          { path: '/contacts/:id', element: <ContactProfile /> }, // “Contact Profile”
          { path: '/invite', element: <InvitePage /> }         // “Invite Page”
        ],
      },
    ],
  },
]);
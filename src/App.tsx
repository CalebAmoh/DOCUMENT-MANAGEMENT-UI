import React, { useContext } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Routes from "./routes";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import AuthContext from "./contexts/AuthContext";  // Add this import
import "./App.css";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
// import 'bootstrap/dist/css/bootstrap.min.css';

// Layout component that conditionally renders the sidebar and header
const Layout = () => {
  const { user } = useContext(AuthContext);  // Match login page pattern
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  // Show Routes only when on login page or not authenticated
  if (isLoginPage || !user) {
    return <Routes />;
  }

  // Otherwise render the full layout with sidebar and header
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Sidebar />
      <Header />
      <Box
        component="main"
        className="MainContent"
        sx={{
          pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100dvh',
          gap: 1,
          overflow: 'auto',
        }}
      >
        <Routes />
      </Box>
    </Box>
  );
};

// Main App component
const App = () => (
  // <AuthProvider>
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Router>
        <Layout />
      </Router>
    </CssVarsProvider>
  // </AuthProvider>
);

export default App;

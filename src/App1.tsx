import React, { useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import AuthContext from "./contexts/AuthContext";  // Add this import
import "./App.css";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import Portal from "./pages/portal";
import Layout from "./components/layout";
import Approval from "./pages/approvals";
import ApprovalHistory from "./pages/approval-history";
import Customers from "./pages/customers";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";


// Main App component
const App = () => (
  <div>
    {/* <Login/> */}
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout />}>

                <Route path="login" element={<Login />} />
                <Route element={<PersistLogin/>}>
                    <Route element={<RequireAuth children={['admin']}/>}> 
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                    <Route element={<RequireAuth children={['approver']}/>}>
                        <Route path="/approvals" element={<Approval />} />
                        <Route path="/approval-history" element={<ApprovalHistory />} />
                    </Route>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/document-portal" element={<Portal />} />
                    <Route path="/customers" element={<Customers />} />
                </Route>
            {/* <Route path="*" element={<Login />} /> */}
        </Route>
      </Routes>
    </CssVarsProvider>
  </div>
);

export default App;

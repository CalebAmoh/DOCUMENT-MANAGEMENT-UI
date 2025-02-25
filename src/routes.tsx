import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Products from "./pages/approvals";
import Dashboard from "./pages/dashboard";
import Orders from "./pages/approval-history";
import Categories from "./pages/portal";
import Customers from "./pages/customers";
import Settings from "./pages/settings";
import Login from "./pages/login";
import RequireAuth from "./components/RequireAuth";
import useAuth from "./hooks/useAuth";
import PersistLogin from "./components/PersistLogin";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Login />} />

      <Route element={<PersistLogin/>}>
      {/* private routes */}
      <Route element={<RequireAuth children={['admin']}/>}>
        <Route path="/settings" element={<Settings />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/document-portal" element={<Categories />} />
      </Route>

      <Route element={<RequireAuth children={['approvers']}/>}>
        <Route path="/approvals" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
      </Route>

      <Route element = {<RequireAuth/>}>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/document-portal" element={<Categories />} /> */}
      </Route>

      <Route path="/customers" element={<Customers />} />
        </Route>
      {/* catch all route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;

// Add this line to make it a module
export {};

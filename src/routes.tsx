import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Products from "../src/pages/products";
import Dashboard from "./pages/dashboard";
import Orders from "./pages/orders";
import Categories from "./pages/categories";
import Customers from "./pages/customers";
import Settings from "./pages/settings";
import Login from "./pages/login";

const AppRoutes = () => (
  // <Router>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/products" element={<Products />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/document-portal" element={<Categories />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/settings" element={<Settings />} />
    {/* <Route path="/" element={<Login />} /> */}
  </Routes>
  // </Router>
);

export default AppRoutes;

// Add this line to make it a module
export {};

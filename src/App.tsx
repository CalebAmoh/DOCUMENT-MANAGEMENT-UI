// import React from "react";
// import Routes from "./routes";
// import { AuthProvider } from "./contexts/AuthContext";
// import "./App.css";

// const App = () => (
//   <AuthProvider>
//     <Routes />
//   </AuthProvider>
// );

// export default App;

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
// import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => (
  <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Router>
          <div style={{ display: "flex" }}>
            <Box sx={{ display: "flex", minHeight: "100dvh" }}>
              <Header />
              <Sidebar />
            </Box>
            <div style={{ flex: 1, padding: "" }}>
              <Routes />
            </div>
          </div>
        </Router>
      </CssVarsProvider>
    </div>
  </AuthProvider>
);

export default App;

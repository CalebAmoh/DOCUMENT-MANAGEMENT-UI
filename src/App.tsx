

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import Categories from "./pages/products";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
// import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => (
  // <AuthProvider>
  //   <div className="flex flex-col min-h-screen">
  //     <CssVarsProvider disableTransitionOnChange>
  //       <CssBaseline />
  //       <Router>
  //         <div style={{ display: "flex" }}>
  //           <Box sx={{ display: "flex", minHeight: "100dvh" }}>
  //             <Header />
  //             <Sidebar />
  //           </Box>
  //           <div style={{ flex: 1, padding: "" }}>
  //             <Routes />
  //           </div>
  //         </div>
  //       </Router>
  //     </CssVarsProvider>
  //   </div>
  // </AuthProvider>
    <AuthProvider>
      <CssVarsProvider disableTransitionOnChange>
          <CssBaseline />
          <Router>
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
              {/* <Categories /> */}
              <Routes />
            </Box>
          </Box>
          </Router>
      </CssVarsProvider>
    </AuthProvider>
);

export default App;

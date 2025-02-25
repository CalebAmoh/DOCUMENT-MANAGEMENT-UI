import React, { ReactNode } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import Login from "../pages/login";

import Sidebar from "./Sidebar";

import Header from "./Header";
import { Outlet } from "react-router-dom";



// const Layout: React.FC<LayoutProps> = ({ children }) => {
  const Layout = () =>{

    const { user } = useContext(AuthContext);  // Match login page pattern
    const location = useLocation();
    const isLoginPage = location.pathname === "/" || location.pathname === "/login";

    // Show Routes only when on login page or not authenticated
    if (isLoginPage) {
      {console.log(user)}
      return(
        <div className="flex flex-col min-h-screen">
          <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
              <Login />
            </Box>
          </CssVarsProvider>
        </div>
      )
    }

    return(
    <div className="flex flex-col min-h-screen">
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        {/* <Box sx={{ display: "flex", minHeight: "100dvh" }}>
          {/* <Header /> */}
          {/* <Sidebar /> */}
          {/* {children} 
        </Box> */}

        <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
          <Sidebar />
          <Header />
          <Outlet />
         {/* <Box
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
          </Box> */}
        </Box>
      </CssVarsProvider>
    </div>
  );
};

export default Layout;

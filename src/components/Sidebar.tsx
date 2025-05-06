import * as React from "react";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import LinearProgress from "@mui/joy/LinearProgress";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SupportRoundedIcon from "@mui/icons-material/SupportRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { NavLink } from "react-router-dom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyIcon from "@mui/icons-material/Key";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import useAuth from "../hooks/useAuth";
import ColorSchemeToggle from "./ColorSxhemeToggle";
import refresh from "../hooks/useRefreshToken";
import logout from "../hooks/useLogout";
import { closeSidebar } from "../utils/utils";
import { ChangePasswordModal } from './ChangePasswordModal';
import { useState } from "react";

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);

  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "0.2s ease",
          "& > *": {
            overflow: "hidden",
          },
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

const getNavLinkStyles = ({ isActive }: { isActive: boolean }) => ({
  backgroundColor: isActive ? "#a569bd" : "inherit",
  color: isActive ? "var(--joy-palette-primary-softColor)" : "inherit",
});
export default function Sidebar() {
  const { user } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Helper functions to check roles
  const isApprover = user?.roles.includes("approver");
  const isAdmin = user?.roles.includes("admin");
  const isFinance = user?.roles.includes("finance");

  // Function to determine if a role is exclusively assigned
  const hasOnlyRole = (role: string) =>
    user?.roles.length === 1 && user?.roles[0] === role;

  // Function to check if user is exclusively admin or originator
  const hasOnlyAdminOrOriginator = () =>
    user?.roles.length === 1 && (user?.roles[0] === "admin" || user?.roles[0] === "originator");

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
        backgroundColor: "#5b2c6f",
        color: "#1A1919",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          marginTop: "5px",
        }}
      >
        {/* <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton> */}
        <Typography level="title-lg" sx={{ color: "#FFFFFF" }}>
          xDMS
        </Typography>
        {/* <ColorSchemeToggle sx={{ ml: "auto" }} /> */}
      </Box>
      <Divider />
      {/*<Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Search"
      />*/}
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        {user && (
          <List
            size="sm"
            sx={{
              gap: 2.5,
              "--List-nestedInsetStart": "30px",
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
          >
            {/* Dashboard is visible to all roles */}
            <ListItem>
              <ListItemButton component={NavLink} to="/dashboard" style={getNavLinkStyles}>
                <DashboardRoundedIcon sx={{ color: "#FFFFFF" }} />
                <ListItemContent>
                  <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
                    Dashboard
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>

            {/* Approval Requests: Only for exclusive approver */}
            {hasOnlyRole("approver") && (
              <ListItem>
                <ListItemButton
                  component={NavLink}
                  to="/approvals"
                  style={getNavLinkStyles}
                >
                  <EditNoteIcon sx={{ color: "#FFFFFF" }} />
                  <ListItemContent>
                    <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
                      Approval Requests
                    </Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )}

            {/* Document Capture: Only for exclusive admin or originator */}
            {hasOnlyAdminOrOriginator() && (
              <ListItem>
                <ListItemButton
                  component={NavLink}
                  to="/document-portal"
                  style={getNavLinkStyles}
                >
                  <KeyIcon sx={{ color: "#FFFFFF" }} />
                  <ListItemContent>
                    <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
                      Document Capture
                    </Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )}

            {/* Finance Approval: Only for exclusive finance */}
            {hasOnlyRole("finance") && (
              <ListItem>
                <ListItemButton
                  component={NavLink}
                  to="/finance-approval"
                  style={getNavLinkStyles}
                >
                  <MenuBookIcon sx={{ color: "#FFFFFF" }} />
                  <ListItemContent>
                    <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
                      Finance Approval
                    </Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )}
          </List>
        )}

        {/* Settings: Only for exclusive admin, at the bottom */}
        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 0,
          }}
        >
          {hasOnlyRole("admin") && (
            <ListItem sx={{ color: "#FFFFFF" }}>
              <ListItemButton
                component={NavLink}
                to="/settings"
                style={getNavLinkStyles}
              >
                <SettingsRoundedIcon sx={{ color: "#FFFFFF" }} />
                <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
                  Settings
                </Typography>
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Avatar
          variant="outlined"
          size="sm"
          // src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
          sx={{ cursor: 'pointer' }}
          onClick={() => setPasswordModalOpen(true)}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm" sx={{ color: "#FFFFFF" }}>
            {user?.first_name} {user?.last_name} {user?.id}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#FFFFFF" }}>
            {user?.email}
          </Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral">
          <LogoutRoundedIcon onClick={(logout())} />
        </IconButton>
      </Box>
      <ChangePasswordModal 
        open={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </Sheet>
  );
}

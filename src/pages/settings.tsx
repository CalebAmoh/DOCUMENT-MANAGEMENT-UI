import * as React from "react";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Typography from "@mui/joy/Typography";
import Profile from "../components/Profile";
import Params from "../components/Params";
import Approvers from "../components/Approvers";
import TempApprovers from "../components/TempApprovers";
import ApprovalSetup from "../components/ApprovalSetup";
const Settings = () => {
  return (
    <div className="">
      {" "}
      <Box sx={{ backgroundColor: "#F8F9FF", flex: 1, width: "100%" }}>
        <Box
          sx={{
            position: "sticky",
            top: { sm: -100, md: -110 },
            bgcolor: "background.body",
            // zIndex: 9995,
          }}
        >
          <Typography
            level="h2"
            component="h1"
            sx={{ color: "#00357A", ml: 6, mt: 3, mb: 2 }}
          >
            Settings
          </Typography>
          <Tabs
            defaultValue={1}
            sx={{
              bgcolor: "transparent",
            }}
          >
            <TabList
              tabFlex={1}
              size="sm"
              sx={{
                pl: { xs: 0, md: 4 },
                justifyContent: "left",
                [`&& .${tabClasses.root}`]: {
                  fontWeight: "600",
                  flex: "initial",
                  color: "text.tertiary",
                  [`&.${tabClasses.selected}`]: {
                    bgcolor: "transparent",
                    color: "text.primary",
                    "&::after": {
                      height: "2px",
                      bgcolor: "primary.500",
                    },
                  },
                },
              }}
            >
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={1}
              >
                Users
              </Tab>

              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={0}
                // onClick={<Initial />}
              >
                Approvers
              </Tab>
              
              
              {/* <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={2}
              >
                Temporary Approvers
              </Tab> */}
              
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={3}
              >
                Parameters
              </Tab>
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={4}
              >
                Document Approval Setup
              </Tab>
            </TabList>
            <TabPanel value={1}>
              <Profile />
            </TabPanel>
            
            <TabPanel value={0}>
              <Approvers />
            </TabPanel>
            {/* <TabPanel value={2}>
              <TempApprovers />
            </TabPanel> */}
            <TabPanel value={3}>
              <Params />
            </TabPanel>
            <TabPanel value={4}>
              <ApprovalSetup />
            </TabPanel>
          </Tabs>
          {/* <Divider /> */}
        </Box>
      </Box>
    </div>
  );
};

export default Settings;

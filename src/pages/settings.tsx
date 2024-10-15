import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Profile from "../components/Profile";
import Params from "../components/Params";
// import Initial from "../components/Initial";
// import Renewal from "../components/Renewal";

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
              {/* <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={0}
                // onClick={<Initial />}
              >
                Profile
              </Tab> */}
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={1}
              >
                Parameters
              </Tab>
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={2}
              >
                Approvers
              </Tab>
            </TabList>
            <TabPanel value={0}>
              <Profile />
            </TabPanel>
            <TabPanel value={1}>
              <Params />
            </TabPanel>
            {/* <TabPanel value={2}>
              <Amendment />
            </TabPanel> */}
          </Tabs>
          {/* <Divider /> */}
        </Box>
      </Box>
    </div>
  );
};

export default Settings;

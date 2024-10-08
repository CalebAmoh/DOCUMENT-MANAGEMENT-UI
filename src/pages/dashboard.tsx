import React, { useState, useEffect } from "react";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import Card from "../components/Card";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/joy/Button";
import FilterListIcon from "@mui/icons-material/FilterList";
import TableHover from "../components/tableStatus";
import Example from "../components/newChart";
import PieC from "../components/pieChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
        .replace(":", ".");
      setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
    };

    // Update the date and time initially
    updateDateTime();

    // Set up an interval to update the date and time every second
    const intervalId = setInterval(updateDateTime, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="main flex bg-yellow-200 ">
      <div className="bg-[#F8F7F1] w-1/4 h-lvh">
        <div className="mt-5 ml-5 ">
          <Typography level="title-lg">Today's Statistics</Typography>
          <Typography>{currentDateTime}</Typography>
          <Card
            title="Scanned Documents"
            spanText="Today"
            mainContent={<Typography level="h3">20</Typography>}
            footerText="Compared to 29 yesterday"
          />
          <Card
            title="Approved Documents"
            spanText="Today"
            mainContent={<Typography level="h3">5</Typography>}
            footerText="Compared to 3 yesterday"
          />
          <div className="bg-[#FFFFFF] mt-5 mr-5 px-6 py-4  rounded shadow">
            <PieC />
          </div>
        </div>
      </div>
      <div className="bg-[#F8F9FF] w-3/4 h-lvh">
        <div className="mt-5 ml-5 mr-5">
          <div className="font-medium text-md mb-6 flex align-center justify-between">
            <Typography level="h2" component="h1">
              Dashboard
            </Typography>
            <span className="mr-10">
              <NotificationsIcon />
            </span>
          </div>

          <div className="space-y-5">
            <div className=" bg-[#ffffff] mr-5">
              <div className=" rounded  shadow">
                <div className="px-6 py-4">
                  <div className="font-bold text-sm mb-2 flex align-center justify-between">
                    Activation History
                  </div>
                  <Divider />
                  <div className="flex justify-between mt-4">
                    <Select
                      size="sm"
                      startDecorator={<AccountBalanceIcon />}
                      variant="outlined"
                      placeholder="Select Bank"
                      indicator={<KeyboardArrowDown />}
                      sx={{
                        width: 700,
                        [`& .${selectClasses.indicator}`]: {
                          transition: "0.2s",
                          [`&.${selectClasses.expanded}`]: {
                            transform: "rotate(-180deg)",
                          },
                        },
                      }}
                    >
                      <Option value="slcb">Sierra Leone Commercial Bank</Option>
                      <Option value="eb">EcoBank</Option>
                      <Option value="rcb">Rokel Commercial Bank</Option>
                      <Option value="zb">Zenith Bank</Option>
                    </Select>
                    <span>
                      <Button
                        sx={{ backgroundColor: "#00357A", width: 100 }}
                        onClick={() => setOpen(true)}
                        size="md"
                        variant="solid"
                      >
                        Check
                      </Button>

                      <Modal
                        aria-labelledby="modal-title"
                        aria-describedby="modal-desc"
                        open={open}
                        onClose={() => setOpen(false)}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Sheet
                          variant="outlined"
                          sx={{
                            maxWidth: 500,
                            borderRadius: "md",
                            p: 3,
                            boxShadow: "lg",
                          }}
                        >
                          <ModalClose variant="plain" sx={{ m: 1 }} />
                          <Typography
                            component="h2"
                            id="modal-title"
                            level="h4"
                            textColor="inherit"
                            fontWeight="lg"
                            mb={1}
                          >
                            This is the modal title
                          </Typography>
                          <Typography id="modal-desc" textColor="text.tertiary">
                            Make sure to use <code>aria-labelledby</code> on the
                            modal dialog with an optional{" "}
                            <code>aria-describedby</code> attribute.
                          </Typography>
                        </Sheet>
                      </Modal>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className=" bg-[#ffffff] mr-5">
              <div className=" rounded  shadow">
                <div className="px-6 py-4">
                  <div className="font-bold text-sm mb-2 flex align-center justify-between">
                    Live Bank Status
                    <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-medium text-gray-700">
                      {<FilterListIcon />}Filter
                    </span>
                  </div>
                  <Divider />
                  <div className="">
                    <TableHover />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#ffffff] pb-4  mr-5 rounded  shadow">
              {/* <p className="ml-10">jf</p> */}
              {/* <Divider />s */}
              <div style={{ width: "100%", height: 210 }}>
                <div className="font-bold text-sm mb-1 pb-1 px-6 pt-4 align-center justify-between">
                  Activation Summary
                </div>
                <div className="px-6 mb-2">
                  <Divider />
                </div>

                <Example />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

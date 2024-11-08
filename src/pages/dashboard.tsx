import React, { useState, useEffect } from "react";
import Divider from "@mui/joy/Divider";
// import Card from "../components/Card";
import Card from '@mui/joy/Card';
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
import BarC from "../components/barChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from '@mui/joy/Typography';
import SvgIcon from '@mui/joy/SvgIcon';
import CardContent from '@mui/joy/CardContent';
import CardActions from '@mui/joy/CardActions';
import CircularProgress from '@mui/joy/CircularProgress';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [open, setOpen] = useState(false);

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

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
      {/* <div className="bg-[#F8F9FF] w-1/4 h-lvh">
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
          
        </div>
      </div> */}
      <div className="bg-[#F8F9FF] w-4/4 h-lvh">
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
            {/* add two cards here side by */}
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Card variant="solid" invertedColors sx={{
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                      color: '#fdfefe',
                      marginRight: 2 // Custom shadow
                      // You can adjust the values as needed
                    }}>
                    <CardContent orientation="horizontal">
                      <SourceRoundedIcon style={{ fontSize: '65px' }}>
                        {/* <SvgIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                        </SvgIcon> */}
                      </SourceRoundedIcon>
                      <CardContent>
                        <Typography level="body-md">GENERATED DOCS</Typography>
                        <Typography level="h2"> 43</Typography>
                      </CardContent>
                    </CardContent>
                    <CardActions>
                      <Button variant="soft" size="sm">
                        ADD NEW DOC
                      </Button>
                      <Button variant="solid" size="sm">
                        VIEW DOCS
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="solid"  invertedColors sx={{
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                      color: '#fdfefe',
                      marginRight: 2 // Custom shadow
                      // You can adjust the values as needed
                    }}>
                    <CardContent orientation="horizontal">
                      <CircularProgress size="lg" determinate value={15}>
                        <SvgIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                        </SvgIcon>
                      </CircularProgress>
                      <CardContent>
                        <Typography level="body-md">APPROVED DOCS</Typography>
                        <Typography level="h2"> 10</Typography>
                      </CardContent>
                    </CardContent>
                    <CardActions>
                      {/* <Button variant="soft" size="sm">
                        VIEW DOCS
                      </Button> */}
                      <Button variant="solid" size="sm">
                        VIEW DOCS
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="solid" invertedColors sx={{
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                      color: '#fdfefe',
                      marginRight: 2 // Custom shadow
                      // You can adjust the values as needed
                    }}>
                    <CardContent orientation="horizontal">
                      <CircularProgress size="lg" determinate value={80}>
                        <SvgIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                        </SvgIcon>
                      </CircularProgress>
                      <CardContent>
                        <Typography level="body-md">UNAPPROVED DOCS</Typography>
                        <Typography level="h2"> 30</Typography>
                      </CardContent>
                    </CardContent>
                    <CardActions>
                      <Button variant="soft" size="sm">
                        Add to Watchlist
                      </Button>
                      <Button variant="solid" size="sm">
                        See breakdown
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="solid"  invertedColors sx={{
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                      color: '#fdfefe',
                      marginRight: 2 // Custom shadow
                      // You can adjust the values as needed
                    }}>
                    <CardContent orientation="horizontal">
                      <CircularProgress size="lg" determinate value={5}>
                        <SvgIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                        </SvgIcon>
                      </CircularProgress>
                      <CardContent>
                        <Typography level="body-md">REJECTED DOCS</Typography>
                        <Typography level="h2"> 3M</Typography>
                      </CardContent>
                    </CardContent>
                    <CardActions>
                      <Button variant="soft" size="sm">
                        Add to Watchlist
                      </Button>
                      <Button variant="solid" size="sm">
                        See breakdown
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={9}>
                  <div className="bg-[#FFFFFF] mt-5 mr-5 px-6 py-4  rounded shadow">
                    <BarC />
                  </div>
                </Grid>
                <Grid item xs={3}>
                    <div className="bg-[#FFFFFF] mt-5 mr-5 px-6 py-4  rounded shadow">
                      <PieC />
                    </div>
                </Grid>
              </Grid>
            </Box>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

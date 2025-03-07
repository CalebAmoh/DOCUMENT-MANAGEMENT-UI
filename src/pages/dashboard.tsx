import React,{useEffect,useState} from 'react';
import {Card,CardActions,CardContent,Typography,styled,Grid,Box,IconButton,Button} from '@mui/joy';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { type ChartConfig } from "../components/ui/chart";
import { ShadcnPieChart } from "../components/ui/chart";

import { ReactComponent as PdfSvg } from "../utils/icons/pdf-file-green-svgrepo-com.svg";
// import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-svgrepo-com.svg";
import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-purple-svgrepo-com.svg";
import useAuth from "../hooks/useAuth";

// Styled component for the dashboard container
const DashboardContainer = styled(Box)({
  padding: '24px',
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  backgroundColor: '#F8F9FF'
});


// Styled component for the cards
const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
});

// Update your data to include colors (optional)
const chartData = [
  { name: "Loan", value: 400, color: "#0088FE" },
  { name: "Project", value: 300, color: "#00C49F" },
  { name: "Sponsorship", value: 300, color: "#FFBB28" },
  { name: "Other", value: 200, color: "#FF8042" },
];

const chartConfig = {
  loan: {
    label: "Loan",
    color: "#0088FE",
  },
  project: {
    label: "Project",
    color: "#00C49F",
  },
  sponsorship: {
    label: "Sponsorship",
    color: "#FFBB28",
  },
  other: {
    label: "Other",
    color: "#FF8042",
  },
} satisfies ChartConfig;

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const {user} = useAuth();
  const folders = [
    { title: 'Generated Documents', count: '23 Files', size: '50MB' },
    { title: 'Approved Documents', count: '170 Files', size: '129MB' },
    { title: 'Unapproved Documents', count: '170 Files', size: '129MB' },
    { title: 'Rejected Documents', count: '170 Files', size: '129MB' },
  ];
  
  const recentFiles = [
    { title: '2025 developmental project', doctype: 'Project', size: '15KB' },
    { title: '140,000 loan request', doctype: 'Loan Request', size: '105KB' },
    { title: '50,000 loan request', doctype: 'Loan Request', size: '155KB' },
    { title: 'Student Sponsorship', doctype: 'Sponsorship', size: '155KB' },
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
    <DashboardContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* <Typography level="h3" component="h1">
          Welcome, {user?.first_name}
        </Typography> */}
        <Typography color="primary" level="h2" variant="plain">Welcome,</Typography>
        <Typography color="neutral" sx={{mr:2}} level="body-lg" variant="plain">{currentDateTime}</Typography>
      </Box>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {folders.map((item, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <StyledCard variant="soft" sx={{
              boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.3)',
              color: '#fdfefe',
              mr: 2
            }}>
              <CardContent>
                <FolderOpenIcon style={{ width: 80, height: 70 }} />
                <Typography level="title-md">{item.title}</Typography>
                <Typography level="body-xs">
                  {item.count} · {item.size}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Typography color="neutral" level="title-lg" variant="plain" sx={{ mt: 4, mb: 1 }}>Recent</Typography>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {recentFiles.map((item, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <StyledCard variant="outlined" sx={{
              boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.3)',
              color: '#fdfefe',
              mr: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PdfSvg style={{width: 30, height: 30}} />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography level="title-md">{item.title}</Typography>
                    <Typography level="body-xs">
                      Category: {item.doctype} · {item.size}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Grid xs={12} sm={6} md={4}>
        <StyledCard variant="soft" sx={{
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.3)',
          color: '#fdfefe',
          mr: 2,
          mt: 5
        }}>
          <CardContent>
            <Typography level="title-md" sx={{ mb: 2 }}>Document Categories</Typography>
            <ShadcnPieChart 
              data={chartData}
              config={chartConfig}
              height={300}
              innerRadius={60}
              outerRadius={90}
              showLabels={true}
            />
          </CardContent>
        </StyledCard>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;

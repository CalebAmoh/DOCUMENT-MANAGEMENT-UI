import React,{useEffect,useState,useCallback} from 'react';
import {Card,CardActions,CardContent,Typography,styled,Grid,Box,IconButton,Button} from '@mui/joy';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { type ChartConfig } from "../components/ui/chart";
import { ShadcnPieChart } from "../components/ui/chart";
import { ShadcnBarChart } from "../components/ui/barchart";
import {ModalClose,Sheet} from "@mui/joy/";
import Modal from "@mui/joy/Modal";

import { ReactComponent as PdfSvg } from "../utils/icons/pdf-file-svg.svg";
// import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-svgrepo-com.svg";
// import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-purple-svgrepo-com.svg";
import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-white-svgrepo-com.svg";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from '../hooks/useAxiosPrivate';

// Styled component for the dashboard container
const DashboardContainer = styled(Box)({
  padding: '24px',
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  backgroundColor: '#e0e0e0'
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

// Replace the CARD_COLORS object with these cooler, more subtle colors
const CARD_COLORS = {
  generated: {
    background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
    light: '#00d2ff',
    dark: '#3a7bd5'
  },
  approved: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
    light: '#4ca1af',
    dark: '#2c3e50'
  },
  unapproved: {
    background: 'linear-gradient(135deg, #614385 0%, #516395 100%)',
    light: '#516395',
    dark: '#614385'
  },
  rejected: {
    background: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
    light: '#49a09d',
    dark: '#5f2c82'
  }
};

// Update the chart colors to match the cooler palette
const chartData = [
  { name: "Loan", value: 400, color: "#3a7bd5" },
  { name: "Project", value: 400, color: "#4ca1af" },
  { name: "Sponsorship", value: 300, color: "#516395" },
  { name: "Other", value: 200, color: "#49a09d" },
];

const chartConfig = {
  loan: {
    label: "Loan",
    color: "#3a7bd5",
  },
  project: {
    label: "Project",
    color: "#4ca1af",
  },
  sponsorship: {
    label: "Sponsorship",
    color: "#516395",
  },
  other: {
    label: "Other",
    color: "#49a09d",
  },
} satisfies ChartConfig;

// Define the color key type
type ColorKey = 'generated' | 'approved' | 'unapproved' | 'rejected';

interface RecentDoc {

  doctype_id: string;
  details: string;
  doc_id: string;
  doctype_name: string;
  status: string;

}

const barChartData = [
  { name: "Loan", value: 400, color: "#3a7bd5" },
  { name: "Sponsorship", value: 450, color: "#4ca1af" },
  { name: "Projects", value: 200, color: "#516395" },
  // { name: "Apr", value: 278, color: "#49a09d" },
  // { name: "May", value: 189, color: "#3a7bd5" },
  // { name: "Jun", value: 239, color: "#4ca1af" },
];

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const {user} = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [state, setState] = useState<{
    generatedDocs: number;
    approvedDocs: number;
    unapprovedDocs: number;
    rejectedDocs: number;
    recentDocs: RecentDoc[];
    docId: string;
    showIframe: boolean;
  }>({
    generatedDocs: 0,
    approvedDocs: 0,
    unapprovedDocs: 0,
    rejectedDocs: 0,
    recentDocs: [],
    docId:"",
    showIframe:false
  });

  // This function is used to handle input change
  const handleDocId = useCallback((value:string) => {
      setState((prevState) => ({
          ...prevState,
          docId: value,
          showIframe:true
      }));


  }, []);
  
  
  const handleCloseIframe = useCallback(() => {
      setState((prevState) => ({
          ...prevState,
          showIframe:false
      }));


  }, []);

  //this function fetches all accounts
  const fetchDashboardStats = useCallback(async () => {
      try {
          

          const response = await axiosPrivate.get(`/get-dashbaord-stats/${user?.id}/${user?.roles}`, { withCredentials:true });
          console.log(response.data.result[4]);
          const stats = response.data.result;
          setState((prevState) => ({
              ...prevState,
              rejectedDocs: stats[0][0].rejecteddocs,
              unapprovedDocs: stats[1][0].unapproveddocs,
              approvedDocs: stats[2][0].approveddocs,
              generatedDocs: stats[3][0].generateddocs,
              recentDocs: stats[4]
          }));
      } catch (error) {
          console.error("Error:", error);
          // setState((prevState) => ({
          //     ...prevState,
          // }));
      }
  }, []);
  
  
  //this useEffect fetches the submitted documents
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const folders: Array<{
    title: string;
    count: string;
    // size: string;
    colorKey: ColorKey;
  }> = [
    { title: 'Generated Documents', count: state.generatedDocs+' File(s)', colorKey: 'generated' },
    { title: 'Approved Documents', count: state.approvedDocs+' File(s)', colorKey: 'approved' },
    { title: 'Unapproved Documents', count: state.unapprovedDocs+' File(s)', colorKey: 'unapproved' },
    { title: 'Rejected Documents', count: state.rejectedDocs+' File(s)', colorKey: 'rejected' },
    // { title: 'Generated Documents', count: '23 Files', size: '50MB', colorKey: 'generated' },
    // { title: 'Approved Documents', count: '170 Files', size: '129MB', colorKey: 'approved' },
    // { title: 'Unapproved Documents', count: '170 Files', size: '129MB', colorKey: 'unapproved' },
    // { title: 'Rejected Documents', count: '170 Files', size: '129MB', colorKey: 'rejected' },
  ];
  
  const recentFiles = [
    { title: 'Developmental project', doctype: 'Project', size: '15KB' },
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
        <Typography color="primary" level="title-lg" variant="plain">Welcome, {user?.first_name}</Typography>
        <Typography color="neutral" sx={{mr:2}} level="body-lg" variant="plain">{currentDateTime}</Typography>
      </Box>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {folders.map((item, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <StyledCard variant="plain" sx={{
              background: CARD_COLORS[item.colorKey].background,
              color: 'white',
              mr: 2,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}>
              <Box 
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 0
                }}
              />
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <FolderOpenIcon style={{ width: 80, height: 70, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))' }} />
                <Typography level="title-lg" sx={{ mt: 2, fontWeight: 'bold',color:'white' }}>{item.title}</Typography>
                <Typography level="body-md" sx={{ opacity: 0.9,color:'white' }}>
                  {item.count} 
                  {/* · {item.size} */}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Typography color="neutral" level="title-lg" variant="plain" sx={{ mt: 4, mb: 1 }}>Recent</Typography>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {state.recentDocs.map((item, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <StyledCard variant="outlined" onClick={() => handleDocId(item.doc_id)} sx={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              cursor:'pointer',
              border: '1px solid rgba(209, 213, 219, 0.3)',
              color: '#333',
              mr: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      background: item.status === 'DRAFT' ? '#e0f2fe' : 
                                   item.status === 'APPROVED' ? '#fef3c7' : '#f3e8ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PdfSvg style={{width: 30, height: 30}} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography level="title-md">{item.doctype_name}</Typography>
                    <Typography level="body-sm" sx={{ 
                      color: item.status === 'DRAFT' ? '#0284c7' : 
                              item.status === 'APPROVED' ? '#d97706' : '#7e22ce'
                    }}>
                      {item.doc_id} · {item.status}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ flexGrow: 1, mt: 2 }}>
        {/* First Chart */}
        <Grid xs={12} sm={6} md={4}>
          <StyledCard variant="plain" sx={{
            background: 'white',
            color: '#333',
            mr: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.02)',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Typography level="title-md" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                Document Categories
              </Typography>
              <ShadcnPieChart 
                data={chartData}
                config={chartConfig}
                height={220}
                innerRadius={60}
                outerRadius={90}
                showLabels={true}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Second Chart */}
        <Grid xs={12} sm={6} md={4}>
          <StyledCard variant="plain" sx={{
            background: 'white',
            color: '#333',
            mr: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.02)',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Typography level="title-md" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                Expenses
              </Typography>
              <ShadcnBarChart 
                data={barChartData}
                height={220}
                barSize={20}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Third Chart */}
        <Grid xs={12} sm={6} md={4}>
          <StyledCard variant="plain" sx={{
            background: 'white',
            color: '#333',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.02)',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Typography level="title-md" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                Status Overview
              </Typography>
              <ShadcnPieChart 
                data={chartData}
                config={chartConfig}
                height={220}
                innerRadius={60}
                outerRadius={90}
                showLabels={true}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Display document */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={state.showIframe} onClose={handleCloseIframe}
            slotProps={{
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "none",
                },
              },
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: { xs: '16px', md: '0 15%' }
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                maxWidth: '90%',
                width: "100%",
                borderRadius: "md",
                p: { xs: 1, sm: 3 },
                boxShadow: "lg",
                height: { xs: 'calc(70vh)', sm: '600px' },
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
              <Typography id="modal-desc" textColor="text.tertiary">
                  
                    <Box sx={{ height: { xs: 'calc(50vh)', sm: '550px' } }}>
                      <iframe
                        src={`http://10.203.14.169/dms/filesearch-${state.docId}`}
                        width="100%"
                        height="100%"
                        title="Document Viewer"
                        style={{ marginTop: '20px' }}
                      />
                    </Box>

                
              </Typography>
            </Sheet>
      </Modal>
    </DashboardContainer>
  );
};

export default Dashboard;

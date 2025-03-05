import React from 'react';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { styled } from '@mui/joy/styles';
// import { ReactComponent as PdfSvg } from "../utils/icons/pdf-file-svg.svg";
// import { ReactComponent as PdfSvg } from "../utils/icons/pdf-file-white-svgrepo-com.svg";
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
const Dashboard = () => {
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

  return (
    <DashboardContainer>
      <Typography level="h3" component="h1" sx={{ mb: 2 }}>
        Welcome, {user?.first_name}
      </Typography>
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
    </DashboardContainer>
  );
};

export default Dashboard;

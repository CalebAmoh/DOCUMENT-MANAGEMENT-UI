import React from 'react';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { styled } from '@mui/joy/styles';
import { ReactComponent as FolderOpenIcon } from "../utils/icons/folder-open-svgrepo-com.svg";

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
  const dashboardItems = [
    { title: 'Generated Documents', count: '23 Files', size: '50MB' },
    { title: 'Approved Documents', count: '170 Files', size: '129MB' },
    { title: 'Unapproved Documents', count: '170 Files', size: '129MB' },
    { title: 'Rejected Documents', count: '170 Files', size: '129MB' },
  ];

  return (
    <DashboardContainer>
      <Typography level="h2" component="h1" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {dashboardItems.map((item, index) => (
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
    </DashboardContainer>
  );
};

export default Dashboard;

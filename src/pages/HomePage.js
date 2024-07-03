import React from 'react';
import { Typography, Container } from '@mui/material';
import CarList from '../components/CarList';

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Car Details
      </Typography>
      <CarList />
    </Container>
  );
};

export default HomePage;
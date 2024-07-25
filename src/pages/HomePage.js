import React from "react";
import { Typography, Container, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../src/assets/bg2.jpg";
import logo from "../assets/logo.png";

const HomePage = () => {
  const history = useNavigate();

  const navigateTo = (path) => {
    history(path);
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <Container sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: Add a semi-transparent background for better readability
          padding: 3,
          borderRadius: 2,
        }}>
        <Box marginTop={2} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            src={logo}
            alt="Subasthika Motors"
            style={{ width: 200, height: "auto", marginBottom: 16 }}
          />
        </Box>
        <Typography
          fontWeight={700}
          variant="h2"
          align="center"
          gutterBottom
        >
          Subasthika Motors
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigateTo("/view-vehicle")}
          >
            Vehicle
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigateTo("/view-estimate")}
          >
            Estimates
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

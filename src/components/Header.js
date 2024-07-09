import React from "react";
import { Box, Typography, Grid, Link } from "@mui/material";
import logo from "../assets/logo.jpg";
import { Link as RouterLink } from "react-router-dom";

const Header = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: "2px solid black",
        paddingBottom: 2,
        justifyContent: "space-between",
      }}
    >
      <Box marginTop={2} sx={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="Subasthika Motors"
          style={{ width: 100, height: "auto", marginRight: 20 }}
        />
        <Box>
          <Typography variant="h4" component="div">
            Subasthika Motors
          </Typography>
        </Box>
      </Box>
      <Box>
        <Grid container spacing={2}>
          <Grid item>
            <Link component={RouterLink} to="/add-car" underline="none">
              Add Vehicle
            </Link>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/" underline="none">
              Vehicle List
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Header;

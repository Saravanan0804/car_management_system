import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderTop: "2px solid black",
        paddingTop: 2,
        bottom: 0,
        paddingBottom: 4,
        justifyContent: "space-between", 
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" component="div">
            Subasthika Motors
          </Typography>
          <Typography variant="body1" component="div">
            Mudamavadi Junction, Nallur, Jaffna
          </Typography>
          <Typography variant="body1" component="div">
            0777111872 & 0766166601<br />abeesthurai97@gmail.com
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" align="right">
        © {new Date().getFullYear()} Subasthika Motors <br />All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import firebase from "../firebase";

const CarForm = () => {
  const [car, setCar] = useState({
    customerName: "",
    km: "",
    issues: "",
    date: "",
    vehicleNumber: "",
  });
  const history = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const carRef = firebase.database().ref("cars").child(id);
      carRef.on("value", (snapshot) => {
        const carData = snapshot.val();
        setCar(carData);
      });

      return () => {
        carRef.off();
      };
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCar((prevCar) => ({ ...prevCar, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const carsRef = firebase.database().ref("cars");
    if (id) {
      carsRef
        .child(id)
        .set(car)
        .then(() => history("/"));
    } else {
      carsRef.push(car).then(() => history("/"));
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" align="center">
              {id ? "Update Car" : "Add Car"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              name="customerName"
              value={car.customerName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="KM"
              name="km"
              value={car.km}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={car.date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vehicle Number"
              name="vehicleNumber"
              value={car.vehicleNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Issues"
              name="issues"
              value={car.issues}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {id ? "Update Car" : "Add Car"}
          </Button>
        </Grid>
      </form>
    </Container>
  );
};

export default CarForm;

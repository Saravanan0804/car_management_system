import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import firebase from "../firebase";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const CarForm = () => {
  const [car, setCar] = useState({
    customerName: "",
    km: "",
    date: "",
    vehicleNumber: "",
    issues: [{ description: "", amount: "" }],
  });
  const navigate = useNavigate();
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

  const handleIssueChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIssues = car.issues.map((issue, i) =>
      i === index ? { ...issue, [name]: value } : issue
    );
    setCar((prevCar) => ({ ...prevCar, issues: updatedIssues }));
  };

  const handleAddIssue = () => {
    setCar((prevCar) => ({
      ...prevCar,
      issues: [...prevCar.issues, { description: "", amount: "" }],
    }));
  };

  const handleRemoveIssue = (index) => {
    const updatedIssues = car.issues.filter((_, i) => i !== index);
    setCar((prevCar) => ({ ...prevCar, issues: updatedIssues }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const carsRef = firebase.database().ref("cars");
    if (id) {
      carsRef
        .child(id)
        .set(car)
        .then(() => navigate("/"));
    } else {
      carsRef.push(car).then(() => navigate("/"));
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
          {car.issues.map((issue, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={`Issue ${index + 1} Description`}
                  name="description"
                  value={issue.description}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Issue ${index + 1} Amount`}
                  name="amount"
                  type="number"
                  value={issue.amount}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleRemoveIssue(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddIssue}
              startIcon={<AddIcon />}
            >
              Add Issue
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {id ? "Update Car" : "Add Car"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CarForm;

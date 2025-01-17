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
import Header from "../components/Header"; 
import Footer from "../components/Footer";

const CarForm = () => {
  const [car, setCar] = useState({
    customerName: "",
    customerPhone: "",
    km: "",
    date: "",
    vehicleNumber: "",
    invoiceNumber: "",
    purchaseAmount: "",
    totalAmount: "",
    balance: "",
    issues: [{ description: "", qty: "", rate: "", amount: "" }],
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
    } else {
      const carsRef = firebase.database().ref("cars");
      carsRef.once("value", (snapshot) => {
        const cars = snapshot.val();
        const newInvoiceNumber = `SM${Object.keys(cars || {}).length + 1}`;
        setCar((prevCar) => ({ ...prevCar, invoiceNumber: newInvoiceNumber }));
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCar((prevCar) => {
      const updatedCar = { ...prevCar, [name]: value };

      if (name === "purchaseAmount") {
        updatedCar.balance = calculateBalance(
          updatedCar.totalAmount,
          parseFloat(value)
        );
      }

      return updatedCar;
    });
  };

  const handleIssueChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIssues = car.issues.map((issue, i) =>
      i === index
        ? {
            ...issue,
            [name]: value,
            amount:
              name === "qty" || name === "rate"
                ? name === "qty"
                  ? value * issue.rate
                  : value * issue.qty
                : issue.amount,
          }
        : issue
    );

    setCar((prevCar) => {
      const totalAmount = updatedIssues.reduce(
        (total, issue) => total + parseFloat(issue.amount || 0),
        0
      );
      const updatedCar = {
        ...prevCar,
        issues: updatedIssues,
        totalAmount: totalAmount,
        balance: calculateBalance(
          totalAmount,
          parseFloat(prevCar.purchaseAmount)
        ),
      };

      return updatedCar;
    });
  };

  const handleAddIssue = () => {
    setCar((prevCar) => ({
      ...prevCar,
      issues: [
        ...prevCar.issues,
        { description: "", qty: "", rate: "", amount: "" },
      ],
    }));
  };

  const handleRemoveIssue = (index) => {
    const updatedIssues = car.issues.filter((_, i) => i !== index);
    setCar((prevCar) => {
      const totalAmount = updatedIssues.reduce(
        (total, issue) => total + parseFloat(issue.amount || 0),
        0
      );
      const updatedCar = {
        ...prevCar,
        issues: updatedIssues,
        totalAmount: totalAmount,
        balance: calculateBalance(
          totalAmount,
          parseFloat(prevCar.purchaseAmount)
        ),
      };

      return updatedCar;
    });
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
      carsRef.push(car).then(() => navigate("/view-vehicle"));
    }
  };

  const handleCancel = () => {
    navigate("/view-vehicle");
  };

  const calculateBalance = (totalAmount, purchaseAmount) => {
    return totalAmount - (purchaseAmount || 0);
  };

  return (
    <Container>
      <Header />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h4" align="center">
              {id ? "Update Invoice Details" : "Add Invoice Details"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              name="customerName"
              required
              value={car.customerName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Phone"
              name="customerPhone"
              required
              value={car.customerPhone}
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
              required
              type="number"
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
              required
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
              required
              value={car.vehicleNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Invoice Number"
              name="invoiceNumber"
              value={car.invoiceNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} display={"flex"}>
          {car.issues.map((issue, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Issue ${index + 1} Description`}
                  name="description"
                  value={issue.description}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label={`Issue ${index + 1} Quantity`}
                  name="qty"
                  type="number"
                  value={issue.qty}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label={`Issue ${index + 1} Rate`}
                  name="rate"
                  type="number"
                  value={issue.rate}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label={`Issue ${index + 1} Amount`}
                  name="amount"
                  type="number"
                  value={issue.amount}
                  onChange={(e) => handleIssueChange(index, e)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2} marginTop={3}>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleRemoveIssue(index)}
                  style={{ color: "red" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Grid item xs={12} marginTop={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddIssue}
            startIcon={<AddIcon />}
          >
            Issue
          </Button>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Total Amount"
              name="totalAmount"
              type="number"
              value={car.totalAmount}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Purchase Amount"
              name="purchaseAmount"
              type="number"
              required
              value={car.purchaseAmount}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Balance"
              name="balance"
              type="number"
              value={car.balance}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12}
          marginTop={3}
          marginBottom={3}
          justifyContent="right"
          spacing={2}
        >
          <Grid item>
            <Button type="submit" variant="contained" color="primary">
              {id ? "Update Invoice" : "Add Invoice"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
      <Footer />
    </Container>
  );
};

export default CarForm;

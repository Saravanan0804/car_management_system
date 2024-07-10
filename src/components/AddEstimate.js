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

const EstimateForm = () => {
  const [estimate, setEstimate] = useState({
    customerName: "",
    customerPhone: "",
    km: "",
    date: "",
    vehicleNumber: "",
    estimateNumber: "",
    totalAmount: "",
    issues: [{ description: "", qty: "", rate: "", amount: "" }],
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const estimateRef = firebase.database().ref("estimates").child(id);
      estimateRef.on("value", (snapshot) => {
        const estimateData = snapshot.val();
        setEstimate(estimateData);
      });

      return () => {
        estimateRef.off();
      };
    } else {
      const estimatesRef = firebase.database().ref("estimates");
      estimatesRef.once("value", (snapshot) => {
        const estimates = snapshot.val();
        const newEstimateNumber = `SM-EM${
          Object.keys(estimates || {}).length + 1
        }`;
        setEstimate((prevEstimate) => ({
          ...prevEstimate,
          estimateNumber: newEstimateNumber,
        }));
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEstimate((prevEstimate) => {
      const updatedEstimate = { ...prevEstimate, [name]: value };
      return updatedEstimate;
    });
  };

  const handleIssueChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIssues = estimate.issues.map((issue, i) =>
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

    setEstimate((prevEstimate) => {
      const totalAmount = updatedIssues.reduce(
        (total, issue) => total + parseFloat(issue.amount || 0),
        0
      );
      const updatedEstimate = {
        ...prevEstimate,
        issues: updatedIssues,
        totalAmount: totalAmount,
      };

      return updatedEstimate;
    });
  };

  const handleAddIssue = () => {
    setEstimate((prevEstimate) => ({
      ...prevEstimate,
      issues: [
        ...prevEstimate.issues,
        { description: "", qty: "", rate: "", amount: "" },
      ],
    }));
  };

  const handleRemoveIssue = (index) => {
    const updatedIssues = estimate.issues.filter((_, i) => i !== index);
    setEstimate((prevEstimate) => {
      const totalAmount = updatedIssues.reduce(
        (total, issue) => total + parseFloat(issue.amount || 0),
        0
      );
      const updatedEstimate = {
        ...prevEstimate,
        issues: updatedIssues,
        totalAmount: totalAmount,
      };

      return updatedEstimate;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const estimatesRef = firebase.database().ref("estimates");
    if (id) {
      estimatesRef
        .child(id)
        .set(estimate)
        .then(() => navigate("/view-estimate"));
    } else {
      estimatesRef.push(estimate).then(() => navigate("/view-estimate"));
    }
  };

  const handleCancel = () => {
    navigate("/view-estimate");
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} marginTop={2}>
            <Typography variant="h4" align="center">
              {id ? "Update Estimate Details" : "Add Estimate Details"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              name="customerName"
              required
              value={estimate.customerName}
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
              value={estimate.customerPhone}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="KM"
              name="km"
              value={estimate.km}
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
              value={estimate.date}
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
              value={estimate.vehicleNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Estimate Number"
              name="estimateNumber"
              value={estimate.estimateNumber}
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
          {estimate.issues.map((issue, index) => (
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
              value={estimate.totalAmount}
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
          marginTop={2}
          marginBottom={3}
          justifyContent="right"
          spacing={2}
        >
          <Grid item>
            <Button type="submit" variant="contained" color="primary">
              {id ? "Update Estimate" : "Add Estimate"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default EstimateForm;

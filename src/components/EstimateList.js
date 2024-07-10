import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Grid,
  TablePagination,
  InputAdornment,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import firebase from "../firebase";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/logo.jpg";
import signatureImage from "../assets/logo.jpg";
import ConfirmationDialog from "./DialogBox";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchEstimates = () => {
    const estimatesRef = firebase.database().ref("estimates");
    estimatesRef.on("value", (snapshot) => {
      const estimates = snapshot.val();
      const estimateList = [];
      for (let id in estimates) {
        estimateList.unshift({ key: id, ...estimates[id] });
      }
      setEstimates(estimateList);
      setFilteredEstimates(estimateList);
    });
  };

  useEffect(() => {
    fetchEstimates();

    return () => {
      const estimatesRef = firebase.database().ref("estimates");
      estimatesRef.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id) => {
    const estimateRef = firebase.database().ref("estimates").child(id);
    estimateRef.remove().then(() => {
      fetchEstimates();
    });
  };

  const handleEdit = (id) => {
    navigate(`/edit-estimate/${id}`);
  };

  const handlePrint = (estimate) => {
    const doc = new jsPDF();

    const addLogo = () => {
      const logo = new Image();
      logo.src = logoImage;
      doc.addImage(logo, "JPEG", 10, 10, 50, 30);
    };

    const header = () => {
      addLogo();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Subasthika Motors", 70, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Mudamavadi Junction Nallur, Jaffna", 70, 24);
      doc.text("Contact: 0777111872 & 0766166601", 70, 32);
      doc.text("Gmail: abeesthurai97@gmail.com", 70, 40);
      doc.line(10, 50, 200, 50);
    };

    const content = () => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Customer Name: ${estimate.customerName}`, 10, 60);
      doc.text(`Vehicle Number: ${estimate.vehicleNumber}`, 10, 70);
      doc.text(`KM: ${estimate.km}`, 10, 80);
      doc.text(`Contact No.: ${estimate.customerPhone}`, 10, 90);

      doc.text(`${estimate.estimateNumber}`, 140, 60);
      doc.text(`${estimate.date}`, 140, 70);
      doc.setFont("helvetica", "normal");

      const issueRows = estimate.issues.map((issue, index) => [
        index + 1,
        issue.description,
        issue.qty,
        issue.rate,
        issue.amount,
      ]);
      doc.autoTable({
        head: [["Sr No.", "Product", "Qty", "Rate", "Amount"]],
        body: issueRows,
        startY: 100,
      });

      const totalAmount = estimate.issues.reduce(
        (total, issue) => total + parseFloat(issue.amount),
        0
      );
      doc.text(
        `Total Amount: ${totalAmount}`,
        10,
        doc.autoTable.previous.finalY + 10
      );
    };

    const addSignature = () => {
      const signature = new Image();
      signature.src = signatureImage;
      doc.addImage(signature, "JPEG", 145, 200, 50, 20);
      doc.setFontSize(12);
      doc.text("A.Abeeskar", 155, 230);
      doc.setFont("helvetica", "bold");
      doc.text("Signature", 155, 235);
      doc.setFont("helvetica", "normal");
    };

    header();
    content();
    addSignature();

    doc.save(`${estimate.customerName}_${estimate.estimateNumber}_invoice.pdf`);
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFilter(value);
    const filtered = estimates.filter(
      (estimate) =>
        estimate.customerName.toLowerCase().includes(value.toLowerCase()) ||
        estimate.vehicleNumber.toLowerCase().includes(value.toLowerCase()) ||
        estimate.estimateNumber.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEstimates(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDeleteDialog = (id) => {
    setEstimateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEstimateToDelete(null);
  };

  return (
    <Container>
      <Typography marginTop={2} variant="h4" align="center" gutterBottom>
        Estimate Details
      </Typography>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <TextField
            value={filter}
            onChange={handleFilterChange}
            fullWidth
            margin="normal"
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/add-estimate")}
            startIcon={<AddIcon />}
          >
            Estimate
          </Button>
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estimate No.</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Contact No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Vehicle No.</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEstimates
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((estimate) => {
                const totalAmount = estimate.issues.reduce(
                  (total, issue) => total + parseFloat(issue.amount),
                  0
                );
                return (
                  <TableRow key={estimate.key}>
                    {console.log(estimate)}
                    <TableCell>{estimate.estimateNumber}</TableCell>
                    <TableCell>{estimate.customerName}</TableCell>
                    <TableCell>{estimate.customerPhone}</TableCell>
                    <TableCell>{estimate.date}</TableCell>
                    <TableCell>{estimate.vehicleNumber}</TableCell>
                    <TableCell>{totalAmount}</TableCell>
                    <TableCell>
                      <IconButton
                        style={{ color: "blue" }}
                        onClick={() => handleEdit(estimate.key)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        style={{ color: "red" }}
                        onClick={() => openDeleteDialog(estimate.key)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        style={{ color: "green" }}
                        onClick={() => handlePrint(estimate)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredEstimates.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        carId={estimateToDelete}
      />
    </Container>
  );
};

export default EstimateList;

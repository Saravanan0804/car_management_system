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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import firebase from "../firebase";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/logo.jpg";
import signatureImage from "../assets/logo.jpg";
import ConfirmationDialog from "./DialogBox";

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchCars = () => {
    const carsRef = firebase.database().ref("cars");
    carsRef.on("value", (snapshot) => {
      const cars = snapshot.val();
      const carList = [];
      for (let id in cars) {
        carList.unshift({ key: id, ...cars[id] });
      }
      setCars(carList);
      setFilteredCars(carList);

      // Check for bills with balance due after 14 days
      const reminders = carList.reduce((acc, car) => {
        const daysDifference = calculateDaysDifference(car.date);
        if (car.balance > 0 && daysDifference > 14) {
          acc.push(car.invoiceNumber);
        }
        return acc;
      }, []);

      if (reminders.length > 0) {
        const reminderMessage = `You Need To Buy Balance Bill ${reminders.join(
          ", "
        )}`;
        toast.warning(reminderMessage, {
          autoClose: 5000,
          style: { textAlign: "center" },
          position: "top-center",
        });
      }
    });
  };

  useEffect(() => {
    fetchCars();

    return () => {
      const carsRef = firebase.database().ref("cars");
      carsRef.off();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id) => {
    const carRef = firebase.database().ref("cars").child(id);
    carRef.remove().then(() => {
      fetchCars();
    });
  };

  const handleEdit = (id) => {
    navigate(`/edit-car/${id}`);
  };

  const handlePrint = (car) => {
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
      doc.text(`Customer Name: ${car.customerName}`, 10, 60);
      doc.text(`Vehicle Number: ${car.vehicleNumber}`, 10, 70);
      doc.text(`KM: ${car.km}`, 10, 80);
      doc.text(`Contact No.: ${car.customerPhone}`, 10, 90);

      doc.text(`${car.invoiceNumber}`, 140, 60);
      doc.text(`${car.date}`, 140, 70);
      doc.setFont("helvetica", "normal");

      const issueRows = car.issues.map((issue, index) => [
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

      const totalAmount = car.issues.reduce(
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

    doc.save(`${car.customerName}_${car.invoiceNumber}_invoice.pdf`);
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFilter(value);
    const filtered = cars.filter(
      (car) =>
        car.customerName.toLowerCase().includes(value.toLowerCase()) ||
        car.vehicleNumber.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateDaysDifference = (date) => {
    const currentDate = new Date();
    const carDate = new Date(date);
    const differenceInTime = currentDate.getTime() - carDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays;
  };

  const openDeleteDialog = (id) => {
    setCarToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  return (
    <Container>
      <ToastContainer />
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <TextField
            label="Filter by Name or Vehicle Number"
            value={filter}
            onChange={handleFilterChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/add-car")}
          >
            Add Vehicle
          </Button>
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice No.</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Contact No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Vehicle No.</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCars
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((car) => {
                const totalAmount = car.issues.reduce(
                  (total, issue) => total + parseFloat(issue.amount),
                  0
                );
                return (
                  <TableRow key={car.key}>
                    <TableCell>{car.invoiceNumber}</TableCell>
                    <TableCell>{car.customerName}</TableCell>
                    <TableCell>{car.customerPhone}</TableCell>
                    <TableCell>{car.date}</TableCell>
                    <TableCell>{car.vehicleNumber}</TableCell>
                    <TableCell>{totalAmount}</TableCell>
                    <TableCell>{car.balance}</TableCell>
                    <TableCell>
                      <IconButton
                        style={{ color: "blue" }}
                        onClick={() => handleEdit(car.key)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        style={{ color: "red" }}
                        onClick={() => openDeleteDialog(car.key)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        style={{ color: "green" }}
                        onClick={() => handlePrint(car)}
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
        count={filteredCars.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        carId={carToDelete}
      />
    </Container>
  );
};

export default CarList;

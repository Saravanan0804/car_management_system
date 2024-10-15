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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/logo.jpg";
import signatureImage from "../assets/sign.jpg";
import ConfirmationDialog from "./DialogBox";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ShareIcon from "@mui/icons-material/Share";

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
      doc.addImage(logo, "PNG", 10, 10, 30, 30);
    };

    const header = () => {
      addLogo();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Subasthika Motors", 50, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Mudamavadi Junction Nallur, Jaffna", 50, 24);
      doc.text("Contact: 0777111872 & 0766166601", 50, 32);
      doc.text("Gmail: abeesthurai97@gmail.com", 50, 40);
      doc.line(10, 50, 200, 50);
    };

    const content = () => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Name:", 10, 60);
      doc.text(car.customerName, 60, 60);
      doc.text(`Vehicle Number:`, 10, 70);
      doc.text(car.vehicleNumber, 60, 70);
      doc.text(`KM:`, 10, 80);
      doc.text(car.km, 60, 80);
      doc.text(`Contact No.:`, 10, 90);
      doc.text(car.customerPhone, 60, 90);
      doc.setFontSize(18);
      doc.setTextColor("blue");
      doc.text(`${car.invoiceNumber}`, 140, 60);
      doc.setTextColor("black");
      doc.setFontSize(12);
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
        margin: { top: 100 },
        pageBreak: "auto",
        styles: { overflow: "linebreak", fontSize: 12 },
        columnStyles: { text: { cellWidth: "auto" } },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            header();
          }
        },
      });

      const totalAmount = car.issues.reduce(
        (total, issue) => total + parseFloat(issue.amount),
        0
      );
      const balance = totalAmount - car.purchaseAmount;
      const summaryRows = [
        ["", "", "Total", `Rs ${totalAmount}`],
        ["", "", "Purchase Amount", `Rs ${car.purchaseAmount}`],
        ["", "", "Balance", `Rs ${balance}`],
      ];

      doc.autoTable({
        body: summaryRows,
        startY: doc.autoTable.previous.finalY + 10,
        theme: "plain",
        styles: { fontSize: 12, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30, halign: "right" },
          3: { cellWidth: 50, halign: "right" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 2) {
            doc.setFont("normal");
          }
        },
      });

      return doc.autoTable.previous.finalY;
    };

    const addSignature = (startY) => {
      if (doc.internal.pageSize.getHeight() - startY < 40) {
        doc.addPage();
        startY = 20; // Start new page with sufficient top margin
      }
      const signature = new Image();
      signature.src = signatureImage;
      doc.addImage(signature, "JPEG", 145, startY + 10, 50, 20);
      doc.setFontSize(12);
      doc.text("A.Abeeskar", 155, startY + 40);
      doc.setFont("helvetica", "bold");
      doc.text("Signature", 155, startY + 45);
      doc.setFont("helvetica", "normal");
    };

    header();
    const finalY = content();
    addSignature(finalY);

    doc.save(`${car.customerName}_${car.invoiceNumber}_invoice.pdf`);
    const pdfBlob = doc.output("blob");

    if (navigator.share) {
      const file = new File([pdfBlob], `${car.customerName}_invoice.pdf`, {
        type: "application/pdf",
      });
  
      navigator
        .share({
          title: "Invoice",
          text: `Please find the invoice for ${car.customerName}`,
          files: [file],
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      // If share is not supported, download the PDF file
      doc.save(`${car.customerName}_${car.invoiceNumber}_invoice.pdf`);
    }
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFilter(value);
    const filtered = cars.filter(
      (car) =>
        car.customerName.toLowerCase().includes(value.toLowerCase()) ||
        car.vehicleNumber.toLowerCase().includes(value.toLowerCase()) ||
        car.invoiceNumber.toLowerCase().includes(value.toLowerCase())
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
      <Header />
      <Typography marginTop={2} variant="h4" align="center" gutterBottom>
        Invoice Details
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
            onClick={() => navigate("/add-car")}
            startIcon={<AddIcon />}
          >
            Invoice
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/view-estimate")}
          >
            Estimates
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
                      <IconButton
                        style={{ color: "purple" }}
                        onClick={() => handlePrint(car)}
                      >
                        <ShareIcon />
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
      <Footer />
    </Container>
  );
};

export default CarList;

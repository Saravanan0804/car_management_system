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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import firebase from "../firebase"; // Import Firebase instance
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CarList = () => {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

  const fetchCars = () => {
    const carsRef = firebase.database().ref("cars");
    carsRef.on("value", (snapshot) => {
      const cars = snapshot.val();
      const carList = [];
      for (let id in cars) {
        carList.push({ key: id, ...cars[id] });
      }
      setCars(carList);
    });
  };

  useEffect(() => {
    fetchCars();

    return () => {
      const carsRef = firebase.database().ref("cars");
      carsRef.off();
    };
  }, []);

  const handleDelete = (id) => {
    const carRef = firebase.database().ref("cars").child(id);
    carRef.remove().then(() => fetchCars());
  };

  const handleEdit = (id) => {
    navigate(`/edit-car/${id}`);
  };

  const handlePrint = (car) => {
    const doc = new jsPDF();

    // Add car details
    doc.text(`Customer Name: ${car.customerName}`, 10, 10);
    doc.text(`KM: ${car.km}`, 10, 20);
    doc.text(`Date: ${car.date}`, 10, 30);
    doc.text(`Vehicle Number: ${car.vehicleNumber}`, 10, 40);

    // Add issues table
    const issueRows = car.issues.map((issue, index) => [
      index + 1,
      issue.description,
      issue.amount,
    ]);
    doc.autoTable({
      head: [["#", "Description", "Amount"]],
      body: issueRows,
      startY: 50,
    });

    // Calculate and add total amount
    const totalAmount = car.issues.reduce(
      (total, issue) => total + parseFloat(issue.amount),
      0
    );
    doc.text(`Total Amount: ${totalAmount}`, 10, doc.autoTable.previous.finalY + 10);

    doc.save(`${car.customerName}_invoice.pdf`);
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/add-car")}
      >
        Add Car
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>KM</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Vehicle Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.key}>
                <TableCell>{car.customerName}</TableCell>
                <TableCell>{car.km}</TableCell>
                <TableCell>{car.date}</TableCell>
                <TableCell>{car.vehicleNumber}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(car.key)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(car.key)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handlePrint(car)}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CarList;

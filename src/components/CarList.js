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
import firebase from "../firebase"; // Import Firebase instance
import { useNavigate } from "react-router-dom";

const CarList = () => {
  const [cars, setCars] = useState([]);
  const history = useNavigate();

  const fetchCars = () => {
    const carsRef = firebase.database().ref('cars');
    carsRef.on('value', (snapshot) => {
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
      const carsRef = firebase.database().ref('cars');
      carsRef.off();
    };
  }, []);

  const handleDelete = (id) => {
    const carRef = firebase.database().ref("cars").child(id);
    carRef.remove().then(() => fetchCars());
  };

  const handleEdit = (id) => {
    history(`/edit-car/${id}`);
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="primary"
        onClick={() => history("/add-car")}
      >
        Add Car
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>KM</TableCell>
              <TableCell>Issues</TableCell>
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
                <TableCell>{car.issues}</TableCell>
                <TableCell>{car.date}</TableCell>
                <TableCell>{car.vehicleNumber}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(car.key)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(car.key)}>
                    <DeleteIcon />
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

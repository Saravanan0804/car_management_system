import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CarForm from "./components/CarForm";
import "./App.css";
import Header from "./components/Header"; 
import Footer from "./components/Footer";
import { Container } from "@mui/material";

function App() {
  return (
    <Router>
      <Container>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-car" element={<CarForm />} />
          <Route path="/edit-car/:id" element={<CarForm />} />
        </Routes>
        <Footer />
      </Container>
    </Router>
  );
}

export default App;

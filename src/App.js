import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CarForm from "./components/CarForm";
import "./App.css";
import EstimateForm from "./components/AddEstimate";
import EstimateList from "./components/EstimateList";
import CarList from "./components/CarList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/view-vehicle" element={<CarList />} />
        <Route path="/add-car" element={<CarForm />} />
        <Route path="/edit-car/:id" element={<CarForm />} />
        <Route path="/view-estimate" element={<EstimateList />} />
        <Route path="/add-estimate" element={<EstimateForm />} />
        <Route path="/edit-estimate/:id" element={<EstimateForm />} />
      </Routes>
    </Router>
  );
}

export default App;

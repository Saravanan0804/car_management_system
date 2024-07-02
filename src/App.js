import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CarForm from "./components/CarForm";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-car" element={<CarForm />} />
        <Route path="/edit-car/:id" element={<CarForm />} />
      </Routes>
    </Router>
  );
}

export default App;

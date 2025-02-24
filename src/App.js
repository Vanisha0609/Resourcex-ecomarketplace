import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";  // Ensure this file exists and matches import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* Lowercase route path */}
      </Routes>
    </Router>
  );
}

export default App;




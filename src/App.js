import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ✅ Check user's role in Firestore
        const buyerRef = doc(db, "buyers", currentUser.uid);
        const sellerRef = doc(db, "sellers", currentUser.uid);

        const buyerDoc = await getDoc(buyerRef);
        const sellerDoc = await getDoc(sellerRef);

        if (buyerDoc.exists()) {
          setRole("buyer");
        } else if (sellerDoc.exists()) {
          setRole("seller");
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/BuyerDashboard"
          element={user && role === "buyer" ? <BuyerDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/SellerDashboard"
          element={user && role === "seller" ? <SellerDashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to check user role in Firestore
  useEffect(() => {
    const checkUserRoleAndRedirect = async (user) => {
      if (!user) return; // Exit if no user is logged in

      try {
        const buyerRef = doc(db, "buyers", user.uid);
        const buyerSnap = await getDoc(buyerRef);
        if (buyerSnap.exists()) {
          navigate("/BuyerDashboard");
          return;
        }

        const sellerRef = doc(db, "sellers", user.uid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          navigate("/SellerDashboard");
          return;
        }

        alert("Your role is not set. Please sign up again.");
        auth.signOut();
        navigate("/signup");
      } catch (error) {
        console.error("Error checking user role:", error.message);
      }
    };

    // Listen for authentication state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRoleAndRedirect(user);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  // Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 bg-white shadow-md fixed top-0 left-0 right-0">
        <img src="/logo.png" alt="ResourceX Logo" className="h-24" />
        <div>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-green-600 border border-green-600 rounded-lg mr-4 hover:bg-green-100"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Login Form - Matching Signup Page Size */}
      <div className="bg-white p-10 rounded-lg shadow-lg mt-24 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full p-3 bg-green-600 text-white rounded-lg mb-4">
            Login
          </button>
        </form>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full p-3 bg-red-500 text-white rounded-lg flex justify-center items-center"
        >
          <img src="/google-icon.png" alt="Google Icon" className="h-5 w-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

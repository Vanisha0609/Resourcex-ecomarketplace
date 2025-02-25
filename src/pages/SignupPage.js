import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignupPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("buyer"); // Default role: buyer
  const navigate = useNavigate();

  // ✅ Handle Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ Validation checks
    if (!companyName || !firstName || !lastName || !email || !password || !confirmPassword) {
      alert("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed up:", user);

      // ✅ Store user details in Firestore
      const userRef = doc(db, role === "buyer" ? "buyers" : "sellers", user.uid);
      await setDoc(userRef, {
        companyName,
        firstName,
        lastName,
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      // ✅ Redirect based on user role
      if (role === "buyer") {
        navigate("/BuyerDashboard");
      } else {
        navigate("/SellerDashboard");
      }
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-24">
      <header className="w-full flex justify-between items-center p-6 bg-white shadow-md fixed top-0 left-0 right-0">
        <img src="/logo.png" alt="ResourceX Logo" className="h-20" />
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-100"
        >
          Login
        </button>
      </header>

      {/* Signup Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-24">
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>
        <form onSubmit={handleSignup} className="flex flex-col">
          {/* Role Selection */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-l-lg ${role === "buyer" ? "bg-green-600 text-white" : "bg-gray-200"}`}
              onClick={() => setRole("buyer")}
            >
              Buyer
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r-lg ${role === "seller" ? "bg-green-600 text-white" : "bg-gray-200"}`}
              onClick={() => setRole("seller")}
            >
              Seller
            </button>
          </div>

          {/* Input Fields */}
          <input
            type="text"
            placeholder="Company Name"
            className="border p-2 rounded mb-3"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded mb-3"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded mb-3"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded mb-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;







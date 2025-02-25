import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // Default role: buyer
  const navigate = useNavigate();

  // ✅ Handle Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      alert("All fields are required!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed up:", user);

      // ✅ Store user details in Firestore (buyers or sellers collection)
      const userRef = doc(db, role === "buyer" ? "buyers" : "sellers", user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      alert("Signup successful! Redirecting to login...");
      navigate("/login"); // ✅ Redirect to login page after signup
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  // ✅ Handle Google Signup
  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // ✅ Store user details in Firestore if first-time login
      const userRef = doc(db, role === "buyer" ? "buyers" : "sellers", user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      alert("Signup successful with Google! Redirecting to login...");
      navigate("/login"); // ✅ Redirect to login page after signup
    } catch (error) {
      console.error("Google Signup Error:", error.message);
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
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>
        <form onSubmit={handleSignup} className="flex flex-col">
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
          <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4">
          <p>OR</p>
          <button
            onClick={handleGoogleSignup}
            className="bg-blue-600 text-white p-2 rounded flex items-center justify-center mt-2 w-full"
          >
            <img src="/google-icon.png" alt="Google Icon" className="h-5 w-5 mr-2" />
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;





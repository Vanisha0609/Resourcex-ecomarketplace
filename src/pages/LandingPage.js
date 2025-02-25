import React from "react";
import { useNavigate } from "react-router-dom";

// Header Component
const Header = () => {
  const navigate = useNavigate(); // Ensure useNavigate is inside a functional component

  return (
    <header className="w-full flex justify-between items-center p-6 bg-white shadow-md fixed top-0 left-0 right-0">
      <img src="/logo.png" alt="ResourceX Logo" className="h-20" />
      <div>
        <button
          onClick={() => navigate("/login")} // Ensure navigation works
          className="px-4 py-2 text-green-600 border border-green-600 rounded-lg mr-4 hover:bg-green-100"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")} // Fix: Navigates to signup page
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};

// Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-24">
      <Header />

      {/* Main Section */}
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to ResourceX
        </h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          A circular economy marketplace where businesses can sell and buy
          industrial by-products efficiently, reducing waste and promoting
          sustainability.
        </p>

        {/* Images Section */}
        <div className="flex justify-center mt-8 space-x-4">
          <img
            src="/image1.png"
            alt="Recycling Process"
            className="h-48 w-48 object-cover rounded-lg shadow-lg"
          />
          <img
            src="/image2.jpg"
            alt="Industrial Waste"
            className="h-48 w-48 object-cover rounded-lg shadow-lg"
          />
          <img
            src="/image3.png"
            alt="Eco-friendly Products"
            className="h-48 w-48 object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage; // Ensure export is at the top level








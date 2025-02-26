import React from "react";
import { useNavigate } from "react-router-dom";

// Header Component
const Header = ({ navigate }) => {
  return (
    <header className="w-full flex justify-between items-center p-1 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <img
        src="/logo.png"
        alt="ResourceX Logo"
        className="h-20 "
      />
      <div>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 text-green-600 border-2 border-green-600 rounded-lg mr-4 hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-300"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate(); // Define navigate here

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 pt-24">
      <Header navigate={navigate} /> {/* Pass navigate as a prop */}

      {/* Hero Section */}
      <div className="text-center mt-12 px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-6 animate-fade-in">
          Welcome to ResourceX
        </h1>
        <p className="text-green-700 mt-4 text-xl max-w-2xl mx-auto animate-fade-in-up">
          A circular economy marketplace where businesses can sell and buy
          industrial by-products efficiently, reducing waste and promoting
          sustainability.
        </p>

        {/* Images Section */}
        <div className="flex justify-center mt-12 space-x-8 animate-fade-in-up">
          <div className="relative group">
            <img
              src="/image1.png"
              alt="Recycling Process"
              className="h-56 w-56 object-cover rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-green-800 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300"></div>
          </div>
          <div className="relative group">
            <img
              src="/image2.jpg"
              alt="Industrial Waste"
              className="h-56 w-56 object-cover rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-green-800 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300"></div>
          </div>
          <div className="relative group">
            <img
              src="/image3.png"
              alt="Eco-friendly Products"
              className="h-56 w-56 object-cover rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-green-800 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300"></div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="mt-12 animate-fade-in-up">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-300"
          >
            Join the Movement
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-12">
            Why Choose ResourceX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src="/icon1.png"
                alt="Eco-friendly"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Eco-friendly Solutions
              </h3>
              <p className="text-green-700">
                Promote sustainability by reusing industrial by-products.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src="/icon2.png"
                alt="Cost-effective"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Cost-effective
              </h3>
              <p className="text-green-700">
                Save costs by buying and selling unused resources.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src="/icon3.png"
                alt="Easy to Use"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Easy to Use
              </h3>
              <p className="text-green-700">
                A user-friendly platform for seamless transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="w-full bg-green-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-green-700 italic">
                "ResourceX has transformed the way we handle industrial waste.
                Highly recommended!"
              </p>
              <p className="text-green-800 font-bold mt-4">- John Doe</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-green-700 italic">
                "A game-changer for sustainable business practices."
              </p>
              <p className="text-green-800 font-bold mt-4">- Jane Smith</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-green-700 italic">
                "Easy to use and highly effective. Great platform!"
              </p>
              <p className="text-green-800 font-bold mt-4">- Mike Johnson</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Banner */}
      <div className="w-full bg-green-800 py-12 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the Circular Economy?
          </h2>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 text-green-800 bg-white rounded-lg hover:bg-green-50 hover:shadow-lg transition-all duration-300"
          >
            Sign Up Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-green-900 text-white text-center py-6">
        <p className="text-lg">
          &copy; 2025 ResourceX. All rights reserved.{" "}
          <span className="text-green-400">♻ Recycle. Reuse. Renew.</span>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

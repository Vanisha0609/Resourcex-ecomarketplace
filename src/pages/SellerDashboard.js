import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";  // ✅ Fix applied

const SellerDashboard = () => {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "products"), where("sellerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);  // ✅ Fix applied
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-5">
        <h2 className="text-xl font-bold mb-5">Seller Dashboard</h2>
        <button
          className={`p-3 rounded ${selectedOption === "dashboard" ? "bg-gray-700" : ""}`}
          onClick={() => setSelectedOption("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`p-3 rounded mt-2 ${selectedOption === "addProduct" ? "bg-gray-700" : ""}`}
          onClick={() => setSelectedOption("addProduct")}
        >
          Add Products
        </button>
        <button
          className={`p-3 rounded mt-2 ${selectedOption === "salesSummary" ? "bg-gray-700" : ""}`}
          onClick={() => setSelectedOption("salesSummary")}
        >
          Sales Summary
        </button>
        <button
          className="p-3 rounded mt-auto bg-red-600 hover:bg-red-700"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5">
        {selectedOption === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Products</h2>
            {products.length > 0 ? (
              <ul>
                {products.map((product) => (
                  <li key={product.id} className="border p-3 mb-2">
                    <strong>{product.name}</strong> - ${product.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products added yet.</p>
            )}
          </div>
        )}

        {selectedOption === "addProduct" && (
          <div>
            <h2 className="text-2xl font-bold">Add a New Product</h2>
            <p>Form to add a product will go here.</p>
          </div>
        )}

        {selectedOption === "salesSummary" && (
          <div>
            <h2 className="text-2xl font-bold">Sales Summary</h2>
            <p>Sales data will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;




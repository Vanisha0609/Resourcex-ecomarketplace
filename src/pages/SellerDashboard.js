import React, { useState, useEffect } from "react";
import { impactdata } from "../impactdata";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { signOut } from "firebase/auth";
import SalesChart from "../components/SalesChart";
// import SellerChatbot from "../components/SellerChatbot";
import { LayoutDashboard, ShoppingBag, PackagePlus, LogOut } from "lucide-react";
import Confetti from "react-confetti"; // Import Confetti

const SellerDashboard = () => {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Metal and Alloy");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

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
  

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName || !description || !category || !price || !image) {
      alert("All fields are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated");
        return;
      }

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${user.uid}/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);
      const impact = impactdata[category] || { co2Saved: 0, wasteDiverted: 0, energySaved: 0};
      // Add product to Firestore
      await addDoc(collection(db, "products"), {
        sellerId: user.uid,
        name: productName,
        description,
        category,
        price: parseFloat(price),
        co2Saved: impact.co2Saved,
        wasteDiverted: impact.wasteDiverted,
        energySaved: impact.energySaved,
        imageUrl,
        createdAt: new Date(),
      });

      

      // Refresh the product list
      fetchProducts();

      // Show confetti and popup message
      setShowConfetti(true); // Trigger confetti
      setPopupMessage("Product added successfully!");
      setTimeout(() => {
        setShowConfetti(false); // Hide confetti after 5 seconds
        setPopupMessage("");
      }, 5000);

      // Reset form
      setProductName("");
      setDescription("");
      setCategory("Metal and Alloy");
      setPrice("");
      setImage(null);
      document.getElementById("imageInput").value = "";
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId, imageUrl) => {
    try {
      // Extract correct storage path from full image URL
      const imagePath = imageUrl.split("/o/")[1].split("?")[0]; // Get part after '/o/' and remove query params
      const decodedPath = decodeURIComponent(imagePath); // Decode URL encoding

      // Delete product from Firestore
      await deleteDoc(doc(db, "products", productId));

      // Delete image from Firebase Storage
      const imageRef = ref(storage, decodedPath);
      await deleteObject(imageRef);

      // Update UI
      setProducts(prev => prev.filter(product => product.id !== productId));

      setPopupMessage("Product deleted successfully!");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth} // Cover full width
          height={window.innerHeight} // Cover full height
          recycle={false} // Stop confetti after animation
        />
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-5 px-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">Seller Dashboard</h1>
        <p className="text-lg text-center max-w-2xl mx-auto">
          Manage your products and track your sales with ease.
        </p>
      </div>

      <div className="flex min-h-[calc(100vh-200px)]"> {/* Ensure full height */}
        {/* Sidebar */}
        <div className="w-64 bg-green-800 text-white flex flex-col p-5 rounded-lg shadow-lg mr-6">
          <h2 className="text-xl font-bold mb-5">Menu</h2>

          <button
            className={`p-3 rounded flex items-center ${
              selectedOption === "dashboard" ? "bg-green-700" : "hover:bg-green-700"
            }`}
            onClick={() => setSelectedOption("dashboard")}
          >
            <LayoutDashboard className="w-6 h-6 mr-2" /> Dashboard
          </button>

          <button
            className={`p-3 rounded flex items-center ${
              selectedOption === "addProduct" ? "bg-green-700" : "hover:bg-green-700"
            }`}
            onClick={() => setSelectedOption("addProduct")}
          >
            <PackagePlus className="w-6 h-6 mr-2" /> Add Products
          </button>

          <button
            className={`p-3 rounded flex items-center ${
              selectedOption === "yourProducts" ? "bg-green-700" : "hover:bg-green-700"
            }`}
            onClick={() => setSelectedOption("yourProducts")}
          >
            <ShoppingBag className="w-6 h-6 mr-2" /> Your Products
          </button>

          {/* <button
            className="p-3 rounded flex items-center bg-blue-600 hover:bg-blue-700 mt-4"
            onClick={() => setSelectedOption("chatbot")}
          >
            <MessageSquare className="w-6 h-6 mr-2" /> Seller Support
          </button> */}

          <button
            className="p-3 rounded mt-auto bg-red-600 hover:bg-red-700 flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="w-6 h-6 mr-2" /> Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
          {selectedOption === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-green-800">📊 Sales Analytics</h2>

              {/* Dashboard Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-xl shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">💰 Total Earnings</h2>
                  <p className="text-2xl font-bold text-green-600">₹12,340</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">📦 Total Orders</h2>
                  <p className="text-2xl font-bold text-blue-600">275</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">🛒 Products Sold</h2>
                  <p className="text-2xl font-bold text-purple-600">135</p>
                </div>
              </div>

              {/* Sales Analytics Chart */}
              <div className="mt-6">
                <SalesChart />
              </div>
            </div>
          )}

          {/* {selectedOption === "chatbot" && <SellerChatbot />} */}

          {selectedOption === "yourProducts" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-800">Your Products</h2>
              {products.length > 0 ? (
                <ul>
                  {products.map((product) => (
                    <li key={product.id} className="border p-3 mb-2 flex gap-4 items-center">
                      <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <strong>{product.name}</strong> - ${product.price}
                        <p className="text-gray-600">{product.description}</p>
                      </div>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleDeleteProduct(product.id, product.imageUrl)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No products added yet.</p>
              )}
            </div>
          )}
          {selectedOption === "addProduct" && (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold text-green-800">Add a New Product</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-3 mt-4 flex-1">
                {/* Product Name Input */}
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                {/* Description Textarea */}
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                {/* Category Dropdown */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Chemical and Petrochemical">Chemical and Petrochemical</option>
                  <option value="Metal and Alloy">Metal and Alloy</option>
                  <option value="Textile & Leather">Textile & Leather</option>
                  <option value="Paper & Pulp">Paper & Pulp</option>
                  <option value="Construction & Demolition">Construction & Demolition</option>
                  <option value="Agricultural & Food Processing">Agricultural & Food Processing</option>
                  <option value="Metal">Metal</option>
                  <option value="Plastic & Polymer">Plastic & Polymer</option>
                  <option value="Glass & Ceramics">Glass & Ceramics</option>
                </select>

                {/* Price Input */}
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                {/* Image Upload Input */}
                <input
                  type="file"
                  id="imageInput"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                >
                  Add Product
                </button>
              </form>
            </div>
          )}

          {popupMessage && (
            <div className="bg-green-500 text-white p-3 mb-3 text-center rounded-lg">
              {popupMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; // Ensure this is at the top level

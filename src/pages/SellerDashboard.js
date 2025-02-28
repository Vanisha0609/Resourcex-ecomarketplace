
import React, { useState, useEffect } from "react";
import { impactdata } from "../impactdata";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { signOut } from "firebase/auth";

const SellerDashboard = () => {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Metal and Alloy");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
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

      // Show popup message
      setPopupMessage("Product added successfully!");
      setTimeout(() => setPopupMessage(""), 3000);

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
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 text-white flex flex-col p-5">
        <h2 className="text-xl font-bold mb-5">Seller Dashboard</h2>
        <button className={`p-3 rounded flex items-center ${selectedOption === "dashboard" ? "bg-gray-700" : ""}`} onClick={() => setSelectedOption("dashboard")}>
          <img src="/dashlogo.png" alt="Dashboard Logo" className="w-6 h-6 mr-2 bg-transparent" />
          Dashboard
        </button>
        <button className={`p-3 rounded flex items-center ${selectedOption === "addProduct" ? "bg-gray-700" : ""}`} onClick={() => setSelectedOption("addProduct")}>
          <img src="/prodlogo.png" alt="Add products" className="w-6 h-6 mr-2 bg-transparent" />
          Add Products
        </button>
        <button className="p-3 rounded mt-auto bg-red-600 hover:bg-red-700" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <div className="flex-1 p-5">
        {popupMessage && <div className="bg-green-500 text-white p-3 mb-3 text-center rounded">{popupMessage}</div>}

        {selectedOption === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Products</h2>
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
          <div>
            <h2 className="text-2xl font-bold">Add a New Product</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-3 mt-4">
              <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="border p-2 rounded" required />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" required></textarea>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
                {["Metal and Alloy", "Chemical and Petrochemical", "Construction & Demolition", "Agricultural & Food Processing", "Textile & Leather", "Paper & Pulp", "Plastic & Polymer", "Electronic Waste & E-Scrap", "Pharmaceutical & Biochemical", "Glass & Ceramics"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" required />
              <input type="file" id="imageInput" onChange={(e) => setImage(e.target.files[0])} className="border p-2 rounded" required />
              <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Add Product</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;

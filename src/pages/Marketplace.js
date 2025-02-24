import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card"; 
import { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db, auth, provider } from "../firebase";
import { FaSearch, FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Persist user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch products in real-time from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      setFilteredProducts(productsList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      setFilteredProducts(productsList);
    };
    fetchProducts();
  }, []);

  // Email/Password Authentication
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/Dashboard");  // Redirect after registration
    } catch (error) {
      console.error("Registration Error:", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const resetPassword = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error("Password Reset Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Google Login
  const handleLoginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Handle adding a new product to Firestore
  const handleAddProduct = async () => {
    if (!user) {
      alert("You must be logged in to add a product.");
      return;
    }
    if (!newProduct.name || !newProduct.category || !newProduct.price || isNaN(newProduct.price) || newProduct.price <= 0) {
      alert("Please enter valid product details.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), newProduct);
      setNewProduct({ name: "", category: "", price: "" });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Search functionality
  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
        Circular Economy Marketplace
      </h1>

      {/* Login & Reset Password Buttons */}
      {!user ? (
        <div className="flex flex-col space-y-4">
          <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded-lg" />
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded-lg" />
          <Button onClick={handleLogin}>Login</Button>
          <Button onClick={handleRegister}>Register</Button>
          <Button onClick={resetPassword} className="bg-gray-400 text-white">Reset Password</Button>
          <Button onClick={handleLoginWithGoogle} className="bg-blue-500 text-white">Sign in with Google</Button>
        </div>
      ) : (
        <div className="mb-4 flex justify-between items-center">
          <p className="font-semibold text-lg">Welcome, <span className="text-green-500">{user.displayName || "User"}</span></p>
          <Button className="bg-red-500 text-white hover:bg-red-600 transition-all" onClick={handleLogout}>Logout</Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center mb-6 bg-white shadow-md rounded-lg p-2">
        <input type="text" placeholder="Search products..." className="p-2 w-full border-none focus:ring-0 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FaSearch className="ml-2 text-gray-500" />
      </div>

      {/* Add New Product */}
      {user && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Add a New Product</h2>
          <input type="text" placeholder="Product Name" className="p-2 w-full border mb-2 rounded-lg" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input type="text" placeholder="Category" className="p-2 w-full border mb-2 rounded-lg" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
          <input type="text" placeholder="Price" className="p-2 w-full border mb-2 rounded-lg" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <Button className="bg-green-500 text-white w-full" onClick={handleAddProduct}><FaPlusCircle className="mr-2" /> Add Product</Button>
        </div>
      )}

      {/* Product List */}
      {filteredProducts.length > 0 ? filteredProducts.map((product) => (
        <Card key={product.id} className="p-4 shadow-md bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600">Category: {product.category}</p>
          <p className="font-bold text-lg">Price: ₹{product.price}</p>
        </Card>
      )) : <p className="text-gray-500">No products found.</p>}
    </div>
  );
}




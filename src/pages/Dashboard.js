import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Button } from "../components/ui/Button";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/"); // Redirect to login if not logged in
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Dashboard
      </h1>

      {user && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">Welcome, {user.displayName || user.email}</h2>
        </div>
      )}

      {/* List of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="p-4 shadow-md bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">Category: {product.category}</p>
              <p className="font-bold text-lg">Price: ₹{product.price}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No products available.</p>
        )}
      </div>

      {/* Back to Marketplace */}
      <div className="mt-6 flex justify-center">
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => navigate("/")}>
          Back to Marketplace
        </Button>
      </div>
    </div>
  );
}

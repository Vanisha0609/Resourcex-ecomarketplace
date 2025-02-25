import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(), // Ensure timestamp is a Date object
      }));

      // Extract unique categories
      const uniqueCategories = [...new Set(productList.map((product) => product.category))];
      setCategories(uniqueCategories);

      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let updatedProducts = [...products];

    // Filter by category
    if (selectedCategory) {
      updatedProducts = updatedProducts.filter((product) => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange.min !== "" && priceRange.max !== "") {
      updatedProducts = updatedProducts.filter(
        (product) => product.price >= priceRange.min && product.price <= priceRange.max
      );
    }

    // Sort products
    if (sortOrder === "latest") {
      updatedProducts.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortOrder === "high-to-low") {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "low-to-high") {
      updatedProducts.sort((a, b) => a.price - b.price);
    }

    setFilteredProducts(updatedProducts);
  }, [selectedCategory, priceRange, sortOrder, products]);

  // Add to Cart function
  const addToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
    // You can save the product to Firestore or local storage for cart functionality
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Buyer Dashboard</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Category Filter */}
          <select
            className="p-2 border rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>

          {/* Price Range Filter */}
          <input
            type="number"
            placeholder="Min Price"
            className="p-2 border rounded"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="p-2 border rounded"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />

          {/* Sort Options */}
          <select
            className="p-2 border rounded"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="latest">Latest</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="low-to-high">Price: Low to High</option>
          </select>
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-200 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="text-gray-700">Category: {product.category}</p>
                <p className="text-gray-900 font-semibold">${product.price}</p>
                <p className="text-gray-600">Quantity: {product.quantity}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700 w-full"
                >
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-2">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;

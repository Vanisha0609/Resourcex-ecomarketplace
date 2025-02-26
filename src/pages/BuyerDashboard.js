import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import mockProducts from "../mockProducts"; // Import mock data
import { FaHeart, FaShoppingCart, FaTimes, FaStar, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Import icons

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Pagination
  const [wishlist, setWishlist] = useState([]); // Wishlist feature
  const [quantity, setQuantity] = useState(1); // Quantity selector state
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      let productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      // If Firebase has no products, fallback to mock data
      if (productList.length === 0) {
        console.warn("No products found in Firebase. Using mock data.");
        productList = mockProducts;
      }

      const uniqueCategories = [...new Set(productList.map((product) => product.category))];
      setCategories(uniqueCategories);
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Error fetching products from Firebase, using mock data:", error);
      setProducts(mockProducts); // Use mock data if Firebase fetch fails
      setFilteredProducts(mockProducts);
      setCategories([...new Set(mockProducts.map((product) => product.category))]);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  // Filter and sort products
  useEffect(() => {
    let updatedProducts = [...products];

    // Search filter
    if (searchQuery.trim() !== "") {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
    setCurrentPage(1); // Reset pagination on filter change
  }, [selectedCategory, priceRange, sortOrder, searchQuery, products]);

  // Add to Cart function
  const addToCart = (product, quantity) => {
    alert(Added ${quantity} ${product.name}(s) to cart!);
  };

  // Add to Wishlist function
  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item.id === product.id)) {
      setWishlist([...wishlist, product]);
      alert(Added ${product.name} to wishlist!);
    } else {
      alert(${product.name} is already in your wishlist!);
    }
  };

  // Quantity selector handlers
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= selectedProduct.quantity) {
      setQuantity(newQuantity);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-5 px-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to ResourceX</h1>
        <p className="text-lg text-center max-w-2xl mx-auto">
          Discover a wide range of products and contribute to a sustainable future.
        </p>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-800 animate-fade-in">
          Buyer Dashboard
        </h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Category Filter */}
          <select
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />

          {/* Sort Options */}
          <select
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="latest">Latest</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="low-to-high">Price: Low to High</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105 animate-fade-in-up relative"
                    onClick={() => {
                      setSelectedProduct(product);
                      setQuantity(1); // Reset quantity when a new product is selected
                    }}
                  >
                    {/* Ribbon for Featured Products */}
                    {product.isFeatured && (
                      <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 rounded-bl-lg">
                        Featured
                      </div>
                    )}

                    {/* Product Image */}
                    <img
                      src={product.image} // Ensure your product data includes an image field
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-green-800">{product.name}</h3>
                    <p className="text-gray-600">Category: {product.category}</p>
                    <p className="text-green-900 font-semibold">${product.price}</p>
                    <p className="text-gray-600">Quantity: {product.quantity}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1); // Default quantity for quick add
                        }}
                        className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToWishlist(product);
                        }}
                        className="flex-1 bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <FaHeart /> Wishlist
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-2">No products found.</p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 items-center gap-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaArrowLeft />
              </button>
              {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-white text-green-600 border border-green-600"
                  } hover:bg-green-700 hover:text-white transition-colors duration-300`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaArrowRight />
              </button>
            </div>
          </>
        )}

        {/* Product Pop-up Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in backdrop-blur-sm">
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="text-2xl" />
              </button>

              {/* Product Image in Modal */}
              <img
                src={selectedProduct.image} // Ensure your product data includes an image field
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-2xl font-bold text-green-800">{selectedProduct.name}</h3>
              <p className="text-gray-700 mt-2">{selectedProduct.description}</p>
              <p className="text-green-900 font-semibold mt-2">Price: ${selectedProduct.price}</p>
              <p className="text-gray-600">Available Quantity: {selectedProduct.quantity}</p>

              {/* Product Rating */}
              <div className="flex items-center mt-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-yellow-500 ${
                      index < selectedProduct.rating ? "fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center mt-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="bg-gray-200 text-gray-700 p-2 rounded-l-lg hover:bg-gray-300 transition-colors duration-300"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="bg-gray-100 px-4 py-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="bg-gray-200 text-gray-700 p-2 rounded-r-lg hover:bg-gray-300 transition-colors duration-300"
                  disabled={quantity >= selectedProduct.quantity}
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    addToCart(selectedProduct, quantity);
                  }}
                  className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    addToWishlist(selectedProduct);
                  }}
                  className="flex-1 bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FaHeart /> Wishlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;

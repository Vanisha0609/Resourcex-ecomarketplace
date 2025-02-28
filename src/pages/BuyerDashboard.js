import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { FaHeart, FaShoppingCart, FaTimes, FaStar, FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

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
  const [itemsPerPage] = useState(6);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [co2Saved, setCo2Saved] = useState(0); // CO2 saved in tons
  const [wasteDiverted, setWasteDiverted] = useState(0); // Waste diverted in kg
  const [energySaved, setEnergySaved] = useState(0); // Energy saved in kWh

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchCart();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, priceRange, sortOrder, searchQuery, products]);

  useEffect(() => {
    const { co2, waste, energy} = calculateImpact(cart);
    setCo2Saved(co2);
    setWasteDiverted(waste);
    setEnergySaved(energy);
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate() || new Date(),
      }));

      const uniqueCategories = [...new Set(productList.map((product) => product.category))];
      setCategories(uniqueCategories);
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((product) => {
        const price = product.price;
        return (
          (!priceRange.min || price >= parseFloat(priceRange.min)) &&
          (!priceRange.max || price <= parseFloat(priceRange.max))
        );
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    if (sortOrder === "latest") {
      filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortOrder === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  const fetchWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const wishlistRef = doc(db, "wishlists", user.uid);
      const wishlistDoc = await getDoc(wishlistRef);

      if (wishlistDoc.exists()) {
        setWishlist(wishlistDoc.data().items);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        setCart(cartDoc.data().items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (product, quantity) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const cartItems = cartDoc.data().items || [];
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);

        if (existingItemIndex !== -1) {
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          cartItems.push({ ...product, quantity });
        }

        await setDoc(cartRef, { items: cartItems });
      } else {
        await setDoc(cartRef, { items: [{ ...product, quantity }] });
      }

      alert(`Added ${quantity} ${product.name}(s) to cart!`);
      fetchCart(); // Refresh cart data
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart. Please try again.");
    }
  };

  const removeFromCart = async (product) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const cartItems = cartDoc.data().items || [];
        const updatedCartItems = cartItems.filter((item) => item.id !== product.id);

        await setDoc(cartRef, { items: updatedCartItems });
        setCart(updatedCartItems);
        alert(`Removed ${product.name} from cart!`);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Error removing from cart. Please try again.");
    }
  };

  const addToWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to add items to your wishlist.");
      return;
    }

    try {
      const wishlistRef = doc(db, "wishlists", user.uid);
      const wishlistDoc = await getDoc(wishlistRef);

      if (wishlistDoc.exists()) {
        const wishlistItems = wishlistDoc.data().items || [];
        const existingItemIndex = wishlistItems.findIndex((item) => item.id === product.id);

        if (existingItemIndex === -1) {
          wishlistItems.push(product);
          await setDoc(wishlistRef, { items: wishlistItems });
          setWishlist(wishlistItems);
          alert(`Added ${product.name} to wishlist!`);
        } else {
          alert(`${product.name} is already in your wishlist!`);
        }
      } else {
        await setDoc(wishlistRef, { items: [product] });
        setWishlist([product]);
        alert(`Added ${product.name} to wishlist!`);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Error adding to wishlist. Please try again.");
    }
  };

  const removeFromWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const wishlistRef = doc(db, "wishlists", user.uid);
      await updateDoc(wishlistRef, {
        items: arrayRemove(product),
      });

      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      alert(`Removed ${product.name} from wishlist!`);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Error removing from wishlist. Please try again.");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= selectedProduct.quantity) {
      setQuantity(newQuantity);
    }
  };

  const calculateImpact = (cart) => {
    let co2 = 0; // in tons
    let waste = 0; // in kg
    let energy = 0; // in kWh

    cart.forEach((item) => {
      co2 += (item.co2Saved || 0) * item.quantity;
      waste += (item.wasteDiverted || 0) * item.quantity;
      energy += (item.energySaved || 0) * item.quantity;
    });

    return { co2, waste, energy};
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full text-left p-2 rounded-lg ${
                activeSection === "dashboard" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("wishlist")}
              className={`w-full text-left p-2 rounded-lg ${
                activeSection === "wishlist" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Wishlist
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("cart")}
              className={`w-full text-left p-2 rounded-lg ${
                activeSection === "cart" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Cart
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("impact")}
              className={`w-full text-left p-2 rounded-lg ${
                activeSection === "impact" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Impact
            </button>
            
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-5 px-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">Welcome to ResourceX</h1>
          <p className="text-lg text-center max-w-2xl mx-auto">
            Discover a wide range of products and contribute to a sustainable future.
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          {activeSection === "dashboard" && (
            <>
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
                            setQuantity(1);
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
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="text-xl font-bold text-green-800">{product.name}</h3>
                          <p className="text-gray-600">Category: {product.category}</p>
                          <p className="text-green-900 font-semibold">${product.price}</p>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
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
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-2xl font-bold text-green-800">{selectedProduct.name}</h3>
                    <p className="text-gray-700 mt-2">{selectedProduct.description}</p>
                    <p className="text-green-900 font-semibold mt-2">Price: ${selectedProduct.price}</p>

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
                          setSelectedProduct(null); // Close modal after adding to cart
                        }}
                        className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          addToWishlist(selectedProduct);
                          setSelectedProduct(null); // Close modal after adding to wishlist
                        }}
                        className="flex-1 bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <FaHeart /> Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Wishlist Section */}
          {activeSection === "wishlist" && (
            <div className="mt-6">
              <h2 className="text-3xl font-bold text-center mb-6 text-green-800">Wishlist</h2>
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105 animate-fade-in-up relative"
                      onClick={() => {
                        setSelectedProduct(product);
                        setQuantity(1);
                      }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-xl font-bold text-green-800">{product.name}</h3>
                      <p className="text-gray-600">Category: {product.category}</p>
                      <p className="text-green-900 font-semibold">${product.price}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(product);
                          }}
                          className="flex-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-2">Your wishlist is empty.</p>
              )}
            </div>
          )}

          {/* Cart Section */}
          {activeSection === "cart" && (
            <div className="mt-6">
              <h2 className="text-3xl font-bold text-center mb-6 text-green-800">Cart</h2>
              {cart.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105 animate-fade-in-up relative"
                      onClick={() => {
                        setSelectedProduct(item);
                        setQuantity(item.quantity);
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-xl font-bold text-green-800">{item.name}</h3>
                      <p className="text-gray-600">Category: {item.category}</p>
                      <p className="text-green-900 font-semibold">${item.price}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 1);
                          }}
                          className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item);
                          }}
                          className="flex-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-2">Your cart is empty.</p>
              )}
            </div>
          )}

           {/* Impact Section */}
           {activeSection === "impact" && (
  <div className="mt-6">
    <h2 className="text-3xl font-bold text-center mb-6 text-green-800">Your Sustainability Impact</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Carbon Footprint Reduction Widget */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-green-800 mb-4">Carbon Footprint Reduction</h3>
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-green-800">{co2Saved.toFixed(1)}t</span>
          </div>
        </div>
        <p className="text-gray-700 text-center mt-4">
          You've saved <span className="font-bold text-green-800">{co2Saved.toFixed(1)} tons</span> of CO2 emissions through your purchases.
        </p>
      </div>

      {/* Waste Diverted Widget */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-green-800 mb-4">Waste Diverted</h3>
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-green-800">{wasteDiverted.toFixed(1)}kg</span>
          </div>
        </div>
        <p className="text-gray-700 text-center mt-4">
          You've diverted <span className="font-bold text-green-800">{wasteDiverted.toFixed(1)}kg</span> of waste from landfills.
        </p>
      </div>

      {/* Sustainability Goals Widget */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
  <h3 className="text-xl font-bold text-green-800 mb-4">Sustainability Goals</h3>
  <div className="flex items-center justify-center">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
      <span className="text-2xl font-bold text-green-800">
        {((co2Saved / 10) * 100).toFixed(0)}% {/* Goal: 10 tons of CO2 saved */}
      </span>
    </div>
  </div>
  <p className="text-gray-700 text-center mt-4">
    You've saved <span className="font-bold text-green-800">{co2Saved.toFixed(1)} tons</span> of CO2 out of a goal of{" "}
    <span className="font-bold text-green-800">10 tons</span>.
  </p>
</div>
    </div>

    {/* Detailed Impact Breakdown */}
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-green-800 mb-4">Detailed Impact Breakdown</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-700">CO2 Emissions Saved</p>
          <p className="text-green-800 font-bold">{co2Saved.toFixed(1)} tons</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-700">Waste Diverted</p>
          <p className="text-green-800 font-bold">{wasteDiverted.toFixed(1)}kg</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-700">Energy Saved</p>
          <p className="text-green-800 font-bold">{energySaved.toFixed(1)} kWh</p>
        </div>
        
      </div>
    </div>

    {/* Sustainability Progress Bar */}
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-green-800 mb-4">Your Progress Towards Sustainability Goals</h3>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-600 h-4 rounded-full"
          style={{ width: `${(co2Saved / 10) * 100}%` }} // Example: 2 tons is 100% goal
        ></div>
      </div>
      <p className="text-gray-700 text-center mt-2">
        You're <span className="font-bold text-green-800">{((co2Saved / 10) * 100).toFixed(0)}%</span> of the way to your sustainability goals!
      </p>
    </div>
  </div>
)}
  
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { auth, provider, signInWithPopup } from "../firebaseConfig";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const travelImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80",
];

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Change carousel image every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % travelImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASEURL}/api/login`, formData);
      toast.success('Login successful!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setTimeout(() => { navigate('/home') }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);

      // Send Google user data to backend
      const googleUserData = {
        googleId: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASEURL}/api/google-signin`, googleUserData);

      if (response.status === 200) {
        toast.success(`Welcome ${result.user.displayName}!`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => { navigate('/home') }, 2000);
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in was cancelled. Please try again.");
      } else {
        toast.error("Google Sign-in failed. Please try again.");
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Blurred Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${travelImages[currentImage]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
        }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Overlay with subtle floating animation */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Carousel */}
        <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={travelImages[currentImage]}
              alt="Travel"
              className="w-full h-full object-cover absolute inset-0"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Right Form */}
        <form onSubmit={handleLogin} className="md:w-1/2 p-8 flex flex-col justify-center bg-gray-50/70 backdrop-blur-sm">
          {/* NEW LOGIN HEADING */}
          <motion.h1
            className="text-4xl font-extrabold mb-4 text-gray-800 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Login
          </motion.h1>

          {/* Subheading */}
          <motion.h2
            className="text-2xl font-bold mb-6 text-gray-800 text-center"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Explore the Beauty of Karnataka
          </motion.h2>

          {/* Email Input */}
          <motion.div
            className="flex items-center mb-4 border border-gray-400 rounded-lg px-3"
            whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              className="w-full outline-none py-2.5 text-gray-900 placeholder-gray-800"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            className="flex items-center mb-4 border border-gray-400 rounded-lg px-3"
            whileFocus={{ scale: 1.02, borderColor: "#3a34fe" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              className="flex-1 outline-none py-2.5 text-gray-900 placeholder-gray-800"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </motion.div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="accent-blue-500" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(59,130,246,0.4)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full mb-3 bg-blue-500 hover:bg-blue-600 transition-all py-2.5 rounded-lg text-white font-semibold shadow-md"
          >
            Log In
          </motion.button>

          {/* Google Sign-In Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 transition-all py-2.5 rounded-lg font-medium text-gray-700 shadow-md"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </motion.button>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
    </>
  );
}

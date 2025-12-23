import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Lottie from "lottie-react";
import ERROR from "./ERROR.json";
import DelayedLoading from "./Compoents/DelayedLoading";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingStatus = lazy(() => import("./pages/BookingStatus"));
const ProtectedRoute = lazy(() => import("./Compoents/ProtectedRoute"));
const Destination = lazy(() => import("./pages/Destination"));
const About = lazy(() => import("./pages/About"));
const PackageDetails = lazy(() => import("./pages/PackageDetails"));
const UserRequest = lazy(() => import("./pages/UserRequest"));
const RequestStatus = lazy(() => import("./pages/RequestStatus"));

function App() {
  return (
    <>
      <Suspense fallback={<DelayedLoading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking-status" element={<ProtectedRoute><BookingStatus /></ProtectedRoute>} />
          <Route path="/destination" element={<Destination />} />
          <Route path="/package-details" element={<PackageDetails />} />
          <Route path="/user-request" element={<UserRequest />} />
          <Route path="/request-status" element={<ProtectedRoute><RequestStatus /></ProtectedRoute>} />
          <Route path="*" element={<Lottie animationData={ERROR} loop={true} autoplay={true} className="w-screen h-screen bg-orange-400/40" />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import loading from "../loading.json";

const DelayedLoading = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <Lottie animationData={loading} loop={true} autoplay={true} className="w-screen h-screen flex justify-center items-center" />;
};

export default DelayedLoading;

import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Compoents/ThemeContext";
import Navbar from "../Compoents/Navbar";
import Footer from "../Compoents/Footer";

const UserRequest = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    landscape: "",
    description: "",
    image: null,
    rating: "",
    price: "",
    duration: "",
    popular: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const landscapes = ["Beach", "Mountain", "Heritage", "City"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Destination name is required";
    if (!formData.landscape) newErrors.landscape = "Landscape is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!selectedFile) newErrors.image = "Please select an image file";
    if (!formData.rating || formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("landscape", formData.landscape);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("rating", formData.rating);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("popular", formData.popular);
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/user-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request");
      }

      // Reset form
      setFormData({
        name: "",
        landscape: "",
        description: "",
        image: null,
        rating: "",
        price: "",
        duration: "",
        popular: false,
      });
      setSelectedFile(null);
      setPreviewUrl("");
      setErrors({});
      toast.success("Request submitted successfully!");
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      toast.error(
        error.message || "Failed to submit request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setFormData({
      name: "",
      landscape: "",
      description: "",
      image: null,
      rating: "",
      price: "",
      duration: "",
      popular: false,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setErrors({});
    setShowCancelModal(false);
    navigate("/");
  };

  const cancelCancel = () => {
    setShowCancelModal(false);
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div
        className={`min-h-screen pt-20 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
        }`}
      >
        {/* Header */}
        <div
          className={`shadow-sm border-b border-gray-200 dark:border-gray-700 `}
        >
          <div
            className={`px-6 py-4 `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold ">Plan Your Custom Trip</h1>
                <p>
                  Tell us about your dream destination and we'll make it happen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className={` rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="e.g., Bangalore, Karnataka"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Landscape */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Landscape *
                  </label>
                  <select
                    name="landscape"
                    value={formData.landscape}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.landscape
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Landscape</option>
                    {landscapes.map((landscape) => (
                      <option key={landscape} value={landscape}>
                        {landscape}
                      </option>
                    ))}
                  </select>
                  {errors.landscape && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.landscape}
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Expected Rating (0-5) *
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.rating
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="4.5"
                  />
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.rating}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="1200"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.duration
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="7 days"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium  mb-2">
                    Destination Image *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      previewUrl
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <div className="flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FaUpload className="mx-auto text-4xl text-gray-400" />
                        <div>
                          <p>
                            Drag and drop an image here, or{" "}
                            <label className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 cursor-pointer underline">
                              browse
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                className="hidden"
                              />
                            </label>
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium  mb-2">
                  Description *
                </label>
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                  value={formData.description}
                  onEditorChange={(content) => {
                    setFormData((prev) => ({ ...prev, description: content }));
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }
                  }}
                  init={{
                    height: 600,
                    selector: "textarea",
                    skin: "oxide-dark",
                    menubar: true,
                    plugins:
                      "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount emoticons paste directionality textcolor hr pagebreak nonbreaking anchor toc visualchars",
                    toolbar:
                      "undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | emoticons hr pagebreak | link image media table | code fullscreen preview help",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    image_advtab: true,
                    emoticons_database: "emojiimages",
                  }}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Popular Checkbox */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm ">
                    Mark as Popular Destination
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600  rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirm Cancel
              </h3>
              <button
                onClick={cancelCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel? All unsaved changes will be
                lost.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserRequest;

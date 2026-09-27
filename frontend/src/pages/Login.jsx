import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { loginSchema } from "../schema";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { authAPI } from "../utils/api";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa6";

function Login() {
  const initialValues = {
    email: "",
    password: "",
  };

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { values, errors, touched, handleSubmit, handleBlur, handleChange } =
    useFormik({
      initialValues: initialValues,
      validationSchema: loginSchema,
      onSubmit: async (values) => {
        try {
          setIsLoading(true);
          setError(null);
          
          const data = await authAPI.login(values.email, values.password);

          if (data.success) {
            login(data.data.user || data.data, data.data.access_token);
            
            toast.success(`${data.message || "Login successful!"}`, {
              position: "top-center",
              autoClose: 3000,
            });
            
            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
          } else {
            setError(data.message || "Login failed");
            toast.error(data.message || "Login failed. Please check your credentials.");
          }
        } catch (error) {
          console.error("Error during login:", error);
          const errorMessage = error.message || "An error occurred during login";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
    });

  return (
    <div className="native-auth-screen relative flex flex-col justify-center items-center w-full min-h-[100dvh] bg-lightBackground dark:bg-gray-950 font-text px-4 py-6 md:py-8">
      <div className="rounded-lg md:rounded-2xl shadow-xl shadow-gray-300 dark:shadow-gray-900/50 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden max-w-md w-full">
        <div className="bg-gradient-to-r from-btn2 to-btn1 p-5 md:p-8">
          <h1 className="font-extrabold capitalize text-3xl md:text-4xl justify-center items-center flex text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-white/90 font-medium text-center px-4">
            Welcome back to your health hub, where your well-being is our priority!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8">
          <div className="flex flex-col justify-center space-y-5">
            {/* Email Input */}
            <div className="flex flex-col group">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-btn2" />
                Email Address
              </label>
              <div className="relative">
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent shadow-sm shadow-gray-300 dark:shadow-gray-700 rounded-xl font-medium px-6 py-3.5 focus:outline-none focus:ring-4 focus:ring-btn2/20 focus:border-btn2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 transition-all group-hover:border-gray-300 dark:group-hover:border-gray-500"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              {errors.email && touched.email ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1 font-medium">
                  <span className="text-red-600">⚠️</span> {errors.email}
                </p>
              ) : null}
            </div>

            {/* Password Input */}
            <div className="flex flex-col group">
              <label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaLock className="text-btn2" />
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent shadow-sm shadow-gray-300 dark:shadow-gray-700 rounded-xl font-medium px-6 py-3.5 focus:outline-none focus:ring-4 focus:ring-btn2/20 focus:border-btn2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 transition-all group-hover:border-gray-300 dark:group-hover:border-gray-500"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              {errors.password && touched.password ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1 font-medium">
                  <span className="text-red-600">⚠️</span> {errors.password}
                </p>
              ) : null}
            </div>

            {/* General Error Message */}
            {error && !errors.email && !errors.password && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium text-center">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mt-3">
            <Link to="/forgot-password" className="text-sm text-btn2 hover:text-sky-600 font-semibold transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full capitalize bg-gradient-to-r from-btn2 to-btn1 font-bold text-white px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-btn2/20 transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-sky-500 hover:to-btn2 hover:scale-105 transform"
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="flex justify-center text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium">
              New user?
              <Link to="/signup">
                <span className="ml-2 capitalize text-btn2 font-bold hover:text-sky-600 transition-colors">
                  Sign up
                </span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

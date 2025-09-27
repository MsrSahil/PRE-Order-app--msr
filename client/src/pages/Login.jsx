import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../config/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/users/login", data);
      toast.success(response.data.message);
      dispatch(loginSuccess(response.data.data));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Welcome Back!</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-red-400"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <p className="text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
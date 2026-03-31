import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils/validators";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return toast.error("Enter a valid email");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast.success("Login successful");
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mb-4 text-sm text-slate-500">Access your Student Portal account</p>

        <div className="mb-3">
          <label className="mb-1 block text-sm">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-3 text-sm text-slate-600">
          No account?{" "}
          <Link className="text-blue-600 hover:underline" to="/signup">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;

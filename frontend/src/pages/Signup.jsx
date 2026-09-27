import { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupSchema } from "../schema";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialValues = {
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
  password: "",
  confirm_password: "",
  age: "",
  gender: "",
  city: "",
  state: "",
};

const inputClass = "min-w-0 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:border-btn2 focus:ring-2 focus:ring-btn2/20 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

function Field({ name, type = "text", placeholder, formik, autoComplete }) {
  const hasError = formik.touched[name] && formik.errors[name];
  return (
    <div className="min-w-0">
      <label className="sr-only" htmlFor={name}>{placeholder}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur} autoComplete={autoComplete} disabled={formik.isSubmitting} className={inputClass} />
      {hasError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors[name]}</p>}
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [requestError, setRequestError] = useState("");

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      setRequestError("");
      try {
        const signupData = {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          phone_number: String(values.phone_number).trim(),
          age: Number.parseInt(values.age, 10),
          gender: values.gender,
          city: values.city.trim(),
          state: values.state.trim(),
        };
        const response = await authAPI.signup(signupData);
        if (!response.success) throw new Error(response.message || "Registration failed");
        login(response.data?.user || response.data);
        toast.success(response.message || "Registration successful");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const message = error.message || "Registration failed";
        setRequestError(message);
        toast.error(message);
      }
    },
  });

  return (
    <main className="native-auth-screen flex min-h-[100dvh] w-full items-center justify-center bg-gray-50 px-3 py-4 font-text dark:bg-gray-950 sm:px-5">
      <section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Set up your Smart Health profile.</p>
        </header>

        <form onSubmit={formik.handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field name="first_name" placeholder="First name" formik={formik} autoComplete="given-name" />
            <Field name="last_name" placeholder="Last name" formik={formik} autoComplete="family-name" />
          </div>

          <Field name="email" type="email" placeholder="Email address" formik={formik} autoComplete="email" />
          <Field name="phone_number" type="tel" placeholder="Phone number" formik={formik} autoComplete="tel" />

          <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-3">
            <Field name="age" type="number" placeholder="Age" formik={formik} autoComplete="off" />
            <div className="min-w-0">
              <label className="sr-only" htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={formik.values.gender} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className={inputClass}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {formik.touched.gender && formik.errors.gender && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.gender}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field name="city" placeholder="City" formik={formik} autoComplete="address-level2" />
            <Field name="state" placeholder="State" formik={formik} autoComplete="address-level1" />
          </div>

          <Field name="password" type="password" placeholder="Password" formik={formik} autoComplete="new-password" />
          <Field name="confirm_password" type="password" placeholder="Confirm password" formik={formik} autoComplete="new-password" />

          {requestError && <p className="text-center text-sm text-red-600 dark:text-red-400">{requestError}</p>}

          <button type="submit" disabled={formik.isSubmitting} className="flex min-h-11 w-full items-center justify-center rounded-md bg-btn2 px-4 py-2.5 font-semibold text-white disabled:opacity-60">
            {formik.isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="font-semibold text-btn1">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

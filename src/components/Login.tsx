import React, { useState } from "react";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router-dom";

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

// Use environment variable or fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {      
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();       

      if (!res.ok) {
        setError(data.error || data.message || "Login failed");
        return;
      }

      // Save user + token in context
      login(data.user, data.token);

      // Redirect after successful login
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="text-3xl font-bold text-indigo-600">ACT Plast Track</div>
        </div>

        {error && (
          <div
            role="alert"
            id="form-error"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* {process.env.NODE_ENV === "development" && ( */}
          <div className="bg-yellow-100 rounded-lg mt-5 w-max p-2">
            <p className="text-sm text-yellow-700">
              Test login → Email: <b>admin@sample.com</b> | Password: <b>admin!pass</b>
            </p>
          </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default Login;

// // import React, { useState, useCallback } from "react";
// // import { useAuth } from "@/AuthContext";
// // import { useNavigate } from "react-router-dom";
// // import { Eye, EyeOff } from "lucide-react"; // ✅ Import icons from lucide-react

// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

// // const Login: React.FC = () => {
// //   const { login } = useAuth();
// //   const navigate = useNavigate();

// //   const [email, setEmail] = useState<string>("");
// //   const [password, setPassword] = useState<string>("");
// //   const [showPassword, setShowPassword] = useState<boolean>(false);
// //   const [error, setError] = useState<string>("");
// //   const [loading, setLoading] = useState<boolean>(false);

// //   const handleSubmit = useCallback(
// //     async (e: React.FormEvent<HTMLFormElement>) => {
// //       e.preventDefault();
// //       setError("");
// //       setLoading(true);

// //       try {
// //         const response = await fetch(`${API_BASE_URL}/api/login`, {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ email, password }),
// //         });

// //         const data = await response.json();

// //         if (!response.ok) {
// //           setError(data.error || data.message || "Login failed.");
// //           return;
// //         }

// //         login(data.user, data.token);
// //         navigate("/dashboard");
// //       } catch (err) {
// //         console.error("Login error:", err);
// //         setError("Something went wrong. Please try again.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //     [email, password, login, navigate]
// //   );

// //   return (
// //     <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
// //       <section className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
// //         <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">ACT Plast Track</h1>

// //         {error && (
// //           <div
// //             role="alert"
// //             id="form-error"
// //             className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center"
// //           >
// //             {error}
// //           </div>
// //         )}

// //         <form onSubmit={handleSubmit} className="space-y-6">
// //           <div>
// //             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
// //               Email Address
// //             </label>
// //             <input
// //               id="email"
// //               type="email"
// //               name="email"
// //               placeholder="Enter your email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value.trim())}
// //               required
// //               aria-invalid={!!error}
// //               aria-describedby={error ? "form-error" : undefined}
// //               className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //             />
// //           </div>

// //           <div className="relative">
// //             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
// //               Password
// //             </label>
// //             <input
// //               id="password"
// //               type={showPassword ? "text" : "password"}
// //               name="password"
// //               placeholder="Enter your password"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               required
// //               aria-invalid={!!error}
// //               aria-describedby={error ? "form-error" : undefined}
// //               className="w-full p-2 pr-10 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword((prev) => !prev)}
// //               className="absolute inset-y-0 right-0 px-3 flex items-center mt-6 text-gray-500 hover:text-indigo-600"
// //               aria-label={showPassword ? "Hide password" : "Show password"}
// //             >
// //               {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
// //             </button>
// //           </div>

// //           <div className="flex items-center justify-between text-sm">
// //             <label className="flex items-center">
// //               <input
// //                 type="checkbox"
// //                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
// //               />
// //               <span className="ml-2 text-gray-600">Remember me</span>
// //             </label>
// //             <a href="/forgot-password" className="text-indigo-600 hover:underline">
// //               Forgot Password?
// //             </a>
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={loading || !email || !password}
// //             className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
// //           >
// //             {loading ? (
// //               <div className="flex items-center justify-center">
// //                 <svg
// //                   className="animate-spin h-5 w-5 mr-2 text-white"
// //                   xmlns="http://www.w3.org/2000/svg"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                 >
// //                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
// //                   <path
// //                     fill="currentColor"
// //                     d="M4 12a8 8 0 018-8v8H4z"
// //                     className="opacity-75"
// //                   />
// //                 </svg>
// //                 Signing In...
// //               </div>
// //             ) : (
// //               "Sign In"
// //             )}
// //           </button>
// //         </form>

// //         {import.meta.env.MODE === "development" && (
// //           <div className="bg-yellow-100 rounded-lg mt-5 p-3 text-center text-sm text-yellow-700">
// //             Test login → Email: <b>admin@sample.com</b> | Password: <b>admin!pass</b>
// //           </div>
// //         )}
// //       </section>
// //     </main>
// //   );
// // };

// // export default Login;



// // LOGIN UPDATED 


// import React, { useState, useCallback } from "react";
// import { useAuth } from "@/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react"; // ✅ Password visibility icons

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

// const Login: React.FC = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [rememberMe, setRememberMe] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
  

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       setError("");
//       setLoading(true);

//       try {
//         const response = await fetch(`${API_BASE_URL}/api/login`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           setError(data.error || data.message || "Login failed. Please check your credentials.");
//           return;
//         }

//         login(data.user, data.token, rememberMe);
//         navigate("/dashboard");
//       } catch (err) {
//         console.error("Login error:", err);
//         setError("Something went wrong. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [email, password, login, rememberMe, navigate]
//   );

//   return (
//     <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
//       <section className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
//         <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">ACT Plast Track</h1>

//         {error && (
//           <div
//             role="alert"
//             id="form-error"
//             className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center"
//           >
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value.trim())}
//               required
//               aria-invalid={!!error}
//               aria-describedby={error ? "form-error" : undefined}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//             />
//           </div>

//           <div className="relative">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               aria-invalid={!!error}
//               aria-describedby={error ? "form-error" : undefined}
//               className="w-full p-2 pr-10 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword((prev) => !prev)}
//               className="absolute inset-y-0 right-0 px-3 flex items-center mt-6 text-gray-500 hover:text-indigo-600"
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//             </button>
//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={() => setRememberMe((prev) => !prev)}
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//               />
//               <span className="ml-2 text-gray-600">Remember me</span>
//             </label>
//             <a href="/forgot-password" className="text-indigo-600 hover:underline">
//               Forgot Password?
//             </a>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !email || !password}
//             className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center">
//                 <svg
//                   className="animate-spin h-5 w-5 mr-2 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
//                   <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
//                 </svg>
//                 Signing In...
//               </div>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>

//         {import.meta.env.MODE === "development" && (
//           <div className="bg-yellow-100 rounded-lg mt-5 p-3 text-center text-sm text-yellow-700">
//             Test login → Email: <b>admin@sample.com</b> | Password: <b>admin!pass</b>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// };

// export default Login;

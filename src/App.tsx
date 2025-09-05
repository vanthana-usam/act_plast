// // // // // import { Toaster } from "@/components/ui/toaster";
// // // // // import { Toaster as Sonner } from "@/components/ui/sonner";
// // // // // import { TooltipProvider } from "@/components/ui/tooltip";
// // // // // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // // // // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // // // // import Index from "./pages/Index";
// // // // // import NotFound from "./pages/NotFound";

// // // // // const queryClient = new QueryClient();

// // // // // const App = () => (
// // // // //   <QueryClientProvider client={queryClient}>
// // // // //     <TooltipProvider>
// // // // //       <Toaster />
// // // // //       <Sonner />
// // // // //       <BrowserRouter>
// // // // //         <Routes>
// // // // //           <Route path="/" element={<Index />} />
// // // // //           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
// // // // //           <Route path="*" element={<NotFound />} />
// // // // //         </Routes>
// // // // //       </BrowserRouter>
// // // // //     </TooltipProvider>
// // // // //   </QueryClientProvider>
// // // // // );

// // // // // export default App;

// // // // import { Toaster } from "@/components/ui/toaster";
// // // // import { Toaster as Sonner } from "@/components/ui/sonner";
// // // // import { TooltipProvider } from "@/components/ui/tooltip";
// // // // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // // // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // // // import NotFound from "./pages/NotFound";
// // // // import Login from "./components/Login";
// // // // import Index from "./pages/Index";
// // // // import ProtectedRoute from "./ProtectedRoute";
// // // // import { AuthProvider } from "./AuthContext";

// // // // const queryClient = new QueryClient();

// // // // const App = () => (
// // // //   <QueryClientProvider client={queryClient}>
// // // //     <TooltipProvider>
// // // //       <Toaster />
// // // //       <Sonner />
// // // //       <BrowserRouter>
// // // //         <Routes>
// // // //           <Route path="/" element={<Login />} />
// // // //           {/* <Route path="/" element={<Index />} /> */}
// // // //           <Route
// // // //             path="/dashboard"
// // // //             element={
// // // //               <ProtectedRoute>
// // // //                 <Index />
// // // //               </ProtectedRoute>
// // // //             }
// // // //           />
// // // //           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
// // // //           <Route path="*" element={<NotFound />} />
// // // //         </Routes>
// // // //       </BrowserRouter>
// // // //     </TooltipProvider>
// // // //   </QueryClientProvider>
// // // // );

// // // // export default App;

// // // import { Toaster } from "@/components/ui/toaster";
// // // import { Toaster as Sonner } from "@/components/ui/sonner";
// // // import { TooltipProvider } from "@/components/ui/tooltip";
// // // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // // import NotFound from "./pages/NotFound";
// // // import Login from "./components/Login";
// // // import Index from "./pages/Index";
// // // import ProtectedRoute from "./ProtectedRoute";
// // // import { AuthProvider } from "./AuthContext";

// // // const queryClient = new QueryClient();

// // // const App = () => (
// // //   <QueryClientProvider client={queryClient}>
// // //     <TooltipProvider>
// // //       <Toaster />
// // //       <Sonner />
// // //       {/* ✅ BrowserRouter should wrap AuthProvider */}
// // //       {/* <BrowserRouter>
// // //           <Routes>
// // //             <Route path="/" element={<Login />} />
// // //            <AuthProvider>
// // //               <Route
// // //                 path="/dashboard"
// // //                 element={
// // //                   <ProtectedRoute>
// // //                     <Index />
// // //                   </ProtectedRoute>
// // //                 }
// // //               />
// // //               <Route path="*" element={<NotFound />} />
// // //             </AuthProvider>
// // //           </Routes>
// // //       </BrowserRouter> */}
// // //       <BrowserRouter>
// // //         <Routes>
// // //           <Route path="/" element={<Login />} />
// // //           <AuthProvider>
// // //             <Route
// // //               path="/dashboard"
// // //               element={
// // //                 <ProtectedRoute>
// // //                   <Index />
// // //                 </ProtectedRoute>
// // //               }
// // //             />
// // //             <Route path="*" element={<NotFound />} />
// // //           </AuthProvider>
// // //         </Routes>
// // //       </BrowserRouter>
// // //     </TooltipProvider>
// // //   </QueryClientProvider>
// // // );

// // // export default App;


// // import { Toaster as Sonner } from "@/components/ui/sonner";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import NotFound from "./pages/NotFound";
// // import Login from "./components/Login";
// // import Index from "./pages/Index";
// // import ProtectedRoute from "./ProtectedRoute";
// // import { AuthProvider } from "./AuthContext";

// // const queryClient = new QueryClient();

// // const App = () => (
// //   <QueryClientProvider client={queryClient}>
// //     <TooltipProvider>
// //       <Sonner />
// //       <BrowserRouter>
// //         <AuthProvider>
// //           <Routes>
// //             <Route path="/" element={<Login />} />
// //             <Route
// //               path="/dashboard"
// //               element={
// //                 <ProtectedRoute>
// //                   <Index />
// //                 </ProtectedRoute>
// //               }
// //             />
// //             <Route path="*" element={<NotFound />} />
// //           </Routes>
// //         </AuthProvider>
// //       </BrowserRouter>
// //     </TooltipProvider>
// //   </QueryClientProvider>
// // );

// // export default App;


// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import NotFound from "./pages/NotFound";
// import Login from "./components/Login";
// import Index from "./pages/Index";
// import ProtectedRoute from "./ProtectedRoute";
// import { AuthProvider } from "./AuthContext";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Sonner />
//       {/* <ErrorBoundary> */}
//         <BrowserRouter>
//           <AuthProvider>
//             <Routes>
//               <Route path="/" element={<Login />} />
//               <Route
//                 path="/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <Index />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </AuthProvider>
//         </BrowserRouter>
//       {/* </ErrorBoundary> */}
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;



import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Index from "./pages/Index";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import { useState } from "react";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Sonner />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

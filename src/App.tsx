// // import { Toaster as Sonner } from "@/components/ui/sonner";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { RouterProvider } from "react-router-dom";
// // import { useState } from "react";
// // import { router } from "./router";

// // const App = () => {
// //   const [queryClient] = useState(() => new QueryClient());

// //   return (
// //     <QueryClientProvider client={queryClient}>
// //       <TooltipProvider>
// //         <Sonner />
// //         <RouterProvider router={router} />
// //       </TooltipProvider>
// //     </QueryClientProvider>
// //   );
// // };

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
// import { useState } from "react";

// const App = () => {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <QueryClientProvider client={queryClient}>
//           <TooltipProvider>
//             <Sonner />
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
//           </TooltipProvider>
//         </QueryClientProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;


// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { RouterProvider } from "react-router-dom";
// import { useState } from "react";
// import { router } from "./router";

// const App = () => {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Sonner />
//         <RouterProvider router={router} />
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

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
import { TaskProvider } from "./TaskContext";

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
                    <TaskProvider>
                      <Index />
                    </TaskProvider>
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

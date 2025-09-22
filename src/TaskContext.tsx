// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";

// interface TaskContextType {
//   taskCount: number;
//   refreshTaskCount: () => void;
// }

// const TaskContext = createContext<TaskContextType | undefined>(undefined);

//   const API_URL = import.meta.env.VITE_API_BASE_URL;


// export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { token } = useAuth();
//   const [taskCount, setTaskCount] = useState(0);
 
//   const fetchTaskCount = async () => {
//     if (!token) return;
//     try {
//       const response = await fetch(`${API_URL}/api/tasks`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       setTaskCount(Array.isArray(data) ? data.length : 0);
//     } catch (error) {
//       console.error("Error fetching task count:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTaskCount();
//   }, [token]);

//   return (
//     <TaskContext.Provider value={{ taskCount, refreshTaskCount: fetchTaskCount }}>
//       {children}
//     </TaskContext.Provider>
//   );
// };

// export const useTaskContext = () => {
//   const ctx = useContext(TaskContext);
//   if (!ctx) throw new Error("useTaskContext must be used inside TaskProvider");
//   return ctx;
// };



import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface TaskContextType {
  taskCount: number;
  refreshTaskCount: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth(); // Add user to get employeeGroup
  const [taskCount, setTaskCount] = useState(0);

  const fetchTaskCount = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      // For non-admins, filter tasks by assignedTo or assignedTeam
      const filteredData = user?.employeeGroup?.toLowerCase() === "admin"
        ? data
        : data.filter(
            (task: any) =>
              task.assignedTo === user?.id ||
              task.assignedTeam?.toLowerCase() === user?.employeeGroup?.toLowerCase()
          );
      setTaskCount(Array.isArray(filteredData) ? filteredData.length : 0);
    } catch (error) {
      console.error("Error fetching task count:", error);
      setTaskCount(0);
    }
  };

  useEffect(() => {
    fetchTaskCount();
  }, [token, user]);

  return (
    <TaskContext.Provider value={{ taskCount, refreshTaskCount: fetchTaskCount }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used inside TaskProvider");
  return ctx;
};
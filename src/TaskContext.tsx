import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

interface Task {
  taskId: string;
  assignedTo: string;
  assignedTeam: string;
}

interface TaskContextType {
  taskCount: number;
  refreshTaskCount: () => void;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [taskCount, setTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchTaskCount = useCallback(async () => {
    // console.log("TaskContext: fetchTaskCount called, user:", user?.id, user?.employeeGroup);
    setIsLoading(true);
    setError(null);
    if (!token) {
      // console.log("TaskContext: No token, skipping fetch");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("TaskContext: API response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      // console.log("TaskContext: Raw API data length:", Array.isArray(data) ? data.length : 0);
      const filteredData = user?.employeeGroup?.toLowerCase() === "admin"
        ? data
        : data.filter((task: Task) =>
            task.assignedTo === user?.id ||
            task.assignedTeam?.toLowerCase() === user?.employeeGroup?.toLowerCase()
          );
      // console.log("TaskContext: Filtered data length:", Array.isArray(filteredData) ? filteredData.length : 0);
      setTaskCount(Array.isArray(filteredData) ? filteredData.length : 0);
      setError(null);
    } catch (err) {
      console.error("TaskContext: Error fetching tasks:", err);
      setTaskCount(0);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
      // console.log("TaskContext: fetchTaskCount completed, taskCount:", taskCount);
    }
  }, [token, user, taskCount]); // Include taskCount for logging

  useEffect(() => {
    fetchTaskCount();
  }, [fetchTaskCount]);

  return (
    <TaskContext.Provider value={{ taskCount, refreshTaskCount: fetchTaskCount, isLoading, error }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used inside TaskProvider");
  return ctx;
};
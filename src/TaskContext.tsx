// FINAL CODE TaskContext.tsx
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
  incrementTaskCount: () => void; // New function for optimistic create
  decrementTaskCount: () => void; // New function for optimistic delete
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
    setIsLoading(true);
    setError(null);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data: Task[] = await response.json();

      const userGroup = user?.employeeGroup?.toLowerCase();
      const filteredData = userGroup === "admin"
        ? data
        : data.filter(task =>
            task.assignedTo === user?.id ||
            task.assignedTeam?.toLowerCase() === userGroup
          );

      setTaskCount(filteredData.length);
      setError(null);
    } catch (err) {
      console.error("TaskContext: Error fetching tasks:", err);
      setTaskCount(0);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Optimistic increment for task creation
  const incrementTaskCount = useCallback(() => {
    setTaskCount(prev => prev + 1);
  }, []);

  // Optimistic decrement for task deletion
  const decrementTaskCount = useCallback(() => {
    setTaskCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    fetchTaskCount();
  }, [fetchTaskCount]);

  return (
    <TaskContext.Provider value={{ taskCount, refreshTaskCount: fetchTaskCount, incrementTaskCount, decrementTaskCount, isLoading, error }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used inside TaskProvider");
  return ctx;
};

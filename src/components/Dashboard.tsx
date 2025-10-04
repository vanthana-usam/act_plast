import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Factory,
  AlertTriangle,
  CheckSquare,
  Calendar,
  Loader2,
  TrendingUp,
  Clock
} from "lucide-react";
import { useAuth } from "@/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTaskContext } from "@/TaskContext";

// ================== Type definitions ==================
interface Task {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string; // ISO string
  progress?: number; // May be missing, fallback used in rendering
}

interface Machine {
  id: string;
  name: string;
  status: string;
  lastMaintenance: string;
}

interface PDIItem {
  id: string;
  issue: string;
  severity: string;
  reportedAt: string; // ISO string
}

interface DashboardData {
  tasks: Task[];
  machines: Machine[];
  pdiItems: PDIItem[];
}

// ================== Empty State Component ==================
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-gray-500 italic">{message}</p>
);

// ================== Main Dashboard ==================
const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { refreshTaskCount } = useTaskContext();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    tasks: [],
    machines: [],
    pdiItems: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const maxRetries = 3;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";


  // ================== Fetch dashboard data ==================
  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tasksRes, machinesRes, pdiRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/machines`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/pdi`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        if (!tasksRes.ok || !machinesRes.ok || !pdiRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const tasks = await tasksRes.json();
        const machines = await machinesRes.json();
        const pdiItems = await pdiRes.json();

        setDashboardData({ tasks, machines, pdiItems });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          if (retryCount < maxRetries) {
            setTimeout(() => setRetryCount((prev) => prev + 1), 2000);
          } else {
            setError("Failed to load dashboard data. Please try again later.");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => controller.abort();
  }, [retryCount, token]);

  // ================== Dashboard Statistics ==================
  const dashboardStats = useMemo(
    () => [
      {
        title: "Overall OEE",
        value: "87.5%",
        icon: TrendingUp,
        color: "bg-green-500",
      },
      {
        title: "Active Machines",
        value: `${
          dashboardData.machines.filter((m) => m.status === "active").length
        }/${dashboardData.machines.length}`,
        color: "bg-blue-500",
        icon: Factory,
      },
      {
        title: "Pending Tasks",
        value: dashboardData.tasks
          .filter((t) => t.status === "pending")
          .length.toString(),
        color: "bg-orange-500",
        icon: CheckSquare,
      },
      {
        title: "PDI Issues",
        value: dashboardData.pdiItems.length.toString(),
        color: "bg-red-500",
        icon: AlertTriangle,
      },
    ],
    [dashboardData]
  );

  // ================== Compute date-related tasks ==================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = dashboardData.tasks.filter((task) => {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && task.status !== "completed";
  }).length;

  const dueTodayTasks = dashboardData.tasks.filter((task) => {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;

  const inProgressTasks = dashboardData.tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completedTasks = dashboardData.tasks.filter(
    (task) => task.status === "completed"
  ).length;

  // ================== Filtered tasks ==================
  const filteredTasks = useMemo(() => {
    let tasks = dashboardData.tasks;

    if (taskFilter !== "all") {
      if (["pending", "in-progress", "completed"].includes(taskFilter)) {
        tasks = tasks.filter((task) => task.status === taskFilter);
      } else {
        tasks = tasks.filter(
          (task) => task.priority.toLowerCase() === taskFilter
        );
      }
    }

    tasks = [...tasks].sort((a, b) => {
      if (a.status === "in-progress" && b.status !== "in-progress") return -1;
      if (b.status === "in-progress" && a.status !== "in-progress") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return tasks;
  }, [dashboardData.tasks, taskFilter]);

  // ================== Helper functions ==================
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const recentAlerts = dashboardData.pdiItems
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    .slice(0, 3);

  // ================== Render ==================
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg mb-5">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" /> Task Overview
              </div>
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-[160px] text-gray-800">
                  <SelectValue placeholder="Filter Tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Overdue Tasks
                </span>
                <Badge className="bg-red-500 text-white shadow-md">
                  {overdueTasks}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Due Today
                </span>
                <Badge className="bg-yellow-500 text-white shadow-md">
                  {dueTodayTasks}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  In Progress
                </span>
                <Badge className="bg-blue-500 text-white shadow-md">
                  {inProgressTasks}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Completed
                </span>
                <Badge className="bg-green-500 text-white shadow-md">
                  {completedTasks}
                </Badge>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-7">
                    <Clock className="h-8 w-16 text-gray-400 mx-auto mb-4" />
                    {/* <EmptyState message="No tasks match the filter" /> */}
                    <p className="text-gray-400 mx-auto mb-4 italic">No tasks match the filter</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="p-4 bg-white rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition transform cursor-pointer border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due:{" "}
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </Badge>
                        <Badge
                          variant={getStatusVariant(task.status)}
                          className="text-sm"
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>

                    {task.status === "in-progress" && (
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                            style={{ width: `${task.progress ?? 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {task.progress ?? 0}% Complete
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

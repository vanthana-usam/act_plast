import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { format } from "date-fns";
import { debounce } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Settings,
  Trash2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateUUID } from "../utils/utils";
import { useAuth } from "@/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTaskContext } from "@/TaskContext";
// Lazy load ActionInputs component
const ActionInputs = lazy(() => import("./ActionInputs"));

interface Action {
  id: string;
  action: string;
  responsible: string;
  dueDate: string;
}

interface Task {
  taskId: string;
  productionCode?: string;
  taskType: string;
  title: string;
  description: string;
  priority: string;
  assignedTo: string;
  assignedTeam: string;
  assignedToName: string;
  dueDate: string;
  status: string;
  createdFrom: string;
  rejectionReason?: string;
  quantity?: number;
  maintenanceType?: string;
  equipment?: string;
  preventiveActions?: Action[];
  progress?: number;
  statusComments?: string;
  rootCause?: string;
  impactAssessment?: string;
  recurrenceRisk?: string;
  lessonsLearned?: string;
}

interface Employee {
  employeeId: string;
  name: string;
}

interface Team {
  teamId: string;
  name: string;
}

interface ProductionRecord {
  productionCode: string;
}

interface ApiTask {
  taskId: string;
  productionCode?: string;
  taskType: string;
  title: string;
  description: string;
  priority: string;
  assignedTo: string;
  assignedTeam: string;
  dueDate: string;
  status: string;
  createdFrom: string;
  rejectionReason?: string;
  quantity?: number;
  maintenanceType?: string;
  equipment?: string;
  preventiveActions?: Action[];
  progress?: number;
  statusComments?: string;
  rootCause?: string;
  impactAssessment?: string;
  recurrenceRisk?: string;
  lessonsLearned?: string;
}

const TaskManagement: React.FC = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { refreshTaskCount } = useTaskContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskForDeletion, setSelectedTaskForDeletion] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;


  const [createForm, setCreateForm] = useState({
    title: "",
    taskType: "",
    priority: "",
    assignedTo: "",
    dueDate: "",
    productionCode: "",
    description: "",
    rejectionReason: "",
    quantity: "",
    maintenanceType: "",
    equipment: "",
  });
  const [updateForm, setUpdateForm] = useState({
    status: "",
    progress: "",
    dueDate: "",
    statusComments: "",
    rootCause: "",
    impactAssessment: "",
    recurrenceRisk: "",
    lessonsLearned: "",
  });

  const [preventiveActions, setPreventiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "", dueDate: "" },
  ]);
  const [createFormErrors, setCreateFormErrors] = useState<
    Partial<Record<keyof typeof createForm, string>>
  >({});
  const [updateFormErrors, setUpdateFormErrors] = useState<
    Partial<
      Record<keyof typeof updateForm, string> & {
        preventiveActions?: { [index: number]: Partial<Action> & { general?: string } };
      }
    >
  >({});

  const API_URL = import.meta.env.VITE_API_BASE_URL || (() => {
    throw new Error("API base URL is not defined.");
  })();

  // Memoize static data
  const priorityColors = useMemo(
    () => ({
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      pending: "bg-orange-100 text-orange-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800",
    }),
    []
  );

  const typeIcons = useMemo(
    () => ({
      downtime: <AlertTriangle className="h-4 w-4" />,
      pdi: <CheckCircle className="h-4 w-4" />,
      maintenance: <Wrench className="h-4 w-4" />,
      quality: <Settings className="h-4 w-4" />,
      default: <Clock className="h-4 w-4" />,
    }),
    []
  );

  // Validation for createForm
  const validateCreateForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof createForm, string>> = {};

    if (!createForm.title) errors.title = "Task title is required.";
    if (!createForm.taskType) errors.taskType = "Task type is required.";
    if (!createForm.priority) errors.priority = "Priority is required.";
    if (!createForm.assignedTo) errors.assignedTo = "Assigned person is required.";
    if (!createForm.dueDate) {
      errors.dueDate = "Due date is required.";
    } else if (new Date(createForm.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      errors.dueDate = "Due date cannot be in the past.";
    }
    if (!createForm.description) errors.description = "Description is required.";
    if (createForm.quantity && (isNaN(parseInt(createForm.quantity, 10)) || parseInt(createForm.quantity, 10) < 0)) {
      errors.quantity = isNaN(parseInt(createForm.quantity, 10)) ? "Quantity must be a valid number." : "Quantity cannot be negative.";
    }
    if (createForm.taskType === "maintenance") {
      if (!createForm.maintenanceType) errors.maintenanceType = "Maintenance type is required.";
      if (!createForm.equipment) errors.equipment = "Equipment is required.";
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [createForm]);

  // Validation for updateForm
  const validateUpdateForm = useCallback(() => {
    const errors: Partial<
      Record<keyof typeof updateForm, string> & {
        preventiveActions?: { [index: number]: Partial<Action> & { general?: string } };
      }
    > = {};

    if (!updateForm.status) errors.status = "Status is required.";
    if (updateForm.progress) {
      const progressNum = parseInt(updateForm.progress, 10);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        errors.progress = "Progress must be a number between 0 and 100.";
      }
    }
    
    setUpdateFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [updateForm, preventiveActions]);

  // Real-time validation on blur
  const handleCreateInputBlur = useCallback((field: keyof typeof createForm) => {
    validateCreateForm();
  }, [validateCreateForm]);

  const handleUpdateInputBlur = useCallback((field: keyof typeof updateForm) => {
    validateUpdateForm();
  }, [validateUpdateForm]);

  // Debounced search
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [tasksRes, teamsRes, employeesRes, productionRes] = await Promise.all([
        fetch(`${API_URL}/api/tasks`, { headers }),
        fetch(`${API_URL}/api/teams`, { headers }),
        fetch(`${API_URL}/api/employees`, { headers }),
        fetch(`${API_URL}/api/production`, { headers }),
      ]);

      if (!tasksRes.ok || !teamsRes.ok || !employeesRes.ok || !productionRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [tasksJson, teamsJson, employeesJson, productionJson] = await Promise.all([
        tasksRes.json() as Promise<ApiTask[]>,
        teamsRes.json() as Promise<Team[]>,
        employeesRes.json() as Promise<Employee[]>,
        productionRes.json() as Promise<{ records: ProductionRecord[] }>,
      ]);

      setEmployees(employeesJson);
      setTeams(teamsJson);
      setProductionRecords(productionJson.records);

      const enrichedTasks = tasksJson.map((task) => ({
        ...task,
        assignedToName: employeesJson.find((e) => e.employeeId === task.assignedTo)?.name || task.assignedTo,
      }));

      setTasks(enrichedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  // Check upcoming due dates
  const checkUpcomingDueDates = useCallback(() => {
    if (!tasks || tasks.length === 0) return;

    const today = new Date();
    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isUserTask = user?.employeeGroup?.toLowerCase() === "admin" || task.assignedTo === user?.id;
      return diffDays >= 0 && diffDays <= 7 && isUserTask;
    });

    if (upcomingTasks.length > 0) {
      const taskTitles = upcomingTasks.map(
        (task) => `${task.title} (Due: ${format(new Date(task.dueDate), "yyyy-MM-dd")})`
      ).join("\n");

      toast({
        title: "Upcoming Tasks",
        description: `The following tasks are due within the next 7 days:\n\n${taskTitles}`,
      });
    }
  }, [tasks, user?.id, user?.employeeGroup, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    checkUpcomingDueDates();
  }, [tasks, checkUpcomingDueDates]);

  const filteredTasks = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const statusLower = statusFilter.toLowerCase();
    const priorityLower = priorityFilter.toLowerCase();
    const typeLower = typeFilter.toLowerCase();

    return tasks.filter((task) => {
      const matchesTeam =
        user?.employeeGroup?.toLowerCase() === "admin" ||
        task.assignedTeam?.toLowerCase() === user?.employeeGroup?.toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(searchTermLower) ||
        task.description?.toLowerCase().includes(searchTermLower) ||
        task.productionCode?.toLowerCase().includes(searchTermLower);

      const matchesStatus = statusFilter === "all" || task.status?.toLowerCase() === statusLower;
      const matchesPriority = priorityFilter === "all" || task.priority?.toLowerCase() === priorityLower;
      const matchesType = typeFilter === "all" || task.taskType?.toLowerCase() === typeLower;

      return matchesTeam && matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [tasks, user?.employeeGroup, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    return filteredTasks.slice(start, end);
  }, [filteredTasks, currentPage]);

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const getEmployeeName = useCallback((id: string) => {
    return employees.find((emp) => emp.employeeId === id)?.name || id;
  }, [employees]);

  const getPriorityColor = useCallback((priority: string) => {
    return priorityColors[priority.toLowerCase()] || priorityColors.default;
  }, [priorityColors]);

  const getStatusColor = useCallback((status: string) => {
    return statusColors[status.toLowerCase()] || statusColors.default;
  }, [statusColors]);

  const getTypeIcon = useCallback((type: string) => {
    return typeIcons[type.toLowerCase()] || typeIcons.default;
  }, [typeIcons]);

  const handleCreateInputChange = useCallback((field: keyof typeof createForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdateInputChange = useCallback((field: keyof typeof updateForm, value: string) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateTask = useCallback(async () => {
  if (!validateCreateForm()) {
    toast({
      variant: "destructive",
      title: "Validation Error",
      description: "Please correct the errors in the form before submitting.",
    });
    return;
  }

  setIsCreating(true);
  try {
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...createForm,
        productionCode: createForm.productionCode || undefined,
        quantity: createForm.quantity ? parseInt(createForm.quantity, 10) : undefined,
      }),
    });

    if (response.ok) {
      setIsAddingTask(false);
      setCreateForm({
        title: "",
        taskType: "",
        priority: "",
        assignedTo: "",
        dueDate: "",
        productionCode: "",
        description: "",
        rejectionReason: "",
        quantity: "",
        maintenanceType: "",
        equipment: "",
      });
      setCreateFormErrors({});
      setError(null);
      toast({
        title: "Success",
        description: "Task created successfully.",
      });
      console.log("TaskManagement: Calling refreshTaskCount after create");
      refreshTaskCount(); // Ensure this is called
      await fetchInitialData();
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || errorData.error || "Failed to create task.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create task.";
    setError(errorMessage);
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  } finally {
    setIsCreating(false);
  }
}, [createForm, token, toast, fetchInitialData, validateCreateForm, refreshTaskCount]);


  const handleUpdateTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsUpdatingTask(true);
    setUpdateForm({
      status: task.status,
      progress: task.progress?.toString() ?? "0",
      dueDate: task.dueDate,
      statusComments: task.statusComments ?? "",
      rootCause: task.rootCause ?? "",
      impactAssessment: task.impactAssessment ?? "",
      recurrenceRisk: task.recurrenceRisk ?? "",
      lessonsLearned: task.lessonsLearned ?? "",
    });
    setPreventiveActions(
      (task.preventiveActions ?? [{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]).map(
        (action) => ({ ...action, id: action.id ?? generateUUID() })
      )
    );
  }, []);

  const handleSaveUpdate = useCallback(async () => {
    if (!selectedTask) return;

    if (!validateUpdateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/tasks/${selectedTask.taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateForm,
          progress: updateForm.progress ? parseInt(updateForm.progress, 10) : undefined,
          preventiveActions: preventiveActions.map(({ id, ...rest }) => rest),
        }),
      });

      if (response.ok) {
        setIsUpdatingTask(false);
        setSelectedTask(null);
        setUpdateFormErrors({});
        setError(null);
        toast({
          title: "Success",
          description: "Task updated successfully.",
        });
        await fetchInitialData();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || "Failed to update task.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedTask, updateForm, preventiveActions, token, toast, fetchInitialData, validateUpdateForm]);

  const handleDeleteTask = useCallback((task: Task) => {
    setSelectedTaskForDeletion(task);
  }, []);

  // const confirmDeleteTask = useCallback(async () => {
  //   if (!selectedTaskForDeletion) return;

  //   setIsDeleting(true);
  //   try {
  //     const response = await fetch(`${API_URL}/api/tasks/${selectedTaskForDeletion.taskId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       setTasks((prev) => prev.filter((task) => task.taskId !== selectedTaskForDeletion.taskId));
  //       setError(null);
  //       toast({
  //         title: "Success",
  //         description: "Task deleted successfully.",
  //       });
  //     } else {
  //       const errorData = await response.json();
  //       const errorMessage = errorData.message || errorData.error || "Failed to delete task.";
  //       setError(errorMessage);
  //       toast({
  //         variant: "destructive",
  //         title: "Error",
  //         description: errorMessage,
  //       });
  //     }
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Failed to delete task.";
  //     setError(errorMessage);
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: errorMessage,
  //     });
  //   } finally {
  //     setIsDeleting(false);
  //     setSelectedTaskForDeletion(null);
  //   }
  // }, [selectedTaskForDeletion, token, toast]);

  const confirmDeleteTask = useCallback(async () => {
  if (!selectedTaskForDeletion) return;

  setIsDeleting(true);
  try {
    const response = await fetch(`${API_URL}/api/tasks/${selectedTaskForDeletion.taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setTasks((prev) => prev.filter((task) => task.taskId !== selectedTaskForDeletion.taskId));
      setSelectedTaskForDeletion(null);
      setError(null);
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
      console.log("TaskManagement: Calling refreshTaskCount after delete");
      refreshTaskCount(); // Ensure this is called
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || errorData.error || "Failed to delete task.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete task.";
    setError(errorMessage);
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  } finally {
    setIsDeleting(false);
  }
}, [selectedTaskForDeletion, token, toast, refreshTaskCount]);


  const handleExportCSV = useCallback(() => {
    const headers = [
      "Task ID",
      "Title",
      "Task Type",
      "Description",
      "Priority",
      "Assigned To",
      "Assigned Team",
      "Due Date",
      "Status",
      "Created From",
      "Production Code",
      "Rejection Reason",
      "Quantity",
      "Maintenance Type",
      "Equipment",
      "Progress",
      "Status Comments",
      "Root Cause",
      "Impact Assessment",
      "Recurrence Risk",
      "Lessons Learned",
      "Preventive Actions",
    ];

    const escapeCSV = (value: any): string => {
      if (value == null) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredTasks.map((task) => [
      escapeCSV(task.taskId),
      escapeCSV(task.title),
      escapeCSV(task.taskType),
      escapeCSV(task.description),
      escapeCSV(task.priority),
      escapeCSV(task.assignedToName),
      escapeCSV(task.assignedTeam),
      escapeCSV(format(new Date(task.dueDate), "yyyy-MM-dd")),
      escapeCSV(task.status),
      escapeCSV(task.createdFrom),
      escapeCSV(task.productionCode || ""),
      escapeCSV(task.rejectionReason || ""),
      escapeCSV(task.quantity || ""),
      escapeCSV(task.maintenanceType || ""),
      escapeCSV(task.equipment || ""),
      escapeCSV(task.progress || ""),
      escapeCSV(task.statusComments || ""),
      escapeCSV(task.rootCause || ""),
      escapeCSV(task.impactAssessment || ""),
      escapeCSV(task.recurrenceRisk || ""),
      escapeCSV(task.lessonsLearned || ""),
      escapeCSV(
        task.preventiveActions
          ? task.preventiveActions
              .map(
                (action) =>
                  `Action: ${action.action}, Responsible: ${getEmployeeName(action.responsible)}, Due: ${action.dueDate}`
              )
              .join("; ")
          : ""
      ),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tasks_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Tasks exported to CSV successfully.",
    });
  }, [filteredTasks, getEmployeeName, toast]);

  const taskStats = useMemo(() => {
    const visibleTasks =
      user?.employeeGroup?.toLowerCase() === "admin"
        ? tasks
        : tasks.filter(
            (task) =>
              task.assignedTo === user?.id ||
              task.assignedTeam?.toLowerCase() === user?.employeeGroup?.toLowerCase()
          );

    const stats = {
      total: visibleTasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0,
    };

    visibleTasks.forEach((task) => {
      const status = task.status?.toLowerCase();
      const priority = task.priority?.toLowerCase();

      if (status === "pending") stats.pending++;
      if (status === "in-progress") stats.inProgress++;
      if (status === "completed") stats.completed++;
      if (priority === "high") stats.highPriority++;
    });

    return stats;
  }, [tasks, user?.id, user?.employeeGroup]);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        {error}
        <Button onClick={fetchInitialData} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <div className="flex space-x-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={filteredTasks.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="text-red-600 text-sm mb-4">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={createForm.title}
                      onChange={(e) =>
                        handleCreateInputChange("title", e.target.value)
                      }
                      onBlur={() => handleCreateInputBlur("title")}
                      aria-invalid={!!createFormErrors.title}
                      aria-describedby={
                        createFormErrors.title ? "title-error" : undefined
                      }
                    />
                    {createFormErrors.title && (
                      <p id="title-error" className="text-red-500 text-sm">
                        {createFormErrors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select
                      value={createForm.taskType}
                      onValueChange={(value) =>
                        handleCreateInputChange("taskType", value)
                      }
                      onOpenChange={() => handleCreateInputBlur("taskType")}
                    >
                      <SelectTrigger id="taskType" aria-label="Select task type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="downtime">Downtime Issue</SelectItem>
                        <SelectItem value="pdi">PDI Issue</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="quality">Quality Control</SelectItem>
                      </SelectContent>
                    </Select>
                    {createFormErrors.taskType && (
                      <p className="text-red-500 text-sm">
                        {createFormErrors.taskType}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={createForm.priority}
                      onValueChange={(value) =>
                        handleCreateInputChange("priority", value)
                      }
                      onOpenChange={() => handleCreateInputBlur("priority")}
                    >
                      <SelectTrigger id="priority" aria-label="Select priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {createFormErrors.priority && (
                      <p className="text-red-500 text-sm">
                        {createFormErrors.priority}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Select
                      value={createForm.assignedTo}
                      onValueChange={(value) =>
                        handleCreateInputChange("assignedTo", value)
                      }
                      onOpenChange={() => handleCreateInputBlur("assignedTo")}
                    >
                      <SelectTrigger id="assignedTo" aria-label="Select employee">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length > 0 ? (
                          employees.map((emp) => (
                            <SelectItem
                              key={emp.employeeId}
                              value={emp.employeeId}
                            >
                              {emp.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            No employees found. Contact admin to add employees.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {createFormErrors.assignedTo && (
                      <p className="text-red-500 text-sm">
                        {createFormErrors.assignedTo}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) =>
                        handleCreateInputChange("dueDate", e.target.value)
                      }
                      onBlur={() => handleCreateInputBlur("dueDate")}
                      min={format(new Date(), "yyyy-MM-dd")}
                      aria-invalid={!!createFormErrors.dueDate}
                      aria-describedby={
                        createFormErrors.dueDate ? "dueDate-error" : undefined
                      }
                    />
                    {createFormErrors.dueDate && (
                      <p id="dueDate-error" className="text-red-500 text-sm">
                        {createFormErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>
                {(createForm.taskType === "downtime" ||
                  createForm.taskType === "pdi") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (if applicable)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={createForm.quantity}
                        onChange={(e) =>
                          handleCreateInputChange("quantity", e.target.value)
                        }
                        onBlur={() => handleCreateInputBlur("quantity")}
                        aria-invalid={!!createFormErrors.quantity}
                        aria-describedby={
                          createFormErrors.quantity ? "quantity-error" : undefined
                        }
                      />
                      {createFormErrors.quantity && (
                        <p id="quantity-error" className="text-red-500 text-sm">
                          {createFormErrors.quantity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rejectionReason">Rejection Reason</Label>
                      <Textarea
                        id="rejectionReason"
                        placeholder="Describe the rejection reason"
                        value={createForm.rejectionReason}
                        onChange={(e) =>
                          handleCreateInputChange("rejectionReason", e.target.value)
                        }
                        rows={3}
                        aria-invalid={!!createFormErrors.rejectionReason}
                        aria-describedby={
                          createFormErrors.rejectionReason ? "rejectionReason-error" : undefined
                        }
                      />
                      {createFormErrors.rejectionReason && (
                        <p id="rejectionReason-error" className="text-red-500 text-sm">
                          {createFormErrors.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {createForm.taskType === "maintenance" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceType">Maintenance Type</Label>
                      <Select
                        value={createForm.maintenanceType}
                        onValueChange={(value) =>
                          handleCreateInputChange("maintenanceType", value)
                        }
                        onOpenChange={() => handleCreateInputBlur("maintenanceType")}
                      >
                        <SelectTrigger
                          id="maintenanceType"
                          aria-label="Select maintenance type"
                        >
                          <SelectValue placeholder="Select maintenance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
                        </SelectContent>
                      </Select>
                      {createFormErrors.maintenanceType && (
                        <p className="text-red-500 text-sm">
                          {createFormErrors.maintenanceType}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment">Equipment</Label>
                      <Input
                        id="equipment"
                        placeholder="Enter equipment name"
                        value={createForm.equipment}
                        onChange={(e) =>
                          handleCreateInputChange("equipment", e.target.value)
                        }
                        onBlur={() => handleCreateInputBlur("equipment")}
                        aria-invalid={!!createFormErrors.equipment}
                        aria-describedby={
                          createFormErrors.equipment ? "equipment-error" : undefined
                        }
                      />
                      {createFormErrors.equipment && (
                        <p id="equipment-error" className="text-red-500 text-sm">
                          {createFormErrors.equipment}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed task description"
                    value={createForm.description}
                    onChange={(e) =>
                      handleCreateInputChange("description", e.target.value)
                    }
                    onBlur={() => handleCreateInputBlur("description")}
                    rows={3}
                    aria-invalid={!!createFormErrors.description}
                    aria-describedby={
                      createFormErrors.description ? "description-error" : undefined
                    }
                  />
                  {createFormErrors.description && (
                    <p id="description-error" className="text-red-500 text-sm">
                      {createFormErrors.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingTask(false);
                    setCreateFormErrors({});
                    setError(null);
                  }}
                  aria-label="Cancel task creation"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  aria-label="Create task"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskStats.total}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {taskStats.pending}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskStats.inProgress}
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {taskStats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {taskStats.highPriority}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        {/* <CardContent>
          {
            type: "pie",
            data: {
              labels: ["Pending", "In Progress", "Completed"],
              datasets: [{
                data: [${taskStats.pending}, ${taskStats.inProgress}, ${taskStats.completed}],
                backgroundColor: ["#F59E0B", "#3B82F6", "#10B981"],
                borderColor: ["#D97706", "#2563EB", "#059669"],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#1F2937"
                  }
                }
              }
            }
          }
        </CardContent> */}
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Search tasks"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityFilter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger
                  id="priorityFilter"
                  aria-label="Filter by priority"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeFilter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="typeFilter" aria-label="Filter by type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="downtime">Downtime</SelectItem>
                  <SelectItem value="pdi">PDI</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tasks ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              paginatedTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getTypeIcon(task.taskType)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl">
                            {task.title}
                          </h3>
                          <Badge variant="secondary">
                            {task.taskType.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Badge className={getStatusColor(task.status)}>
                         {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1).replace("-", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{" "}
                        Priority
                      </Badge>
                    </div>
                    {/* <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1).replace("-", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{" }
                        Priority
                      </Badge>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        Task Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">{format(new Date(task.dueDate), "yyyy-MM-dd")}</span>
                        </div>
                        {task.productionCode && (
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              Production Code:
                            </span>
                            <span className="font-medium">
                              {task.productionCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        Source Information
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Created from:</span>
                          <Badge variant="outline" className="text-xs">
                            {task.createdFrom.charAt(0).toUpperCase() +
                              task.createdFrom.slice(1)}
                          </Badge>
                        </div>
                        {task.rejectionReason && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Rejection Reason:</strong>{" "}
                            {task.rejectionReason}
                          </div>
                        )}
                        {task.maintenanceType && (
                          <div className="text-xs text-gray-600">
                            <strong>Maintenance Type:</strong>{" "}
                            {task.maintenanceType}
                          </div>
                        )}
                        {task.equipment && (
                          <div className="text-xs text-gray-600">
                            <strong>Equipment:</strong> {task.equipment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTask(task)}
                      className="bg-blue-600 hover:bg-blue-700"
                      aria-label={`Update task ${task.title}`}
                      disabled={isUpdating}
                    >
                      Update Task
                    </Button>
                    {user?.employeeGroup?.toLowerCase() === "admin" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTask(task)}
                        aria-label={`Delete task ${task.title}`}
                        disabled={isDeleting}
                      >
                        Delete Task
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Task Dialog */}
      <Dialog open={isUpdatingTask} onOpenChange={setIsUpdatingTask}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
            <Tabs defaultValue="status">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status Update</TabsTrigger>
                <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
                <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) =>
                        handleUpdateInputChange("status", value)
                      }
                      onOpenChange={() => handleUpdateInputBlur("status")}
                    >
                      <SelectTrigger id="status" aria-label="Select status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateFormErrors.status && (
                      <p className="text-red-500 text-sm">
                        {updateFormErrors.status}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={updateForm.progress}
                      onChange={(e) =>
                        handleUpdateInputChange("progress", e.target.value)
                      }
                      onBlur={() => handleUpdateInputBlur("progress")}
                      aria-invalid={!!updateFormErrors.progress}
                      aria-describedby={
                        updateFormErrors.progress ? "progress-error" : undefined
                      }
                    />
                    {updateFormErrors.progress && (
                      <p id="progress-error" className="text-red-500 text-sm">
                        {updateFormErrors.progress}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={updateForm.dueDate}
                      onChange={(e) =>
                        handleUpdateInputChange("dueDate", e.target.value)
                      }
                      onBlur={() => handleUpdateInputBlur("dueDate")}
                      min={format(new Date(), "yyyy-MM-dd")}
                      aria-invalid={!!updateFormErrors.dueDate}
                      aria-describedby={
                        updateFormErrors.dueDate ? "dueDate-error" : undefined
                      }
                    />
                    {updateFormErrors.dueDate && (
                      <p id="dueDate-error" className="text-red-500 text-sm">
                        {updateFormErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusComments">Status Comments</Label>
                  <Textarea
                    id="statusComments"
                    placeholder="Add comments about current status or progress made"
                    value={updateForm.statusComments}
                    onChange={(e) =>
                      handleUpdateInputChange("statusComments", e.target.value)
                    }
                    rows={3}
                    aria-invalid={!!updateFormErrors.statusComments}
                    aria-describedby={
                      updateFormErrors.statusComments ? "statusComments-error" : undefined
                    }
                  />
                  {updateFormErrors.statusComments && (
                    <p id="statusComments-error" className="text-red-500 text-sm">
                      {updateFormErrors.statusComments}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preventive">
                <Suspense fallback={<div>Loading preventive actions...</div>}>
                  {updateFormErrors.preventiveActions?.general && (
                    <p className="text-red-500 text-sm">
                      {updateFormErrors.preventiveActions.general}
                    </p>
                  )}
                  <ActionInputs
                    actions={preventiveActions}
                    setActions={setPreventiveActions}
                    title="Preventive Actions"
                    employees={employees}
                    errors={updateFormErrors.preventiveActions}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rootCause">Root Cause Analysis</Label>
                  <Textarea
                    id="rootCause"
                    placeholder="Describe the root cause of the issue"
                    value={updateForm.rootCause}
                    onChange={(e) =>
                      handleUpdateInputChange("rootCause", e.target.value)
                    }
                    rows={4}
                    aria-invalid={!!updateFormErrors.rootCause}
                    aria-describedby={
                      updateFormErrors.rootCause ? "rootCause-error" : undefined
                    }
                  />
                  {updateFormErrors.rootCause && (
                    <p id="rootCause-error" className="text-red-500 text-sm">
                      {updateFormErrors.rootCause}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="impactAssessment">Impact Assessment</Label>
                    <Select
                      value={updateForm.impactAssessment}
                      onValueChange={(value) =>
                        handleUpdateInputChange("impactAssessment", value)
                      }
                      onOpenChange={() =>
                        handleUpdateInputBlur("impactAssessment")
                      }
                    >
                      <SelectTrigger
                        id="impactAssessment"
                        aria-label="Select impact level"
                      >
                        <SelectValue placeholder="Select impact level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="critical">
                          Critical Impact
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {updateFormErrors.impactAssessment && (
                      <p className="text-red-500 text-sm">
                        {updateFormErrors.impactAssessment}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceRisk">Recurrence Risk</Label>
                    <Select
                      value={updateForm.recurrenceRisk}
                      onValueChange={(value) =>
                        handleUpdateInputChange("recurrenceRisk", value)
                      }
                      onOpenChange={() =>
                        handleUpdateInputBlur("recurrenceRisk")
                      }
                    >
                      <SelectTrigger
                        id="recurrenceRisk"
                        aria-label="Select risk level"
                      >
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateFormErrors.recurrenceRisk && (
                      <p className="text-red-500 text-sm">
                        {updateFormErrors.recurrenceRisk}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                  <Textarea
                    id="lessonsLearned"
                    placeholder="Document key learnings and improvements for future reference"
                    value={updateForm.lessonsLearned}
                    onChange={(e) =>
                      handleUpdateInputChange("lessonsLearned", e.target.value)
                    }
                    rows={3}
                    aria-invalid={!!updateFormErrors.lessonsLearned}
                    aria-describedby={
                      updateFormErrors.lessonsLearned ? "lessonsLearned-error" : undefined
                    }
                  />
                  {updateFormErrors.lessonsLearned && (
                    <p id="lessonsLearned-error" className="text-red-500 text-sm">
                      {updateFormErrors.lessonsLearned}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdatingTask(false);
                setUpdateFormErrors({});
                setError(null);
              }}
              aria-label="Cancel task update"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUpdate}
              aria-label="Save task updates"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Updates"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!selectedTaskForDeletion} onOpenChange={() => setSelectedTaskForDeletion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the task "{selectedTaskForDeletion?.title}"?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedTaskForDeletion(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;

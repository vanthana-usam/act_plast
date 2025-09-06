// import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Plus,
//   Search,
//   Calendar,
//   Clock,
//   User,
//   AlertTriangle,
//   CheckCircle,
//   Wrench,
//   Settings,
//   Trash2,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { debounce } from "lodash";
// import { generateUUID } from "../utils/utils";
// import { useAuth } from "@/AuthContext";
// import { useToast } from "@/components/ui/use-toast";

// // Lazy load ActionInputs component
// const ActionInputs = lazy(() => import("./ActionInputs"));

// interface Action {
//   id: string;
//   action: string;
//   responsible: string;
//   dueDate: string;
// }

// interface Task {
//   taskId: string;
//   productionCode?: string;
//   taskType: string;
//   title: string;
//   description: string;
//   priority: string;
//   assignedTo: string;
//   assignedTeam: string;
//   assignedToName: string;
//   dueDate: string;
//   status: string;
//   createdFrom: string;
//   rejectionReason?: string;
//   quantity?: number;
//   maintenanceType?: string;
//   equipment?: string;
//   correctiveActions?: Action[];
//   preventiveActions?: Action[];
//   progress?: number;
//   statusComments?: string;
//   rootCause?: string;
//   impactAssessment?: string;
//   recurrenceRisk?: string;
//   lessonsLearned?: string;
// }

// const TaskManagement: React.FC = () => {
//   const { token, user } = useAuth();
//   const { toast } = useToast();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isUpdatingTask, setIsUpdatingTask] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [teams, setTeams] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [productionRecords, setProductionRecords] = useState<any[]>([]); // Added state
//   const [createForm, setCreateForm] = useState({
//     title: "",
//     taskType: "",
//     priority: "",
//     assignedTo: "",
//     dueDate: "",
//     productionCode: "",
//     description: "",
//     rejectionReason: "",
//     quantity: "",
//     maintenanceType: "",
//     equipment: "",
//   });
//   const [updateForm, setUpdateForm] = useState({
//     status: "",
//     progress: "",
//     statusComments: "",
//     rootCause: "",
//     impactAssessment: "",
//     recurrenceRisk: "",
//     lessonsLearned: "",
//   });
//   const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
//     { id: generateUUID(), action: "", responsible: "", dueDate: "" },
//   ]);
//   const [preventiveActions, setPreventiveActions] = useState<Action[]>([
//     { id: generateUUID(), action: "", responsible: "", dueDate: "" },
//   ]);

//   // Memoize static data to prevent unnecessary recalculations
//   const priorityColors = useMemo(
//     () => ({
//       high: "bg-red-100 text-red-800",
//       medium: "bg-yellow-100 text-yellow-800",
//       low: "bg-green-100 text-green-800",
//       default: "bg-gray-100 text-gray-800",
//     }),
//     []
//   );

//   const statusColors = useMemo(
//     () => ({
//       pending: "bg-orange-100 text-orange-800",
//       "in-progress": "bg-blue-100 text-blue-800",
//       completed: "bg-green-100 text-green-800",
//       default: "bg-gray-100 text-gray-800",
//     }),
//     []
//   );

//   const typeIcons = useMemo(
//     () => ({
//       downtime: <AlertTriangle className="h-4 w-4" />,
//       pdi: <CheckCircle className="h-4 w-4" />,
//       maintenance: <Wrench className="h-4 w-4" />,
//       quality: <Settings className="h-4 w-4" />,
//       default: <Clock className="h-4 w-4" />,
//     }),
//     []
//   );

//   // Combine data fetching into a single function
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       };

//       const [tasksRes, teamsRes, employeesRes, productionRes] = await Promise.all([
//         fetch("http://192.168.1.82:5000/api/tasks", { headers }),
//         fetch("http://192.168.1.82:5000/api/teams", { headers }),
//         fetch("http://192.168.1.82:5000/api/employees", { headers }),
//         fetch("http://192.168.1.82:5000/api/production", { headers }),
//       ]);

//       if (!tasksRes.ok || !teamsRes.ok || !employeesRes.ok || !productionRes.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const [tasksJson, teamsJson, employeesJson, productionJson] = await Promise.all([
//         tasksRes.json(),
//         teamsRes.json(),
//         employeesRes.json(),
//         productionRes.json(),
//       ]);

//       setEmployees(employeesJson);
//       setTeams(Array.isArray(teamsJson) ? teamsJson : []);
//       setProductionRecords(Array.isArray(productionJson.records) ? productionJson.records : []);

//       const enrichedTasks = tasksJson.map((task: any) => ({
//         ...task,
//         assignedToName: employeesJson.find((e: any) => e.employeeId === task.assignedTo)?.name || task.assignedTo,
//       }));

//       setTasks(Array.isArray(enrichedTasks) ? enrichedTasks : []);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to load data. Please try again.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to load data. Please try again.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [token, toast]);

//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   const filteredTasks = useMemo(() => {
//     return tasks.filter((task) => {
//       const matchesGroup = task.assignedTeam === user?.employeeGroup;
//       const matchesSearch =
//         task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (task.productionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
//       const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter.toLowerCase();
//       const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter.toLowerCase();
//       const matchesType = typeFilter === "all" || task.taskType.toLowerCase() === typeFilter.toLowerCase();

//       return matchesGroup && matchesSearch && matchesStatus && matchesPriority && matchesType;
//     });
//   }, [tasks, user?.employeeGroup, searchTerm, statusFilter, priorityFilter, typeFilter]);

//   const getEmployeeName = useCallback((id: string) => {
//     return employees.find((emp) => emp.employeeId === id)?.name || id;
//   }, [employees]);

//   const getPriorityColor = useCallback((priority: string) => {
//     return priorityColors[priority.toLowerCase()] || priorityColors.default;
//   }, [priorityColors]);

//   const getStatusColor = useCallback((status: string) => {
//     return statusColors[status.toLowerCase()] || statusColors.default;
//   }, [statusColors]);

//   const getTypeIcon = useCallback((type: string) => {
//     return typeIcons[type.toLowerCase()] || typeIcons.default;
//   }, [typeIcons]);

//   const handleCreateInputChange = useCallback((field: keyof typeof createForm, value: string) => {
//     setCreateForm((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleUpdateInputChange = useCallback((field: keyof typeof updateForm, value: string) => {
//     setUpdateForm((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleCreateTask = useCallback(async () => {
//     if (
//       !createForm.title ||
//       !createForm.taskType ||
//       !createForm.priority ||
//       !createForm.assignedTo ||
//       !createForm.dueDate ||
//       !createForm.description
//     ) {
//       setError("Title, type, priority, assigned to, due date, and description are required.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Please fill in all required fields.",
//       });
//       return;
//     }

//     try {
//       const response = await fetch("http://192.168.1.82:5000/api/tasks", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...createForm,
//           productionCode: String(createForm.productionCode || ""),
//           quantity: createForm.quantity ? parseInt(createForm.quantity, 10) : undefined,
//         }),
//       });

//       if (response.ok) {
//         setIsAddingTask(false);
//         setCreateForm({
//           title: "",
//           taskType: "",
//           priority: "",
//           assignedTo: "",
//           dueDate: "",
//           productionCode: "",
//           description: "",
//           rejectionReason: "",
//           quantity: "",
//           maintenanceType: "",
//           equipment: "",
//         });
//         setError(null);
//         toast({
//           title: "Success",
//           description: "Task created successfully.",
//         });
//         await fetchInitialData();
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || "Failed to create task. Please try again.");
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: errorData.message || "Failed to create task.",
//         });
//       }
//     } catch (err) {
//       console.error("Error creating task:", err);
//       setError("Failed to create task. Please try again.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to create task. Please try again.",
//       });
//     }
//   }, [createForm, token, toast, fetchInitialData]);

//   const handleUpdateTask = useCallback((task: Task) => {
//     setSelectedTask(task);
//     setIsUpdatingTask(true);
//     setUpdateForm({
//       status: task.status,
//       progress: task.progress?.toString() ?? "0",
//       statusComments: task.statusComments ?? "",
//       rootCause: task.rootCause ?? "",
//       impactAssessment: task.impactAssessment ?? "",
//       recurrenceRisk: task.recurrenceRisk ?? "",
//       lessonsLearned: task.lessonsLearned ?? "",
//     });
//     setCorrectiveActions(
//       (task.correctiveActions ?? [{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]).map(
//         (action) => ({ ...action, id: action.id ?? generateUUID() })
//       )
//     );
//     setPreventiveActions(
//       (task.preventiveActions ?? [{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]).map(
//         (action) => ({ ...action, id: action.id ?? generateUUID() })
//       )
//     );
//   }, []);

//   const handleSaveUpdate = useCallback(async () => {
//     if (!selectedTask) return;

//     if (!updateForm.status) {
//       setError("Status is required.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Status is required.",
//       });
//       return;
//     }

//     if (
//       correctiveActions.some((action) => !action.action || !action.responsible || !action.dueDate) ||
//       preventiveActions.some((action) => !action.action || !action.responsible || !action.dueDate)
//     ) {
//       setError("All corrective and preventive actions must have action, responsible person, and due date.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "All actions must have action, responsible person, and due date.",
//       });
//       return;
//     }

//     try {
//       const response = await fetch(`http://192.168.1.82:5000/api/tasks/${selectedTask.taskId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...updateForm,
//           progress: updateForm.progress ? parseInt(updateForm.progress, 10) : undefined,
//           correctiveActions: correctiveActions.map(({ id, ...rest }) => rest),
//           preventiveActions: preventiveActions.map(({ id, ...rest }) => rest),
//         }),
//       });

//       if (response.ok) {
//         setIsUpdatingTask(false);
//         setSelectedTask(null);
//         setError(null);
//         toast({
//           title: "Success",
//           description: "Task updated successfully.",
//         });
//         await fetchInitialData();
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || "Failed to update task. Please try again.");
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: errorData.message || "Failed to update task.",
//         });
//       }
//     } catch (err) {
//       console.error("Error updating task:", err);
//       setError("Failed to update task. Please try again.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to update task. Please try again.",
//       });
//     }
//   }, [selectedTask, updateForm, correctiveActions, preventiveActions, token, toast, fetchInitialData]);

//   const handleDeleteTask = useCallback(async (taskId: string) => {
//     if (!confirm("Are you sure you want to delete this task?")) return;

//     try {
//       const response = await fetch(`http://192.168.1.82:5000/api/tasks/${taskId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
//         setError(null);
//         toast({
//           title: "Success",
//           description: "Task deleted successfully.",
//         });
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || "Failed to delete task. Please try again.");
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: errorData.message || "Failed to delete task.",
//         });
//       }
//     } catch (err) {
//       console.error("Error deleting task:", err);
//       setError("Failed to delete task. Please try again.");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to delete task. Please try again.",
//       });
//     }
//   }, [token, toast]);

//   const taskStats = useMemo(
//     () => ({
//       total: tasks.length,
//       pending: tasks.filter((task) => task.status === "pending").length,
//       inProgress: tasks.filter((task) => task.status === "in-progress").length,
//       completed: tasks.filter((task) => task.status === "completed").length,
//       highPriority: tasks.filter((task) => task.priority === "high").length,
//     }),
//     [tasks]
//   );

//   if (isLoading) {
//     return (
//       <div className="text-center p-4">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//         <p className="mt-2 text-gray-600">Loading tasks...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center p-4 text-red-600">
//         {error}
//         <Button
//           onClick={fetchInitialData}
//           className="ml-4"
//         >
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
//         <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               Create Task
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Create New Task</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               {error && (
//                 <div className="text-red-600 text-sm mb-4">{error}</div>
//               )}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Task Title</Label>
//                   <Input
//                     placeholder="Enter task title"
//                     value={createForm.title}
//                     onChange={(e) => handleCreateInputChange("title", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Task Type</Label>
//                   <Select
//                     value={createForm.taskType}
//                     onValueChange={(value) => handleCreateInputChange("taskType", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="downtime">Downtime Issue</SelectItem>
//                       <SelectItem value="pdi">PDI Issue</SelectItem>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                       <SelectItem value="quality">Quality Control</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label>Priority</Label>
//                   <Select
//                     value={createForm.priority}
//                     onValueChange={(value) => handleCreateInputChange("priority", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select priority" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="low">Low</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="high">High</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Assigned To</Label>
//                   <Select
//                     value={createForm.assignedTo}
//                     onValueChange={(value) => handleCreateInputChange("assignedTo", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Employee" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {employees.map((emp) => (
//                         <SelectItem key={emp.employeeId} value={emp.employeeId}>
//                           {emp.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Due Date</Label>
//                   <Input
//                     type="date"
//                     value={createForm.dueDate}
//                     onChange={(e) => handleCreateInputChange("dueDate", e.target.value)}
//                   />
//                 </div>
//               </div>
//               {createForm.taskType === "downtime" || createForm.taskType === "pdi" ? (
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Production Code</Label>
//                     <Select
//                       value={createForm.productionCode}
//                       onValueChange={(value) => handleCreateInputChange("productionCode", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select production code" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {productionRecords
//                           .filter((prod) => prod.productionCode?.trim())
//                           .map((prod) => (
//                             <SelectItem
//                               key={prod.recordId}
//                               value={prod.productionCode}
//                             >
//                               {prod.productionCode}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Quantity (if applicable)</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter quantity"
//                       value={createForm.quantity}
//                       onChange={(e) => handleCreateInputChange("quantity", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2 col-span-2">
//                     <Label>Rejection Reason</Label>
//                     <Textarea
//                       placeholder="Describe the rejection reason"
//                       value={createForm.rejectionReason}
//                       onChange={(e) => handleCreateInputChange("rejectionReason", e.target.value)}
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//               ) : createForm.taskType === "maintenance" ? (
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Maintenance Type</Label>
//                     <Select
//                       value={createForm.maintenanceType}
//                       onValueChange={(value) => handleCreateInputChange("maintenanceType", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select maintenance type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="preventive">Preventive</SelectItem>
//                         <SelectItem value="scheduled">Scheduled</SelectItem>
//                         <SelectItem value="corrective">Corrective</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Equipment</Label>
//                     <Input
//                       placeholder="Enter equipment name"
//                       value={createForm.equipment}
//                       onChange={(e) => handleCreateInputChange("equipment", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               ) : null}
//               <div className="space-y-2">
//                 <Label>Description</Label>
//                 <Textarea
//                   placeholder="Detailed task description"
//                   value={createForm.description}
//                   onChange={(e) => handleCreateInputChange("description", e.target.value)}
//                   rows={3}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setIsAddingTask(false);
//                   setError(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleCreateTask}>Create Task</Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-5 gap-4">
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Tasks</p>
//                 <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
//               </div>
//               <Clock className="h-8 w-8 text-blue-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending</p>
//                 <p className="text-2xl font-bold text-orange-600">{taskStats.pending}</p>
//               </div>
//               <AlertTriangle className="h-8 w-8 text-orange-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">In Progress</p>
//                 <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
//               </div>
//               <Settings className="h-8 w-8 text-blue-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">High Priority</p>
//                 <p className="text-2xl font-bold text-red-600">{taskStats.highPriority}</p>
//               </div>
//               <AlertTriangle className="h-8 w-8 text-red-600" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card className="border-0 shadow-sm">
//         <CardContent className="p-4">
//           <div className="grid grid-cols-5 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="search">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="search"
//                   placeholder="Search tasks..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                   aria-label="Search tasks"
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label>Status</Label>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="in-progress">In Progress</SelectItem>
//                   <SelectItem value="completed">Completed</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label>Priority</Label>
//               <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Priority</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="low">Low</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label>Type</Label>
//               <Select value={typeFilter} onValueChange={setTypeFilter}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="downtime">Downtime</SelectItem>
//                   <SelectItem value="pdi">PDI</SelectItem>
//                   <SelectItem value="maintenance">Maintenance</SelectItem>
//                   <SelectItem value="quality">Quality</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Task List */}
//       <Card className="border-0 shadow-md">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="h-5 w-5" />
//             Tasks ({filteredTasks.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {filteredTasks.length === 0 ? (
//               <div className="text-center py-12">
//                 <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
//                 <p className="text-gray-500">Try adjusting your search or filters</p>
//               </div>
//             ) : (
//               filteredTasks.map((task) => (
//                 <div
//                   key={task.taskId}
//                   className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-start space-x-3">
//                       <div className="mt-1">{getTypeIcon(task.taskType)}</div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <h3 className="font-semibold text-xl">{task.title}</h3>
//                           <Badge variant="secondary">{task.taskType.toUpperCase()}</Badge>
//                         </div>
//                         <p className="text-gray-600 text-sm mb-3">{task.description}</p>
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-end gap-2">
//                       <Badge className={getStatusColor(task.status)}>
//                         {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
//                       </Badge>
//                       <Badge className={getPriorityColor(task.priority)}>
//                         {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
//                       </Badge>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6 mb-4">
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-900">Task Details</h4>
//                       <div className="text-sm space-y-1">
//                         <div className="flex items-center space-x-2">
//                           <User className="h-4 w-4 text-gray-400" />
//                           <span className="text-gray-600">Assigned to:</span>
//                           <span className="font-medium">{getEmployeeName(task.assignedTo)}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Calendar className="h-4 w-4 text-gray-400" />
//                           <span className="text-gray-600">Due Date:</span>
//                           <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
//                         </div>
//                         {task.productionCode && (
//                           <div className="flex items-center space-x-2">
//                             <Settings className="h-4 w-4 text-gray-400" />
//                             <span className="text-gray-600">Production Code:</span>
//                             <span className="font-medium">{task.productionCode}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-900">Source Information</h4>
//                       <div className="text-sm space-y-1">
//                         <div className="flex items-center space-x-2">
//                           <span className="text-gray-600">Created from:</span>
//                           <Badge variant="outline" className="text-xs">
//                             {task.createdFrom.charAt(0).toUpperCase() + task.createdFrom.slice(1)}
//                           </Badge>
//                         </div>
//                         {task.rejectionReason && (
//                           <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
//                             <strong>Rejection Reason:</strong> {task.rejectionReason}
//                           </div>
//                         )}
//                         {task.maintenanceType && (
//                           <div className="text-xs text-gray-600">
//                             <strong>Maintenance Type:</strong> {task.maintenanceType}
//                           </div>
//                         )}
//                         {task.equipment && (
//                           <div className="text-xs text-gray-600">
//                             <strong>Equipment:</strong> {task.equipment}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex justify-end space-x-2">
//                     <Button
//                       size="sm"
//                       onClick={() => handleUpdateTask(task)}
//                       className="bg-blue-600 hover:bg-blue-700"
//                     >
//                       Update Task
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDeleteTask(task.taskId)}
//                     >
//                       Delete Task
//                     </Button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Update Task Dialog */}
//       <Dialog open={isUpdatingTask} onOpenChange={setIsUpdatingTask}>
//         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Update Task: {selectedTask?.title}</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-6 py-4">
//             {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
//             <Tabs defaultValue="status">
//               <TabsList className="grid w-full grid-cols-4">
//                 <TabsTrigger value="status">Status Update</TabsTrigger>
//                 <TabsTrigger value="corrective">Corrective Actions</TabsTrigger>
//                 <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
//                 <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
//               </TabsList>

//               <TabsContent value="status" className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Status</Label>
//                     <Select
//                       value={updateForm.status}
//                       onValueChange={(value) => handleUpdateInputChange("status", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="in-progress">In Progress</SelectItem>
//                         <SelectItem value="completed">Completed</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Progress (%)</Label>
//                     <Input
//                       type="number"
//                       placeholder="0-100"
//                       min="0"
//                       max="100"
//                       value={updateForm.progress}
//                       onChange={(e) => handleUpdateInputChange("progress", e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Status Comments</Label>
//                   <Textarea
//                     placeholder="Add comments about current status or progress made"
//                     value={updateForm.statusComments}
//                     onChange={(e) => handleUpdateInputChange("statusComments", e.target.value)}
//                     rows={3}
//                   />
//                 </div>
//               </TabsContent>

//               <TabsContent value="corrective">
//                 <Suspense fallback={<div>Loading corrective actions...</div>}>
//                   <ActionInputs
//                     actions={correctiveActions}
//                     setActions={setCorrectiveActions}
//                     title="Corrective Actions"
//                     employees={employees}
//                   />
//                 </Suspense>
//               </TabsContent>

//               <TabsContent value="preventive">
//                 <Suspense fallback={<div>Loading preventive actions...</div>}>
//                   <ActionInputs
//                     actions={preventiveActions}
//                     setActions={setPreventiveActions}
//                     title="Preventive Actions"
//                     employees={employees}
//                   />
//                 </Suspense>
//               </TabsContent>

//               <TabsContent value="analysis" className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Root Cause Analysis</Label>
//                   <Textarea
//                     placeholder="Describe the root cause of the issue"
//                     value={updateForm.rootCause}
//                     onChange={(e) => handleUpdateInputChange("rootCause", e.target.value)}
//                     rows={4}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Impact Assessment</Label>
//                     <Select
//                       value={updateForm.impactAssessment}
//                       onValueChange={(value) => handleUpdateInputChange("impactAssessment", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select impact level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low Impact</SelectItem>
//                         <SelectItem value="medium">Medium Impact</SelectItem>
//                         <SelectItem value="high">High Impact</SelectItem>
//                         <SelectItem value="critical">Critical Impact</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Recurrence Risk</Label>
//                     <Select
//                       value={updateForm.recurrenceRisk}
//                       onValueChange={(value) => handleUpdateInputChange("recurrenceRisk", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select risk level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low Risk</SelectItem>
//                         <SelectItem value="medium">Medium Risk</SelectItem>
//                         <SelectItem value="high">High Risk</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Lessons Learned</Label>
//                   <Textarea
//                     placeholder="Document key learnings and improvements for future reference"
//                     value={updateForm.lessonsLearned}
//                     onChange={(e) => handleUpdateInputChange("lessonsLearned", e.target.value)}
//                     rows={3}
//                   />
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>
//           <div className="flex justify-end space-x-2">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsUpdatingTask(false);
//                 setError(null);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSaveUpdate}>Save Updates</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default TaskManagement;


import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
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
import { debounce } from "lodash";
import { generateUUID } from "../utils/utils";
import { useAuth } from "@/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
  correctiveActions?: Action[];
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [productionRecords, setProductionRecords] = useState<any[]>([]); // Added state
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
    statusComments: "",
    rootCause: "",
    impactAssessment: "",
    recurrenceRisk: "",
    lessonsLearned: "",
  });
  const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "", dueDate: "" },
  ]);
  const [preventiveActions, setPreventiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "", dueDate: "" },
  ]);

  // Memoize static data to prevent unnecessary recalculations
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
const API_URL = 'http://localhost:5000';

  // Combine data fetching into a single function
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
        tasksRes.json(),
        teamsRes.json(),
        employeesRes.json(),
        productionRes.json(),
      ]);

      setEmployees(employeesJson);
      setTeams(Array.isArray(teamsJson) ? teamsJson : []);
      setProductionRecords(Array.isArray(productionJson.records) ? productionJson.records : []);

      const enrichedTasks = tasksJson.map((task: any) => ({
        ...task,
        assignedToName: employeesJson.find((e: any) => e.employeeId === task.assignedTo)?.name || task.assignedTo,
      }));

      setTasks(Array.isArray(enrichedTasks) ? enrichedTasks : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesGroup = task.assignedTeam === user?.employeeGroup;
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.productionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesType = typeFilter === "all" || task.taskType.toLowerCase() === typeFilter.toLowerCase();

      return matchesGroup && matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [tasks, user?.employeeGroup, searchTerm, statusFilter, priorityFilter, typeFilter]);

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
    if (
      !createForm.title ||
      !createForm.taskType ||
      !createForm.priority ||
      !createForm.assignedTo ||
      !createForm.dueDate ||
      !createForm.description
    ) {
      setError("Title, type, priority, assigned to, due date, and description are required.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const response = await fetch("http://192.168.1.82:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...createForm,
          productionCode: String(createForm.productionCode || ""),
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
        setError(null);
        toast({
          title: "Success",
          description: "Task created successfully.",
        });
        await fetchInitialData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create task. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to create task.",
        });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task. Please try again.",
      });
    }
  }, [createForm, token, toast, fetchInitialData]);

  const handleUpdateTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsUpdatingTask(true);
    setUpdateForm({
      status: task.status,
      progress: task.progress?.toString() ?? "0",
      statusComments: task.statusComments ?? "",
      rootCause: task.rootCause ?? "",
      impactAssessment: task.impactAssessment ?? "",
      recurrenceRisk: task.recurrenceRisk ?? "",
      lessonsLearned: task.lessonsLearned ?? "",
    });
    setCorrectiveActions(
      (task.correctiveActions ?? [{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]).map(
        (action) => ({ ...action, id: action.id ?? generateUUID() })
      )
    );
    setPreventiveActions(
      (task.preventiveActions ?? [{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]).map(
        (action) => ({ ...action, id: action.id ?? generateUUID() })
      )
    );
  }, []);

  const handleSaveUpdate = useCallback(async () => {
    if (!selectedTask) return;

    if (!updateForm.status) {
      setError("Status is required.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Status is required.",
      });
      return;
    }

    if (
      correctiveActions.some((action) => !action.action || !action.responsible || !action.dueDate) ||
      preventiveActions.some((action) => !action.action || !action.responsible || !action.dueDate)
    ) {
      setError("All corrective and preventive actions must have action, responsible person, and due date.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "All actions must have action, responsible person, and due date.",
      });
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.82:5000/api/tasks/${selectedTask.taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateForm,
          progress: updateForm.progress ? parseInt(updateForm.progress, 10) : undefined,
          correctiveActions: correctiveActions.map(({ id, ...rest }) => rest),
          preventiveActions: preventiveActions.map(({ id, ...rest }) => rest),
        }),
      });

      if (response.ok) {
        setIsUpdatingTask(false);
        setSelectedTask(null);
        setError(null);
        toast({
          title: "Success",
          description: "Task updated successfully.",
        });
        await fetchInitialData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update task. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to update task.",
        });
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task. Please try again.",
      });
    }
  }, [selectedTask, updateForm, correctiveActions, preventiveActions, token, toast, fetchInitialData]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`http://192.168.1.82:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
        setError(null);
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete task. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to delete task.",
        });
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task. Please try again.",
      });
    }
  }, [token, toast]);

  const taskStats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      highPriority: tasks.filter((task) => task.priority === "high").length,
    }),
    [tasks]
  );

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
        <Button
          onClick={fetchInitialData}
          className="ml-4"
        >
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
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
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
                  <Label>Task Title</Label>
                  <Input
                    placeholder="Enter task title"
                    value={createForm.title}
                    onChange={(e) => handleCreateInputChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={createForm.taskType}
                    onValueChange={(value) => handleCreateInputChange("taskType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="downtime">Downtime Issue</SelectItem>
                      <SelectItem value="pdi">PDI Issue</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="quality">Quality Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={createForm.priority}
                    onValueChange={(value) => handleCreateInputChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select
                    value={createForm.assignedTo}
                    onValueChange={(value) => handleCreateInputChange("assignedTo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => handleCreateInputChange("dueDate", e.target.value)}
                  />
                </div>
              </div>
              {createForm.taskType === "downtime" || createForm.taskType === "pdi" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Production Code</Label>
                    <Select
                      value={createForm.productionCode}
                      onValueChange={(value) => handleCreateInputChange("productionCode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select production code" />
                      </SelectTrigger>
                      <SelectContent>
                        {productionRecords
                          .filter((prod) => prod.productionCode?.trim())
                          .map((prod) => (
                            <SelectItem
                              key={prod.recordId}
                              value={prod.productionCode}
                            >
                              {prod.productionCode}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (if applicable)</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={createForm.quantity}
                      onChange={(e) => handleCreateInputChange("quantity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Rejection Reason</Label>
                    <Textarea
                      placeholder="Describe the rejection reason"
                      value={createForm.rejectionReason}
                      onChange={(e) => handleCreateInputChange("rejectionReason", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ) : createForm.taskType === "maintenance" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maintenance Type</Label>
                    <Select
                      value={createForm.maintenanceType}
                      onValueChange={(value) => handleCreateInputChange("maintenanceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Equipment</Label>
                    <Input
                      placeholder="Enter equipment name"
                      value={createForm.equipment}
                      onChange={(e) => handleCreateInputChange("equipment", e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Detailed task description"
                  value={createForm.description}
                  onChange={(e) => handleCreateInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
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
                <p className="text-2xl font-bold text-orange-600">{taskStats.pending}</p>
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
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
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
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{taskStats.highPriority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Search tasks"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
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
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
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
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getTypeIcon(task.taskType)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl">{task.title}</h3>
                          <Badge variant="secondary">{task.taskType.toUpperCase()}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Task Details</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium">{getEmployeeName(task.assignedTo)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        {task.productionCode && (
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Production Code:</span>
                            <span className="font-medium">{task.productionCode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Source Information</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Created from:</span>
                          <Badge variant="outline" className="text-xs">
                            {task.createdFrom.charAt(0).toUpperCase() + task.createdFrom.slice(1)}
                          </Badge>
                        </div>
                        {task.rejectionReason && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Rejection Reason:</strong> {task.rejectionReason}
                          </div>
                        )}
                        {task.maintenanceType && (
                          <div className="text-xs text-gray-600">
                            <strong>Maintenance Type:</strong> {task.maintenanceType}
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
                    >
                      Update Task
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTask(task.taskId)}
                    >
                      Delete Task
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="status">Status Update</TabsTrigger>
                <TabsTrigger value="corrective">Corrective Actions</TabsTrigger>
                <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
                <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) => handleUpdateInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Progress (%)</Label>
                    <Input
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={updateForm.progress}
                      onChange={(e) => handleUpdateInputChange("progress", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status Comments</Label>
                  <Textarea
                    placeholder="Add comments about current status or progress made"
                    value={updateForm.statusComments}
                    onChange={(e) => handleUpdateInputChange("statusComments", e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="corrective">
                <Suspense fallback={<div>Loading corrective actions...</div>}>
                  <ActionInputs
                    actions={correctiveActions}
                    setActions={setCorrectiveActions}
                    title="Corrective Actions"
                    employees={employees}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="preventive">
                <Suspense fallback={<div>Loading preventive actions...</div>}>
                  <ActionInputs
                    actions={preventiveActions}
                    setActions={setPreventiveActions}
                    title="Preventive Actions"
                    employees={employees}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-2">
                  <Label>Root Cause Analysis</Label>
                  <Textarea
                    placeholder="Describe the root cause of the issue"
                    value={updateForm.rootCause}
                    onChange={(e) => handleUpdateInputChange("rootCause", e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Impact Assessment</Label>
                    <Select
                      value={updateForm.impactAssessment}
                      onValueChange={(value) => handleUpdateInputChange("impactAssessment", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="critical">Critical Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recurrence Risk</Label>
                    <Select
                      value={updateForm.recurrenceRisk}
                      onValueChange={(value) => handleUpdateInputChange("recurrenceRisk", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lessons Learned</Label>
                  <Textarea
                    placeholder="Document key learnings and improvements for future reference"
                    value={updateForm.lessonsLearned}
                    onChange={(e) => handleUpdateInputChange("lessonsLearned", e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdatingTask(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate}>Save Updates</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
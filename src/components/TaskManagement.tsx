// import React, { useState, useEffect } from "react";
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

// interface Action {
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

// const TaskManagement = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isUpdatingTask, setIsUpdatingTask] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [productionCodes, setProductionCodes] = useState<string[]>([]);

//   const [teams, setTeams] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // const [employees, setEmployees] = useState<string[]>([]);
//   const [newTask, setNewTask] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//     assignedTo: "",
//     priority: "Medium",
//     status: "Pending",
//   });

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
//     { action: "", responsible: "", dueDate: "" },
//   ]);
//   const [preventiveActions, setPreventiveActions] = useState<Action[]>([
//     { action: "", responsible: "", dueDate: "" },
//   ]);

//   const [employees, setEmployees] = useState<any[]>([]);
//   const [assignedTo, setAssignedTo] = useState("");

//   useEffect(() => {
//   const fetchData = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const [tasksRes, codesRes, teamsRes, employeesRes] = await Promise.all([
//         fetch("http://192.168.1.158:5000/api/tasks"),
//         fetch("http://192.168.1.158:5000/api/production-codes"),
//         fetch("http://192.168.1.158:5000/api/teams"),
//         fetch("http://192.168.1.158:5000/api/employees"),
//       ]);

//       const [tasksJson, codesJson, teamsJson, employeesJson] = await Promise.all([
//         tasksRes.json(),
//         codesRes.json(),
//         teamsRes.json(),
//         employeesRes.json(),
//       ]);

//       setEmployees(employeesJson);

//       const enrichedTasks = tasksJson.map((task: any) => {
//         const emp = employeesJson.find((e: any) => e.employeeId === task.assignedTo);
//         return { ...task, assignedToName: emp ? emp.name : task.assignedTo };
//       });

//       setTasks(Array.isArray(enrichedTasks) ? enrichedTasks : []);
//       setProductionCodes(Array.isArray(codesJson) ? codesJson : []);
//       setTeams(Array.isArray(teamsJson) ? teamsJson : []);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to load tasks. Please try again.");
//       setTasks([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   fetchData();
// }, []);


//   const filteredTasks = tasks.filter((task) => {
//     const matchesSearch =
//       task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (task.productionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ??
//         false);
//     const matchesStatus =
//       statusFilter === "all" || task.status === statusFilter;
//     const matchesPriority =
//       priorityFilter === "all" || task.priority === priorityFilter;
//     const matchesType = typeFilter === "all" || task.taskType === typeFilter;
//     return matchesSearch && matchesStatus && matchesPriority && matchesType;
//   });

//   const getEmployeeName = (id: string) => {
//   return employees.find((emp) => emp.employeeId === id)?.name || id;
// };


//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "bg-red-100 text-red-800";
//       case "medium":
//         return "bg-yellow-100 text-yellow-800";
//       case "low":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-orange-100 text-orange-800";
//       case "in-progress":
//         return "bg-blue-100 text-blue-800";
//       case "completed":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case "downtime":
//         return <AlertTriangle className="h-4 w-4" />;
//       case "pdi":
//         return <CheckCircle className="h-4 w-4" />;
//       case "maintenance":
//         return <Wrench className="h-4 w-4" />;
//       case "quality":
//         return <Settings className="h-4 w-4" />;
//       default:
//         return <Clock className="h-4 w-4" />;
//     }
//   };

//   const addAction = (
//     setter: React.Dispatch<React.SetStateAction<Action[]>>
//   ) => {
//     setter((prev) => [...prev, { action: "", responsible: "", dueDate: "" }]);
//   };

//   const removeAction = (
//     index: number,
//     setter: React.Dispatch<React.SetStateAction<Action[]>>
//   ) => {
//     setter((prev) => prev.filter((_, i) => i !== index));
//   };

//   const updateAction = (
//     index: number,
//     field: keyof Action,
//     value: string,
//     setter: React.Dispatch<React.SetStateAction<Action[]>>
//   ) => {
//     setter((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
//     );
//   };

//   const handleCreateInputChange = (
//     field: keyof typeof createForm,
//     value: string
//   ) => {
//     setCreateForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleUpdateInputChange = (
//     field: keyof typeof updateForm,
//     value: string
//   ) => {
//     setUpdateForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // console.log("Tasks:", createForm);

//   const handleCreateTask = async () => {
//     // Basic validation
//     if (
//       !createForm.title ||
//       !createForm.taskType ||
//       !createForm.priority ||
//       // !createForm.assignedTo ||
//       !createForm.dueDate ||
//       !createForm.description
//     ) {
//       setError(
//         "Title, type, priority, assigned to, due date, and description are required."
//       );
//       return;
//     }
//     try {
//       const response = await fetch("http://192.168.1.158:5000/api/tasks", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...createForm,
//           quantity: createForm.quantity
//             ? parseInt(createForm.quantity, 10)
//             : undefined,
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
//         // Refresh tasks
//         const tasksRes = await fetch("http://192.168.1.158:5000/api/tasks").then(
//           (res) => res.json()
//         );
//         setTasks(Array.isArray(tasksRes) ? tasksRes : []);
//       } else {
//         setError("Failed to create task. Please try again.");
//       }
//     } catch (err) {
//       console.error("Error creating task:", err);
//       setError("Failed to create task. Please try again.");
//     }
//   };

//   const handleUpdateTask = (task: Task) => {
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
//       task.correctiveActions ?? [{ action: "", responsible: "", dueDate: "" }]
//     );
//     setPreventiveActions(
//       task.preventiveActions ?? [{ action: "", responsible: "", dueDate: "" }]
//     );
//   };

//   const handleSaveUpdate = async () => {
//     if (!selectedTask) return;
//     if (!updateForm.status) {
//       setError("Status is required.");
//       return;
//     }
//     if (
//       correctiveActions.some(
//         (action) => !action.action || !action.responsible || !action.dueDate
//       )
//     ) {
//       setError(
//         "All corrective actions must have action, responsible person, and due date."
//       );
//       return;
//     }
//     if (
//       preventiveActions.some(
//         (action) => !action.action || !action.responsible || !action.dueDate
//       )
//     ) {
//       setError(
//         "All preventive actions must have action, responsible person, and due date."
//       );
//       return;
//     }
//     try {
//       const response = await fetch(
//         `http://192.168.1.158:5000/api/tasks/${selectedTask.taskId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...updateForm,
//             progress: updateForm.progress
//               ? parseInt(updateForm.progress, 10)
//               : undefined,
//             correctiveActions,
//             preventiveActions,
//           }),
//         }
//       );
//       if (response.ok) {
//         setIsUpdatingTask(false);
//         setSelectedTask(null);
//         // Refresh tasks
//         const tasksRes = await fetch("http://192.168.1.158:5000/api/tasks").then(
//           (res) => res.json()
//         );
//         setTasks(Array.isArray(tasksRes) ? tasksRes : []);
//       } else {
//         setError("Failed to update task. Please try again.");
//       }
//     } catch (err) {
//       console.error("Error updating task:", err);
//       setError("Failed to update task. Please try again.");
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     if (!confirm("Are you sure you want to delete this task?")) return;
//     try {
//       const response = await fetch(
//         `http://192.168.1.158:5000/api/tasks/${taskId}`,
//         {
//           method: "DELETE",
//         }
//       );
//       if (response.ok) {
//         setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
//       } else {
//         setError("Failed to delete task. Please try again.");
//       }
//     } catch (err) {
//       console.error("Error deleting task:", err);
//       setError("Failed to delete task. Please try again.");
//     }
//   };

//   const ActionInputs = ({
//     actions,
//     setActions,
//     title,
//   }: {
//     actions: Action[];
//     setActions: React.Dispatch<React.SetStateAction<Action[]>>;
//     title: string;
//   }) => (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <Label className="text-base font-medium">{title}</Label>
//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           onClick={() => addAction(setActions)}
//         >
//           <Plus className="h-4 w-4 mr-1" />
//           Add Action
//         </Button>
//       </div>
//       {actions.map((item, index) => (
//         <div key={index} className="grid grid-cols-12 gap-2 items-end">
//           <div className="col-span-5">
//             <Label htmlFor={`${title}-action-${index}`}>Action</Label>
//             <Textarea
//               id={`${title}-action-${index}`}
//               value={item.action}
//               onChange={(e) =>
//                 updateAction(index, "action", e.target.value, setActions)
//               }
//               placeholder="Describe the action"
//               className="min-h-[60px]"
//             />
//           </div>
//           <div className="col-span-3">
//   <Label htmlFor={`${title}-responsible-${index}`}>
//     Responsible Person
//   </Label>
//   <Select
//     value={item.responsible}
//     onValueChange={(value) =>
//       updateAction(index, "responsible", value, setActions)
//     }
//   >
//     <SelectTrigger>
//       <SelectValue placeholder="Select employee" />
//     </SelectTrigger>
//     <SelectContent>
//       {employees.map((emp) => (
//         <SelectItem key={emp.employeeId} value={emp.employeeId}>
//           {emp.name}
//         </SelectItem>
//       ))}
//     </SelectContent>
//   </Select>
// </div>

//           <div className="col-span-3">
//             <Label htmlFor={`${title}-dueDate-${index}`}>Due Date</Label>
//             <Input
//               id={`${title}-dueDate-${index}`}
//               type="date"
//               value={item.dueDate}
//               onChange={(e) =>
//                 updateAction(index, "dueDate", e.target.value, setActions)
//               }
//             />
//           </div>
//           <div className="col-span-1">
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={() => removeAction(index, setActions)}
//               disabled={actions.length === 1}
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const taskStats = {
//     total: tasks.length,
//     pending: tasks.filter((task) => task.status === "pending").length,
//     inProgress: tasks.filter((task) => task.status === "in-progress").length,
//     completed: tasks.filter((task) => task.status === "completed").length,
//     highPriority: tasks.filter((task) => task.priority === "high").length,
//   };

//   if (error) {
//     return (
//       <div className="text-center p-4 text-red-600">
//         {error}
//         <Button
//           onClick={() => {
//             setError(null);
//             setIsLoading(true);
//             fetch("http://192.168.1.158:5000/api/tasks")
//               .then((res) => res.json())
//               .then((data) => {
//                 setTasks(Array.isArray(data) ? data : []);
//                 setIsLoading(false);
//               })
//               .catch(() => {
//                 setError("Failed to load tasks. Please try again.");
//                 setIsLoading(false);
//               });
//           }}
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
//                     onChange={(e) =>
//                       handleCreateInputChange("title", e.target.value)
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Task Type</Label>
//                   <Select
//                     value={createForm.taskType}
//                     onValueChange={(value) =>
//                       handleCreateInputChange("taskType", value)
//                     }
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
//                     onValueChange={(value) =>
//                       handleCreateInputChange("priority", value)
//                     }
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
//                   <div>
//                     <Label>Assigned To</Label>
//                     <Select
//                       value={createForm.assignedTo}
//                       onValueChange={(value) =>
//                         handleCreateInputChange("assignedTo", value)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Employee" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {employees.map((emp) => (
//                           <SelectItem
//                             key={emp.employeeId}
//                             value={emp.employeeId}
//                           >
//                             {emp.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Due Date</Label>
//                   <Input
//                     type="date"
//                     value={createForm.dueDate}
//                     onChange={(e) =>
//                       handleCreateInputChange("dueDate", e.target.value)
//                     }
//                   />
//                 </div>
//               </div>
//               {createForm.taskType === "downtime" ||
//               createForm.taskType === "pdi" ? (
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Production Code</Label>
//                     <Select
//                       value={createForm.productionCode}
//                       onValueChange={(value) =>
//                         handleCreateInputChange("productionCode", value)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select production code" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {productionCodes.map((code) => (
//                           <SelectItem key={code} value={code}>
//                             {code}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Quantity (if applicable)</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter quantity"
//                       value={createForm.quantity}
//                       onChange={(e) =>
//                         handleCreateInputChange("quantity", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div className="space-y-2 col-span-2">
//                     <Label>Rejection Reason</Label>
//                     <Textarea
//                       placeholder="Describe the rejection reason"
//                       value={createForm.rejectionReason}
//                       onChange={(e) =>
//                         handleCreateInputChange(
//                           "rejectionReason",
//                           e.target.value
//                         )
//                       }
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
//                       onValueChange={(value) =>
//                         handleCreateInputChange("maintenanceType", value)
//                       }
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
//                       onChange={(e) =>
//                         handleCreateInputChange("equipment", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//               ) : null}
//               <div className="space-y-2">
//                 <Label>Description</Label>
//                 <Textarea
//                   placeholder="Detailed task description"
//                   value={createForm.description}
//                   onChange={(e) =>
//                     handleCreateInputChange("description", e.target.value)
//                   }
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
//                 <p className="text-2xl font-bold text-blue-600">
//                   {taskStats.total}
//                 </p>
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
//                 <p className="text-2xl font-bold text-orange-600">
//                   {taskStats.pending}
//                 </p>
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
//                 <p className="text-2xl font-bold text-blue-600">
//                   {taskStats.inProgress}
//                 </p>
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
//                 <p className="text-2xl font-bold text-green-600">
//                   {taskStats.completed}
//                 </p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   High Priority
//                 </p>
//                 <p className="text-2xl font-bold text-red-600">
//                   {taskStats.highPriority}
//                 </p>
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
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">
//                   No tasks found
//                 </h3>
//                 <p className="text-gray-500">
//                   Try adjusting your search or filters
//                 </p>
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
//                           <h3 className="font-semibold text-xl">
//                             {task.title}
//                           </h3>
//                           <Badge variant="outline" className="text-blue-600">
//                             {task.taskId}
//                           </Badge>
//                           <Badge variant="secondary">
//                             {task.taskType.toUpperCase()}
//                           </Badge>
//                         </div>
//                         <p className="text-gray-600 text-sm mb-3">
//                           {task.description}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-end gap-2">
//                       <Badge className={getStatusColor(task.status)}>
//                         {task.status.charAt(0).toUpperCase() +
//                           task.status.slice(1).replace("-", " ")}
//                       </Badge>
//                       <Badge className={getPriorityColor(task.priority)}>
//                         {task.priority.charAt(0).toUpperCase() +
//                           task.priority.slice(1)}{" "}
//                         Priority
//                       </Badge>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6 mb-4">
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-900">
//                         Task Details
//                       </h4>
//                       <div className="text-sm space-y-1">
//                         <div className="flex items-center space-x-2">
//                           <User className="h-4 w-4 text-gray-400" />
//                           <span className="text-gray-600">Assigned to:</span>
//                           <span className="font-medium">{getEmployeeName(task.assignedTo)}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Calendar className="h-4 w-4 text-gray-400" />
//                           <span className="text-gray-600">Due Date:</span>
//                           <span className="font-medium">
//                             {/* {task.dueDate} */}
//                             {new Date(task.dueDate).toLocaleDateString()}
//                           </span>
//                         </div>
//                         {task.productionCode && (
//                           <div className="flex items-center space-x-2">
//                             <Settings className="h-4 w-4 text-gray-400" />
//                             <span className="text-gray-600">
//                               Production Code:
//                             </span>
//                             <span className="font-medium">
//                               {task.productionCode}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-900">
//                         Source Information
//                       </h4>
//                       <div className="text-sm space-y-1">
//                         <div className="flex items-center space-x-2">
//                           <span className="text-gray-600">Created from:</span>
//                           <Badge variant="outline" className="text-xs">
//                             {task.createdFrom.charAt(0).toUpperCase() +
//                               task.createdFrom.slice(1)}
//                           </Badge>
//                         </div>
//                         {task.rejectionReason && (
//                           <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
//                             <strong>Rejection Reason:</strong>{" "}
//                             {task.rejectionReason}
//                           </div>
//                         )}
//                         {task.maintenanceType && (
//                           <div className="text-xs text-gray-600">
//                             <strong>Maintenance Type:</strong>{" "}
//                             {task.maintenanceType}
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
//                       onValueChange={(value) =>
//                         handleUpdateInputChange("status", value)
//                       }
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
//                       onChange={(e) =>
//                         handleUpdateInputChange("progress", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Status Comments</Label>
//                   <Textarea
//                     placeholder="Add comments about current status or progress made"
//                     value={updateForm.statusComments}
//                     onChange={(e) =>
//                       handleUpdateInputChange("statusComments", e.target.value)
//                     }
//                     rows={3}
//                   />
//                 </div>
//               </TabsContent>

//               <TabsContent value="corrective">
//                 <ActionInputs
//                   actions={correctiveActions}
//                   setActions={setCorrectiveActions}
//                   title="Corrective Actions"
//                 />
//               </TabsContent>

//               <TabsContent value="preventive">
//                 <ActionInputs
//                   actions={preventiveActions}
//                   setActions={setPreventiveActions}
//                   title="Preventive Actions"
//                 />
//               </TabsContent>

//               <TabsContent value="analysis" className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Root Cause Analysis</Label>
//                   <Textarea
//                     placeholder="Describe the root cause of the issue"
//                     value={updateForm.rootCause}
//                     onChange={(e) =>
//                       handleUpdateInputChange("rootCause", e.target.value)
//                     }
//                     rows={4}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Impact Assessment</Label>
//                     <Select
//                       value={updateForm.impactAssessment}
//                       onValueChange={(value) =>
//                         handleUpdateInputChange("impactAssessment", value)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select impact level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low Impact</SelectItem>
//                         <SelectItem value="medium">Medium Impact</SelectItem>
//                         <SelectItem value="high">High Impact</SelectItem>
//                         <SelectItem value="critical">
//                           Critical Impact
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Recurrence Risk</Label>
//                     <Select
//                       value={updateForm.recurrenceRisk}
//                       onValueChange={(value) =>
//                         handleUpdateInputChange("recurrenceRisk", value)
//                       }
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
//                     onChange={(e) =>
//                       handleUpdateInputChange("lessonsLearned", e.target.value)
//                     }
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


import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const TaskManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [productionCodes, setProductionCodes] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
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

const [productionRecords, setProductionRecords] = useState<any[]>([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("http://192.168.1.158:5000/api/production");
      const data = await res.json();
      console.log("Fetched Production Records:", data);

      // ✅ set records correctly
      setProductionRecords(Array.isArray(data.records) ? data.records : []);
    } catch (err) {
      console.error("Error fetching production records:", err);
    }
  };
  fetchData();
}, []);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tasksRes, teamsRes, employeesRes] = await Promise.all([
          fetch("http://192.168.1.158:5000/api/tasks"),
          fetch("http://192.168.1.158:5000/api/teams"),
          fetch("http://192.168.1.158:5000/api/employees"),
        ]);

        const [tasksJson, teamsJson, employeesJson] = await Promise.all([
          tasksRes.json(),
          teamsRes.json(),
          employeesRes.json(),
        ]);

        setEmployees(employeesJson);

        const enrichedTasks = tasksJson.map((task: any) => {
          const emp = employeesJson.find((e: any) => e.employeeId === task.assignedTo);
          return { ...task, assignedToName: emp ? emp.name : task.assignedTo };
        });

        setTasks(Array.isArray(enrichedTasks) ? enrichedTasks : []);
        setTeams(Array.isArray(teamsJson) ? teamsJson : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load tasks. Please try again.");
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.productionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === "all" || task.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" || task.taskType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });
}, [tasks, searchTerm, statusFilter, priorityFilter, typeFilter]);


  const getEmployeeName = useCallback((id: string) => {
    return employees.find((emp) => emp.employeeId === id)?.name || id;
  }, [employees]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "downtime":
        return <AlertTriangle className="h-4 w-4" />;
      case "pdi":
        return <CheckCircle className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "quality":
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateInputChange = useCallback(
    (field: keyof typeof createForm, value: string) => {
      setCreateForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleUpdateInputChange = useCallback(
    (field: keyof typeof updateForm, value: string) => {
      setUpdateForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCreateTask = async () => {
    if (
      !createForm.title ||
      !createForm.taskType ||
      !createForm.priority ||
      !createForm.assignedTo ||
      !createForm.dueDate ||
      !createForm.description
    ) {
      setError("Title, type, priority, assigned to, due date, and description are required.");
      return;
    }
    try {
      console.log("Creating task with data:", createForm);
      
      const response = await fetch("http://192.168.1.158:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const tasksRes = await fetch("http://192.168.1.158:5000/api/tasks").then((res) => res.json());
        setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create task. Please try again.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task. Please try again.");
    }
  };

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
      (task.correctiveActions ?? [{ id: generateUUID, action: "", responsible: "", dueDate: "" }]).map(
        (action) => ({ ...action, id: action.id ?? generateUUID })
      )
    );
    setPreventiveActions(
      (task.preventiveActions ?? [{ id: generateUUID, action: "", responsible: "", dueDate: "" }]).map(
        (action) => ({ ...action, id: action.id ?? generateUUID })
      )
    );
  }, []);

  const handleSaveUpdate = async () => {
    if (!selectedTask) return;
    if (!updateForm.status) {
      setError("Status is required.");
      return;
    }
    if (
      correctiveActions.some((action) => !action.action || !action.responsible || !action.dueDate)
    ) {
      setError("All corrective actions must have action, responsible person, and due date.");
      return;
    }
    if (
      preventiveActions.some((action) => !action.action || !action.responsible || !action.dueDate)
    ) {
      setError("All preventive actions must have action, responsible person, and due date.");
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.158:5000/api/tasks/${selectedTask.taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        const tasksRes = await fetch("http://192.168.1.158:5000/api/tasks").then((res) => res.json());
        setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update task. Please try again.");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`http://192.168.1.158:5000/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete task. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const ActionInputs = React.memo(
    ({
      actions,
      setActions,
      title,
      employees,
    }: {
      actions: Action[];
      setActions: React.Dispatch<React.SetStateAction<Action[]>>;
      title: string;
      employees: any[];
    }) => {
      // Local state for each action's textarea value
      const [localActionValues, setLocalActionValues] = useState<{ [key: string]: string }>(
        Object.fromEntries(actions.map((action) => [action.id, action.action]))
      );

      // Sync local state when actions change
      useEffect(() => {
        setLocalActionValues(
          Object.fromEntries(actions.map((action) => [action.id, action.action]))
        );
      }, [actions]);

      const addAction = useCallback(() => {
        const newId = generateUUID();
        setActions((prev) => [
          ...prev,
          { id: newId, action: "", responsible: "", dueDate: "" },
        ]);
        setLocalActionValues((prev) => ({ ...prev, [newId]: "" }));
      }, [setActions]);

      const removeAction = useCallback(
        (id: string) => {
          setActions((prev) => prev.filter((action) => action.id !== id));
          setLocalActionValues((prev) => {
            const newValues = { ...prev };
            delete newValues[id];
            return newValues;
          });
        },
        [setActions]
      );

      const updateAction = useCallback(
        (id: string, field: keyof Action, value: string) => {
          setActions((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
          );
        },
        [setActions]
      );

      const debouncedUpdateAction = useCallback(
        debounce(
          (id: string, field: keyof Action, value: string) => {
            updateAction(id, field, value);
          },
          300
        ),
        [updateAction]
      );

      const handleActionChange = useCallback((id: string, value: string) => {
        setLocalActionValues((prev) => ({ ...prev, [id]: value }));
      }, []);

      const handleActionBlur = useCallback(
        (id: string) => {
          updateAction(id, "action", localActionValues[id] || "");
        },
        [localActionValues, updateAction]
      );

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">{title}</Label>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              <Plus className="h-4 w-4 mr-1" />
              Add Action
            </Button>
          </div>
          {actions.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label htmlFor={`${title}-action-${item.id}`}>Action</Label>
                <Textarea
                  id={`${title}-action-${item.id}`}
                  value={localActionValues[item.id] || ""}
                  onChange={(e) => handleActionChange(item.id, e.target.value)}
                  onBlur={() => handleActionBlur(item.id)}
                  placeholder="Describe the action"
                  className="min-h-[60px]"
                  aria-label={`${title} action ${item.id}`}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor={`${title}-responsible-${item.id}`}>
                  Responsible Person
                </Label>
                <Select
                  value={item.responsible}
                  onValueChange={(value) => debouncedUpdateAction(item.id, "responsible", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
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
              <div className="col-span-3">
                <Label htmlFor={`${title}-dueDate-${item.id}`}>Due Date</Label>
                <Input
                  id={`${title}-dueDate-${item.id}`}
                  type="date"
                  value={item.dueDate}
                  onChange={(e) => debouncedUpdateAction(item.id, "dueDate", e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(item.id)}
                  disabled={actions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  );

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
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetch("http://192.168.1.158:5000/api/tasks")
              .then((res) => res.json())
              .then((data) => {
                setTasks(Array.isArray(data) ? data : []);
                setIsLoading(false);
              })
              .catch(() => {
                setError("Failed to load tasks. Please try again.");
                setIsLoading(false);
              });
          }}
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
                    onChange={(e) =>
                      handleCreateInputChange("title", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={createForm.taskType}
                    onValueChange={(value) =>
                      handleCreateInputChange("taskType", value)
                    }
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
                    onValueChange={(value) =>
                      handleCreateInputChange("priority", value)
                    }
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
                    onValueChange={(value) =>
                      handleCreateInputChange("assignedTo", value)
                    }
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
                    onChange={(e) =>
                      handleCreateInputChange("dueDate", e.target.value)
                    }
                  />
                </div>
              </div>
              {createForm.taskType === "downtime" ||
              createForm.taskType === "pdi" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Production Code</Label>
                    <Select
                      value={createForm.productionCode}
                      onValueChange={(value) => {
                        handleCreateInputChange("productionCode", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select production code" />
                      </SelectTrigger>
                      <SelectContent>
                        {productionRecords
                          .filter((prod) => prod.productionCode?.trim()) // removes null, undefined, or empty strings
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
                      onChange={(e) =>
                        handleCreateInputChange("quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Rejection Reason</Label>
                    <Textarea
                      placeholder="Describe the rejection reason"
                      value={createForm.rejectionReason}
                      onChange={(e) =>
                        handleCreateInputChange(
                          "rejectionReason",
                          e.target.value
                        )
                      }
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
                      onValueChange={(value) =>
                        handleCreateInputChange("maintenanceType", value)
                      }
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
                      onChange={(e) =>
                        handleCreateInputChange("equipment", e.target.value)
                      }
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Detailed task description"
                  value={createForm.description}
                  onChange={(e) =>
                    handleCreateInputChange("description", e.target.value)
                  }
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
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
                          <h3 className="font-semibold text-xl">
                            {task.title}
                          </h3>
                          {/* <Badge variant="outline" className="text-blue-600">
                            {task.taskId}
                          </Badge> */}
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
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        Task Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium">
                            {getEmployeeName(task.assignedTo)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
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
                      onValueChange={(value) =>
                        handleUpdateInputChange("status", value)
                      }
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
                      onChange={(e) =>
                        handleUpdateInputChange("progress", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status Comments</Label>
                  <Textarea
                    placeholder="Add comments about current status or progress made"
                    value={updateForm.statusComments}
                    onChange={(e) =>
                      handleUpdateInputChange("statusComments", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="corrective">
                <ActionInputs
                  actions={correctiveActions}
                  setActions={setCorrectiveActions}
                  title="Corrective Actions"
                  employees={employees}
                />
              </TabsContent>

              <TabsContent value="preventive">
                <ActionInputs
                  actions={preventiveActions}
                  setActions={setPreventiveActions}
                  title="Preventive Actions"
                  employees={employees}
                />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-2">
                  <Label>Root Cause Analysis</Label>
                  <Textarea
                    placeholder="Describe the root cause of the issue"
                    value={updateForm.rootCause}
                    onChange={(e) =>
                      handleUpdateInputChange("rootCause", e.target.value)
                    }
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Impact Assessment</Label>
                    <Select
                      value={updateForm.impactAssessment}
                      onValueChange={(value) =>
                        handleUpdateInputChange("impactAssessment", value)
                      }
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label>Recurrence Risk</Label>
                    <Select
                      value={updateForm.recurrenceRisk}
                      onValueChange={(value) =>
                        handleUpdateInputChange("recurrenceRisk", value)
                      }
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
                    onChange={(e) =>
                      handleUpdateInputChange("lessonsLearned", e.target.value)
                    }
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
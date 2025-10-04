import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  AlertTriangle,
  CheckCircle,
  Wrench,
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
import { useAuth } from "@/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTaskContext } from "@/TaskContext";

interface PreventiveRecord {
  Id: string;
  EquipmentType: string;
  DueDate: string | null;
  Description: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt?: string;
  CompletedAt?: string;
}

const PreventiveMaintenance: React.FC = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { refreshTaskCount } = useTaskContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [preventiveRecords, setPreventiveRecords] = useState<PreventiveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  const [isAddingPreventive, setIsAddingPreventive] = useState(false);
  const [isUpdatingPreventive, setIsUpdatingPreventive] = useState(false);
  const [selectedPreventive, setSelectedPreventive] = useState<PreventiveRecord | null>(null);
  const [selectedPreventiveForDeletion, setSelectedPreventiveForDeletion] = useState<PreventiveRecord | null>(null);

  const [preventiveForm, setPreventiveForm] = useState({
    equipmentType: "",
    dueDate: "",
    description: "",
  });
  const [preventiveUpdateForm, setPreventiveUpdateForm] = useState({
    equipmentType: "",
    dueDate: "",
    description: "",
    status: "",
  });
  const [preventiveFormErrors, setPreventiveFormErrors] = useState<Partial<typeof preventiveForm>>({});
  const [preventiveUpdateFormErrors, setPreventiveUpdateFormErrors] = useState<Partial<typeof preventiveUpdateForm>>({});

  const API_URL = import.meta.env.VITE_API_BASE_URL || (() => {
    throw new Error("API base URL is not defined.");
  })();

  // Memoize static data
  const statusColors = useMemo(
    () => ({
      Pending: "bg-orange-100 text-orange-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800",
    }),
    []
  );

  // Validation for preventiveForm
  const validatePreventiveForm = useCallback(() => {
    const errors: Partial<typeof preventiveForm> = {};
    if (!preventiveForm.equipmentType) errors.equipmentType = "Equipment type is required";
    if (preventiveForm.dueDate && new Date(preventiveForm.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      errors.dueDate = "Due date cannot be in the past.";
    }
    setPreventiveFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [preventiveForm]);

  // Validation for preventiveUpdateForm
  const validatePreventiveUpdateForm = useCallback(() => {
    const errors: Partial<typeof preventiveUpdateForm> = {};
    if (!preventiveUpdateForm.equipmentType) errors.equipmentType = "Equipment type is required";
    if (preventiveUpdateForm.dueDate && new Date(preventiveUpdateForm.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      errors.dueDate = "Due date cannot be in the past.";
    }
    if (!preventiveUpdateForm.status) errors.status = "Status is required";
    setPreventiveUpdateFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [preventiveUpdateForm]);

  // Real-time validation on blur
  const handlePreventiveInputBlur = useCallback((field: keyof typeof preventiveForm) => {
    validatePreventiveForm();
  }, [validatePreventiveForm]);

  const handlePreventiveUpdateInputBlur = useCallback((field: keyof typeof preventiveUpdateForm) => {
    validatePreventiveUpdateForm();
  }, [validatePreventiveUpdateForm]);

  // Debounced search
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Fetch with retry mechanism
  const fetchWithRetry = useCallback(async (url: string, options: RequestInit, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        console.log("fetch with retry response", response);
        
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON, received ${contentType}: ${text.slice(0, 100)}...`);
        }
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json().catch(() => {
          throw new Error("Failed to parse JSON response");
        });
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("Max retries reached");
  }, []);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const preventiveRecords = await fetchWithRetry(`${API_URL}/api/preventive-maintenance`, { headers });
      setPreventiveRecords(preventiveRecords);
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
  }, [token, toast, fetchWithRetry]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getStatusColor = useCallback((status: string) => {
    return statusColors[status.toLowerCase()] || statusColors.default;
  }, [statusColors]);

  const formatStatus = useCallback((status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const handlePreventiveInputChange = useCallback((field: keyof typeof preventiveForm, value: string) => {
    setPreventiveForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePreventiveUpdateInputChange = useCallback((field: keyof typeof preventiveUpdateForm, value: string) => {
    setPreventiveUpdateForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreatePreventiveTask = useCallback(async () => {
    if (!validatePreventiveForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the preventive maintenance form.",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log("Sending request to:", `${API_URL}/api/preventive-maintenance`);

      const response = await fetchWithRetry(`${API_URL}/api/preventive-maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          EquipmentType: preventiveForm.equipmentType,
          DueDate: preventiveForm.dueDate || null,
          Description: preventiveForm.description || "",
        }),
      });

      setIsAddingPreventive(false);
      setPreventiveForm({
        equipmentType: "",
        dueDate: "",
        description: "",
      });
      setPreventiveFormErrors({});
      setError(null);
      toast({
        title: "Success",
        description: "Preventive maintenance record created successfully.",
      });
      refreshTaskCount();
      await fetchInitialData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create preventive maintenance record.";
      console.error("Request failed:", errorMessage);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsCreating(false);
    }
  }, [preventiveForm, token, toast, validatePreventiveForm, refreshTaskCount, fetchInitialData, fetchWithRetry]);

  const handleUpdatePreventive = useCallback((rec: PreventiveRecord) => {
    setSelectedPreventive(rec);
    setIsUpdatingPreventive(true);
    setPreventiveUpdateForm({
      equipmentType: rec.EquipmentType,
      dueDate: rec.DueDate ? format(new Date(rec.DueDate), "yyyy-MM-dd") : "",
      description: rec.Description,
      status: rec.Status,
    });
  }, []);

  const handleSavePreventiveUpdate = useCallback(async () => {
    if (!selectedPreventive) return;

    if (!validatePreventiveUpdateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetchWithRetry(`${API_URL}/api/preventive-maintenance/${selectedPreventive.Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          EquipmentType: preventiveUpdateForm.equipmentType,
          DueDate: preventiveUpdateForm.dueDate || null,
          Description: preventiveUpdateForm.description || "",
          Status: preventiveUpdateForm.status,
          CompletedAt: preventiveUpdateForm.status === "completed" ? new Date().toISOString() : null,
        }),
      });

      setIsUpdatingPreventive(false);
      setSelectedPreventive(null);
      setPreventiveUpdateFormErrors({});
      setError(null);
      toast({
        title: "Success",
        description: "Preventive maintenance record updated successfully.",
      });
      await fetchInitialData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update preventive maintenance record.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedPreventive, preventiveUpdateForm, token, toast, fetchInitialData, validatePreventiveUpdateForm, fetchWithRetry]);

  const handleDeletePreventive = useCallback((rec: PreventiveRecord) => {
    setSelectedPreventiveForDeletion(rec);
  }, []);

  const confirmDeletePreventive = useCallback(async () => {
    if (!selectedPreventiveForDeletion) return;

    setIsDeleting(true);
    try {
      await fetchWithRetry(`${API_URL}/api/preventive-maintenance/${selectedPreventiveForDeletion.Id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPreventiveRecords((prev) => prev.filter((rec) => rec.Id !== selectedPreventiveForDeletion.Id));
      setSelectedPreventiveForDeletion(null);
      setError(null);
      toast({
        title: "Success",
        description: "Preventive maintenance record deleted successfully.",
      });
      refreshTaskCount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete preventive maintenance record.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPreventiveForDeletion, token, toast, refreshTaskCount, fetchWithRetry]);

  const filteredRecords = useMemo(() => {
    let records = preventiveRecords;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      records = records.filter((rec) =>
        rec.EquipmentType.toLowerCase().includes(lowerSearch) ||
        rec.Description.toLowerCase().includes(lowerSearch)
      );
    }
    if (statusFilter !== "all") {
      records = records.filter((rec) => rec.Status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (typeFilter !== "all") {
      records = records.filter((rec) => rec.EquipmentType.toLowerCase() === typeFilter.toLowerCase());
    }
    return records;
  }, [preventiveRecords, searchTerm, statusFilter, typeFilter]);

  const currentRecords = useMemo(() => {
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    return filteredRecords.slice(indexOfFirstTask, indexOfLastTask);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / tasksPerPage);

  const pmStats = useMemo(() => {
    const stats = {
      total: filteredRecords.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    filteredRecords.forEach((task) => {
      const status = task.Status?.toLowerCase();
      if (status === "Pending") stats.pending++;
      if (status === "In Progress") stats.inProgress++;
      if (status === "Completed") stats.completed++;
    });

    return stats;
  }, [filteredRecords]);

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
        <Button onClick={fetchInitialData} className="ml-4" aria-label="Retry loading data">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddingPreventive} onOpenChange={setIsAddingPreventive}>
            <DialogTrigger asChild>
              <Button disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Preventive Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Preventive Maintenance Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="text-red-600 text-sm mb-4">{error}</div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentType">Equipment Type</Label>
                    <Select
                      value={preventiveForm.equipmentType}
                      onValueChange={(value) =>
                        handlePreventiveInputChange("equipmentType", value)
                      }
                      onOpenChange={() => handlePreventiveInputBlur("equipmentType")}
                    >
                      <SelectTrigger id="equipmentType" aria-label="Select equipment type">
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mold">Mold</SelectItem>
                        <SelectItem value="machine">Machine</SelectItem>
                      </SelectContent>
                    </Select>
                    {preventiveFormErrors.equipmentType && (
                      <p className="text-red-500 text-sm">
                        {preventiveFormErrors.equipmentType}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={preventiveForm.dueDate}
                    onChange={(e) =>
                      handlePreventiveInputChange("dueDate", e.target.value)
                    }
                    onBlur={() => handlePreventiveInputBlur("dueDate")}
                    min={format(new Date(), "yyyy-MM-dd")}
                    aria-invalid={!!preventiveFormErrors.dueDate}
                    aria-describedby={
                      preventiveFormErrors.dueDate ? "dueDate-error" : undefined
                    }
                  />
                  {preventiveFormErrors.dueDate && (
                    <p id="dueDate-error" className="text-red-500 text-sm">
                      {preventiveFormErrors.dueDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the preventive maintenance task"
                    value={preventiveForm.description}
                    onChange={(e) =>
                      handlePreventiveInputChange("description", e.target.value)
                    }
                    onBlur={() => handlePreventiveInputBlur("description")}
                    rows={3}
                    aria-invalid={!!preventiveFormErrors.description}
                    aria-describedby={
                      preventiveFormErrors.description ? "description-error" : undefined
                    }
                  />
                  {preventiveFormErrors.description && (
                    <p id="description-error" className="text-red-500 text-sm">
                      {preventiveFormErrors.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingPreventive(false);
                    setPreventiveFormErrors({});
                    setError(null);
                  }}
                  aria-label="Cancel preventive maintenance creation"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePreventiveTask}
                  aria-label="Create preventive maintenance record"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Preventive Maintenance"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Preventive Maintenance</p>
                <p className="text-2xl font-bold text-blue-600">{pmStats.total}</p>
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
                <p className="text-2xl font-bold text-orange-600">{pmStats.pending}</p>
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
                <p className="text-2xl font-bold text-blue-600">{pmStats.inProgress}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{pmStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeFilter">Equipment Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="typeFilter" aria-label="Filter by equipment type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mold">Mold</SelectItem>
                  <SelectItem value="machine">Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Preventive Maintenance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentRecords.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No preventive maintenance records found</h3>
              </div>
            ) : (
              currentRecords.map((rec) => (
                <div
                  key={rec.Id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1"><Wrench className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl">{rec.EquipmentType.charAt(0).toUpperCase() + rec.EquipmentType.slice(1)} Maintenance</h3>
                          <Badge variant="secondary">PREVENTIVE</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">Description: {rec.Description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(rec.Status)}>
                        {formatStatus(rec.Status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Details</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">{rec.DueDate ? format(new Date(rec.DueDate), "yyyy-MM-dd") : "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Status Information</h4>
                      <div className="text-sm space-y-1">
                        {rec.CompletedAt && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Completed At:</span>
                            <span className="font-medium">{format(new Date(rec.CompletedAt), "yyyy-MM-dd HH:mm")}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Created At:</span>
                          <span className="font-medium">{format(new Date(rec.CreatedAt), "yyyy-MM-dd HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePreventive(rec)}
                      className="bg-blue-600 hover:bg-blue-700"
                      aria-label={`Update preventive maintenance record for ${rec.EquipmentType} with ID ${rec.Id}`}
                      disabled={isUpdating}
                    >
                      Update Record
                    </Button>
                    {user?.employeeGroup?.toLowerCase() === "admin" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePreventive(rec)}
                        aria-label={`Delete preventive maintenance record for ${rec.EquipmentType} with ID ${rec.Id}`}
                        disabled={isDeleting}
                      >
                        Delete Record
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredRecords.length > tasksPerPage && (
            <div className="flex justify-between items-center mt-4">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              <span aria-live="polite">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUpdatingPreventive} onOpenChange={setIsUpdatingPreventive}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Preventive Maintenance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="text-red-600 text-sm mb-4">{error}</div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentType">Equipment Type</Label>
                <Select
                  value={preventiveUpdateForm.equipmentType}
                  onValueChange={(value) =>
                    handlePreventiveUpdateInputChange("equipmentType", value)
                  }
                  onOpenChange={() => handlePreventiveUpdateInputBlur("equipmentType")}
                >
                  <SelectTrigger id="equipmentType" aria-label="Select equipment type">
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mold">Mold</SelectItem>
                    <SelectItem value="machine">Machine</SelectItem>
                  </SelectContent>
                </Select>
                {preventiveUpdateFormErrors.equipmentType && (
                  <p className="text-red-500 text-sm">
                    {preventiveUpdateFormErrors.equipmentType}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={preventiveUpdateForm.dueDate}
                onChange={(e) =>
                  handlePreventiveUpdateInputChange("dueDate", e.target.value)
                }
                onBlur={() => handlePreventiveUpdateInputBlur("dueDate")}
                min={format(new Date(), "yyyy-MM-dd")}
                aria-invalid={!!preventiveUpdateFormErrors.dueDate}
                aria-describedby={
                  preventiveUpdateFormErrors.dueDate ? "dueDate-error" : undefined
                }
              />
              {preventiveUpdateFormErrors.dueDate && (
                <p id="dueDate-error" className="text-red-500 text-sm">
                  {preventiveUpdateFormErrors.dueDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the preventive maintenance task"
                value={preventiveUpdateForm.description}
                onChange={(e) =>
                  handlePreventiveUpdateInputChange("description", e.target.value)
                }
                onBlur={() => handlePreventiveUpdateInputBlur("description")}
                rows={3}
                aria-invalid={!!preventiveUpdateFormErrors.description}
                aria-describedby={
                  preventiveUpdateFormErrors.description ? "description-error" : undefined
                }
              />
              {preventiveUpdateFormErrors.description && (
                <p id="description-error" className="text-red-500 text-sm">
                  {preventiveUpdateFormErrors.description}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={preventiveUpdateForm.status}
                onValueChange={(value) =>
                  handlePreventiveUpdateInputChange("status", value)
                }
                onOpenChange={() => handlePreventiveUpdateInputBlur("status")}
              >
                <SelectTrigger id="status" aria-label="Select status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {preventiveUpdateFormErrors.status && (
                <p className="text-red-500 text-sm">
                  {preventiveUpdateFormErrors.status}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdatingPreventive(false);
                setPreventiveUpdateFormErrors({});
                setError(null);
              }}
              aria-label="Cancel preventive maintenance update"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreventiveUpdate}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Update preventive maintenance record"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Preventive Maintenance"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPreventiveForDeletion} onOpenChange={() => setSelectedPreventiveForDeletion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this preventive maintenance record?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPreventiveForDeletion(null)}
              disabled={isDeleting}
              aria-label="Cancel deletion"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePreventive}
              disabled={isDeleting}
              aria-label="Confirm deletion"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreventiveMaintenance;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Error Boundary Component (unchanged)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    toast.error(`An error occurred: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600">
            Something went wrong
          </h3>
          <p className="text-gray-500 mt-2">{this.state.errorMessage}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MOM {
  MOMId: string;
  Title: string;
  MeetingDate: string;
  Department: string;
  Status: string;
  Attendees: string;
  Summary: string | null;
  Decisions: string | null;
  ActionItems: ActionItem[];
}

interface ActionItem {
  actionId: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}

const API_URL = 'http://192.168.1.82:5000';

const MOMManagement: React.FC = () => {
  const { token } = useAuth();
  const [isCreatingMOM, setIsCreatingMOM] = useState(false);
  const [momList, setMomList] = useState<MOM[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [attendees, setAttendees] = useState("");
  const [summary, setSummary] = useState("");
  const [decisions, setDecisions] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { actionId: uuidv4(), description: "", assignedTo: "", dueDate: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMOM, setEditingMOM] = useState<MOM | null>(null);

  // Memoized date parsing
  const parseDate = useCallback((dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateStr}`);
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (err) {
      console.warn(`Error parsing date ${dateStr}:`, err);
      return "";
    }
  }, []);

  // Memoized UUID validation
  const isValidUUID = useCallback((str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }, []);

  // Validate MOM data
  const isValidMOM = useCallback((data: any): data is MOM => {
    return (
      data &&
      typeof data.MOMId === "string" &&
      typeof data.Title === "string" &&
      typeof data.MeetingDate === "string" &&
      typeof data.Department === "string" &&
      typeof data.Status === "string" &&
      typeof data.Attendees === "string" &&
      (data.Summary === null || typeof data.Summary === "string") &&
      (data.Decisions === null || typeof data.Decisions === "string") &&
      Array.isArray(data.ActionItems) &&
      data.ActionItems.every(
        (item: any) =>
          typeof item.actionId === "string" &&
          typeof item.description === "string" &&
          typeof item.assignedTo === "string" &&
          typeof item.dueDate === "string"
      )
    );
  }, []);

  // Fetch MOM list from backend
  const fetchMoms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/mom`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch MOMs (Status: ${res.status})`);
      }
      const data: any[] = await res.json();
      const validData = data.filter(isValidMOM);
      if (validData.length !== data.length) {
        console.warn("Some MOM data was invalid and filtered out:", data);
      }
      setMomList(validData);
    } catch (err: any) {
      console.error("Error fetching MOMs:", err);
      toast.error(`Failed to load meeting records: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, isValidMOM]);

  // Debounced fetchMoms to prevent excessive API calls
  const debouncedFetchMoms = useCallback(
    debounce(fetchMoms, 300),
    [fetchMoms]
  );

  useEffect(() => {
    debouncedFetchMoms();
    return () => debouncedFetchMoms.cancel();
  }, [debouncedFetchMoms]);

  // Memoized action item handlers
  const addActionItem = useCallback(() => {
    setActionItems((prev) => [
      ...prev,
      { actionId: uuidv4(), description: "", assignedTo: "", dueDate: "" },
    ]);
  }, []);

  const removeActionItem = useCallback((index: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateActionItem = useCallback(
    (index: number, field: keyof ActionItem, value: string) => {
      setActionItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleEdit = useCallback((mom: MOM) => {
    setEditingMOM(mom);
    setIsCreatingMOM(true);
    setMeetingTitle(mom.Title);
    setMeetingDate(parseDate(mom.MeetingDate));
    setDepartment(mom.Department);
    setStatus(mom.Status);
    setAttendees(mom.Attendees);
    setSummary(mom.Summary || "");
    setDecisions(mom.Decisions || "");
    setActionItems(
      mom.ActionItems.length > 0
        ? mom.ActionItems.map((ai) => ({
            actionId: ai.actionId || uuidv4(),
            description: ai.description,
            assignedTo: ai.assignedTo,
            dueDate: parseDate(ai.dueDate),
          }))
        : [{ actionId: uuidv4(), description: "", assignedTo: "", dueDate: "" }]
    );
  }, [parseDate]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this MOM?")) return;

    if (!isValidUUID(id)) {
      toast.error("Invalid MOM ID format");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/mom/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete MOM (Status: ${res.status})`);
      }

      toast.success("MOM deleted successfully");
      debouncedFetchMoms();
    } catch (err: any) {
      console.error("Error deleting MOM:", {
        message: err.message,
        stack: err.stack,
      });
      toast.error(`Failed to delete MOM: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isValidUUID, token, debouncedFetchMoms]);

  const handleSubmit = useCallback(async () => {
    if (!meetingTitle || !meetingDate || !department || !status || !attendees) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const validActionItems = actionItems.filter(
      (item) => item.description && item.assignedTo && item.dueDate
    );

    if (validActionItems.length === 0) {
      toast.error("Please add at least one valid action item.");
      return;
    }

    const momData = {
      title: meetingTitle,
      meetingDate,
      department,
      status,
      attendees,
      summary,
      decisions,
      actionItems: validActionItems.map(({ actionId, ...rest }) => rest),
    };

    setIsLoading(true);
    try {
      let res;
      if (editingMOM) {
        if (!isValidUUID(editingMOM.MOMId)) {
          throw new Error("Invalid MOM ID format");
        }
        res = await fetch(`${API_URL}/api/mom/${editingMOM.MOMId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(momData),
        });
      } else {
        res = await fetch(`${API_URL}/api/mom`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(momData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `${editingMOM ? "Update" : "Creation"} failed (Status: ${res.status})`);
      }

      toast.success(editingMOM ? "MOM updated successfully" : "MOM created successfully");
      setIsCreatingMOM(false);
      setEditingMOM(null);
      resetForm();
      debouncedFetchMoms();
    } catch (err: any) {
      console.error("Error submitting MOM:", err);
      toast.error(`Failed to ${editingMOM ? "update" : "create"} MOM: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    meetingTitle,
    meetingDate,
    department,
    status,
    attendees,
    summary,
    decisions,
    actionItems,
    editingMOM,
    isValidUUID,
    token,
    debouncedFetchMoms,
  ]);

  const resetForm = useCallback(() => {
    setMeetingTitle("");
    setMeetingDate("");
    setDepartment("");
    setStatus("");
    setAttendees("");
    setSummary("");
    setDecisions("");
    setActionItems([{ actionId: uuidv4(), description: "", assignedTo: "", dueDate: "" }]);
    setEditingMOM(null);
  }, []);

  const handleCancel = useCallback(() => {
    setIsCreatingMOM(false);
    resetForm();
  }, [resetForm]);

  // Memoized render for action items to prevent unnecessary re-renders
  const renderActionItems = useMemo(() => {
    return actionItems.map((item, index) => (
      <div
        key={item.actionId}
        className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-4 border rounded-lg bg-gray-50"
      >
        <div className="md:col-span-5">
          <Label htmlFor={`action-${item.actionId}`}>Action Description *</Label>
          <Textarea
            id={`action-${item.actionId}`}
            value={item.description}
            onChange={(e) => updateActionItem(index, "description", e.target.value)}
            placeholder="Describe the action item"
            rows={2}
            required
            aria-required="true"
          />
        </div>
        <div className="md:col-span-3">
          <Label htmlFor={`assigned-${item.actionId}`}>Assigned To *</Label>
          <Input
            id={`assigned-${item.actionId}`}
            value={item.assignedTo}
            onChange={(e) => updateActionItem(index, "assignedTo", e.target.value)}
            placeholder="Person/Team"
            required
            aria-required="true"
          />
        </div>
        <div className="md:col-span-3">
          <Label htmlFor={`due-${item.actionId}`}>Due Date *</Label>
          <Input
            id={`due-${item.actionId}`}
            type="date"
            value={item.dueDate}
            onChange={(e) => updateActionItem(index, "dueDate", e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="md:col-span-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeActionItem(index)}
            disabled={actionItems.length === 1 || isLoading}
            aria-label="Remove action item"
          >
            ×
          </Button>
        </div>
      </div>
    ));
  }, [actionItems, isLoading, updateActionItem, removeActionItem]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Minutes of Meeting (MOM)
          </h2>
          <Dialog open={isCreatingMOM} onOpenChange={setIsCreatingMOM}>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Create MOM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMOM ? "Edit MOM" : "Create New Minutes of Meeting"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details for the meeting minutes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title">Meeting Title *</Label>
                    <Input
                      id="meeting-title"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="Enter meeting title"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Date *</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select onValueChange={setDepartment} value={department}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select onValueChange={setStatus} value={status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Attendees (comma separated) *</Label>
                  <Input
                    id="attendees"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="John Doe, Jane Smith, Mike Johnson"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Meeting Summary</Label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Enter meeting summary and key points discussed"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decisions">Key Decisions (one per line)</Label>
                  <Textarea
                    id="decisions"
                    value={decisions}
                    onChange={(e) => setDecisions(e.target.value)}
                    placeholder="Enter key decisions made during the meeting"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">
                      Action Items *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addActionItem}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Action Item
                    </Button>
                  </div>

                  <div className="space-y-3">{renderActionItems}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading
                    ? editingMOM
                      ? "Updating..."
                      : "Creating..."
                    : editingMOM
                    ? "Update MOM"
                    : "Create MOM"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Meeting Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-500 mt-2">Loading meeting records...</p>
              </div>
            ) : momList.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Create Meeting Minutes
                </h3>
                <p className="text-gray-500 mb-4">
                  Use the "Create MOM" button above to document your meetings,
                  decisions, and action items.
                </p>
                <p className="text-sm text-gray-400">
                  All meeting data will be stored and action items can be tracked
                  through the task management system.
                </p>
              </div>
            ) : (
              <div className="relative border-l border-gray-300 dark:border-gray-700 ml-4">
                {momList.map((mom) => (
                  <div key={mom.MOMId} className="mb-8 ml-6">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border border-white"></div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {mom.Title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {parseDate(mom.MeetingDate) || "Invalid Date"}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                          <span className="font-medium">Department:</span>{" "}
                          {mom.Department}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {mom.Status}
                        </p>
                        <p>
                          <span className="font-medium">Attendees:</span>{" "}
                          {mom.Attendees}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(mom)}
                          aria-label={`Edit ${mom.Title}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(mom.MOMId)}
                          aria-label={`Delete ${mom.Title}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  return debounced as T & { cancel: () => void };
}

export default React.memo(MOMManagement);
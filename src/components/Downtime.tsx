import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { format, parseISO } from "date-fns";
import { generateUUID } from "@/utils/utils";
import { useAuth } from "@/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTaskContext } from "@/TaskContext";

// Lazy-load UI components to reduce initial bundle size
const Card = lazy(() => import("@/components/ui/card").then((module) => ({ default: module.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then((module) => ({ default: module.CardContent })));
const CardHeader = lazy(() => import("@/components/ui/card").then((module) => ({ default: module.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then((module) => ({ default: module.CardTitle })));
const Button = lazy(() => import("@/components/ui/button").then((module) => ({ default: module.Button })));
const Input = lazy(() => import("@/components/ui/input").then((module) => ({ default: module.Input })));
const Label = lazy(() => import("@/components/ui/label").then((module) => ({ default: module.Label })));
const Badge = lazy(() => import("@/components/ui/badge").then((module) => ({ default: module.Badge })));
const Dialog = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.Dialog })));
const DialogContent = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.DialogContent })));
const DialogHeader = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.DialogHeader })));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.DialogTitle })));
const DialogDescription = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.DialogDescription })));
const DialogTrigger = lazy(() => import("@/components/ui/dialog").then((module) => ({ default: module.DialogTrigger })));
const Select = lazy(() => import("@/components/ui/select").then((module) => ({ default: module.Select })));
const SelectContent = lazy(() => import("@/components/ui/select").then((module) => ({ default: module.SelectContent })));
const SelectItem = lazy(() => import("@/components/ui/select").then((module) => ({ default: module.SelectItem })));
const SelectTrigger = lazy(() => import("@/components/ui/select").then((module) => ({ default: module.SelectTrigger })));
const SelectValue = lazy(() => import("@/components/ui/select").then((module) => ({ default: module.SelectValue })));
const Textarea = lazy(() => import("@/components/ui/textarea").then((module) => ({ default: module.Textarea })));
const Plus = lazy(() => import("lucide-react").then((module) => ({ default: module.Plus })));
const CheckCircle = lazy(() => import("lucide-react").then((module) => ({ default: module.CheckCircle })));
const Link = lazy(() => import("lucide-react").then((module) => ({ default: module.Link })));
const Trash2 = lazy(() => import("lucide-react").then((module) => ({ default: module.Trash2 })));
const Clock = lazy(() => import("lucide-react").then((module) => ({ default: module.Clock })));

// Interfaces for type safety
interface Action {
  actionId: string;
  action: string;
  responsible: string;
  dueDate: string;
}

interface PdiEntry {
  pdiId: string;
  productionCode: string;
  product: string;
  date: string;
  shift: string;
  defectName: string;
  areaOfDefect: string;
  quantity: number;
  inspector: string;
  status: "Open" | "In Progress" | "Closed";
  severity: "low" | "medium" | "high";
  correctiveActions: Action[];
  preventiveActions: Action[];
}

interface Defect {
  defectId: string;
  name: string;
  defectType: string;
  status: string;
}

interface ProductionData {
  recordId: string;
  productionCode: string;
}

interface Employee {
  employeeId: string;
  name: string;
  role: string;
}

interface Product {
  productId: string;
  name: string;
}

interface PdiForm {
  productionCode: string;
  defectName: string;
  areaOfDefect: string;
  quantity: string;
  inspector: string;
  severity: string;
  date: string;
  shift: string;
  product: string;
}

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AREA_OF_DEFECT = [
  { value: "assembly", label: "Assembly" },
  { value: "molding", label: "Molding" },
  { value: "storage", label: "Storage" },
  { value: "pdi", label: "PDI" },
] as const;

// Validation utility
const isValidPdiEntry = (entry: unknown): entry is PdiEntry => {
  return (
    !!entry &&
    typeof (entry as PdiEntry).pdiId === "string" &&
    typeof (entry as PdiEntry).productionCode === "string" &&
    typeof (entry as PdiEntry).product === "string" &&
    typeof (entry as PdiEntry).date === "string" &&
    typeof (entry as PdiEntry).shift === "string" &&
    typeof (entry as PdiEntry).defectName === "string" &&
    typeof (entry as PdiEntry).areaOfDefect === "string" &&
    typeof (entry as PdiEntry).quantity === "number" &&
    typeof (entry as PdiEntry).inspector === "string" &&
    typeof (entry as PdiEntry).status === "string" &&
    typeof (entry as PdiEntry).severity === "string" &&
    Array.isArray((entry as PdiEntry).correctiveActions) &&
    Array.isArray((entry as PdiEntry).preventiveActions)
  );
};



// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({
  children,
  fallback,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = () => setHasError(true);
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return hasError ? <>{fallback}</> : <>{children}</>;
};

const Downtime: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [isAddingPDI, setIsAddingPDI] = useState(false);
  const [pdiData, setPdiData] = useState<PdiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pdiForm, setPdiForm] = useState<PdiForm>({
    productionCode: "",
    defectName: "",
    areaOfDefect: "",
    quantity: "",
    inspector: "",
    severity: "",
    date: "",
    shift: "",
    product: "",
  });
  const [pdiCorrectiveActions, setPdiCorrectiveActions] = useState<Action[]>([]);
  const [pdiPreventiveActions, setPdiPreventiveActions] = useState<Action[]>([]);
  const [editingPdiId, setEditingPdiId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterStatus, setFilterStatus] = useState<"All" | "Open" | "In Progress" | "Closed">("All");
  const [defects, setDefects] = useState<Defect[]>([]);
const { refreshTaskCount } = useTaskContext();


  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // Fetch data with AbortController for cleanup
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [pdiRes, productionRes, employeeRes, defectRes, productRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/pdi`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/production`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/employees`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/defects`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/products`, { headers, signal: controller.signal }),
        ]);

        const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
        const normalizedPdiData = Array.isArray(pdiJson)
          ? pdiJson
              .map((pdi: PdiEntry, index: number) => ({
                ...pdi,
                pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
                correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
                  ...action,
                  actionId: action.actionId || generateUUID(),
                })),
                preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
                  ...action,
                  actionId: action.actionId || generateUUID(),
                })),
              }))
              .filter((pdi, index, self) => {
                if (!pdi.pdiId) return false;
                return self.findIndex((p) => p.pdiId === pdi.pdiId) === index;
              })
          : [];
        setPdiData(normalizedPdiData);

        const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
        setProductionData(productionJson.records || []);

        const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
        setEmployees(Array.isArray(employeeJson) ? employeeJson : []);

        const defectJson = defectRes.ok ? await defectRes.json() : [];
        setDefects(Array.isArray(defectJson) ? defectJson : []);

        const productJson = productRes.ok ? await productRes.json() : [];
        setProducts(Array.isArray(productJson) ? productJson : []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(["Failed to load data. Partial data may be displayed."]);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load data.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [headers, toast]);

  const productMap = useMemo(() => {
    return Object.fromEntries(products.map((p) => [p.productId, p.name]));
  }, [products]);

  const getProductName = useCallback((id: string) => productMap[id] ?? "Unknown Product", [productMap]);

  const getEmployeeName = useCallback(
    (id: string) => employees.find((emp) => emp.employeeId === id)?.name || id,
    [employees]
  );

  const filteredPdiData = useMemo(
    () => pdiData.filter((pdi) => filterStatus === "All" || pdi.status === filterStatus),
    [pdiData, filterStatus]
  );

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      Open: "bg-red-100 text-red-800 border-red-800",
      Closed: "bg-green-100 text-green-800 border-green-800",
      "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-800";
  }, []);

  const getSeverityColor = useCallback((severity: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[severity] || "bg-gray-500";
  }, []);

  const addAction = useCallback((setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
    setter((prev) => [
      ...prev,
      {
        actionId: generateUUID(),
        action: "",
        responsible: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
      },
    ]);
  }, []);

  const removeAction = useCallback(
    (index: number, setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
      setter((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const updateAction = useCallback(
    (
      index: number,
      field: keyof Action,
      value: string,
      setter: React.Dispatch<React.SetStateAction<Action[]>>
    ) => {
      setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    },
    []
  );

  const handleInputChange = useCallback((field: keyof PdiForm, value: string) => {
    setPdiForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PdiForm, string> & {
      pdiCorrectiveActions?: { [index: number]: Partial<Action> & { general?: string } };
      pdiPreventiveActions?: { [index: number]: Partial<Action> & { general?: string } };
    }>
  >({});

  const validateForm = useCallback(() => {
    const errors: typeof formErrors = {};

    const requiredFields: (keyof PdiForm)[] = [
      "defectName",
      "areaOfDefect",
      "quantity",
      "inspector",
      "severity",
      "date",
      "shift",
      "product",
    ];
    requiredFields.forEach((field) => {
      if (!pdiForm[field]) {
        errors[field] = "This field is required.";
      }
    });

    if (pdiForm.quantity && (isNaN(parseInt(pdiForm.quantity, 10)) || parseInt(pdiForm.quantity, 10) < 0)) {
      errors.quantity = isNaN(parseInt(pdiForm.quantity, 10)) ? "Quantity must be a valid number." : "Quantity cannot be negative.";
    }

    if (pdiForm.date && new Date(pdiForm.date) > new Date()) {
      errors.date = "Date cannot be in the future.";
    }

    if (editingPdiId) {
      const validateActions = (actions: Action[], type: "pdiCorrectiveActions" | "pdiPreventiveActions") => {
        if (actions.length === 0) {
          errors[type] = { general: `At least one ${type.split("pdi")[1].toLowerCase()} action is required.` };
        } else {
          const actionErrors: { [index: number]: Partial<Action> } = {};
          actions.forEach((action, index) => {
            const err: Partial<Action> = {};
            if (!action.action) err.action = "This field is required.";
            if (!action.responsible) err.responsible = "This field is required.";
            if (!action.dueDate || new Date(action.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
              err.dueDate = !action.dueDate ? "This field is required." : "Due date cannot be in the past.";
            }
            if (Object.keys(err).length > 0) actionErrors[index] = err;
          });
          if (Object.keys(actionErrors).length > 0) errors[type] = { ...errors[type], ...actionErrors };
        }
      };

      validateActions(pdiCorrectiveActions, "pdiCorrectiveActions");
      validateActions(pdiPreventiveActions, "pdiPreventiveActions");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [pdiForm, pdiCorrectiveActions, pdiPreventiveActions, editingPdiId]);

  const handleEditActions = useCallback((pdi: PdiEntry) => {
    setEditingPdiId(pdi.pdiId);
    setPdiForm({
      productionCode: pdi.productionCode,
      defectName: pdi.defectName,
      areaOfDefect: pdi.areaOfDefect,
      quantity: pdi.quantity.toString(),
      inspector: pdi.inspector,
      severity: pdi.severity,
      date: pdi.date ? format(parseISO(pdi.date), "yyyy-MM-dd") : "",
      shift: pdi.shift,
      product: pdi.product,
    });
    setPdiCorrectiveActions(
      pdi.correctiveActions.map((action) => ({
        ...action,
        actionId: action.actionId || generateUUID(),
        dueDate: action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "",
      }))
    );
    setPdiPreventiveActions(
      pdi.preventiveActions.map((action) => ({
        ...action,
        actionId: action.actionId || generateUUID(),
        dueDate: action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "",
      }))
    );
    setIsAddingPDI(true);
  }, []);

  const resetForm = useCallback(() => {
    setPdiForm({
      productionCode: "",
      defectName: "",
      areaOfDefect: "",
      quantity: "",
      inspector: "",
      severity: "",
      date: "",
      shift: "",
      product: "",
    });
    setPdiCorrectiveActions([]);
    setPdiPreventiveActions([]);
    setEditingPdiId(null);
    setError(null);
    setFormErrors({});
  }, []);

  const handleSubmitPDI = useCallback(async () => {
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please correct the errors in the form." });
      return;
    }
    setIsSubmitting(true);
    try {
      const newEntry = {
        ...pdiForm,
        quantity: parseInt(pdiForm.quantity, 10),
        correctiveActions: editingPdiId ? pdiCorrectiveActions : [],
        preventiveActions: editingPdiId ? pdiPreventiveActions : [],
        status: editingPdiId ? pdiData.find((p) => p.pdiId === editingPdiId)?.status || "Open" : "Open",
      };
      const url = editingPdiId ? `${API_BASE_URL}/api/pdi/${editingPdiId}` : `${API_BASE_URL}/api/pdi`;
      const method = editingPdiId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session Expired. Please log in again."
            : `Failed to ${editingPdiId ? "update" : "save"} PDI entry.`
        );
      }

      const savedEntry = await response.json();
      const validatedEntry: PdiEntry = isValidPdiEntry(savedEntry)
        ? {
            ...savedEntry,
            correctiveActions: (savedEntry.correctiveActions || []).map((action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })),
            preventiveActions: (savedEntry.preventiveActions || []).map((action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })),
          }
        : {
            ...newEntry,
            pdiId: editingPdiId || generateUUID(),
            correctiveActions: newEntry.correctiveActions.map((action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })),
            preventiveActions: newEntry.preventiveActions.map((action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })),
          };

      setPdiData((prev) => {
        const newData = editingPdiId
          ? prev.map((p) => (p.pdiId === editingPdiId ? validatedEntry : p))
          : [...prev, validatedEntry];
        return newData;
      });

      toast({
        title: "Success",
        description: editingPdiId ? "PDI entry updated successfully." : "PDI entry saved successfully.",
      });
      setIsAddingPDI(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError([message]);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [pdiForm, editingPdiId, pdiCorrectiveActions, pdiPreventiveActions, pdiData, headers, toast, resetForm, validateForm]);

  const handleUpdateStatus = useCallback(
    async (pdiId: string, newStatus: PdiEntry["status"]) => {
      setIsUpdatingStatus(pdiId);
      try {
        const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status: HTTP ${response.status}`);
        }

        const responseData = await response.json();
        setPdiData((prev) =>
          prev.map((p) => (p.pdiId === pdiId ? { ...responseData, status: newStatus } : p))
        );

        toast({ title: "Success", description: `Status updated to ${newStatus}.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update status.";
        setError([message]);
        toast({ variant: "destructive", title: "Error", description: message });
      } finally {
        setIsUpdatingStatus(null);
      }
    },
    [headers, toast]
  );

  const handleDeletePDI = useCallback(
    async (pdiId: string) => {
      if (!window.confirm("Are you sure you want to delete this PDI entry?")) return;
      setIsUpdatingStatus(pdiId);
      try {
        const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? "PDI entry not found." : "Failed to delete PDI entry.");
        }

        setPdiData((prev) => prev.filter((p) => p.pdiId !== pdiId));
        toast({ title: "Success", description: "PDI entry deleted successfully." });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete PDI entry.";
        setError([message]);
        toast({ variant: "destructive", title: "Error", description: message });
      } finally {
        setIsUpdatingStatus(null);
      }
    },
    [headers, toast]
  );

  const ActionInputs: React.FC<{
    actions: Action[];
    setActions: React.Dispatch<React.SetStateAction<Action[]>>;
    title: string;
    errors?: { [index: number]: Partial<Action> };
  }> = React.memo(({ actions, setActions, title, errors }) => {
    const [localActionValues, setLocalActionValues] = useState<{ [key: string]: string }>(
      Object.fromEntries(actions.map((action) => [action.actionId, action.action]))
    );

    useEffect(() => {
      setLocalActionValues(Object.fromEntries(actions.map((action) => [action.actionId, action.action])));
    }, [actions]);

    const handleActionChange = useCallback((id: string, value: string) => {
      setLocalActionValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleActionBlur = useCallback(
      (index: number, id: string) => {
        updateAction(index, "action", localActionValues[id] || "", setActions);
      },
      [localActionValues, setActions]
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">{title}</Label>
          <Suspense fallback={<div>Loading...</div>}>
            <Button type="button" variant="outline" size="sm" onClick={() => addAction(setActions)}>
              <Plus className="h-4 w-4 mr-1" />
              Add {title.split(" ")[0]}
            </Button>
          </Suspense>
        </div>
        {actions.map((item, index) => (
          <div key={item.actionId} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <Label htmlFor={`action-${index}`}>Action</Label>
              <Suspense fallback={<div>Loading...</div>}>
                <Textarea
                  id={`action-${index}`}
                  value={localActionValues[item.actionId] || ""}
                  onChange={(e) => handleActionChange(item.actionId, e.target.value)}
                  onBlur={() => handleActionBlur(index, item.actionId)}
                  placeholder="Describe the action"
                  className={`min-h-[60px] ${errors?.[index]?.action ? "border-red-500" : ""}`}
                  aria-label={`${title} action ${index + 1}`}
                />
              </Suspense>
              {errors?.[index]?.action && <p className="text-red-600 text-sm">{errors[index].action}</p>}
            </div>
            <div className="col-span-3">
              <Label htmlFor={`responsible-${index}`}>Responsible Person</Label>
              <Suspense fallback={<div>Loading...</div>}>
                <Select
                  value={item.responsible}
                  onValueChange={(value) => updateAction(index, "responsible", value, setActions)}
                >
                  <SelectTrigger aria-label="Select responsible person">
                    <SelectValue placeholder="Select responsible person" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Suspense>
              {errors?.[index]?.responsible && <p className="text-red-600 text-sm">{errors[index].responsible}</p>}
            </div>
            <div className="col-span-3">
              <Label htmlFor={`dueDate-${index}`}>Due Date</Label>
              <Suspense fallback={<div>Loading...</div>}>
                <Input
                  id={`dueDate-${index}`}
                  type="date"
                  value={item.dueDate ? format(parseISO(item.dueDate), "yyyy-MM-dd") : ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => updateAction(index, "dueDate", e.target.value, setActions)}
                  className={errors?.[index]?.dueDate ? "border-red-500" : ""}
                  aria-label={`${title} due date ${index + 1}`}
                />
              </Suspense>
              {errors?.[index]?.dueDate && <p className="text-red-600 text-sm">{errors[index].dueDate}</p>}
            </div>
            <div className="col-span-1">
              <Suspense fallback={<div>Loading...</div>}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(index, setActions)}
                  disabled={actions.length === 1}
                  aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Suspense>
            </div>
          </div>
        ))}
        {actions.length === 0 && <p className="text-sm text-gray-500">No actions added yet.</p>}
      </div>
    );
  });

  const PdiItem: React.FC<{ pdi: PdiEntry }> = React.memo(({ pdi }) => (
    <Suspense fallback={<div>Loading PDI Item...</div>}>
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
              <Link className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">{pdi.productionCode}</span>
            </div>
            <h3 className="font-semibold text-lg">{getProductName(pdi.product)}</h3>
            <Badge variant="outline">{pdi.defectName}</Badge>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(pdi.severity)}`}></div>
              <span className="text-sm font-medium">{pdi.severity}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={pdi.status}
              onValueChange={(value: PdiEntry["status"]) => handleUpdateStatus(pdi.pdiId, value)}
              disabled={isUpdatingStatus === pdi.pdiId}
            >
              <SelectTrigger className={getStatusColor(pdi.status)} aria-label={`Status for PDI entry ${pdi.pdiId}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeletePDI(pdi.pdiId)}
              disabled={isUpdatingStatus === pdi.pdiId}
              aria-label={`Delete PDI entry ${pdi.pdiId}`}
            >
              {isUpdatingStatus === pdi.pdiId ? "Deleting..." : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Date & Shift</p>
            <p className="text-lg font-bold text-blue-900">
              {pdi.date && !isNaN(parseISO(pdi.date).getTime()) ? format(parseISO(pdi.date), "yyyy-MM-dd") : "Invalid Date"}
            </p>
            <p className="text-sm text-blue-600">Shift {pdi.shift}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-800">Defect Quantity</p>
            <p className="text-2xl font-bold text-red-900">{pdi.quantity}</p>
            <p className="text-sm text-red-600">Units affected</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800">Inspector</p>
            <p className="text-lg font-bold text-green-900">{getEmployeeName(pdi.inspector)}</p>
            <p className="text-sm text-green-600">Quality inspector</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-orange-800">Action Required</p>
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleEditActions(pdi)}
              aria-label={pdi.status === "Open" ? "Update actions for PDI entry" : "View details for PDI entry"}
            >
              {pdi.status === "Open" ? "Update Actions" : "View Details"}
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  ));

  if (isLoading) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Suspense>
    );
  }

  if (error && pdiData.length === 0) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="text-center p-4 text-red-600">
          {error.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
          <Button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              const fetchData = async () => {
                try {
                  const [pdiRes, productionRes, employeeRes, defectRes, productRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/pdi`, { headers }),
                    fetch(`${API_BASE_URL}/api/production`, { headers }),
                    fetch(`${API_BASE_URL}/api/employees`, { headers }),
                    fetch(`${API_BASE_URL}/api/defects`, { headers }),
                    fetch(`${API_BASE_URL}/api/products`, { headers }),
                  ]);

                  const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
                  const normalizedPdiData = Array.isArray(pdiJson)
                    ? pdiJson
                        .map((pdi: PdiEntry, index: number) => ({
                          ...pdi,
                          pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
                          correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
                            ...action,
                            actionId: action.actionId || generateUUID(),
                          })),
                          preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
                            ...action,
                            actionId: action.actionId || generateUUID(),
                          })),
                        }))
                        .filter((pdi, index, self) => {
                          if (!pdi.pdiId) return false;
                          return self.findIndex((p) => p.pdiId === pdi.pdiId) === index;
                        })
                    : [];
                  setPdiData(normalizedPdiData);

                  const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
                  setProductionData(productionJson.records || []);

                  const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
                  setEmployees(Array.isArray(employeeJson) ? employeeJson : []);

                  const defectJson = defectRes.ok ? await defectRes.json() : [];
                  setDefects(Array.isArray(defectJson) ? defectJson : []);

                  const productJson = productRes.ok ? await productRes.json() : [];
                  setProducts(Array.isArray(productJson) ? productJson : []);
                } catch (err) {
                  setError(["Failed to load data. Partial data may be displayed."]);
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load data.",
                  });
                } finally {
                  setIsLoading(false);
                }
              };
              fetchData();
            }}
            className="ml-4"
            aria-label="Retry loading PDI data"
          >
            Retry
          </Button>
        </div>
      </Suspense>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">PDI Inspection</h2>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-red-600">
                {pdiData.filter((pdi) => pdi.status === "Open").length} Open Issues
              </Badge>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {pdiData.filter((pdi) => pdi.status === "Closed").length} Resolved
              </Badge>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger aria-label="Filter by status" className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Pre-Delivery Inspection (PDI)
                </CardTitle>
                <Dialog
                  open={isAddingPDI}
                  onOpenChange={(open) => {
                    setIsAddingPDI(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700" aria-label="Add new PDI entry">
                      <Plus className="h-4 w-4 mr-2" />
                      Add PDI Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto"
                    aria-describedby="dialog-description-text"
                    onOpenAutoFocus={(e) => {
                      const firstInput = e.currentTarget.querySelector("#defectName");
                      firstInput?.focus();
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>{editingPdiId ? "Edit PDI Entry" : "Add PDI Entry"}</DialogTitle>
                      <DialogDescription id="dialog-description-text">
                        {editingPdiId ? "Update the details of the PDI entry." : "Enter the details for a new PDI entry."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {error &&
                        error.map((item, index) => (
                          <div
                            key={index}
                            role="alert"
                            className="bg-red-300 p-2 rounded-md text-red-800 text-sm mb-4"
                          >
                            {item}
                          </div>
                        ))}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="defectName">Defect Name</Label>
                          <Select
                            value={pdiForm.defectName}
                            onValueChange={(value) => handleInputChange("defectName", value)}
                          >
                            <SelectTrigger id="defectName" aria-label="Select defect name">
                              <SelectValue placeholder="Select defect" />
                            </SelectTrigger>
                            <SelectContent>
                              {defects.length > 0 ? (
                                <>
                                  {defects.map((def) => (
                                    <SelectItem key={def.defectId} value={def.name}>
                                      {def.name}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="other">Other</SelectItem>
                                </>
                              ) : (
                                <div className="text-center py-2">Loading defects...</div>
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.defectName && <p className="text-red-500 text-sm">{formErrors.defectName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="areaOfDefect">Area of Defect</Label>
                          <Select
                            value={pdiForm.areaOfDefect}
                            onValueChange={(value) => handleInputChange("areaOfDefect", value)}
                          >
                            <SelectTrigger id="areaOfDefect" aria-label="Select area of defect">
                              <SelectValue placeholder="Select area of defect" />
                            </SelectTrigger>
                            <SelectContent>
                              {AREA_OF_DEFECT.map((prod) => (
                                <SelectItem key={prod.value} value={prod.value}>
                                  {prod.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.areaOfDefect && <p className="text-red-500 text-sm">{formErrors.areaOfDefect}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={pdiForm.quantity}
                            onChange={(e) => handleInputChange("quantity", e.target.value)}
                            placeholder="Enter quantity"
                            aria-label="Defect quantity"
                          />
                          {formErrors.quantity && <p className="text-red-500 text-sm">{formErrors.quantity}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inspector">Inspector Name</Label>
                          <Select
                            value={pdiForm.inspector}
                            onValueChange={(value) => handleInputChange("inspector", value)}
                          >
                            <SelectTrigger aria-label="Select inspector">
                              <SelectValue placeholder="Select inspector" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.length > 0 ? (
                                employees.map((emp) => (
                                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                                    {emp.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1 text-sm text-gray-500">
                                  No Employees found.
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.inspector && <p className="text-red-500 text-sm">{formErrors.inspector}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="severity">Severity</Label>
                          <Select
                            value={pdiForm.severity}
                            onValueChange={(value) => handleInputChange("severity", value)}
                          >
                            <SelectTrigger aria-label="Select severity">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.severity && <p className="text-red-500 text-sm">{formErrors.severity}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={pdiForm.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            aria-label="Inspection date"
                          />
                          {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shift">Shift</Label>
                          <Select
                            value={pdiForm.shift}
                            onValueChange={(value) => handleInputChange("shift", value)}
                          >
                            <SelectTrigger aria-label="Select shift">
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Shift A</SelectItem>
                              <SelectItem value="B">Shift B</SelectItem>
                              <SelectItem value="C">Shift C</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.shift && <p className="text-red-500 text-sm">{formErrors.shift}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Product Name</Label>
                          <Select
                            value={pdiForm.product}
                            onValueChange={(value) => handleInputChange("product", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.length > 0 ? (
                                products.map((prod) => (
                                  <SelectItem key={prod.productId} value={prod.productId}>
                                    {prod.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="text-center py-2 text-gray-500">
                                  No products found.
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.product && <p className="text-red-500 text-sm">{formErrors.product}</p>}
                        </div>
                      </div>
                      {editingPdiId && (
                        <>
                          {formErrors.pdiCorrectiveActions?.general && (
                            <p className="text-red-500 text-sm">{formErrors.pdiCorrectiveActions.general}</p>
                          )}
                          <ActionInputs
                            actions={pdiCorrectiveActions}
                            setActions={setPdiCorrectiveActions}
                            title="Corrective Actions"
                            errors={formErrors.pdiCorrectiveActions}
                          />
                          {formErrors.pdiPreventiveActions?.general && (
                            <p className="text-red-500 text-sm">{formErrors.pdiPreventiveActions.general}</p>
                          )}
                          <ActionInputs
                            actions={pdiPreventiveActions}
                            setActions={setPdiPreventiveActions}
                            title="Preventive Actions"
                            errors={formErrors.pdiPreventiveActions}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPDI(false);
                          resetForm();
                        }}
                        aria-label="Cancel PDI entry"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitPDI}
                        disabled={isSubmitting}
                        aria-label={editingPdiId ? "Update PDI entry" : "Save PDI entry"}
                      >
                        {isSubmitting ? "Saving..." : editingPdiId ? "Update PDI Entry" : "Save PDI Entry"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredPdiData.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No PDI entries found.</h3>
                    <p className="text-gray-500 italic">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredPdiData.map((pdi) => <PdiItem key={pdi.pdiId} pdi={pdi} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Downtime;
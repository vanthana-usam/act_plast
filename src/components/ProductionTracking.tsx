import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
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
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Factory,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/AuthContext";
import { generateUUID } from "@/utils/utils";
import { generateProductionCode } from "@/utils/productionCodeGenerator";
import { useTaskContext } from "@/TaskContext";

const ActionInputs = lazy(() => import("./ActionInputs"));

interface Action {
  id: string;
  action: string;
  responsible: string;
}

interface ProductionRecord {
  recordId: string;
  productionCode: string;
  productionType: string;
  date: string;
  shift: string;
  machineName: string;
  product: string;
  plannedQty: number;
  actualQty: number;
  rejectedQty: number;
  lumpsQty: number;
  lumpsReason: string | null;
  rejectionTypes: {
    type: string;
    quantity: number;
    reason: string;
    entryId?: string;
    assignedToTeam: string;
    correctiveActions?: Action[];
  }[];
  downtime: number;
  downtimeType: string | null;
  defectType: string | null;
  targetOutput: number;
  plannedMins: number;
  operator: string;
  supervisor: string;
  status: string;
  efficiency: number;
  team: string | null;
  customDefectType?: string;
  customDowntimeType?: string;
  downtimeCorrectiveActions?: Action[];
}

interface RejectionEntry {
  type: string;
  quantity: string;
  reason: string;
  customType?: string;
  assignedToTeam: string;
  correctiveActions?: Action[]; // Made optional for type safety
}

interface ProductionFormData {
  productionType: string;
  date: string;
  shift: string;
  machineId: string;
  productId: string;
  plannedQty: string;
  actualQty: string;
  targetOutput: string;
  plannedMins: string;
  rejectionEntries: RejectionEntry[];
  defectType: string;
  customDefectType: string;
  downtimeType: string;
  customDowntimeType: string;
  downtime: string;
  lumpsQty: string;
  lumpsReason: string;
  operator: string;
  supervisor: string;
  status: string;
  efficiency: string | number;
  team: string;
}

interface Employee {
  employeeId: string;
  name: string;
  role?: string;
  employeeGroup?: string;
}

interface Machine {
  machineId: string;
  machineName: string;
}

interface Product {
  productId: string;
  name: string;
  machineId?: string;
  cycleTime?: number;
  cavities?: number;
}

interface Defect {
  defectId: string;
  name: string;
  defectType: string;
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const downtimeTypes = [
  { value: "machine-breakdown", label: "Machine Breakdown" },
  { value: "material-shortage", label: "Material Shortage" },
  { value: "quality-issue", label: "Quality Issue" },
  { value: "changeover", label: "Changeover" },
  { value: "maintenance", label: "Planned Maintenance" },
  { value: "power-failure", label: "Power Failure" },
  { value: "mold-issue", label: "Mold Issue" },
  { value: "temperature-issue", label: "Temperature Issue" },
  { value: "pressure-issue", label: "Pressure Issue" },
  { value: "cycle-time-deviation", label: "Cycle Time Deviation" },
  { value: "other", label: "Other" },
];

const rejectionTypes = ["Startup", "In_Progress", "Re_Startup"];

const ProductionTracking: React.FC = React.memo(() => {
  const { token, logout } = useAuth();
  console.log(token);
  
  const { refreshTaskCount } = useTaskContext();
  const { toast } = useToast();

  // State declarations
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterMachine, setFilterMachine] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterDefect, setFilterDefect] = useState("all");
  const [filterPhenomenon, setFilterPhenomenon] = useState("all");
  const [filterRejectionType, setFilterRejectionType] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProductionType, setFilterProductionType] = useState("all");
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState({
    employees: false,
    machines: false,
    products: false,
    defects: false,
    production: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRecords, setDeletingRecords] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<keyof ProductionFormData, string> & {
        rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
        correctiveActions?: { [index: number]: Partial<Action> };
        downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
      }
    >
  >({});
  const [resetFiltersAfterSubmit] = useState(true);
  const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "" },
  ]);
  const [downtimeCorrectiveActions, setDowntimeCorrectiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "" },
  ]);

  useEffect(()=>{
  refreshTaskCount();
},[])

  // Memoized initial form state
  const formInitialState = useMemo(
    () => ({
      productionType: "",
      date: new Date().toISOString().split("T")[0],
      shift: "",
      machineId: "",
      productId: "",
      plannedQty: "",
      actualQty: "",
      targetOutput: "",
      plannedMins: "",
      rejectionEntries: [
        {
          type: "",
          quantity: "",
          reason: "",
          customType: "",
          assignedToTeam: "",
          correctiveActions: [],
        },
      ],
      defectType: "",
      customDefectType: "",
      downtimeType: "",
      customDowntimeType: "",
      downtime: "",
      lumpsQty: "",
      lumpsReason: "",
      operator: "",
      supervisor: "",
      status: "completed",
      efficiency: "",
      team: "",
    }),
    []
  );

  const [formData, setFormData] = useState<ProductionFormData>(formInitialState);

  // Memoized utility functions
  const getEmployeeName = useMemo(
    () =>
      (id: string): string => {
        const match = employees.find((e) => e.employeeId === id || e.name === id);
        return match?.name ?? "Unknown";
      },
    [employees]
  );

  const getMachineName = useMemo(
    () =>
      (id: string): string => {
        return machines.find((m) => m.machineId === id)?.machineName ?? "Unknown";
      },
    [machines]
  );

  const getProductName = useMemo(
    () =>
      (id: string): string => {
        return products.find((p) => p.productId === id)?.name ?? "Unknown";
      },
    [products]
  );

  // Memoized unique departments (employeeGroups)
  const uniqueDepartments = useMemo(
    () => Array.from(new Set(employees.map((emp) => emp.employeeGroup || ""))).filter(Boolean),
    [employees]
  );

  // Memoized unique defects
  const uniqueDefects = useMemo(
    () => Array.from(new Set(defects.map((def) => def.name))),
    [defects]
  );

  // Memoized filtered defects for form
  const filteredDefects = useMemo(() => {
    if (!formData.productionType) return [];
    const targetType = formData.productionType.toLowerCase();
    return Array.from(
      new Map(
        defects
          .filter((def) => def.defectType.toLowerCase() === targetType)
          .map((def) => [def.name, def])
      ).values()
    );
  }, [defects, formData.productionType]);

  // Memoized filtered production data (client-side filtering)
  const filteredProduction = useMemo(() => {
    let filtered = productionData;

    const lowerName = filterName.toLowerCase();
    if (lowerName) {
      filtered = filtered.filter((record) =>
        record.productionCode.toLowerCase().includes(lowerName) ||
        record.product.toLowerCase().includes(lowerName) ||
        record.machineName.toLowerCase().includes(lowerName) ||
        getEmployeeName(record.operator).toLowerCase().includes(lowerName) ||
        getEmployeeName(record.supervisor).toLowerCase().includes(lowerName)
      );
    }

    if (filterDate) {
      filtered = filtered.filter((record) => record.date === filterDate);
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter((record) => record.team === filterDepartment);
    }

    if (filterMachine !== "all") {
      const machineName = getMachineName(filterMachine);
      filtered = filtered.filter((record) => record.machineName === machineName);
    }

    if (filterProduct !== "all") {
      const productName = getProductName(filterProduct);
      filtered = filtered.filter((record) => record.product === productName);
    }

    if (filterDefect !== "all") {
      filtered = filtered.filter((record) =>
        record.defectType === filterDefect || record.customDefectType === filterDefect
      );
    }

    if (filterPhenomenon !== "all") {
      filtered = filtered.filter((record) =>
        record.downtimeType === filterPhenomenon || record.customDowntimeType === filterPhenomenon
      );
    }

    if (filterRejectionType !== "all") {
      filtered = filtered.filter((record) =>
        record.rejectionTypes.some((entry) => entry.type === filterRejectionType)
      );
    }

    if (filterShift !== "all") {
      filtered = filtered.filter((record) => record.shift === filterShift);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    if (filterProductionType !== "all") {
      filtered = filtered.filter((record) => record.productionType === filterProductionType);
    }

    return filtered;
  }, [
    productionData,
    filterName,
    filterDate,
    filterDepartment,
    filterMachine,
    filterProduct,
    filterDefect,
    filterPhenomenon,
    filterRejectionType,
    filterShift,
    filterStatus,
    filterProductionType,
    getEmployeeName,
    getMachineName,
    getProductName,
  ]);

  // Memoized stats based on filtered production
  const stats = useMemo(
    () => ({
      totalJobs: filteredProduction.length,
      completed: filteredProduction.filter((item) => item.status === "completed").length,
      totalPlanned: filteredProduction.reduce((acc, item) => acc + item.plannedQty, 0),
      totalActual: filteredProduction.reduce((acc, item) => acc + item.actualQty, 0),
      totalRejected: filteredProduction.reduce((acc, item) => acc + (item.rejectedQty || 0), 0),
      avgEfficiency: filteredProduction.length
        ? Math.round(
            filteredProduction.reduce((acc, item) => acc + item.efficiency, 0) /
              filteredProduction.length
          )
        : 0,
    }),
    [filteredProduction]
  );

  // Calculate target output
  const calculateTargetOutput = useCallback(() => {
    if (!formData.productId || !formData.plannedMins) return "";
    const product = products.find((p) => p.productId === formData.productId);
    if (!product?.cycleTime || !product.cavities) return "";
    const plannedMins = Number(formData.plannedMins);
    if (isNaN(plannedMins) || plannedMins <= 0) return "";
    return Math.floor((plannedMins * 60 / product.cycleTime) * product.cavities).toString();
  }, [formData.productId, formData.plannedMins, products]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetOutput: calculateTargetOutput(),
    }));
  }, [calculateTargetOutput]);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading((prev) => ({
      ...prev,
      employees: true,
      machines: true,
      products: true,
      defects: true,
    }));
    try {
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const [employeesRes, machinesRes, productsRes, defectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/employees`, { headers }),
        fetch(`${API_BASE_URL}/api/machines`, { headers }),
        fetch(`${API_BASE_URL}/api/products`, { headers }),
        fetch(`${API_BASE_URL}/api/defects`, { headers }),
      ]);

      if ([employeesRes, machinesRes, productsRes, defectsRes].some((res) => res.status === 401)) {
        logout();
        toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
        return;
      }

      if (!employeesRes.ok || !machinesRes.ok || !productsRes.ok || !defectsRes.ok) {
        throw new Error("Failed to fetch initial data");
      }

      const [employeesData, machinesData, productsData, defectsData] = await Promise.all([
        employeesRes.json(),
        machinesRes.json(),
        productsRes.json(),
        defectsRes.json(),
      ]);

      if (
        !Array.isArray(employeesData) ||
        !Array.isArray(machinesData) ||
        !Array.isArray(productsData) ||
        !Array.isArray(defectsData)
      ) {
        throw new Error("Invalid data format");
      }

      setEmployees(employeesData);
      setMachines(machinesData);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setDefects(defectsData.map((def: Defect) => ({
        ...def,
        defectType: def.defectType.toLowerCase().replace(/\s+/g, "-"),
      })));
      toast({ title: "Data Loaded", description: "Initial data loaded successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: `Failed to fetch initial data: ${err.message}` });
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        employees: false,
        machines: false,
        products: false,
        defects: false,
      }));
    }
  }, [token, logout, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch production data (all records)
  const fetchProductionData = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, production: true }));
    try {
      // Fetch all records by omitting pagination params (assume API returns all; alternatively, set high limit)
      const query = new URLSearchParams({ limit: "10000" }).toString(); // High limit to fetch all
      const response = await fetch(`${API_BASE_URL}/api/production?${query}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout();
        toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { data: { records } } = await response.json();
      if (!Array.isArray(records)) {
        throw new Error("Invalid response format: records is not an array");
      }

      setProductionData(records);
      toast({ title: "Production Data Loaded", description: `Loaded ${records.length} records.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: `Failed to fetch production data: ${err.message}` });
      setProductionData([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, production: false }));
    }
  }, [token, logout, toast]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  // Delete production record
  const handleDeleteProduction = useCallback(
    async (recordId: string) => {
      if (!window.confirm("Are you sure you want to delete this production record?")) return;

      setDeletingRecords((prev) => [...prev, recordId]);
      const previousData = productionData;
      setProductionData((prev) => prev.filter((record) => record.recordId !== recordId));

      try {
        const response = await fetch(`${API_BASE_URL}/api/production/${recordId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
          setProductionData(previousData);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        toast({ title: "Success", description: "Production record deleted successfully." });
      } catch (err: any) {
        setProductionData(previousData);
        toast({ variant: "destructive", title: "Error", description: `Failed to delete record: ${err.message}` });
      } finally {
        setDeletingRecords((prev) => prev.filter((id) => id !== recordId));
      }
    },
    [token, logout, toast, productionData]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: keyof ProductionFormData, value: string) => {
      setFormData((prev) => {
        const newFormData = { ...prev, [field]: value };
        const newErrors = { ...formErrors };

        if (newErrors[field]) delete newErrors[field];

        if (field === "productionType") {
          newFormData.defectType = "";
          newFormData.customDefectType = "";
          delete newErrors.defectType;
          delete newErrors.customDefectType;
        } else if (field === "defectType" && value !== "other") {
          newFormData.customDefectType = "";
          delete newErrors.customDefectType;
        } else if (field === "downtimeType" && value !== "other") {
          newFormData.customDowntimeType = "";
          delete newErrors.customDowntimeType;
        } else if (field === "machineId") {
          newFormData.productId = "";
          setFilteredProducts(products.filter((prod) => prod.machineId === value || !prod.machineId));
        }

        setFormErrors(Object.keys(newErrors).length ? newErrors : {});
        return newFormData;
      });
    },
    [formErrors, products]
  );

  // Handle rejection entry changes
  const handleRejectionEntryChange = useCallback(
    (index: number, field: keyof RejectionEntry, value: any) => {
      setFormData((prev) => ({
        ...prev,
        rejectionEntries: prev.rejectionEntries.map((entry, i) =>
          i === index ? { ...entry, [field]: value } : entry
        ),
      }));
    },
    []
  );

  const addRejectionEntry = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      rejectionEntries: [
        ...prev.rejectionEntries,
        {
          type: "",
          quantity: "",
          reason: "",
          customType: "",
          assignedToTeam: "",
          correctiveActions: [],
        },
      ],
    }));
  }, []);

  const removeRejectionEntry = useCallback(
    (index: number) => {
      setFormData((prev) => {
        const newRejectionEntries = prev.rejectionEntries.filter((_, i) => i !== index);
        const newErrors = { ...formErrors };
        if (newErrors.rejectionEntries?.[index]) {
          delete newErrors.rejectionEntries[index];
          if (!Object.keys(newErrors.rejectionEntries).length) {
            delete newErrors.rejectionEntries;
          }
        }
        setFormErrors(Object.keys(newErrors).length ? newErrors : {});
        return { ...prev, rejectionEntries: newRejectionEntries };
      });
    },
    [formErrors]
  );

  // Generate production code
  const generateNewProductionCode = useCallback(() => {
    if (
      !formData.machineId ||
      !formData.date ||
      !formData.shift ||
      !formData.productionType ||
      !formData.productId
    )
      return "";
    const productionTypeForCode =
      formData.productionType === "InjectionMolding" ? "injection" : "Assembly";
    return generateProductionCode(
      getMachineName(formData.machineId),
      getProductName(formData.productId),
      formData.date,
      formData.shift,
      productionTypeForCode
    );
  }, [formData, getMachineName, getProductName]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Partial<
      Record<keyof ProductionFormData, string> & {
        rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
        correctiveActions?: { [index: number]: Partial<Action> };
        downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
      }
    > = {};

    const validateRequired = (field: keyof ProductionFormData, message: string) => {
      if (!formData[field]) errors[field] = message;
    };

    const validateNumeric = (field: keyof ProductionFormData, message: string) => {
      if (formData[field] && (isNaN(Number(formData[field])) || Number(formData[field]) < 0)) {
        errors[field] = message;
      }
    };

    // Required fields
    [
      ["productionType", "Production type is required."],
      ["date", "Date is required."],
      ["shift", "Shift is required."],
      ["machineId", "Machine is required."],
      ["productId", "Product is required."],
      ["plannedQty", "Planned quantity is required."],
      ["actualQty", "Actual quantity is required."],
      ["plannedMins", "Planned minutes is required."],
    ].forEach(([field, message]) => validateRequired(field as keyof ProductionFormData, message));

    // Numeric fields
    [
      ["plannedQty", "Must be a non-negative number."],
      ["actualQty", "Must be a non-negative number."],
      ["targetOutput", "Must be a non-negative number."],
      ["plannedMins", "Must be a non-negative number."],
      ["downtime", "Must be a non-negative number."],
      ["lumpsQty", "Must be a non-negative number."],
    ].forEach(([field, message]) => validateNumeric(field as keyof ProductionFormData, message));

    if (
      formData.actualQty &&
      formData.plannedQty &&
      Number(formData.actualQty) > Number(formData.plannedQty)
    ) {
      errors.actualQty = "Actual quantity cannot exceed planned quantity.";
    }

    if (formData.lumpsReason && !isNaN(Number(formData.lumpsReason))) {
      errors.lumpsReason = "Lumps reason cannot be numeric.";
    }

    const rejectionErrors: { [index: number]: Partial<RejectionEntry> } = {};
    const nonEmptyRejections = formData.rejectionEntries.filter(
      (entry) => entry.type || entry.quantity || entry.reason || entry.customType
    );

    nonEmptyRejections.forEach((entry, index) => {
      const entryErrors: Partial<RejectionEntry> = {};
      if (!entry.type) entryErrors.type = "Rejection type is required.";
      if (entry.type === "Other" && !entry.customType) {
        entryErrors.customType = "Custom rejection type is required.";
      }
      if (!entry.quantity) {
        entryErrors.quantity = "Quantity is required.";
      } else if (isNaN(Number(entry.quantity)) || Number(entry.quantity) < 0) {
        entryErrors.quantity = "Must be a non-negative number.";
      }
      if (!entry.reason) {
        entryErrors.reason = "Reason is required.";
      } else if (!isNaN(Number(entry.reason))) {
        entryErrors.reason = "Reason cannot be numeric.";
      }
      if (entry.correctiveActions?.length) {
        const actionErrors: { [actionIndex: number]: Partial<Action> } = {};
        entry.correctiveActions.forEach((action, actionIndex) => {
          if (action.action || action.responsible) {
            if (!action.action) actionErrors[actionIndex] = { action: "Action is required." };
            if (!action.responsible) actionErrors[actionIndex] = { ...actionErrors[actionIndex], responsible: "Responsible person is required." };
          }
        });
        if (Object.keys(actionErrors).length) {
          entryErrors.correctiveActions = actionErrors;
        }
      }
      if (Object.keys(entryErrors).length) rejectionErrors[index] = entryErrors;
    });

    if (Object.keys(rejectionErrors).length) {
      errors.rejectionEntries = rejectionErrors;
    }

    const totalRejectionQty = nonEmptyRejections.reduce(
      (sum, entry) => sum + Number(entry.quantity) || 0,
      0
    );
    if (formData.actualQty && totalRejectionQty > Number(formData.actualQty)) {
      errors.rejectionEntries = {
        ...errors.rejectionEntries,
        general: "Total rejection quantity cannot exceed actual quantity.",
      };
    }

    if (formData.defectType === "other" && !formData.customDefectType) {
      errors.customDefectType = "Custom defect type is required.";
    }

    if (formData.downtimeType === "other" && !formData.customDowntimeType) {
      errors.customDowntimeType = "Custom downtime type is required.";
    }

    const downtimeActionErrors: { [index: number]: Partial<Action> } = {};
    downtimeCorrectiveActions.forEach((action, index) => {
      if (action.action || action.responsible) {
        if (!action.action) downtimeActionErrors[index] = { action: "Action is required." };
        if (!action.responsible) downtimeActionErrors[index] = { ...downtimeActionErrors[index], responsible: "Responsible person is required." };
      }
    });

    if (Object.keys(downtimeActionErrors).length) {
      errors.downtimeCorrectiveActions = downtimeActionErrors;
    }

    setFormErrors(Object.keys(errors).length ? errors : {});
    return !Object.keys(errors).length;
  }, [formData, downtimeCorrectiveActions]);

  // Submit production record
  const handleSubmitProduction = useCallback(async () => {
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please correct form errors." });
      return;
    }

    const productionCode = generateNewProductionCode();
    if (!productionCode) {
      toast({ variant: "destructive", title: "Error", description: "Failed to generate production code." });
      return;
    }

    const recordId = generateUUID();
    const rejectionTypesFinal = formData.rejectionEntries
      .filter((entry) => entry.type || entry.quantity || entry.reason || entry.customType || entry.assignedToTeam)
      .map((entry) => ({
        entryId: generateUUID(),
        type: entry.type === "Other" ? entry.customType || "Other" : entry.type,
        quantity: Number(entry.quantity) || 0,
        reason: entry.reason || "",
        assignedToTeam: entry.assignedToTeam || "",
        correctiveActions: entry.correctiveActions?.filter((action) => action.action && action.responsible) || [],
      }));

    const defectTypeFinal = formData.defectType === "other" ? formData.customDefectType : formData.defectType;
    const downtimeTypeFinal = formData.downtimeType === "other" ? formData.customDowntimeType : formData.downtimeType;

    const efficiency =
      Number(formData.plannedQty) > 0
        ? Math.min(100, Math.round((Number(formData.actualQty) / Number(formData.plannedQty)) * 100))
        : 0;

    const newRecord: ProductionRecord = {
      recordId,
      productionCode,
      productionType: formData.productionType,
      date: formData.date,
      shift: formData.shift,
      machineName: getMachineName(formData.machineId),
      product: getProductName(formData.productId),
      plannedQty: Number(formData.plannedQty) || 0,
      actualQty: Number(formData.actualQty) || 0,
      rejectedQty: rejectionTypesFinal.reduce((sum, entry) => sum + entry.quantity, 0),
      lumpsQty: Number(formData.lumpsQty) || 0,
      lumpsReason: formData.lumpsReason || null,
      rejectionTypes: rejectionTypesFinal,
      downtime: Number(formData.downtime) || 0,
      downtimeType: downtimeTypeFinal || null,
      defectType: defectTypeFinal || null,
      targetOutput: Number(formData.targetOutput) || 0,
      plannedMins: Number(formData.plannedMins) || 0,
      operator: formData.operator,
      supervisor: formData.supervisor || "Unknown",
      status: formData.status,
      efficiency,
      team: formData.team || null,
      customDefectType: formData.defectType === "other" ? formData.customDefectType || null : null,
      customDowntimeType: formData.downtimeType === "other" ? formData.customDowntimeType || null : null,
      downtimeCorrectiveActions: downtimeCorrectiveActions.filter((action) => action.action && action.responsible),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRecord),
      });

      if (response.status === 401) {
        logout();
        toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      setIsAddingProduction(false);
      setFormData({
        ...formInitialState,
        rejectionEntries: [{ type: "", quantity: "", reason: "", customType: "", assignedToTeam: "", correctiveActions: [] }],
      });
      setFormErrors({});
      setCorrectiveActions([{ id: generateUUID(), action: "", responsible: "" }]);
      setDowntimeCorrectiveActions([{ id: generateUUID(), action: "", responsible: "" }]);

      if (resetFiltersAfterSubmit) {
        setFilterName("");
        setFilterDate("");
        setFilterDepartment("all");
        setFilterMachine("all");
        setFilterProduct("all");
        setFilterDefect("all");
        setFilterPhenomenon("all");
        setFilterRejectionType("all");
        setFilterShift("all");
        setFilterStatus("all");
        setFilterProductionType("all");
      }
      await fetchProductionData();
      refreshTaskCount();

      toast({ title: "Success", description: "Production record added successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: `Failed to submit record: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    generateNewProductionCode,
    formData,
    getMachineName,
    getProductName,
    resetFiltersAfterSubmit,
    fetchProductionData,
    toast,
    logout,
    token,
    formInitialState,
    correctiveActions,
    downtimeCorrectiveActions,
  ]);

  // Status and efficiency colors
  const getStatusColor = useCallback(
    (status: string) =>
      ({
        completed: "bg-green-100 text-green-800",
        "in-progress": "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
      }[status] || "bg-gray-100 text-gray-800"),
    []
  );

  const getEfficiencyColor = useCallback(
    (efficiency: number) => {
      if (efficiency >= 95) return "text-green-600";
      if (efficiency >= 85) return "text-yellow-600";
      return "text-red-600";
    },
    []
  );

  const getProductionTypeLabel = useCallback(
    (type: string) => (type === "InjectionMolding" ? "Injection Molding" : "Assembly"),
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilterName("");
    setFilterDate("");
    setFilterDepartment("all");
    setFilterMachine("all");
    setFilterProduct("all");
    setFilterDefect("all");
    setFilterPhenomenon("all");
    setFilterRejectionType("all");
    setFilterShift("all");
    setFilterStatus("all");
    setFilterProductionType("all");
  }, []);

  // Reusable select component for employees, machines, products
  const renderSelect = useCallback(
    ({
      id,
      value,
      onChange,
      options,
      placeholder,
      isLoading,
      error,
      label,
      ariaLabel,
    }: {
      id: string;
      value: string;
      onChange: (value: string) => void;
      options: { value: string; label: string }[];
      placeholder: string;
      isLoading?: boolean;
      error?: string;
      label: string;
      ariaLabel: string;
    }) => (
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger
            id={id}
            className={`w-full ${error ? "border-red-500" : "border-gray-300"}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-label={ariaLabel}
          >
            <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.length ? (
              options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-gray-500">No options found</div>
            )}
          </SelectContent>
        </Select>
        {error && (
          <p id={`${id}-error`} className="text-red-500 text-sm">
            {error}
          </p>
        )}
      </div>
    ),
    []
  );

  // Render loading state
  if (Object.values(isLoading).some((loading) => loading)) {
    return (
      <div className="flex justify-center items-center h-screen" role="status" aria-label="Loading initial data">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  // Main render
  return (
    <div className="mx-auto p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Production Tracking
        </h2>
        <Dialog open={isAddingProduction} onOpenChange={setIsAddingProduction}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Add new production entry"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Production Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Add Production Entry</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new production record.
                Required fields are marked.
              </DialogDescription>
            </DialogHeader>
            <Suspense
              fallback={
                <div
                  className="flex justify-center items-center py-4"
                  role="status"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />{" "}
                  Loading...
                </div>
              }
            >
              <div className="space-y-6 py-4">
                {/* Production Type */}
                {renderSelect({
                  id: "productionType",
                  value: formData.productionType,
                  onChange: (value) =>
                    handleInputChange("productionType", value),
                  options: [
                    { value: "InjectionMolding", label: "Injection Molding" },
                    { value: "Assembly", label: "Assembly" },
                  ],
                  placeholder: "Select production type",
                  error: formErrors.productionType,
                  label: "Production Type *",
                  ariaLabel: "Select production type",
                })}

                {/* Date and Shift */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="date" className="font-medium">
                      Produced Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.date ? "border-red-500" : "border-gray-300"
                      }`}
                      max={new Date().toISOString().split("T")[0]}
                      aria-invalid={!!formErrors.date}
                      aria-describedby={
                        formErrors.date ? "date-error" : undefined
                      }
                    />
                    {formErrors.date && (
                      <p id="date-error" className="text-red-500 text-sm">
                        {formErrors.date}
                      </p>
                    )}
                  </div>
                  {renderSelect({
                    id: "shift",
                    value: formData.shift,
                    onChange: (value) => handleInputChange("shift", value),
                    options: [
                      { value: "A", label: "Shift A" },
                      { value: "B", label: "Shift B" },
                      { value: "C", label: "Shift C" },
                    ],
                    placeholder: "Select shift",
                    error: formErrors.shift,
                    label: "Produced Shift *",
                    ariaLabel: "Select shift",
                  })}
                </div>

                {/* Operator and Supervisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect({
                    id: "operator",
                    value: formData.operator,
                    onChange: (value) => handleInputChange("operator", value),
                    options: employees.map((emp) => ({
                      value: emp.employeeId,
                      label: emp.name,
                    })),
                    placeholder: "Select Operator",
                    isLoading: isLoading.employees,
                    error: formErrors.operator,
                    label: "Operator *",
                    ariaLabel: "Select operator",
                  })}
                  {renderSelect({
                    id: "supervisor",
                    value: formData.supervisor,
                    onChange: (value) => handleInputChange("supervisor", value),
                    options: employees.map((emp) => ({
                      value: emp.employeeId,
                      label: emp.name,
                    })),
                    placeholder: "Select Supervisor",
                    isLoading: isLoading.employees,
                    error: formErrors.supervisor,
                    label: "Supervisor",
                    ariaLabel: "Select supervisor",
                  })}
                </div>

                {/* Machine, Product, Planned Minutes, Target Output */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderSelect({
                    id: "machineId",
                    value: formData.machineId,
                    onChange: (value) => handleInputChange("machineId", value),
                    options: machines.map((mac) => ({
                      value: mac.machineId,
                      label: mac.machineName,
                    })),
                    placeholder: "Select machine",
                    isLoading: isLoading.machines,
                    error: formErrors.machineId,
                    label: "Machine Name *",
                    ariaLabel: "Select machine",
                  })}
                  <div>
                    <Label htmlFor="productId" className="font-medium">
                      Product Name *
                    </Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) =>
                        handleInputChange("productId", value)
                      }
                      disabled={!formData.machineId || isLoading.products} // disable if no machine
                    >
                      <SelectTrigger
                        id="productId"
                        className={`w-full ${
                          formErrors.productId
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        aria-invalid={!!formErrors.productId}
                        aria-describedby={
                          formErrors.productId ? "productId-error" : undefined
                        }
                      >
                        <SelectValue
                          placeholder={
                            !formData.machineId
                              ? "Select machine first"
                              : isLoading.products
                              ? "Loading..."
                              : "Select product"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {formData.machineId ? ( // only load products after machine is selected
                          filteredProducts.length ? (
                            filteredProducts.map((prod) => (
                              <SelectItem
                                key={prod.productId}
                                value={prod.productId}
                              >
                                {prod.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-gray-500">
                              No Products found
                            </div>
                          )
                        ) : (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            Please select a machine first
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {formErrors.productId && (
                      <p id="productId-error" className="text-red-500 text-sm">
                        {formErrors.productId}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="plannedMins" className="font-medium">
                      Planned Minutes *
                    </Label>
                    <Input
                      id="plannedMins"
                      type="number"
                      placeholder="480"
                      value={formData.plannedMins}
                      onChange={(e) =>
                        handleInputChange("plannedMins", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.plannedMins
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.plannedMins}
                      aria-describedby={
                        formErrors.plannedMins ? "plannedMins-error" : undefined
                      }
                    />
                    {formErrors.plannedMins && (
                      <p
                        id="plannedMins-error"
                        className="text-red-500 text-sm"
                      >
                        {formErrors.plannedMins}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="targetOutput" className="font-medium">
                      Target Output
                    </Label>
                    <Input
                      id="targetOutput"
                      type="number"
                      placeholder="0"
                      value={formData.targetOutput}
                      readOnly
                      className="w-full bg-gray-100"
                      aria-readonly="true"
                      aria-describedby={
                        formErrors.targetOutput
                          ? "targetOutput-error"
                          : undefined
                      }
                    />
                    {formErrors.targetOutput && (
                      <p
                        id="targetOutput-error"
                        className="text-red-500 text-sm"
                      >
                        {formErrors.targetOutput}
                      </p>
                    )}
                  </div>
                </div>

                {/* Planned and Actual Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="plannedQty" className="font-medium">
                      Planned Quantity *
                    </Label>
                    <Input
                      id="plannedQty"
                      type="number"
                      placeholder="1000"
                      value={formData.plannedQty}
                      onChange={(e) =>
                        handleInputChange("plannedQty", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.plannedQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.plannedQty}
                      aria-describedby={
                        formErrors.plannedQty ? "plannedQty-error" : undefined
                      }
                    />
                    {formErrors.plannedQty && (
                      <p id="plannedQty-error" className="text-red-500 text-sm">
                        {formErrors.plannedQty}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="actualQty" className="font-medium">
                      Actual Quantity *
                    </Label>
                    <Input
                      id="actualQty"
                      type="number"
                      placeholder="950"
                      value={formData.actualQty}
                      onChange={(e) =>
                        handleInputChange("actualQty", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.actualQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.actualQty}
                      aria-describedby={
                        formErrors.actualQty ? "actualQty-error" : undefined
                      }
                    />
                    {formErrors.actualQty && (
                      <p id="actualQty-error" className="text-red-500 text-sm">
                        {formErrors.actualQty}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rejection Entries */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-medium">Rejection Entries</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRejectionEntry}
                      aria-label="Add new rejection entry"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Rejection
                    </Button>
                  </div>
                  {formErrors.rejectionEntries?.general && (
                    <p className="text-red-500 text-sm mb-2">
                      {formErrors.rejectionEntries.general}
                    </p>
                  )}
                  {formData.rejectionEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg mb-4 relative bg-gray-50"
                    >
                      {formData.rejectionEntries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeRejectionEntry(index)}
                          aria-label={`Remove rejection entry ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderSelect({
                          id: `rejectionType-${index}`,
                          value: entry.type,
                          onChange: (value) =>
                            handleRejectionEntryChange(index, "type", value),
                          options: rejectionTypes.map((type) => ({
                            value: type,
                            label: type,
                          })),
                          placeholder: "Select rejection type",
                          error: formErrors.rejectionEntries?.[index]?.type,
                          label: "Rejection Type",
                          ariaLabel: "Select rejection type",
                        })}
                        <div className="flex flex-col space-y-1.5">
                          <Label
                            htmlFor={`rejectionQuantity-${index}`}
                            className="font-medium"
                          >
                            Rejection Quantity
                          </Label>
                          <Input
                            id={`rejectionQuantity-${index}`}
                            type="number"
                            placeholder="50"
                            value={entry.quantity}
                            onChange={(e) =>
                              handleRejectionEntryChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className={`w-full ${
                              formErrors.rejectionEntries?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            aria-invalid={
                              !!formErrors.rejectionEntries?.[index]?.quantity
                            }
                            aria-describedby={
                              formErrors.rejectionEntries?.[index]?.quantity
                                ? `rejectionQuantity-error-${index}`
                                : undefined
                            }
                          />
                          {formErrors.rejectionEntries?.[index]?.quantity && (
                            <p
                              id={`rejectionQuantity-error-${index}`}
                              className="text-red-500 text-sm"
                            >
                              {formErrors.rejectionEntries[index].quantity}
                            </p>
                          )}
                        </div>
                        {renderSelect({
                          id: `assignedToTeam-${index}`,
                          value: entry.assignedToTeam,
                          onChange: (value) =>
                            handleRejectionEntryChange(
                              index,
                              "assignedToTeam",
                              value
                            ),
                          options: uniqueDepartments.map((group) => ({
                            value: group,
                            label: group,
                          })),
                          placeholder: "Select Team",
                          isLoading: isLoading.employees,
                          error:
                            formErrors.rejectionEntries?.[index]
                              ?.assignedToTeam,
                          label: "Assign to Team",
                          ariaLabel: "Select team for rejection",
                        })}
                      </div>
                      <div className="mt-4">
                        <Label
                          htmlFor={`rejectionReason-${index}`}
                          className="font-medium"
                        >
                          Rejection Reason
                        </Label>
                        <Textarea
                          id={`rejectionReason-${index}`}
                          placeholder="Describe the reason"
                          rows={3}
                          value={entry.reason}
                          onChange={(e) =>
                            handleRejectionEntryChange(
                              index,
                              "reason",
                              e.target.value
                            )
                          }
                          className={`w-full ${
                            formErrors.rejectionEntries?.[index]?.reason
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          aria-invalid={
                            !!formErrors.rejectionEntries?.[index]?.reason
                          }
                          aria-describedby={
                            formErrors.rejectionEntries?.[index]?.reason
                              ? `rejectionReason-error-${index}`
                              : undefined
                          }
                        />
                        {formErrors.rejectionEntries?.[index]?.reason && (
                          <p
                            id={`rejectionReason-error-${index}`}
                            className="text-red-500 text-sm"
                          >
                            {formErrors.rejectionEntries[index].reason}
                          </p>
                        )}
                      </div>
                      <ActionInputs
                        actions={entry.correctiveActions || []}
                        setActions={(actions: Action[]) =>
                          handleRejectionEntryChange(
                            index,
                            "correctiveActions",
                            actions
                          )
                        }
                        title="Corrective Actions for Rejection"
                        employees={employees}
                        errors={
                          formErrors.rejectionEntries?.[index]
                            ?.correctiveActions
                        }
                        showDueDate={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Defect Type */}
                {renderSelect({
                  id: "defectType",
                  value: formData.defectType,
                  onChange: (value) => handleInputChange("defectType", value),
                  options: [
                    ...filteredDefects.map((def) => ({
                      value: def.name,
                      label: def.name,
                    })),
                    { value: "other", label: "Other" },
                  ],
                  placeholder: formData.productionType
                    ? "Select Defect Type"
                    : "Select production type first",
                  isLoading: isLoading.defects,
                  error: formErrors.defectType,
                  label: "Defect Type",
                  ariaLabel: "Select defect type",
                })}
                {formData.defectType === "other" && (
                  <div className="mt-2 flex flex-col space-y-1.5">
                    <Label htmlFor="customDefectType" className="font-medium">
                      Custom Defect Type
                    </Label>
                    <Textarea
                      id="customDefectType"
                      placeholder="Specify defect type"
                      value={formData.customDefectType}
                      onChange={(e) =>
                        handleInputChange("customDefectType", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.customDefectType
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.customDefectType}
                      aria-describedby={
                        formErrors.customDefectType
                          ? "customDefectType-error"
                          : undefined
                      }
                    />
                    {formErrors.customDefectType && (
                      <p
                        id="customDefectType-error"
                        className="text-red-500 text-sm"
                      >
                        {formErrors.customDefectType}
                      </p>
                    )}
                  </div>
                )}

                {/* Downtime Reason */}
                <div className="border p-4 rounded-lg mb-4 bg-gray-50">
                  {renderSelect({
                    id: "downtimeType",
                    value: formData.downtimeType,
                    onChange: (value) =>
                      handleInputChange("downtimeType", value),
                    options: [
                      { value: "none", label: "No Issue" },
                      ...downtimeTypes,
                    ],
                    placeholder: "Select Downtime type",
                    error: formErrors.downtimeType,
                    label: "Downtime Reason",
                    ariaLabel: "Select downtime type",
                  })}
                  {formData.downtimeType === "other" && (
                    <div className="mt-5 flex flex-col space-y-1.5">
                      <Label
                        htmlFor="customDowntimeType"
                        className="font-medium"
                      >
                        Custom Downtime Type
                      </Label>
                      <Textarea
                        id="customDowntimeType"
                        placeholder="Specify downtime type"
                        value={formData.customDowntimeType}
                        onChange={(e) =>
                          handleInputChange(
                            "customDowntimeType",
                            e.target.value
                          )
                        }
                        className={`w-full ${
                          formErrors.customDowntimeType
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        aria-invalid={!!formErrors.customDowntimeType}
                        aria-describedby={
                          formErrors.customDowntimeType
                            ? "customDowntimeType-error"
                            : undefined
                        }
                      />
                      {formErrors.customDowntimeType && (
                        <p
                          id="customDowntimeType-error"
                          className="text-red-500 text-sm"
                        >
                          {formErrors.customDowntimeType}
                        </p>
                      )}
                    </div>
                  )}
                  {formData.downtimeType !== "none" &&
                    formData.downtimeType && (
                      <div>
                        <div className="grid grid-cols-2 mt-5 gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="downtime" className="font-medium">
                              Downtime (minutes)
                            </Label>
                            <Input
                              id="downtime"
                              type="number"
                              placeholder="30"
                              value={formData.downtime}
                              onChange={(e) =>
                                handleInputChange("downtime", e.target.value)
                              }
                              className={`w-full ${
                                formErrors.downtime
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              aria-invalid={!!formErrors.downtime}
                              aria-describedby={
                                formErrors.downtime
                                  ? "downtime-error"
                                  : undefined
                              }
                            />
                            {formErrors.downtime && (
                              <p
                                id="downtime-error"
                                className="text-red-500 text-sm"
                              >
                                {formErrors.downtime}
                              </p>
                            )}
                          </div>
                          {renderSelect({
                            id: "team",
                            value: formData.team,
                            onChange: (value) =>
                              handleInputChange("team", value),
                            options: uniqueDepartments.map((group) => ({
                              value: group,
                              label: group,
                            })),
                            placeholder: "Select Team",
                            isLoading: isLoading.employees,
                            error: formErrors.team,
                            label: "Assign to Team",
                            ariaLabel: "Select team for downtime",
                          })}
                        </div>
                        <ActionInputs
                          actions={downtimeCorrectiveActions}
                          setActions={setDowntimeCorrectiveActions}
                          title="Corrective Actions for Downtime"
                          employees={employees}
                          errors={formErrors.downtimeCorrectiveActions}
                          showDueDate={false}
                        />
                      </div>
                    )}
                </div>

                {/* Lumps Quantity and Reason */}
                <div className="border p-4 rounded-lg mb-4 bg-gray-50">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lumpsQty" className="font-medium">
                      Lumps Quantity
                    </Label>
                    <Input
                      id="lumpsQty"
                      type="number"
                      placeholder="5"
                      value={formData.lumpsQty}
                      onChange={(e) =>
                        handleInputChange("lumpsQty", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.lumpsQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.lumpsQty}
                      aria-describedby={
                        formErrors.lumpsQty ? "lumpsQty-error" : undefined
                      }
                    />
                    {formErrors.lumpsQty && (
                      <p id="lumpsQty-error" className="text-red-500 text-sm">
                        {formErrors.lumpsQty}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col space-y-1.5">
                    <Label htmlFor="lumpsReason" className="font-medium">
                      Lumps Reason
                    </Label>
                    <Textarea
                      id="lumpsReason"
                      placeholder="Describe lumps reason"
                      rows={3}
                      value={formData.lumpsReason}
                      onChange={(e) =>
                        handleInputChange("lumpsReason", e.target.value)
                      }
                      className={`w-full ${
                        formErrors.lumpsReason
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-invalid={!!formErrors.lumpsReason}
                      aria-describedby={
                        formErrors.lumpsReason ? "lumpsReason-error" : undefined
                      }
                    />
                    {formErrors.lumpsReason && (
                      <p
                        id="lumpsReason-error"
                        className="text-red-500 text-sm"
                      >
                        {formErrors.lumpsReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingProduction(false)}
                    aria-label="Cancel production entry"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitProduction}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label="Save production entry"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Total Jobs",
            value: stats.totalJobs,
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Planned",
            value: stats.totalPlanned.toLocaleString(),
            icon: Users,
            color: "text-purple-600",
          },
          {
            title: "Actual",
            value: stats.totalActual.toLocaleString(),
            icon: Clock,
            color: "text-indigo-600",
          },
          {
            title: "Rejected",
            value: stats.totalRejected,
            icon: XCircle,
            color: "text-red-600",
          },
          {
            title: "Avg Efficiency",
            value: `${stats.avgEfficiency}%`,
            icon: AlertTriangle,
            color: getEfficiencyColor(stats.avgEfficiency),
          },
        ].map((stat, index) => (
          <Card key={index} className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="filterName" className="font-medium">
                Name
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="filterName"
                  placeholder="Search name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-10 border-gray-300"
                  aria-label="Filter by name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filterDate" className="font-medium">
                Date
              </Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border-gray-300"
                aria-label="Filter by date"
              />
            </div>
            {renderSelect({
              id: "filterDepartment",
              value: filterDepartment,
              onChange: setFilterDepartment,
              options: [
                { value: "all", label: "All Departments" },
                ...uniqueDepartments.map((dept) => ({
                  value: dept,
                  label: dept,
                })),
              ],
              placeholder: "All Departments",
              label: "Department",
              ariaLabel: "Filter by department",
            })}
            {renderSelect({
              id: "filterMachine",
              value: filterMachine,
              onChange: setFilterMachine,
              options: [
                { value: "all", label: "All Machines" },
                ...machines.map((mac) => ({
                  value: mac.machineId,
                  label: mac.machineName,
                })),
              ],
              placeholder: "All Machines",
              label: "Machine",
              ariaLabel: "Filter by machine",
            })}
            {renderSelect({
              id: "filterProduct",
              value: filterProduct,
              onChange: setFilterProduct,
              options: [
                { value: "all", label: "All Products" },
                ...products.map((prod) => ({
                  value: prod.productId,
                  label: prod.name,
                })),
              ],
              placeholder: "All Products",
              label: "Product",
              ariaLabel: "Filter by product",
            })}
            {renderSelect({
              id: "filterDefect",
              value: filterDefect,
              onChange: setFilterDefect,
              options: [
                { value: "all", label: "All Defects" },
                ...uniqueDefects.map((def) => ({ value: def, label: def })),
              ],
              placeholder: "All Defects",
              label: "Defect Base",
              ariaLabel: "Filter by defect",
            })}
            {renderSelect({
              id: "filterPhenomenon",
              value: filterPhenomenon,
              onChange: setFilterPhenomenon,
              options: [
                { value: "all", label: "All Phenomena" },
                ...downtimeTypes.map((type) => ({
                  value: type.value,
                  label: type.label,
                })),
              ],
              placeholder: "All Phenomena",
              label: "Phenomenon Based",
              ariaLabel: "Filter by phenomenon",
            })}
            {renderSelect({
              id: "filterRejectionType",
              value: filterRejectionType,
              onChange: setFilterRejectionType,
              options: [
                { value: "all", label: "All Rejection Types" },
                ...rejectionTypes.map((type) => ({ value: type, label: type })),
              ],
              placeholder: "All Rejection Types",
              label: "Rejection Type",
              ariaLabel: "Filter by rejection type",
            })}
            {renderSelect({
              id: "filterShift",
              value: filterShift,
              onChange: setFilterShift,
              options: [
                { value: "all", label: "All Shifts" },
                { value: "A", label: "Shift A" },
                { value: "B", label: "Shift B" },
                { value: "C", label: "Shift C" },
              ],
              placeholder: "All Shifts",
              label: "Shift",
              ariaLabel: "Filter by shift",
            })}
            {renderSelect({
              id: "filterProductionType",
              value: filterProductionType,
              onChange: setFilterProductionType,
              options: [
                { value: "all", label: "All Types" },
                { value: "InjectionMolding", label: "Injection Molding" },
                { value: "Assembly", label: "Assembly" },
              ],
              placeholder: "All Types",
              label: "Production Type",
              ariaLabel: "Filter by production type",
            })}
            {renderSelect({
              id: "filterStatus",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "all", label: "All Status" },
                { value: "completed", label: "Completed" },
                { value: "in-progress", label: "In Progress" },
                { value: "pending", label: "Pending" },
              ],
              placeholder: "All Status",
              label: "Status",
              ariaLabel: "Filter by status",
            })}

            <div className="mt-4 flex justify-end ">
            <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white" onClick={handleClearFilters}>Clear Filters</Button>
          </div> 
          </div>
          
        </CardContent>
      </Card>

      {/* Production Records */}
      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Factory className="h-5 w-5 text-gray-600" />
            Production Records ({filteredProduction.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading.production ? (
            <div
              className="flex justify-center items-center py-12"
              role="status"
              aria-label="Loading production records"
            >
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Loading records...</span>
            </div>
          ) : filteredProduction.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Production Found
              </h3>
              <p className="text-gray-500 italic">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProduction.map((record) => (
                <div
                  key={record.recordId}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-900 font-bold"
                      >
                        {record.productionCode || "N/A"}
                      </Badge>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {record.product}
                      </h3>
                      <Badge variant="outline">
                        {getProductionTypeLabel(record.productionType)}
                      </Badge>
                      <Badge variant="outline">Shift {record.shift}</Badge>
                      <Badge variant="outline">{record.machineName}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </Badge>
                      <span
                        className={`text-sm font-bold ${getEfficiencyColor(
                          record.efficiency
                        )}`}
                      >
                        {record.efficiency}% Efficiency
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduction(record.recordId)}
                        disabled={deletingRecords.includes(record.recordId)}
                        aria-label={`Delete production record ${record.recordId}`}
                      >
                        {deletingRecords.includes(record.recordId) ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Planned Qty
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        {record.plannedQty.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Actual Qty
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {record.actualQty.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">
                        Target Output
                      </p>
                      <p className="text-xl font-bold text-purple-900">
                        {record.targetOutput.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Rejected Qty
                      </p>
                      <p className="text-xl font-bold text-red-900">
                        {record.rejectedQty}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">
                        Lumps Qty
                      </p>
                      <p className="text-xl font-bold text-orange-900">
                        {record.lumpsQty}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">
                        Downtime
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {record.downtime} min
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-indigo-800">
                        Planned Minutes
                      </p>
                      <p className="text-lg font-bold text-indigo-900">
                        {record.plannedMins} min
                      </p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-pink-800">
                        Rejection Types
                      </p>
                      <p className="text-sm font-bold text-pink-900">
                        {record.rejectionTypes
                          ?.map((entry) => entry.type)
                          .join(", ") || "None"}
                      </p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-cyan-800">
                        Defect Type
                      </p>
                      <p className="text-sm font-bold text-cyan-900">
                        {record.defectType || "None"}
                      </p>
                    </div>
                  </div>
                  {(record.rejectionTypes?.some((entry) => entry.reason) ||
                    record.lumpsReason) && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-2">
                            Issues Reported
                          </h4>
                          {record.rejectionTypes?.map(
                            (entry, index) =>
                              entry.reason && (
                                <div key={index} className="mb-2">
                                  <p className="text-sm font-medium text-yellow-800">
                                    Rejection ({entry.type}): {entry.quantity}{" "}
                                    units
                                  </p>
                                  <p className="text-sm text-yellow-700">
                                    {entry.reason}
                                  </p>
                                  {entry.correctiveActions?.length > 0 && (
                                    <div className="mt-1">
                                      <p className="text-sm font-medium text-yellow-800">
                                        Corrective Actions:
                                      </p>
                                      {entry.correctiveActions.map(
                                        (action, actionIndex) => (
                                          <p
                                            key={actionIndex}
                                            className="text-sm text-yellow-700"
                                          >
                                            - {action.action} (Assigned to:{" "}
                                            {getEmployeeName(
                                              action.responsible
                                            )}
                                            )
                                          </p>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                          )}
                          {record.lumpsReason && (
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Lumps Reason ({record.lumpsQty} units):
                              </p>
                              <p className="text-sm text-yellow-700">
                                {record.lumpsReason}
                              </p>
                            </div>
                          )}
                          {record.downtimeCorrectiveActions?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-yellow-800">
                                Downtime Corrective Actions:
                              </p>
                              {record.downtimeCorrectiveActions.map(
                                (action, index) => (
                                  <p
                                    key={index}
                                    className="text-sm text-yellow-700"
                                  >
                                    - {action.action} (Assigned to:{" "}
                                    {getEmployeeName(action.responsible)})
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ProductionTracking;

// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   lazy,
//   Suspense,
// } from "react";
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
//   Users,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Factory,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/components/ui/use-toast";
// import { useAuth } from "@/AuthContext";
// import { generateUUID } from "@/utils/utils";
// import { generateProductionCode } from "@/utils/productionCodeGenerator";
// import { useTaskContext } from "@/TaskContext";

// const ActionInputs = lazy(() => import("./ActionInputs"));

// interface Action {
//   id: string;
//   action: string;
//   responsible: string;
// }

// interface ProductionRecord {
//   recordId: string;
//   productionCode: string;
//   productionType: string;
//   date: string;
//   shift: string;
//   machineName: string;
//   product: string;
//   plannedQty: number;
//   actualQty: number;
//   rejectedQty: number;
//   lumpsQty: number;
//   lumpsReason: string | null;
//   rejectionTypes: {
//     type: string;
//     quantity: number;
//     reason: string;
//     entryId?: string;
//     assignedToTeam: string;
//     correctiveActions?: Action[];
//   }[];
//   downtime: number;
//   downtimeType: string | null;
//   defectType: string | null;
//   targetOutput: number;
//   plannedMins: number;
//   operator: string;
//   supervisor: string;
//   status: string;
//   efficiency: number;
//   team: string | null;
//   customDefectType?: string;
//   customDowntimeType?: string;
//   downtimeCorrectiveActions?: Action[];
// }

// interface RejectionEntry {
//   type: string;
//   quantity: string;
//   reason: string;
//   customType?: string;
//   assignedToTeam: string;
//   correctiveActions?: Action[]; // Made optional for type safety
// }

// interface ProductionFormData {
//   productionType: string;
//   date: string;
//   shift: string;
//   machineId: string;
//   productId: string;
//   plannedQty: string;
//   actualQty: string;
//   targetOutput: string;
//   plannedMins: string;
//   rejectionEntries: RejectionEntry[];
//   defectType: string;
//   customDefectType: string;
//   downtimeType: string;
//   customDowntimeType: string;
//   downtime: string;
//   lumpsQty: string;
//   lumpsReason: string;
//   operator: string;
//   supervisor: string;
//   status: string;
//   efficiency: string | number;
//   team: string;
// }

// interface Employee {
//   employeeId: string;
//   name: string;
//   role?: string;
//   employeeGroup?: string;
// }

// interface Machine {
//   machineId: string;
//   machineName: string;
// }

// interface Product {
//   productId: string;
//   name: string;
//   machineId?: string;
//   cycleTime?: number;
//   cavities?: number;
// }

// interface Defect {
//   defectId: string;
//   name: string;
//   defectType: string;
//   status: string;
// }

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// const downtimeTypes = [
//   { value: "machine-breakdown", label: "Machine Breakdown" },
//   { value: "material-shortage", label: "Material Shortage" },
//   { value: "quality-issue", label: "Quality Issue" },
//   { value: "changeover", label: "Changeover" },
//   { value: "maintenance", label: "Planned Maintenance" },
//   { value: "power-failure", label: "Power Failure" },
//   { value: "mold-issue", label: "Mold Issue" },
//   { value: "temperature-issue", label: "Temperature Issue" },
//   { value: "pressure-issue", label: "Pressure Issue" },
//   { value: "cycle-time-deviation", label: "Cycle Time Deviation" },
//   { value: "other", label: "Other" },
// ];

// const rejectionTypes = ["Startup", "In_Progress", "Re_Startup"];

// const ProductionTracking: React.FC = React.memo(() => {
//   const { token, logout } = useAuth();
//   const { refreshTaskCount } = useTaskContext();
//   const { toast } = useToast();

//   // State declarations
//   const [filterName, setFilterName] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [filterDepartment, setFilterDepartment] = useState("all");
//   const [filterMachine, setFilterMachine] = useState("all");
//   const [filterProduct, setFilterProduct] = useState("all");
//   const [filterDefect, setFilterDefect] = useState("all");
//   const [filterPhenomenon, setFilterPhenomenon] = useState("all");
//   const [filterRejectionType, setFilterRejectionType] = useState("all");
//   const [filterShift, setFilterShift] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterProductionType, setFilterProductionType] = useState("all");
//   const [isAddingProduction, setIsAddingProduction] = useState(false);
//   const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [machines, setMachines] = useState<Machine[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [defects, setDefects] = useState<Defect[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState({
//     employees: false,
//     machines: false,
//     products: false,
//     defects: false,
//     production: false,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [deletingRecords, setDeletingRecords] = useState<string[]>([]);
//   const [formErrors, setFormErrors] = useState<
//     Partial<
//       Record<keyof ProductionFormData, string> & {
//         rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
//         correctiveActions?: { [index: number]: Partial<Action> };
//         downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
//       }
//     >
//   >({});
//   const [resetFiltersAfterSubmit] = useState(true);
//   const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
//     { id: generateUUID(), action: "", responsible: "" },
//   ]);
//   const [downtimeCorrectiveActions, setDowntimeCorrectiveActions] = useState<Action[]>([
//     { id: generateUUID(), action: "", responsible: "" },
//   ]);

//   // Memoized initial form state
//   const formInitialState = useMemo(
//     () => ({
//       productionType: "",
//       date: new Date().toISOString().split("T")[0],
//       shift: "",
//       machineId: "",
//       productId: "",
//       plannedQty: "",
//       actualQty: "",
//       targetOutput: "",
//       plannedMins: "",
//       rejectionEntries: [
//         {
//           type: "",
//           quantity: "",
//           reason: "",
//           customType: "",
//           assignedToTeam: "",
//           correctiveActions: [],
//         },
//       ],
//       defectType: "",
//       customDefectType: "",
//       downtimeType: "",
//       customDowntimeType: "",
//       downtime: "",
//       lumpsQty: "",
//       lumpsReason: "",
//       operator: "",
//       supervisor: "",
//       status: "completed",
//       efficiency: "",
//       team: "",
//     }),
//     []
//   );

//   const [formData, setFormData] = useState<ProductionFormData>(formInitialState);

//   // Memoized utility functions
//   const getEmployeeName = useMemo(
//     () =>
//       (id: string): string => {
//         const match = employees.find((e) => e.employeeId === id || e.name === id);
//         return match?.name ?? "Unknown";
//       },
//     [employees]
//   );

//   const getMachineName = useMemo(
//     () =>
//       (id: string): string => {
//         return machines.find((m) => m.machineId === id)?.machineName ?? "Unknown";
//       },
//     [machines]
//   );

//   const getProductName = useMemo(
//     () =>
//       (id: string): string => {
//         return products.find((p) => p.productId === id)?.name ?? "Unknown";
//       },
//     [products]
//   );

//   // Memoized unique departments (employeeGroups)
//   const uniqueDepartments = useMemo(
//     () => Array.from(new Set(employees.map((emp) => emp.employeeGroup || ""))).filter(Boolean),
//     [employees]
//   );

//   // Memoized unique defects
//   const uniqueDefects = useMemo(
//     () => Array.from(new Set(defects.map((def) => def.name))),
//     [defects]
//   );

//   // Memoized filtered defects for form
//   const filteredDefects = useMemo(() => {
//     if (!formData.productionType) return [];
//     const targetType = formData.productionType.toLowerCase();
//     return Array.from(
//       new Map(
//         defects
//           .filter((def) => def.defectType.toLowerCase() === targetType)
//           .map((def) => [def.name, def])
//       ).values()
//     );
//   }, [defects, formData.productionType]);

//   // Memoized filtered production data (client-side filtering)
//   const filteredProduction = useMemo(() => {
//     let filtered = productionData;

//     const lowerName = filterName.toLowerCase();
//     if (lowerName) {
//       filtered = filtered.filter((record) =>
//         record.productionCode.toLowerCase().includes(lowerName) ||
//         record.product.toLowerCase().includes(lowerName) ||
//         record.machineName.toLowerCase().includes(lowerName) ||
//         getEmployeeName(record.operator).toLowerCase().includes(lowerName) ||
//         getEmployeeName(record.supervisor).toLowerCase().includes(lowerName)
//       );
//     }

//     if (filterDate) {
//       filtered = filtered.filter((record) => record.date === filterDate);
//     }

//     if (filterDepartment !== "all") {
//       filtered = filtered.filter((record) => record.team === filterDepartment);
//     }

//     if (filterMachine !== "all") {
//       const machineName = getMachineName(filterMachine);
//       filtered = filtered.filter((record) => record.machineName === machineName);
//     }

//     if (filterProduct !== "all") {
//       const productName = getProductName(filterProduct);
//       filtered = filtered.filter((record) => record.product === productName);
//     }

//     if (filterDefect !== "all") {
//       filtered = filtered.filter((record) =>
//         record.defectType === filterDefect || record.customDefectType === filterDefect
//       );
//     }

//     if (filterPhenomenon !== "all") {
//       filtered = filtered.filter((record) =>
//         record.downtimeType === filterPhenomenon || record.customDowntimeType === filterPhenomenon
//       );
//     }

//     if (filterRejectionType !== "all") {
//       filtered = filtered.filter((record) =>
//         record.rejectionTypes.some((entry) => entry.type === filterRejectionType)
//       );
//     }

//     if (filterShift !== "all") {
//       filtered = filtered.filter((record) => record.shift === filterShift);
//     }

//     if (filterStatus !== "all") {
//       filtered = filtered.filter((record) => record.status === filterStatus);
//     }

//     if (filterProductionType !== "all") {
//       filtered = filtered.filter((record) => record.productionType === filterProductionType);
//     }

//     return filtered;
//   }, [
//     productionData,
//     filterName,
//     filterDate,
//     filterDepartment,
//     filterMachine,
//     filterProduct,
//     filterDefect,
//     filterPhenomenon,
//     filterRejectionType,
//     filterShift,
//     filterStatus,
//     filterProductionType,
//     getEmployeeName,
//     getMachineName,
//     getProductName,
//   ]);

//   // Memoized stats based on filtered production
//   const stats = useMemo(
//     () => ({
//       totalJobs: filteredProduction.length,
//       completed: filteredProduction.filter((item) => item.status === "completed").length,
//       totalPlanned: filteredProduction.reduce((acc, item) => acc + item.plannedQty, 0),
//       totalActual: filteredProduction.reduce((acc, item) => acc + item.actualQty, 0),
//       totalRejected: filteredProduction.reduce((acc, item) => acc + (item.rejectedQty || 0), 0),
//       avgEfficiency: filteredProduction.length
//         ? Math.round(
//             filteredProduction.reduce((acc, item) => acc + item.efficiency, 0) /
//               filteredProduction.length
//           )
//         : 0,
//     }),
//     [filteredProduction]
//   );

//   // Calculate target output
//   const calculateTargetOutput = useCallback(() => {
//     if (!formData.productId || !formData.plannedMins) return "";
//     const product = products.find((p) => p.productId === formData.productId);
//     if (!product?.cycleTime || !product.cavities) return "";
//     const plannedMins = Number(formData.plannedMins);
//     if (isNaN(plannedMins) || plannedMins <= 0) return "";
//     return Math.floor((plannedMins * 60 / product.cycleTime) * product.cavities).toString();
//   }, [formData.productId, formData.plannedMins, products]);

//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       targetOutput: calculateTargetOutput(),
//     }));
//   }, [calculateTargetOutput]);

//   // Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading((prev) => ({
//       ...prev,
//       employees: true,
//       machines: true,
//       products: true,
//       defects: true,
//     }));
//     try {
//       const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
//       const [employeesRes, machinesRes, productsRes, defectsRes] = await Promise.all([
//         fetch(`${API_BASE_URL}/api/employees`, { headers }),
//         fetch(`${API_BASE_URL}/api/machines`, { headers }),
//         fetch(`${API_BASE_URL}/api/products`, { headers }),
//         fetch(`${API_BASE_URL}/api/defects`, { headers }),
//       ]);

//       if ([employeesRes, machinesRes, productsRes, defectsRes].some((res) => res.status === 401)) {
//         logout();
//         toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
//         return;
//       }

//       if (!employeesRes.ok || !machinesRes.ok || !productsRes.ok || !defectsRes.ok) {
//         throw new Error("Failed to fetch initial data");
//       }

//       const [employeesData, machinesData, productsData, defectsData] = await Promise.all([
//         employeesRes.json(),
//         machinesRes.json(),
//         productsRes.json(),
//         defectsRes.json(),
//       ]);

//       if (
//         !Array.isArray(employeesData) ||
//         !Array.isArray(machinesData) ||
//         !Array.isArray(productsData) ||
//         !Array.isArray(defectsData)
//       ) {
//         throw new Error("Invalid data format");
//       }

//       setEmployees(employeesData);
//       setMachines(machinesData);
//       setProducts(productsData);
//       setFilteredProducts(productsData);
//       setDefects(defectsData.map((def: Defect) => ({
//         ...def,
//         defectType: def.defectType.toLowerCase().replace(/\s+/g, "-"),
//       })));
//       toast({ title: "Data Loaded", description: "Initial data loaded successfully." });
//     } catch (err: any) {
//       toast({ variant: "destructive", title: "Error", description: `Failed to fetch initial data: ${err.message}` });
//     } finally {
//       setIsLoading((prev) => ({
//         ...prev,
//         employees: false,
//         machines: false,
//         products: false,
//         defects: false,
//       }));
//     }
//   }, [token, logout, toast]);

//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   // Fetch production data (all records)
//   const fetchProductionData = useCallback(async () => {
//     setIsLoading((prev) => ({ ...prev, production: true }));
//     try {
//       // Fetch all records by omitting pagination params (assume API returns all; alternatively, set high limit)
//       const query = new URLSearchParams({ limit: "10000" }).toString(); // High limit to fetch all
//       const response = await fetch(`${API_BASE_URL}/api/production?${query}`, {
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       });

//       if (response.status === 401) {
//         logout();
//         toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const { data: { records } } = await response.json();
//       if (!Array.isArray(records)) {
//         throw new Error("Invalid response format: records is not an array");
//       }

//       setProductionData(records);
//       toast({ title: "Production Data Loaded", description: `Loaded ${records.length} records.` });
//     } catch (err: any) {
//       toast({ variant: "destructive", title: "Error", description: `Failed to fetch production data: ${err.message}` });
//       setProductionData([]);
//     } finally {
//       setIsLoading((prev) => ({ ...prev, production: false }));
//     }
//   }, [token, logout, toast]);

//   useEffect(() => {
//     fetchProductionData();
//   }, [fetchProductionData]);

//   // Delete production record
//   const handleDeleteProduction = useCallback(
//     async (recordId: string) => {
//       if (!window.confirm("Are you sure you want to delete this production record?")) return;

//       setDeletingRecords((prev) => [...prev, recordId]);
//       const previousData = productionData;
//       setProductionData((prev) => prev.filter((record) => record.recordId !== recordId));

//       try {
//         const response = await fetch(`${API_BASE_URL}/api/production/${recordId}`, {
//           method: "DELETE",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         });

//         if (response.status === 401) {
//           logout();
//           toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
//           setProductionData(previousData);
//           return;
//         }

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         toast({ title: "Success", description: "Production record deleted successfully." });
//       } catch (err: any) {
//         setProductionData(previousData);
//         toast({ variant: "destructive", title: "Error", description: `Failed to delete record: ${err.message}` });
//       } finally {
//         setDeletingRecords((prev) => prev.filter((id) => id !== recordId));
//       }
//     },
//     [token, logout, toast, productionData]
//   );

//   // Handle form input changes
//   const handleInputChange = useCallback(
//     (field: keyof ProductionFormData, value: string) => {
//       setFormData((prev) => {
//         const newFormData = { ...prev, [field]: value };
//         const newErrors = { ...formErrors };

//         if (newErrors[field]) delete newErrors[field];

//         if (field === "productionType") {
//           newFormData.defectType = "";
//           newFormData.customDefectType = "";
//           delete newErrors.defectType;
//           delete newErrors.customDefectType;
//         } else if (field === "defectType" && value !== "other") {
//           newFormData.customDefectType = "";
//           delete newErrors.customDefectType;
//         } else if (field === "downtimeType" && value !== "other") {
//           newFormData.customDowntimeType = "";
//           delete newErrors.customDowntimeType;
//         } else if (field === "machineId") {
//           newFormData.productId = "";
//           setFilteredProducts(products.filter((prod) => prod.machineId === value || !prod.machineId));
//         }

//         setFormErrors(Object.keys(newErrors).length ? newErrors : {});
//         return newFormData;
//       });
//     },
//     [formErrors, products]
//   );

//   // Handle rejection entry changes
//   const handleRejectionEntryChange = useCallback(
//     (index: number, field: keyof RejectionEntry, value: any) => {
//       setFormData((prev) => ({
//         ...prev,
//         rejectionEntries: prev.rejectionEntries.map((entry, i) =>
//           i === index ? { ...entry, [field]: value } : entry
//         ),
//       }));
//     },
//     []
//   );

//   const addRejectionEntry = useCallback(() => {
//     setFormData((prev) => ({
//       ...prev,
//       rejectionEntries: [
//         ...prev.rejectionEntries,
//         {
//           type: "",
//           quantity: "",
//           reason: "",
//           customType: "",
//           assignedToTeam: "",
//           correctiveActions: [],
//         },
//       ],
//     }));
//   }, []);

//   const removeRejectionEntry = useCallback(
//     (index: number) => {
//       setFormData((prev) => {
//         const newRejectionEntries = prev.rejectionEntries.filter((_, i) => i !== index);
//         const newErrors = { ...formErrors };
//         if (newErrors.rejectionEntries?.[index]) {
//           delete newErrors.rejectionEntries[index];
//           if (!Object.keys(newErrors.rejectionEntries).length) {
//             delete newErrors.rejectionEntries;
//           }
//         }
//         setFormErrors(Object.keys(newErrors).length ? newErrors : {});
//         return { ...prev, rejectionEntries: newRejectionEntries };
//       });
//     },
//     [formErrors]
//   );

//   // Generate production code
//   const generateNewProductionCode = useCallback(() => {
//     if (
//       !formData.machineId ||
//       !formData.date ||
//       !formData.shift ||
//       !formData.productionType ||
//       !formData.productId
//     )
//       return "";
//     const productionTypeForCode =
//       formData.productionType === "InjectionMolding" ? "injection" : "Assembly";
//     return generateProductionCode(
//       getMachineName(formData.machineId),
//       getProductName(formData.productId),
//       formData.date,
//       formData.shift,
//       productionTypeForCode
//     );
//   }, [formData, getMachineName, getProductName]);

//   // Validate form
//   const validateForm = useCallback(() => {
//     const errors: Partial<
//       Record<keyof ProductionFormData, string> & {
//         rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
//         correctiveActions?: { [index: number]: Partial<Action> };
//         downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
//       }
//     > = {};

//     const validateRequired = (field: keyof ProductionFormData, message: string) => {
//       if (!formData[field]) errors[field] = message;
//     };

//     const validateNumeric = (field: keyof ProductionFormData, message: string) => {
//       if (formData[field] && (isNaN(Number(formData[field])) || Number(formData[field]) < 0)) {
//         errors[field] = message;
//       }
//     };

//     // Required fields
//     [
//       ["productionType", "Production type is required."],
//       ["date", "Date is required."],
//       ["shift", "Shift is required."],
//       ["machineId", "Machine is required."],
//       ["productId", "Product is required."],
//       ["plannedQty", "Planned quantity is required."],
//       ["actualQty", "Actual quantity is required."],
//       ["plannedMins", "Planned minutes is required."],
//     ].forEach(([field, message]) => validateRequired(field as keyof ProductionFormData, message));

//     // Numeric fields
//     [
//       ["plannedQty", "Must be a non-negative number."],
//       ["actualQty", "Must be a non-negative number."],
//       ["targetOutput", "Must be a non-negative number."],
//       ["plannedMins", "Must be a non-negative number."],
//       ["downtime", "Must be a non-negative number."],
//       ["lumpsQty", "Must be a non-negative number."],
//     ].forEach(([field, message]) => validateNumeric(field as keyof ProductionFormData, message));

//     if (
//       formData.actualQty &&
//       formData.plannedQty &&
//       Number(formData.actualQty) > Number(formData.plannedQty)
//     ) {
//       errors.actualQty = "Actual quantity cannot exceed planned quantity.";
//     }

//     if (formData.lumpsReason && !isNaN(Number(formData.lumpsReason))) {
//       errors.lumpsReason = "Lumps reason cannot be numeric.";
//     }

//     const rejectionErrors: { [index: number]: Partial<RejectionEntry> } = {};
//     const nonEmptyRejections = formData.rejectionEntries.filter(
//       (entry) => entry.type || entry.quantity || entry.reason || entry.customType
//     );

//     nonEmptyRejections.forEach((entry, index) => {
//       const entryErrors: Partial<RejectionEntry> = {};
//       if (!entry.type) entryErrors.type = "Rejection type is required.";
//       if (entry.type === "Other" && !entry.customType) {
//         entryErrors.customType = "Custom rejection type is required.";
//       }
//       if (!entry.quantity) {
//         entryErrors.quantity = "Quantity is required.";
//       } else if (isNaN(Number(entry.quantity)) || Number(entry.quantity) < 0) {
//         entryErrors.quantity = "Must be a non-negative number.";
//       }
//       if (!entry.reason) {
//         entryErrors.reason = "Reason is required.";
//       } else if (!isNaN(Number(entry.reason))) {
//         entryErrors.reason = "Reason cannot be numeric.";
//       }
//       if (entry.correctiveActions?.length) {
//         const actionErrors: { [actionIndex: number]: Partial<Action> } = {};
//         entry.correctiveActions.forEach((action, actionIndex) => {
//           if (action.action || action.responsible) {
//             if (!action.action) actionErrors[actionIndex] = { action: "Action is required." };
//             if (!action.responsible) actionErrors[actionIndex] = { ...actionErrors[actionIndex], responsible: "Responsible person is required." };
//           }
//         });
//         if (Object.keys(actionErrors).length) {
//           entryErrors.correctiveActions = actionErrors;
//         }
//       }
//       if (Object.keys(entryErrors).length) rejectionErrors[index] = entryErrors;
//     });

//     if (Object.keys(rejectionErrors).length) {
//       errors.rejectionEntries = rejectionErrors;
//     }

//     const totalRejectionQty = nonEmptyRejections.reduce(
//       (sum, entry) => sum + Number(entry.quantity) || 0,
//       0
//     );
//     if (formData.actualQty && totalRejectionQty > Number(formData.actualQty)) {
//       errors.rejectionEntries = {
//         ...errors.rejectionEntries,
//         general: "Total rejection quantity cannot exceed actual quantity.",
//       };
//     }

//     if (formData.defectType === "other" && !formData.customDefectType) {
//       errors.customDefectType = "Custom defect type is required.";
//     }

//     if (formData.downtimeType === "other" && !formData.customDowntimeType) {
//       errors.customDowntimeType = "Custom downtime type is required.";
//     }

//     const downtimeActionErrors: { [index: number]: Partial<Action> } = {};
//     downtimeCorrectiveActions.forEach((action, index) => {
//       if (action.action || action.responsible) {
//         if (!action.action) downtimeActionErrors[index] = { action: "Action is required." };
//         if (!action.responsible) downtimeActionErrors[index] = { ...downtimeActionErrors[index], responsible: "Responsible person is required." };
//       }
//     });

//     if (Object.keys(downtimeActionErrors).length) {
//       errors.downtimeCorrectiveActions = downtimeActionErrors;
//     }

//     setFormErrors(Object.keys(errors).length ? errors : {});
//     return !Object.keys(errors).length;
//   }, [formData, downtimeCorrectiveActions]);

//   // Submit production record
//   const handleSubmitProduction = useCallback(async () => {
//     if (!validateForm()) {
//       toast({ variant: "destructive", title: "Validation Error", description: "Please correct form errors." });
//       return;
//     }

//     const productionCode = generateNewProductionCode();
//     if (!productionCode) {
//       toast({ variant: "destructive", title: "Error", description: "Failed to generate production code." });
//       return;
//     }

//     const recordId = generateUUID();
//     const rejectionTypesFinal = formData.rejectionEntries
//       .filter((entry) => entry.type || entry.quantity || entry.reason || entry.customType || entry.assignedToTeam)
//       .map((entry) => ({
//         entryId: generateUUID(),
//         type: entry.type === "Other" ? entry.customType || "Other" : entry.type,
//         quantity: Number(entry.quantity) || 0,
//         reason: entry.reason || "",
//         assignedToTeam: entry.assignedToTeam || "",
//         correctiveActions: entry.correctiveActions?.filter((action) => action.action && action.responsible) || [],
//       }));

//     const defectTypeFinal = formData.defectType === "other" ? formData.customDefectType : formData.defectType;
//     const downtimeTypeFinal = formData.downtimeType === "other" ? formData.customDowntimeType : formData.downtimeType;

//     const efficiency =
//       Number(formData.plannedQty) > 0
//         ? Math.min(100, Math.round((Number(formData.actualQty) / Number(formData.plannedQty)) * 100))
//         : 0;

//     const newRecord: ProductionRecord = {
//       recordId,
//       productionCode,
//       productionType: formData.productionType,
//       date: formData.date,
//       shift: formData.shift,
//       machineName: getMachineName(formData.machineId),
//       product: getProductName(formData.productId),
//       plannedQty: Number(formData.plannedQty) || 0,
//       actualQty: Number(formData.actualQty) || 0,
//       rejectedQty: rejectionTypesFinal.reduce((sum, entry) => sum + entry.quantity, 0),
//       lumpsQty: Number(formData.lumpsQty) || 0,
//       lumpsReason: formData.lumpsReason || null,
//       rejectionTypes: rejectionTypesFinal,
//       downtime: Number(formData.downtime) || 0,
//       downtimeType: downtimeTypeFinal || null,
//       defectType: defectTypeFinal || null,
//       targetOutput: Number(formData.targetOutput) || 0,
//       plannedMins: Number(formData.plannedMins) || 0,
//       operator: formData.operator,
//       supervisor: formData.supervisor || "Unknown",
//       status: formData.status,
//       efficiency,
//       team: formData.team || null,
//       customDefectType: formData.defectType === "other" ? formData.customDefectType || null : null,
//       customDowntimeType: formData.downtimeType === "other" ? formData.customDowntimeType || null : null,
//       downtimeCorrectiveActions: downtimeCorrectiveActions.filter((action) => action.action && action.responsible),
//     };

//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/production`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify(newRecord),
//       });

//       if (response.status === 401) {
//         logout();
//         toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
//         return;
//       }

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       setIsAddingProduction(false);
//       setFormData({
//         ...formInitialState,
//         rejectionEntries: [{ type: "", quantity: "", reason: "", customType: "", assignedToTeam: "", correctiveActions: [] }],
//       });
//       setFormErrors({});
//       setCorrectiveActions([{ id: generateUUID(), action: "", responsible: "" }]);
//       setDowntimeCorrectiveActions([{ id: generateUUID(), action: "", responsible: "" }]);

//       if (resetFiltersAfterSubmit) {
//         setFilterName("");
//         setFilterDate("");
//         setFilterDepartment("all");
//         setFilterMachine("all");
//         setFilterProduct("all");
//         setFilterDefect("all");
//         setFilterPhenomenon("all");
//         setFilterRejectionType("all");
//         setFilterShift("all");
//         setFilterStatus("all");
//         setFilterProductionType("all");
//       }
//       await fetchProductionData();
//       refreshTaskCount();

//       toast({ title: "Success", description: "Production record added successfully." });
//     } catch (err: any) {
//       toast({ variant: "destructive", title: "Error", description: `Failed to submit record: ${err.message}` });
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [
//     validateForm,
//     generateNewProductionCode,
//     formData,
//     getMachineName,
//     getProductName,
//     resetFiltersAfterSubmit,
//     fetchProductionData,
//     toast,
//     logout,
//     token,
//     formInitialState,
//     correctiveActions,
//     downtimeCorrectiveActions,
//   ]);

//   // Status and efficiency colors
//   const getStatusColor = useCallback(
//     (status: string) =>
//       ({
//         completed: "bg-green-100 text-green-800",
//         "in-progress": "bg-blue-100 text-blue-800",
//         pending: "bg-yellow-100 text-yellow-800",
//       }[status] || "bg-gray-100 text-gray-800"),
//     []
//   );

//   const getEfficiencyColor = useCallback(
//     (efficiency: number) => {
//       if (efficiency >= 95) return "text-green-600";
//       if (efficiency >= 85) return "text-yellow-600";
//       return "text-red-600";
//     },
//     []
//   );

//   const getProductionTypeLabel = useCallback(
//     (type: string) => (type === "InjectionMolding" ? "Injection Molding" : "Assembly"),
//     []
//   );

//   // Reusable select component for employees, machines, products
//   const renderSelect = useCallback(
//     ({
//       id,
//       value,
//       onChange,
//       options,
//       placeholder,
//       isLoading,
//       error,
//       label,
//       ariaLabel,
//     }: {
//       id: string;
//       value: string;
//       onChange: (value: string) => void;
//       options: { value: string; label: string }[];
//       placeholder: string;
//       isLoading?: boolean;
//       error?: string;
//       label: string;
//       ariaLabel: string;
//     }) => (
//       <div className="flex flex-col space-y-1.5">
//         <Label htmlFor={id} className="font-medium">
//           {label}
//         </Label>
//         <Select value={value} onValueChange={onChange} disabled={isLoading}>
//           <SelectTrigger
//             id={id}
//             className={`w-full ${error ? "border-red-500" : "border-gray-300"}`}
//             aria-invalid={!!error}
//             aria-describedby={error ? `${id}-error` : undefined}
//             aria-label={ariaLabel}
//           >
//             <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
//           </SelectTrigger>
//           <SelectContent>
//             {options.length ? (
//               options.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))
//             ) : (
//               <div className="px-2 py-1 text-sm text-gray-500">No options found</div>
//             )}
//           </SelectContent>
//         </Select>
//         {error && (
//           <p id={`${id}-error`} className="text-red-500 text-sm">
//             {error}
//           </p>
//         )}
//       </div>
//     ),
//     []
//   );

//   // Render loading state
//   if (Object.values(isLoading).some((loading) => loading)) {
//     return (
//       <div className="flex justify-center items-center h-screen" role="status" aria-label="Loading initial data">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
//         <span className="ml-2 text-gray-600">Loading data...</span>
//       </div>
//     );
//   }

//   // Main render
//   return (
//     <div className="mx-auto p-6 space-y-6 bg-gray-50">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">
//           Production Tracking
//         </h2>
//         <Dialog open={isAddingProduction} onOpenChange={setIsAddingProduction}>
//           <DialogTrigger asChild>
//             <Button
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//               aria-label="Add new production entry"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add Production Entry
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
//             <DialogHeader>
//               <DialogTitle>Add Production Entry</DialogTitle>
//               <DialogDescription>
//                 Fill in the details below to add a new production record.
//                 Required fields are marked.
//               </DialogDescription>
//             </DialogHeader>
//             <Suspense
//               fallback={
//                 <div
//                   className="flex justify-center items-center py-4"
//                   role="status"
//                 >
//                   <Loader2 className="h-6 w-6 animate-spin text-gray-600" />{" "}
//                   Loading...
//                 </div>
//               }
//             >
//               <div className="space-y-6 py-4">
//                 {/* Production Type */}
//                 {renderSelect({
//                   id: "productionType",
//                   value: formData.productionType,
//                   onChange: (value) =>
//                     handleInputChange("productionType", value),
//                   options: [
//                     { value: "InjectionMolding", label: "Injection Molding" },
//                     { value: "Assembly", label: "Assembly" },
//                   ],
//                   placeholder: "Select production type",
//                   error: formErrors.productionType,
//                   label: "Production Type *",
//                   ariaLabel: "Select production type",
//                 })}

//                 {/* Date and Shift */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="date" className="font-medium">
//                       Produced Date *
//                     </Label>
//                     <Input
//                       id="date"
//                       type="date"
//                       value={formData.date}
//                       onChange={(e) =>
//                         handleInputChange("date", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.date ? "border-red-500" : "border-gray-300"
//                       }`}
//                       max={new Date().toISOString().split("T")[0]}
//                       aria-invalid={!!formErrors.date}
//                       aria-describedby={
//                         formErrors.date ? "date-error" : undefined
//                       }
//                     />
//                     {formErrors.date && (
//                       <p id="date-error" className="text-red-500 text-sm">
//                         {formErrors.date}
//                       </p>
//                     )}
//                   </div>
//                   {renderSelect({
//                     id: "shift",
//                     value: formData.shift,
//                     onChange: (value) => handleInputChange("shift", value),
//                     options: [
//                       { value: "A", label: "Shift A" },
//                       { value: "B", label: "Shift B" },
//                       { value: "C", label: "Shift C" },
//                     ],
//                     placeholder: "Select shift",
//                     error: formErrors.shift,
//                     label: "Produced Shift *",
//                     ariaLabel: "Select shift",
//                   })}
//                 </div>

//                 {/* Operator and Supervisor */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {renderSelect({
//                     id: "operator",
//                     value: formData.operator,
//                     onChange: (value) => handleInputChange("operator", value),
//                     options: employees.map((emp) => ({
//                       value: emp.employeeId,
//                       label: emp.name,
//                     })),
//                     placeholder: "Select Operator",
//                     isLoading: isLoading.employees,
//                     error: formErrors.operator,
//                     label: "Operator *",
//                     ariaLabel: "Select operator",
//                   })}
//                   {renderSelect({
//                     id: "supervisor",
//                     value: formData.supervisor,
//                     onChange: (value) => handleInputChange("supervisor", value),
//                     options: employees.map((emp) => ({
//                       value: emp.employeeId,
//                       label: emp.name,
//                     })),
//                     placeholder: "Select Supervisor",
//                     isLoading: isLoading.employees,
//                     error: formErrors.supervisor,
//                     label: "Supervisor",
//                     ariaLabel: "Select supervisor",
//                   })}
//                 </div>

//                 {/* Machine, Product, Planned Minutes, Target Output */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   {renderSelect({
//                     id: "machineId",
//                     value: formData.machineId,
//                     onChange: (value) => handleInputChange("machineId", value),
//                     options: machines.map((mac) => ({
//                       value: mac.machineId,
//                       label: mac.machineName,
//                     })),
//                     placeholder: "Select machine",
//                     isLoading: isLoading.machines,
//                     error: formErrors.machineId,
//                     label: "Machine Name *",
//                     ariaLabel: "Select machine",
//                   })}
//                   <div>
//                     <Label htmlFor="productId" className="font-medium">
//                       Product Name *
//                     </Label>
//                     <Select
//                       value={formData.productId}
//                       onValueChange={(value) =>
//                         handleInputChange("productId", value)
//                       }
//                       disabled={!formData.machineId || isLoading.products} // disable if no machine
//                     >
//                       <SelectTrigger
//                         id="productId"
//                         className={`w-full ${
//                           formErrors.productId
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         }`}
//                         aria-invalid={!!formErrors.productId}
//                         aria-describedby={
//                           formErrors.productId ? "productId-error" : undefined
//                         }
//                       >
//                         <SelectValue
//                           placeholder={
//                             !formData.machineId
//                               ? "Select machine first"
//                               : isLoading.products
//                               ? "Loading..."
//                               : "Select product"
//                           }
//                         />
//                       </SelectTrigger>

//                       <SelectContent>
//                         {formData.machineId ? ( // only load products after machine is selected
//                           filteredProducts.length ? (
//                             filteredProducts.map((prod) => (
//                               <SelectItem
//                                 key={prod.productId}
//                                 value={prod.productId}
//                               >
//                                 {prod.name}
//                               </SelectItem>
//                             ))
//                           ) : (
//                             <div className="px-2 py-1 text-sm text-gray-500">
//                               No Products found
//                             </div>
//                           )
//                         ) : (
//                           <div className="px-2 py-1 text-sm text-gray-500">
//                             Please select a machine first
//                           </div>
//                         )}
//                       </SelectContent>
//                     </Select>

//                     {formErrors.productId && (
//                       <p id="productId-error" className="text-red-500 text-sm">
//                         {formErrors.productId}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="plannedMins" className="font-medium">
//                       Planned Minutes *
//                     </Label>
//                     <Input
//                       id="plannedMins"
//                       type="number"
//                       placeholder="480"
//                       value={formData.plannedMins}
//                       onChange={(e) =>
//                         handleInputChange("plannedMins", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.plannedMins
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.plannedMins}
//                       aria-describedby={
//                         formErrors.plannedMins ? "plannedMins-error" : undefined
//                       }
//                     />
//                     {formErrors.plannedMins && (
//                       <p
//                         id="plannedMins-error"
//                         className="text-red-500 text-sm"
//                       >
//                         {formErrors.plannedMins}
//                       </p>
//                     )}
//                   </div>
//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="targetOutput" className="font-medium">
//                       Target Output
//                     </Label>
//                     <Input
//                       id="targetOutput"
//                       type="number"
//                       placeholder="0"
//                       value={formData.targetOutput}
//                       readOnly
//                       className="w-full bg-gray-100"
//                       aria-readonly="true"
//                       aria-describedby={
//                         formErrors.targetOutput
//                           ? "targetOutput-error"
//                           : undefined
//                       }
//                     />
//                     {formErrors.targetOutput && (
//                       <p
//                         id="targetOutput-error"
//                         className="text-red-500 text-sm"
//                       >
//                         {formErrors.targetOutput}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Planned and Actual Quantity */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="plannedQty" className="font-medium">
//                       Planned Quantity *
//                     </Label>
//                     <Input
//                       id="plannedQty"
//                       type="number"
//                       placeholder="1000"
//                       value={formData.plannedQty}
//                       onChange={(e) =>
//                         handleInputChange("plannedQty", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.plannedQty
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.plannedQty}
//                       aria-describedby={
//                         formErrors.plannedQty ? "plannedQty-error" : undefined
//                       }
//                     />
//                     {formErrors.plannedQty && (
//                       <p id="plannedQty-error" className="text-red-500 text-sm">
//                         {formErrors.plannedQty}
//                       </p>
//                     )}
//                   </div>
//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="actualQty" className="font-medium">
//                       Actual Quantity *
//                     </Label>
//                     <Input
//                       id="actualQty"
//                       type="number"
//                       placeholder="950"
//                       value={formData.actualQty}
//                       onChange={(e) =>
//                         handleInputChange("actualQty", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.actualQty
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.actualQty}
//                       aria-describedby={
//                         formErrors.actualQty ? "actualQty-error" : undefined
//                       }
//                     />
//                     {formErrors.actualQty && (
//                       <p id="actualQty-error" className="text-red-500 text-sm">
//                         {formErrors.actualQty}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Rejection Entries */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <Label className="font-medium">Rejection Entries</Label>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={addRejectionEntry}
//                       aria-label="Add new rejection entry"
//                     >
//                       <Plus className="h-4 w-4 mr-2" /> Add Rejection
//                     </Button>
//                   </div>
//                   {formErrors.rejectionEntries?.general && (
//                     <p className="text-red-500 text-sm mb-2">
//                       {formErrors.rejectionEntries.general}
//                     </p>
//                   )}
//                   {formData.rejectionEntries.map((entry, index) => (
//                     <div
//                       key={index}
//                       className="border p-4 rounded-lg mb-4 relative bg-gray-50"
//                     >
//                       {formData.rejectionEntries.length > 1 && (
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="absolute top-2 right-2"
//                           onClick={() => removeRejectionEntry(index)}
//                           aria-label={`Remove rejection entry ${index + 1}`}
//                         >
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         </Button>
//                       )}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {renderSelect({
//                           id: `rejectionType-${index}`,
//                           value: entry.type,
//                           onChange: (value) =>
//                             handleRejectionEntryChange(index, "type", value),
//                           options: rejectionTypes.map((type) => ({
//                             value: type,
//                             label: type,
//                           })),
//                           placeholder: "Select rejection type",
//                           error: formErrors.rejectionEntries?.[index]?.type,
//                           label: "Rejection Type",
//                           ariaLabel: "Select rejection type",
//                         })}
//                         <div className="flex flex-col space-y-1.5">
//                           <Label
//                             htmlFor={`rejectionQuantity-${index}`}
//                             className="font-medium"
//                           >
//                             Rejection Quantity
//                           </Label>
//                           <Input
//                             id={`rejectionQuantity-${index}`}
//                             type="number"
//                             placeholder="50"
//                             value={entry.quantity}
//                             onChange={(e) =>
//                               handleRejectionEntryChange(
//                                 index,
//                                 "quantity",
//                                 e.target.value
//                               )
//                             }
//                             className={`w-full ${
//                               formErrors.rejectionEntries?.[index]?.quantity
//                                 ? "border-red-500"
//                                 : "border-gray-300"
//                             }`}
//                             aria-invalid={
//                               !!formErrors.rejectionEntries?.[index]?.quantity
//                             }
//                             aria-describedby={
//                               formErrors.rejectionEntries?.[index]?.quantity
//                                 ? `rejectionQuantity-error-${index}`
//                                 : undefined
//                             }
//                           />
//                           {formErrors.rejectionEntries?.[index]?.quantity && (
//                             <p
//                               id={`rejectionQuantity-error-${index}`}
//                               className="text-red-500 text-sm"
//                             >
//                               {formErrors.rejectionEntries[index].quantity}
//                             </p>
//                           )}
//                         </div>
//                         {renderSelect({
//                           id: `assignedToTeam-${index}`,
//                           value: entry.assignedToTeam,
//                           onChange: (value) =>
//                             handleRejectionEntryChange(
//                               index,
//                               "assignedToTeam",
//                               value
//                             ),
//                           options: uniqueDepartments.map((group) => ({
//                             value: group,
//                             label: group,
//                           })),
//                           placeholder: "Select Team",
//                           isLoading: isLoading.employees,
//                           error:
//                             formErrors.rejectionEntries?.[index]
//                               ?.assignedToTeam,
//                           label: "Assign to Team",
//                           ariaLabel: "Select team for rejection",
//                         })}
//                       </div>
//                       <div className="mt-4">
//                         <Label
//                           htmlFor={`rejectionReason-${index}`}
//                           className="font-medium"
//                         >
//                           Rejection Reason
//                         </Label>
//                         <Textarea
//                           id={`rejectionReason-${index}`}
//                           placeholder="Describe the reason"
//                           rows={3}
//                           value={entry.reason}
//                           onChange={(e) =>
//                             handleRejectionEntryChange(
//                               index,
//                               "reason",
//                               e.target.value
//                             )
//                           }
//                           className={`w-full ${
//                             formErrors.rejectionEntries?.[index]?.reason
//                               ? "border-red-500"
//                               : "border-gray-300"
//                           }`}
//                           aria-invalid={
//                             !!formErrors.rejectionEntries?.[index]?.reason
//                           }
//                           aria-describedby={
//                             formErrors.rejectionEntries?.[index]?.reason
//                               ? `rejectionReason-error-${index}`
//                               : undefined
//                           }
//                         />
//                         {formErrors.rejectionEntries?.[index]?.reason && (
//                           <p
//                             id={`rejectionReason-error-${index}`}
//                             className="text-red-500 text-sm"
//                           >
//                             {formErrors.rejectionEntries[index].reason}
//                           </p>
//                         )}
//                       </div>
//                       <ActionInputs
//                         actions={entry.correctiveActions || []}
//                         setActions={(actions: Action[]) =>
//                           handleRejectionEntryChange(
//                             index,
//                             "correctiveActions",
//                             actions
//                           )
//                         }
//                         title="Corrective Actions for Rejection"
//                         employees={employees}
//                         errors={
//                           formErrors.rejectionEntries?.[index]
//                             ?.correctiveActions
//                         }
//                         showDueDate={false}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Defect Type */}
//                 {renderSelect({
//                   id: "defectType",
//                   value: formData.defectType,
//                   onChange: (value) => handleInputChange("defectType", value),
//                   options: [
//                     ...filteredDefects.map((def) => ({
//                       value: def.name,
//                       label: def.name,
//                     })),
//                     { value: "other", label: "Other" },
//                   ],
//                   placeholder: formData.productionType
//                     ? "Select Defect Type"
//                     : "Select production type first",
//                   isLoading: isLoading.defects,
//                   error: formErrors.defectType,
//                   label: "Defect Type",
//                   ariaLabel: "Select defect type",
//                 })}
//                 {formData.defectType === "other" && (
//                   <div className="mt-2 flex flex-col space-y-1.5">
//                     <Label htmlFor="customDefectType" className="font-medium">
//                       Custom Defect Type
//                     </Label>
//                     <Textarea
//                       id="customDefectType"
//                       placeholder="Specify defect type"
//                       value={formData.customDefectType}
//                       onChange={(e) =>
//                         handleInputChange("customDefectType", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.customDefectType
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.customDefectType}
//                       aria-describedby={
//                         formErrors.customDefectType
//                           ? "customDefectType-error"
//                           : undefined
//                       }
//                     />
//                     {formErrors.customDefectType && (
//                       <p
//                         id="customDefectType-error"
//                         className="text-red-500 text-sm"
//                       >
//                         {formErrors.customDefectType}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* Downtime Reason */}
//                 <div className="border p-4 rounded-lg mb-4 bg-gray-50">
//                   {renderSelect({
//                     id: "downtimeType",
//                     value: formData.downtimeType,
//                     onChange: (value) =>
//                       handleInputChange("downtimeType", value),
//                     options: [
//                       { value: "none", label: "No Issue" },
//                       ...downtimeTypes,
//                     ],
//                     placeholder: "Select Downtime type",
//                     error: formErrors.downtimeType,
//                     label: "Downtime Reason",
//                     ariaLabel: "Select downtime type",
//                   })}
//                   {formData.downtimeType === "other" && (
//                     <div className="mt-5 flex flex-col space-y-1.5">
//                       <Label
//                         htmlFor="customDowntimeType"
//                         className="font-medium"
//                       >
//                         Custom Downtime Type
//                       </Label>
//                       <Textarea
//                         id="customDowntimeType"
//                         placeholder="Specify downtime type"
//                         value={formData.customDowntimeType}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "customDowntimeType",
//                             e.target.value
//                           )
//                         }
//                         className={`w-full ${
//                           formErrors.customDowntimeType
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         }`}
//                         aria-invalid={!!formErrors.customDowntimeType}
//                         aria-describedby={
//                           formErrors.customDowntimeType
//                             ? "customDowntimeType-error"
//                             : undefined
//                         }
//                       />
//                       {formErrors.customDowntimeType && (
//                         <p
//                           id="customDowntimeType-error"
//                           className="text-red-500 text-sm"
//                         >
//                           {formErrors.customDowntimeType}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                   {formData.downtimeType !== "none" &&
//                     formData.downtimeType && (
//                       <div>
//                         <div className="grid grid-cols-2 mt-5 gap-4">
//                           <div className="flex flex-col space-y-1.5">
//                             <Label htmlFor="downtime" className="font-medium">
//                               Downtime (minutes)
//                             </Label>
//                             <Input
//                               id="downtime"
//                               type="number"
//                               placeholder="30"
//                               value={formData.downtime}
//                               onChange={(e) =>
//                                 handleInputChange("downtime", e.target.value)
//                               }
//                               className={`w-full ${
//                                 formErrors.downtime
//                                   ? "border-red-500"
//                                   : "border-gray-300"
//                               }`}
//                               aria-invalid={!!formErrors.downtime}
//                               aria-describedby={
//                                 formErrors.downtime
//                                   ? "downtime-error"
//                                   : undefined
//                               }
//                             />
//                             {formErrors.downtime && (
//                               <p
//                                 id="downtime-error"
//                                 className="text-red-500 text-sm"
//                               >
//                                 {formErrors.downtime}
//                               </p>
//                             )}
//                           </div>
//                           {renderSelect({
//                             id: "team",
//                             value: formData.team,
//                             onChange: (value) =>
//                               handleInputChange("team", value),
//                             options: uniqueDepartments.map((group) => ({
//                               value: group,
//                               label: group,
//                             })),
//                             placeholder: "Select Team",
//                             isLoading: isLoading.employees,
//                             error: formErrors.team,
//                             label: "Assign to Team",
//                             ariaLabel: "Select team for downtime",
//                           })}
//                         </div>
//                         <ActionInputs
//                           actions={downtimeCorrectiveActions}
//                           setActions={setDowntimeCorrectiveActions}
//                           title="Corrective Actions for Downtime"
//                           employees={employees}
//                           errors={formErrors.downtimeCorrectiveActions}
//                           showDueDate={false}
//                         />
//                       </div>
//                     )}
//                 </div>

//                 {/* Lumps Quantity and Reason */}
//                 <div className="border p-4 rounded-lg mb-4 bg-gray-50">
//                   <div className="flex flex-col space-y-1.5">
//                     <Label htmlFor="lumpsQty" className="font-medium">
//                       Lumps Quantity
//                     </Label>
//                     <Input
//                       id="lumpsQty"
//                       type="number"
//                       placeholder="5"
//                       value={formData.lumpsQty}
//                       onChange={(e) =>
//                         handleInputChange("lumpsQty", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.lumpsQty
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.lumpsQty}
//                       aria-describedby={
//                         formErrors.lumpsQty ? "lumpsQty-error" : undefined
//                       }
//                     />
//                     {formErrors.lumpsQty && (
//                       <p id="lumpsQty-error" className="text-red-500 text-sm">
//                         {formErrors.lumpsQty}
//                       </p>
//                     )}
//                   </div>
//                   <div className="mt-3 flex flex-col space-y-1.5">
//                     <Label htmlFor="lumpsReason" className="font-medium">
//                       Lumps Reason
//                     </Label>
//                     <Textarea
//                       id="lumpsReason"
//                       placeholder="Describe lumps reason"
//                       rows={3}
//                       value={formData.lumpsReason}
//                       onChange={(e) =>
//                         handleInputChange("lumpsReason", e.target.value)
//                       }
//                       className={`w-full ${
//                         formErrors.lumpsReason
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                       aria-invalid={!!formErrors.lumpsReason}
//                       aria-describedby={
//                         formErrors.lumpsReason ? "lumpsReason-error" : undefined
//                       }
//                     />
//                     {formErrors.lumpsReason && (
//                       <p
//                         id="lumpsReason-error"
//                         className="text-red-500 text-sm"
//                       >
//                         {formErrors.lumpsReason}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Form Actions */}
//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsAddingProduction(false)}
//                     aria-label="Cancel production entry"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleSubmitProduction}
//                     disabled={isSubmitting}
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                     aria-label="Save production entry"
//                   >
//                     {isSubmitting ? (
//                       <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     ) : (
//                       "Save"
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </Suspense>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         {[
//           {
//             title: "Total Jobs",
//             value: stats.totalJobs,
//             icon: Calendar,
//             color: "text-blue-600",
//           },
//           {
//             title: "Completed",
//             value: stats.completed,
//             icon: CheckCircle,
//             color: "text-green-600",
//           },
//           {
//             title: "Planned",
//             value: stats.totalPlanned.toLocaleString(),
//             icon: Users,
//             color: "text-purple-600",
//           },
//           {
//             title: "Actual",
//             value: stats.totalActual.toLocaleString(),
//             icon: Clock,
//             color: "text-indigo-600",
//           },
//           {
//             title: "Rejected",
//             value: stats.totalRejected,
//             icon: XCircle,
//             color: "text-red-600",
//           },
//           {
//             title: "Avg Efficiency",
//             value: `${stats.avgEfficiency}%`,
//             icon: AlertTriangle,
//             color: getEfficiencyColor(stats.avgEfficiency),
//           },
//         ].map((stat, index) => (
//           <Card key={index} className="border-none shadow-sm bg-white">
//             <CardContent className="p-4 flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {stat.title}
//                 </p>
//                 <p className={`text-2xl font-bold ${stat.color}`}>
//                   {stat.value}
//                 </p>
//               </div>
//               <stat.icon className={`h-8 w-8 ${stat.color}`} />
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Filters */}
//       <Card className="border-none shadow-sm bg-white">
//         <CardContent className="p-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             <div>
//               <Label htmlFor="filterName" className="font-medium">
//                 Name
//               </Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="filterName"
//                   placeholder="Search name..."
//                   value={filterName}
//                   onChange={(e) => setFilterName(e.target.value)}
//                   className="pl-10 border-gray-300"
//                   aria-label="Filter by name"
//                 />
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="filterDate" className="font-medium">
//                 Date
//               </Label>
//               <Input
//                 id="filterDate"
//                 type="date"
//                 value={filterDate}
//                 onChange={(e) => setFilterDate(e.target.value)}
//                 className="border-gray-300"
//                 aria-label="Filter by date"
//               />
//             </div>
//             {renderSelect({
//               id: "filterDepartment",
//               value: filterDepartment,
//               onChange: setFilterDepartment,
//               options: [
//                 { value: "all", label: "All Departments" },
//                 ...uniqueDepartments.map((dept) => ({
//                   value: dept,
//                   label: dept,
//                 })),
//               ],
//               placeholder: "All Departments",
//               label: "Department",
//               ariaLabel: "Filter by department",
//             })}
//             {renderSelect({
//               id: "filterMachine",
//               value: filterMachine,
//               onChange: setFilterMachine,
//               options: [
//                 { value: "all", label: "All Machines" },
//                 ...machines.map((mac) => ({
//                   value: mac.machineId,
//                   label: mac.machineName,
//                 })),
//               ],
//               placeholder: "All Machines",
//               label: "Machine",
//               ariaLabel: "Filter by machine",
//             })}
//             {renderSelect({
//               id: "filterProduct",
//               value: filterProduct,
//               onChange: setFilterProduct,
//               options: [
//                 { value: "all", label: "All Products" },
//                 ...products.map((prod) => ({
//                   value: prod.productId,
//                   label: prod.name,
//                 })),
//               ],
//               placeholder: "All Products",
//               label: "Product",
//               ariaLabel: "Filter by product",
//             })}
//             {renderSelect({
//               id: "filterDefect",
//               value: filterDefect,
//               onChange: setFilterDefect,
//               options: [
//                 { value: "all", label: "All Defects" },
//                 ...uniqueDefects.map((def) => ({ value: def, label: def })),
//               ],
//               placeholder: "All Defects",
//               label: "Defect Base",
//               ariaLabel: "Filter by defect",
//             })}
//             {renderSelect({
//               id: "filterPhenomenon",
//               value: filterPhenomenon,
//               onChange: setFilterPhenomenon,
//               options: [
//                 { value: "all", label: "All Phenomena" },
//                 ...downtimeTypes.map((type) => ({
//                   value: type.value,
//                   label: type.label,
//                 })),
//               ],
//               placeholder: "All Phenomena",
//               label: "Phenomenon Based",
//               ariaLabel: "Filter by phenomenon",
//             })}
//             {renderSelect({
//               id: "filterRejectionType",
//               value: filterRejectionType,
//               onChange: setFilterRejectionType,
//               options: [
//                 { value: "all", label: "All Rejection Types" },
//                 ...rejectionTypes.map((type) => ({ value: type, label: type })),
//               ],
//               placeholder: "All Rejection Types",
//               label: "Rejection Type",
//               ariaLabel: "Filter by rejection type",
//             })}
//             {renderSelect({
//               id: "filterShift",
//               value: filterShift,
//               onChange: setFilterShift,
//               options: [
//                 { value: "all", label: "All Shifts" },
//                 { value: "A", label: "Shift A" },
//                 { value: "B", label: "Shift B" },
//                 { value: "C", label: "Shift C" },
//               ],
//               placeholder: "All Shifts",
//               label: "Shift",
//               ariaLabel: "Filter by shift",
//             })}
//             {renderSelect({
//               id: "filterProductionType",
//               value: filterProductionType,
//               onChange: setFilterProductionType,
//               options: [
//                 { value: "all", label: "All Types" },
//                 { value: "InjectionMolding", label: "Injection Molding" },
//                 { value: "Assembly", label: "Assembly" },
//               ],
//               placeholder: "All Types",
//               label: "Production Type",
//               ariaLabel: "Filter by production type",
//             })}
//             {renderSelect({
//               id: "filterStatus",
//               value: filterStatus,
//               onChange: setFilterStatus,
//               options: [
//                 { value: "all", label: "All Status" },
//                 { value: "completed", label: "Completed" },
//                 { value: "in-progress", label: "In Progress" },
//                 { value: "pending", label: "Pending" },
//               ],
//               placeholder: "All Status",
//               label: "Status",
//               ariaLabel: "Filter by status",
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Production Records */}
//       <Card className="border-none shadow-md bg-white">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-xl">
//             <Factory className="h-5 w-5 text-gray-600" />
//             Production Records ({filteredProduction.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isLoading.production ? (
//             <div
//               className="flex justify-center items-center py-12"
//               role="status"
//               aria-label="Loading production records"
//             >
//               <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
//               <span className="ml-2 text-gray-600">Loading records...</span>
//             </div>
//           ) : filteredProduction.length === 0 ? (
//             <div className="text-center py-12">
//               <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 No Production Found
//               </h3>
//               <p className="text-gray-500 italic">
//                 Try adjusting your search or filters.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredProduction.map((record) => (
//                 <div
//                   key={record.recordId}
//                   className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center space-x-4">
//                       <Badge
//                         variant="outline"
//                         className="bg-blue-50 text-blue-900 font-bold"
//                       >
//                         {record.productionCode || "N/A"}
//                       </Badge>
//                       <h3 className="font-semibold text-lg text-gray-900">
//                         {record.product}
//                       </h3>
//                       <Badge variant="outline">
//                         {getProductionTypeLabel(record.productionType)}
//                       </Badge>
//                       <Badge variant="outline">Shift {record.shift}</Badge>
//                       <Badge variant="outline">{record.machineName}</Badge>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Badge className={getStatusColor(record.status)}>
//                         {record.status.charAt(0).toUpperCase() +
//                           record.status.slice(1)}
//                       </Badge>
//                       <span
//                         className={`text-sm font-bold ${getEfficiencyColor(
//                           record.efficiency
//                         )}`}
//                       >
//                         {record.efficiency}% Efficiency
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDeleteProduction(record.recordId)}
//                         disabled={deletingRecords.includes(record.recordId)}
//                         aria-label={`Delete production record ${record.recordId}`}
//                       >
//                         {deletingRecords.includes(record.recordId) ? (
//                           <Loader2 className="h-4 w-4 animate-spin text-red-500" />
//                         ) : (
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
//                     <div className="bg-green-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-green-800">
//                         Planned Qty
//                       </p>
//                       <p className="text-xl font-bold text-green-900">
//                         {record.plannedQty.toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-blue-800">
//                         Actual Qty
//                       </p>
//                       <p className="text-xl font-bold text-blue-900">
//                         {record.actualQty.toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="bg-purple-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-purple-800">
//                         Target Output
//                       </p>
//                       <p className="text-xl font-bold text-purple-900">
//                         {record.targetOutput.toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="bg-red-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-red-800">
//                         Rejected Qty
//                       </p>
//                       <p className="text-xl font-bold text-red-900">
//                         {record.rejectedQty}
//                       </p>
//                     </div>
//                     <div className="bg-orange-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-orange-800">
//                         Lumps Qty
//                       </p>
//                       <p className="text-xl font-bold text-orange-900">
//                         {record.lumpsQty}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-gray-800">
//                         Downtime
//                       </p>
//                       <p className="text-lg font-bold text-gray-900">
//                         {record.downtime} min
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {new Date(record.date).toLocaleDateString("en-US", {
//                           year: "numeric",
//                           month: "long",
//                           day: "numeric",
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                     <div className="bg-indigo-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-indigo-800">
//                         Planned Minutes
//                       </p>
//                       <p className="text-lg font-bold text-indigo-900">
//                         {record.plannedMins} min
//                       </p>
//                     </div>
//                     <div className="bg-pink-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-pink-800">
//                         Rejection Types
//                       </p>
//                       <p className="text-sm font-bold text-pink-900">
//                         {record.rejectionTypes
//                           ?.map((entry) => entry.type)
//                           .join(", ") || "None"}
//                       </p>
//                     </div>
//                     <div className="bg-cyan-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-cyan-800">
//                         Defect Type
//                       </p>
//                       <p className="text-sm font-bold text-cyan-900">
//                         {record.defectType || "None"}
//                       </p>
//                     </div>
//                   </div>
//                   {(record.rejectionTypes?.some((entry) => entry.reason) ||
//                     record.lumpsReason) && (
//                     <div className="bg-yellow-50 p-4 rounded-lg">
//                       <div className="flex items-start space-x-2">
//                         <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
//                         <div>
//                           <h4 className="font-medium text-yellow-800 mb-2">
//                             Issues Reported
//                           </h4>
//                           {record.rejectionTypes?.map(
//                             (entry, index) =>
//                               entry.reason && (
//                                 <div key={index} className="mb-2">
//                                   <p className="text-sm font-medium text-yellow-800">
//                                     Rejection ({entry.type}): {entry.quantity}{" "}
//                                     units
//                                   </p>
//                                   <p className="text-sm text-yellow-700">
//                                     {entry.reason}
//                                   </p>
//                                   {entry.correctiveActions?.length > 0 && (
//                                     <div className="mt-1">
//                                       <p className="text-sm font-medium text-yellow-800">
//                                         Corrective Actions:
//                                       </p>
//                                       {entry.correctiveActions.map(
//                                         (action, actionIndex) => (
//                                           <p
//                                             key={actionIndex}
//                                             className="text-sm text-yellow-700"
//                                           >
//                                             - {action.action} (Assigned to:{" "}
//                                             {getEmployeeName(
//                                               action.responsible
//                                             )}
//                                             )
//                                           </p>
//                                         )
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               )
//                           )}
//                           {record.lumpsReason && (
//                             <div>
//                               <p className="text-sm font-medium text-yellow-800">
//                                 Lumps Reason ({record.lumpsQty} units):
//                               </p>
//                               <p className="text-sm text-yellow-700">
//                                 {record.lumpsReason}
//                               </p>
//                             </div>
//                           )}
//                           {record.downtimeCorrectiveActions?.length > 0 && (
//                             <div className="mt-2">
//                               <p className="text-sm font-medium text-yellow-800">
//                                 Downtime Corrective Actions:
//                               </p>
//                               {record.downtimeCorrectiveActions.map(
//                                 (action, index) => (
//                                   <p
//                                     key={index}
//                                     className="text-sm text-yellow-700"
//                                   >
//                                     - {action.action} (Assigned to:{" "}
//                                     {getEmployeeName(action.responsible)})
//                                   </p>
//                                 )
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// });

// export default ProductionTracking;
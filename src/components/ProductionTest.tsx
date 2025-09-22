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
  ChevronLeft,
  ChevronRight,
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
import { useDebounce } from "use-debounce";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/AuthContext";
import { generateUUID } from "@/utils/utils";
import { generateProductionCode } from "@/utils/productionCodeGenerator";

const ActionInputs = lazy(() => import("./ActionInputs"));

interface Action {
  id: string;
  action: string;
  responsible: string;
  dueDate: string;
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
  correctiveActions: Action[];
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
}

interface Defect {
  defectId: string;
  name: string;
  defectType: string;
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [filterDate, setFilterDate] = useState("");
  const [debouncedFilterDate] = useDebounce(filterDate, 300);
  const [filterShift, setFilterShift] = useState("all");
  const [debouncedFilterShift] = useDebounce(filterShift, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [debouncedFilterStatus] = useDebounce(filterStatus, 300);
  const [filterProductionType, setFilterProductionType] = useState("all");
  const [debouncedFilterProductionType] = useDebounce(
    filterProductionType,
    300
  );
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    employees: false,
    machines: false,
    products: false,
    defects: false,
    production: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<keyof ProductionFormData, string> & {
        rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
        correctiveActions?: { [index: number]: Partial<Action> };
        downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
      }
    >
  >({});
  const [resetFiltersAfterSubmit, setResetFiltersAfterSubmit] = useState(true);
  const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
    { id: generateUUID(), action: "", responsible: "", dueDate: "" },
  ]);
  const [downtimeCorrectiveActions, setDowntimeCorrectiveActions] = useState<
    Action[]
  >([{ id: generateUUID(), action: "", responsible: "", dueDate: "" }]);

  const formInitialState: ProductionFormData = useMemo(
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

  const [formData, setFormData] =
    useState<ProductionFormData>(formInitialState);

  const fetchInitialData = useCallback(async () => {
    setIsLoading((prev) => ({
      ...prev,
      employees: true,
      machines: true,
      products: true,
      defects: true,
    }));
    try {
      const [employeesRes, machinesRes, productsRes, defectsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/employees`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/machines`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/products`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/defects`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (
        [employeesRes, machinesRes, productsRes, defectsRes].some(
          (res) => res.status === 401
        )
      ) {
        logout();
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please log in again.",
        });
        return;
      }

      if (
        !employeesRes.ok ||
        !machinesRes.ok ||
        !productsRes.ok ||
        !defectsRes.ok
      ) {
        throw new Error("Failed to fetch initial data");
      }

      const [employeesData, machinesData, productsData, defectsData] =
        await Promise.all([
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
      setDefects(
        defectsData.map((def: Defect) => ({
          ...def,
          defectType: def.defectType.toLowerCase().replace(/\s+/g, "-"),
        }))
      );
      toast({
        title: "Data Loaded",
        description: "Initial data loaded successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch initial data: ${err.message}`,
      });
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

  const fetchProductionData = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, production: true }));
    try {
      const query = new URLSearchParams({
        search: debouncedSearchTerm,
        date: debouncedFilterDate,
        shift: debouncedFilterShift === "all" ? "" : debouncedFilterShift,
        status: debouncedFilterStatus === "all" ? "" : debouncedFilterStatus,
        productionType:
          debouncedFilterProductionType === "all"
            ? ""
            : debouncedFilterProductionType,
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`${API_BASE_URL}/api/production?${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (response.status === 401) {
        logout();
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please log in again.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const {
        data: { records, total },
      } = await response.json();
      if (!Array.isArray(records)) {
        throw new Error("Invalid response format: records is not an array");
      }

      setProductionData(records);
      setTotalPages(Math.ceil(total / limit) || 1);
      toast({
        title: "Production Data Loaded",
        description: `Loaded ${records.length} records.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch production data: ${err.message}`,
      });
      setProductionData([]);
      setTotalPages(1);
    } finally {
      setIsLoading((prev) => ({ ...prev, production: false }));
      setIsPaginating(false);
    }
  }, [
    debouncedSearchTerm,
    debouncedFilterDate,
    debouncedFilterShift,
    debouncedFilterStatus,
    debouncedFilterProductionType,
    page,
    limit,
    token,
    logout,
    toast,
  ]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  const handleDeleteProduction = useCallback(
    async (recordId: string) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this production record?"
        )
      )
        return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/production/${recordId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          logout();
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Please log in again.",
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        await fetchProductionData();
        toast({
          title: "Success",
          description: "Production record deleted successfully.",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete record: ${err.message}`,
        });
      }
    },
    [token, logout, toast, fetchProductionData]
  );
  
  const handleInputChange = useCallback(
  (field: keyof ProductionFormData, value: string) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      const newErrors = { ...formErrors };

      // Remove error for the field if exists
      if (newErrors[field]) delete newErrors[field];

      // Reset dependent fields
      if (field === "productionType") {
        newFormData.defectType = "";
        newFormData.customDefectType = "";
        delete newErrors.defectType;
        delete newErrors.customDefectType;
      }

      if (field === "defectType" && value !== "other") {
        newFormData.customDefectType = "";
        delete newErrors.customDefectType;
      }

      if (field === "downtimeType" && value !== "other") {
        newFormData.customDowntimeType = "";
        delete newErrors.customDowntimeType;
      }

      // ✅ Filter products when machine changes
      if (field === "machineId") {
        // Reset selected product
        newFormData.productId = "";

        // Filter products based on selected machine
        const filtered = products.filter((prod) => prod.machineId === value);
        setFilteredProducts(filtered);
      }

      setFormErrors(newErrors);
      return newFormData;
    });
  },
  [formErrors, products]
);


  const handleRejectionEntryChange = (
    index: number,
    field: keyof RejectionEntry,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedEntries = [...prev.rejectionEntries];
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value, // <-- value can be string, number, OR Action[]
      };
      return { ...prev, rejectionEntries: updatedEntries };
    });
  };

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
        const newRejectionEntries = prev.rejectionEntries.filter(
          (_, i) => i !== index
        );
        const newErrors = { ...formErrors };
        if (newErrors.rejectionEntries) {
          delete newErrors.rejectionEntries[index];
          if (Object.keys(newErrors.rejectionEntries).length === 0) {
            delete newErrors.rejectionEntries;
          }
        }
        return { ...prev, rejectionEntries: newRejectionEntries };
      });
    },
    [formErrors]
  );

  const getEmployeeName = useCallback(
    (id: string) => {
      return employees.find((e) => e.employeeId === id)?.name ?? "Unknown";
    },
    [employees]
  );

  const getMachineName = useCallback(
    (id: string) => {
      return machines.find((m) => m.machineId === id)?.machineName ?? "Unknown";
    },
    [machines]
  );

  const getProductName = useCallback(
    (id: string) => {
      return products.find((p) => p.productId === id)?.name ?? "Unknown";
    },
    [products]
  );

  const generateNewProductionCode = useCallback(() => {
    if (
      !formData.machineId ||
      !formData.date ||
      !formData.shift ||
      !formData.productionType
    )
      return "";
    const productionTypeForCode =
      formData.productionType === "InjectionMolding" ? "injection" : "Assembly";
    return generateProductionCode(
      getMachineName(formData.machineId),
      getProductName(formData.productId) || "PRODUCT",
      formData.date,
      formData.shift,
      productionTypeForCode
    );
  }, [formData, getMachineName, getProductName]);

  const validateForm = useCallback(() => {
    const errors: Partial<
      Record<keyof ProductionFormData, string> & {
        rejectionEntries?: { [index: number]: Partial<RejectionEntry> };
        correctiveActions?: { [index: number]: Partial<Action> };
        downtimeCorrectiveActions?: { [index: number]: Partial<Action> };
      }
    > = {};
    const requiredFields: (keyof ProductionFormData)[] = [
      "productionType",
      "date",
      "shift",
      "machineId",
      "productId",
      "plannedQty",
      "actualQty",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required.";
      }
    });

    const numericFields: (keyof ProductionFormData)[] = [
      "plannedQty",
      "actualQty",
      "targetOutput",
      "plannedMins",
      "downtime",
      "lumpsQty",
    ];
    numericFields.forEach((field) => {
      if (
        formData[field] &&
        (isNaN(Number(formData[field])) || Number(formData[field]) < 0)
      ) {
        errors[field] = "Must be a non-negative number.";
      }
    });

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
      (entry) =>
        entry.type || entry.quantity || entry.reason || entry.customType
    );

    nonEmptyRejections.forEach((entry, index) => {
      if (!entry.type) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          type: "Rejection type is required.",
        };
      }
      if (entry.type === "Other" && !entry.customType) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          customType: "Custom rejection type is required.",
        };
      }
      if (!entry.quantity) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          quantity: "Quantity is required.",
        };
      } else if (isNaN(Number(entry.quantity)) || Number(entry.quantity) < 0) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          quantity: "Must be a non-negative number.",
        };
      }
      if (!entry.reason) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          reason: "Reason is required.",
        };
      } else if (!isNaN(Number(entry.reason))) {
        rejectionErrors[index] = {
          ...rejectionErrors[index],
          reason: "Reason cannot be numeric.",
        };
      }
      if (entry.correctiveActions) {
        const actionErrors: { [actionIndex: number]: Partial<Action> } = {};
        entry.correctiveActions.forEach((action, actionIndex) => {
          if (action.action || action.responsible || action.dueDate) {
            if (!action.action)
              actionErrors[actionIndex] = {
                ...actionErrors[actionIndex],
                action: "Action is required.",
              };
            if (!action.responsible)
              actionErrors[actionIndex] = {
                ...actionErrors[actionIndex],
                responsible: "Responsible person is required.",
              };
            if (!action.dueDate)
              actionErrors[actionIndex] = {
                ...actionErrors[actionIndex],
                dueDate: "Due date is required.",
              };
            else if (!/^\d{4}-\d{2}-\d{2}$/.test(action.dueDate)) {
              actionErrors[actionIndex] = {
                ...actionErrors[actionIndex],
                dueDate: "Due date must be in YYYY-MM-DD format.",
              };
            }
          }
        });
        if (Object.keys(actionErrors).length > 0) {
          rejectionErrors[index] = {
            ...rejectionErrors[index],
            correctiveActions: actionErrors,
          };
        }
      }
    });

    if (Object.keys(rejectionErrors).length > 0) {
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
      if (action.action || action.responsible || action.dueDate) {
        if (!action.action)
          downtimeActionErrors[index] = {
            ...downtimeActionErrors[index],
            action: "Action is required.",
          };
        if (!action.responsible)
          downtimeActionErrors[index] = {
            ...downtimeActionErrors[index],
            responsible: "Responsible person is required.",
          };
        if (!action.dueDate)
          downtimeActionErrors[index] = {
            ...downtimeActionErrors[index],
            dueDate: "Due date is required.",
          };
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(action.dueDate)) {
          downtimeActionErrors[index] = {
            ...downtimeActionErrors[index],
            dueDate: "Due date must be in YYYY-MM-DD format.",
          };
        }
      }
    });

    if (Object.keys(downtimeActionErrors).length > 0) {
      errors.downtimeCorrectiveActions = downtimeActionErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, downtimeCorrectiveActions]);

  const handleSubmitProduction = useCallback(async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct form errors.",
      });
      return;
    }

    const productionCode = generateNewProductionCode();
    if (!productionCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate production code.",
      });
      return;
    }

    const recordId = generateUUID();
    const rejectionTypesFinal = formData.rejectionEntries
      .filter(
        (entry) =>
          entry.type || entry.quantity || entry.reason || entry.customType || entry.assignedToTeam
      )
      .map((entry) => ({
        entryId: generateUUID(),
        type: entry.type === "Other" ? entry.customType || "Other" : entry.type,
        quantity: Number(entry.quantity) || 0,
        reason: entry.reason || "",
        assignedToTeam: entry.assignedToTeam || "",
        correctiveActions:
          entry.correctiveActions?.filter(
            (action) => action.action && action.responsible && action.dueDate
          ) || [],
      }));

    const defectTypeFinal =
      formData.defectType === "other"
        ? formData.customDefectType
        : formData.defectType;
    const downtimeTypeFinal =
      formData.downtimeType === "other"
        ? formData.customDowntimeType
        : formData.downtimeType;

    const efficiency =
      Number(formData.plannedQty) > 0
        ? Math.min(
            100,
            Math.round(
              (Number(formData.actualQty) / Number(formData.plannedQty)) * 100
            )
          )
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
      rejectedQty: rejectionTypesFinal.reduce(
        (sum, entry) => sum + entry.quantity,
        0
      ),
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
      customDefectType:
        formData.defectType === "other"
          ? formData.customDefectType || null
          : null,
      customDowntimeType:
        formData.downtimeType === "other"
          ? formData.customDowntimeType || null
          : null,
      downtimeCorrectiveActions: downtimeCorrectiveActions.filter(
        (action) => action.action && action.responsible && action.dueDate
      ),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRecord),
      });

      if (response.status === 401) {
        logout();
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please log in again.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setIsAddingProduction(false);
      setFormData({
        ...formInitialState,
        rejectionEntries: [
          {
            type: "",
            quantity: "",
            reason: "",
            customType: "",
            assignedToTeam:"",
            correctiveActions: [],
          },
        ],
      });
      setFormErrors({});
      setCorrectiveActions([
        { id: generateUUID(), action: "", responsible: "", dueDate: "" },
      ]);
      setDowntimeCorrectiveActions([
        { id: generateUUID(), action: "", responsible: "", dueDate: "" },
      ]);

      if (resetFiltersAfterSubmit) {
        setSearchTerm("");
        setFilterDate("");
        setFilterShift("all");
        setFilterStatus("all");
        setFilterProductionType("all");
        setPage(1);
        fetchProductionData();
      } else {
        await fetchProductionData();
      }

      toast({
        title: "Success",
        description: "Production record added successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit record: ${err.message}`,
      });
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

  const getStatusColor = useCallback((status: string) => {
    return (
      {
        completed: "bg-green-100 text-green-800",
        "in-progress": "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
      }[status] || "bg-gray-100 text-gray-800"
    );
  }, []);

  const getEfficiencyColor = useCallback((efficiency: number) => {
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 85) return "text-yellow-600";
    return "text-red-600";
  }, []);

  const getProductionTypeLabel = useCallback((type: string) => {
    return type === "InjectionMolding" ? "Injection Molding" : "Assembly";
  }, []);

  const stats = useMemo(
    () => ({
      totalJobs: productionData.length,
      completed: productionData.filter((item) => item.status === "completed")
        .length,
      totalPlanned: productionData.reduce(
        (acc, item) => acc + item.plannedQty,
        0
      ),
      totalActual: productionData.reduce(
        (acc, item) => acc + item.actualQty,
        0
      ),
      totalRejected: productionData.reduce(
        (acc, item) => acc + (item.rejectedQty || 0),
        0
      ),
      avgEfficiency: productionData.length
        ? Math.round(
            productionData.reduce((acc, item) => acc + item.efficiency, 0) /
              productionData.length
          )
        : 0,
    }),
    [productionData]
  );

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

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
        setPage(newPage);
        setIsPaginating(true);
      }
    },
    [page, totalPages]
  );

  if (Object.values(isLoading).some((loading) => loading)) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        role="status"
        aria-label="Loading initial data"
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productionType" className="font-medium">
                      Production Type *
                    </Label>
                    <Select
                      value={formData.productionType}
                      onValueChange={(value) =>
                        handleInputChange("productionType", value)
                      }
                    >
                      <SelectTrigger
                        id="productionType"
                        className={
                          formErrors.productionType
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.productionType}
                      >
                        <SelectValue placeholder="Select production type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InjectionMolding">
                          Injection Molding
                        </SelectItem>
                        <SelectItem value="Assembly">Assembly</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.productionType && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.productionType}
                      </p>
                    )}
                  </div>
                  {/* <div>
                    <Label htmlFor="productionCode" className="font-medium">
                      Production Code
                    </Label>
                    <Input
                      id="productionCode"
                      value={generateNewProductionCode()}
                      readOnly
                      className="bg-gray-100"
                      aria-readonly="true"
                    />
                  </div> */}
                  <div>
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
                      className={
                        formErrors.date ? "border-red-500" : "border-gray-300"
                      }
                      max={new Date().toISOString().split("T")[0]}
                      aria-invalid={!!formErrors.date}
                    />
                    {formErrors.date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operator" className="font-medium">
                      Operator *
                    </Label>
                    <Select
                      value={formData.operator}
                      onValueChange={(value) =>
                        handleInputChange("operator", value)
                      }
                      disabled={isLoading.employees}
                    >
                      <SelectTrigger
                        id="operator"
                        className={
                          formErrors.operator
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.operator}
                      >
                        <SelectValue
                          placeholder={
                            isLoading.employees
                              ? "Loading..."
                              : "Select Operator"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length ? (
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
                            No employees found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.operator && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.operator}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="supervisor" className="font-medium">
                      Supervisor
                    </Label>
                    <Select
                      value={formData.supervisor}
                      onValueChange={(value) =>
                        handleInputChange("supervisor", value)
                      }
                      disabled={isLoading.employees}
                    >
                      <SelectTrigger
                        id="supervisor"
                        className={
                          formErrors.supervisor
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.supervisor}
                      >
                        <SelectValue
                          placeholder={
                            isLoading.employees
                              ? "Loading..."
                              : "Select Supervisor"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length ? (
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
                            No employees found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.supervisor && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.supervisor}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shift" className="font-medium">
                      Produced Shift *
                    </Label>
                    <Select
                      value={formData.shift}
                      onValueChange={(value) =>
                        handleInputChange("shift", value)
                      }
                    >
                      <SelectTrigger
                        id="shift"
                        className={
                          formErrors.shift
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.shift}
                      >
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Shift A</SelectItem>
                        <SelectItem value="B">Shift B</SelectItem>
                        <SelectItem value="C">Shift C</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.shift && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.shift}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="machineId" className="font-medium">
                      Machine Name *
                    </Label>
                    <Select
                      value={formData.machineId}
                      onValueChange={(value) =>
                        handleInputChange("machineId", value)
                      }
                      disabled={isLoading.machines}
                    >
                      <SelectTrigger
                        id="machineId"
                        className={
                          formErrors.machineId
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.machineId}
                      >
                        <SelectValue
                          placeholder={
                            isLoading.machines ? "Loading..." : "Select machine"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.length ? (
                          machines.map((mac) => (
                            <SelectItem
                              key={mac.machineId}
                              value={mac.machineId}
                            >
                              {mac.machineName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            No Machines found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.machineId && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.machineId}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="productId" className="font-medium">
                      Product Name *
                    </Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) =>
                        handleInputChange("productId", value)
                      }
                      disabled={isLoading.products}
                    >
                      <SelectTrigger
                        id="productId"
                        className={
                          formErrors.productId
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.productId}
                      >
                        <SelectValue
                          placeholder={
                            isLoading.products ? "Loading..." : "Select product"
                          }
                        />
                      </SelectTrigger>
                      {/* <SelectContent>
                        {products.length ? (
                          products.map((prod) => (
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
                        )}
                      </SelectContent> */}
                      <SelectContent>
                        {filteredProducts.length ? (
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
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.productId && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.productId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
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
                      className={
                        formErrors.plannedQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.plannedQty}
                    />
                    {formErrors.plannedQty && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.plannedQty}
                      </p>
                    )}
                  </div>
                  <div>
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
                      className={
                        formErrors.actualQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.actualQty}
                    />
                    {formErrors.actualQty && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.actualQty}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="targetOutput" className="font-medium">
                      Target Output
                    </Label>
                    <Input
                      id="targetOutput"
                      type="number"
                      placeholder="1200"
                      value={formData.targetOutput}
                      onChange={(e) =>
                        handleInputChange("targetOutput", e.target.value)
                      }
                      className={
                        formErrors.targetOutput
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.targetOutput}
                    />
                    {formErrors.targetOutput && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.targetOutput}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="plannedMins" className="font-medium">
                      Planned Minutes
                    </Label>
                    <Input
                      id="plannedMins"
                      type="number"
                      placeholder="480"
                      value={formData.plannedMins}
                      onChange={(e) =>
                        handleInputChange("plannedMins", e.target.value)
                      }
                      className={
                        formErrors.plannedMins
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.plannedMins}
                    />
                    {formErrors.plannedMins && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.plannedMins}
                      </p>
                    )}
                  </div>
                </div>

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
                        <div>
                          <Label
                            htmlFor={`rejectionType-${index}`}
                            className="font-medium"
                          >
                            Rejection Type
                          </Label>
                          <Select
                            value={entry.type}
                            onValueChange={(value) =>
                              handleRejectionEntryChange(index, "type", value)
                            }
                          >
                            <SelectTrigger
                              id={`rejectionType-${index}`}
                              className={
                                formErrors.rejectionEntries?.[index]?.type
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }
                              aria-invalid={
                                !!formErrors.rejectionEntries?.[index]?.type
                              }
                            >
                              <SelectValue placeholder="Select rejection type" />
                            </SelectTrigger>
                            <SelectContent>
                              {rejectionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.rejectionEntries?.[index]?.type && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.rejectionEntries[index].type}
                            </p>
                          )}
                        </div>
                        {entry.type === "Other" && (
                          <div>
                            <Label
                              htmlFor={`customRejectionType-${index}`}
                              className="font-medium"
                            >
                              Custom Rejection Type
                            </Label>
                            <Input
                              id={`customRejectionType-${index}`}
                              placeholder="Specify type"
                              value={entry.customType}
                              onChange={(e) =>
                                handleRejectionEntryChange(
                                  index,
                                  "customType",
                                  e.target.value
                                )
                              }
                              className={
                                formErrors.rejectionEntries?.[index]?.customType
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }
                              aria-invalid={
                                !!formErrors.rejectionEntries?.[index]
                                  ?.customType
                              }
                            />
                            {formErrors.rejectionEntries?.[index]
                              ?.customType && (
                              <p className="text-red-500 text-sm mt-1">
                                {formErrors.rejectionEntries[index].customType}
                              </p>
                            )}
                          </div>
                        )}
                        <div>
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
                            className={
                              formErrors.rejectionEntries?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-300"
                            }
                            aria-invalid={
                              !!formErrors.rejectionEntries?.[index]?.quantity
                            }
                          />
                          {formErrors.rejectionEntries?.[index]?.quantity && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.rejectionEntries[index].quantity}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor={`assignedToTeam-${index}`} className="font-medium">
                            Assign to Team
                          </Label>

                          <Select
                            value={formData.rejectionEntries[index].assignedToTeam}
                            onValueChange={(value) =>
                              handleRejectionEntryChange(index, "assignedToTeam", value)
                            }
                            disabled={isLoading.employees}
                          >
                            <SelectTrigger
                              id={`assignedToTeam-${index}`}
                              className={
                                formErrors.rejectionEntries?.[index]?.assignedToTeam
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }
                              aria-invalid={!!formErrors.rejectionEntries?.[index]?.assignedToTeam}
                            >
                              <SelectValue
                                placeholder={
                                  isLoading.employees ? "Loading..." : "Select Team"
                                }
                              />
                            </SelectTrigger>

                            <SelectContent>
                              {Array.from(new Set(employees.map((emp) => emp.employeeGroup || "")))
                                .filter((group) => group)
                                .map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              {!Array.from(new Set(employees.map((emp) => emp.employeeGroup || "")))
                                .filter((group) => group).length && (
                                <div className="px-2 py-1 text-sm text-gray-500">
                                  No teams found
                                </div>
                              )}
                            </SelectContent>
                          </Select>

                          {formErrors.rejectionEntries?.[index]?.assignedToTeam && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.rejectionEntries[index].assignedToTeam}
                            </p>
                          )}
                        </div>

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
                          className={
                            formErrors.rejectionEntries?.[index]?.reason
                              ? "border-red-500"
                              : "border-gray-300"
                          }
                          aria-invalid={
                            !!formErrors.rejectionEntries?.[index]?.reason
                          }
                        />
                        {formErrors.rejectionEntries?.[index]?.reason && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.rejectionEntries[index].reason}
                          </p>
                        )}
                      </div>
                      {/* <ActionInputs
                        actions={entry.correctiveActions || []}
                        setActions={(actions: Action[]) =>
                          handleRejectionEntryChange(index, "correctiveActions", actions)
                        }
                        title="Corrective Actions for Rejection"
                        employees={employees}
                        errors={formErrors.rejectionEntries?.[index]?.correctiveActions}
                      /> */}
                      <ActionInputs
                        actions={entry.correctiveActions || []}
                        setActions={(newActions: Action[]) =>
                          handleRejectionEntryChange(
                            index,
                            "correctiveActions",
                            newActions
                          )
                        }
                        title="Corrective Actions for Rejection"
                        employees={employees}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="defectType" className="font-medium">
                    Defect Type
                  </Label>
                  <Select
                    value={formData.defectType}
                    onValueChange={(value) =>
                      handleInputChange("defectType", value)
                    }
                    disabled={isLoading.defects || !formData.productionType}
                  >
                    <SelectTrigger
                      id="defectType"
                      className={
                        formErrors.defectType
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.defectType}
                    >
                      <SelectValue
                        placeholder={
                          isLoading.defects
                            ? "Loading..."
                            : !formData.productionType
                            ? "Select production type first"
                            : "Select Defect Type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDefects.map((def) => (
                        <SelectItem key={def.defectId} value={def.name}>
                          {def.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.defectType && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.defectType}
                    </p>
                  )}
                  {formData.defectType === "other" && (
                    <div className="mt-2">
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
                        className={
                          formErrors.customDefectType
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.customDefectType}
                      />
                      {formErrors.customDefectType && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.customDefectType}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded-lg mb-4 relative bg-gray-50">
                  <Label htmlFor="downtimeType" className="font-medium">
                    Downtime Reason
                  </Label>
                  <Select
                    value={formData.downtimeType}
                    onValueChange={(value) =>
                      handleInputChange("downtimeType", value)
                    }
                  >
                    <SelectTrigger
                      id="downtimeType"
                      className={
                        formErrors.downtimeType
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.downtimeType}
                    >
                      <SelectValue placeholder="Select Downtime type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Issue</SelectItem>
                      {downtimeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.downtimeType && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.downtimeType}
                    </p>
                  )}
                  {formData.downtimeType === "other" && (
                    <div className="mt-2">
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
                        className={
                          formErrors.customDowntimeType
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                        aria-invalid={!!formErrors.customDowntimeType}
                      />
                      {formErrors.customDowntimeType && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.customDowntimeType}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.downtimeType !== "none" &&
                    formData.downtimeType && (
                      <div className="mt-3">
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
                          className={
                            formErrors.downtime
                              ? "border-red-500"
                              : "border-gray-300"
                          }
                          aria-invalid={!!formErrors.downtime}
                        />
                        {formErrors.downtime && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.downtime}
                          </p>
                        )}
                        <div className="mt-3">
                          <Label htmlFor="team" className="font-medium">
                            Assign to Team
                          </Label>
                          <Select
                            value={formData.team}
                            onValueChange={(value) =>
                              handleInputChange("team", value)
                            }
                            disabled={isLoading.employees}
                          >
                            <SelectTrigger
                              id="team"
                              className={
                                formErrors.team
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }
                              aria-invalid={!!formErrors.team}
                            >
                              <SelectValue
                                placeholder={
                                  isLoading.employees
                                    ? "Loading..."
                                    : "Select Team"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  employees.map(
                                    (emp) => emp.employeeGroup || ""
                                  )
                                )
                              )
                                .filter((group) => group)
                                .map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              {!Array.from(
                                new Set(
                                  employees.map(
                                    (emp) => emp.employeeGroup || ""
                                  )
                                )
                              ).filter((group) => group).length && (
                                <div className="px-2 py-1 text-sm text-gray-500">
                                  No teams found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.team && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.team}
                            </p>
                          )}
                        </div>
                        <ActionInputs
                          actions={downtimeCorrectiveActions || []} // Fallback to empty array
                          setActions={setDowntimeCorrectiveActions}
                          title="Corrective Actions for Downtime"
                          employees={employees}
                          errors={formErrors.downtimeCorrectiveActions}
                        />
                      </div>
                    )}
                </div>

                <div className="grid ">
                  <div>
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
                      className={
                        formErrors.lumpsQty
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.lumpsQty}
                    />
                    {formErrors.lumpsQty && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.lumpsQty}
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
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
                      className={
                        formErrors.lumpsReason
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.lumpsReason}
                    />
                    {formErrors.lumpsReason && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.lumpsReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* <div>
                  <Label htmlFor="status" className="font-medium">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className={
                        formErrors.status ? "border-red-500" : "border-gray-300"
                      }
                      aria-invalid={!!formErrors.status}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.status}
                    </p>
                  )}
                </div> */}

                {/* <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reset-filters"
                    checked={resetFiltersAfterSubmit}
                    onChange={(e) =>
                      setResetFiltersAfterSubmit(e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <Label htmlFor="reset-filters" className="font-medium">
                    Reset filters after submission
                  </Label>
                </div> */}

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

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="font-medium">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search production..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                  aria-label="Search production records"
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
            <div>
              <Label htmlFor="filterShift" className="font-medium">
                Shift
              </Label>
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger id="filterShift" className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="A">Shift A</SelectItem>
                  <SelectItem value="B">Shift B</SelectItem>
                  <SelectItem value="C">Shift C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterProductionType" className="font-medium">
                Production Type
              </Label>
              <Select
                value={filterProductionType}
                onValueChange={setFilterProductionType}
              >
                <SelectTrigger
                  id="filterProductionType"
                  className="border-gray-300"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="InjectionMolding">
                    Injection Molding
                  </SelectItem>
                  <SelectItem value="Assembly">Assembly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterStatus" className="font-medium">
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus" className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Factory className="h-5 w-5 text-gray-600" />
            Production Records ({productionData.length})
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
          ) : productionData.length === 0 ? (
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
              {productionData.map((record) => (
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
                        aria-label={`Delete production record ${record.recordId}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
                                            , Due: {action.dueDate})
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
                                    {getEmployeeName(action.responsible)}, Due:{" "}
                                    {action.dueDate})
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
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isPaginating}
                    className="border-gray-300"
                    aria-label="Previous page"
                  >
                    {isPaginating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    )}
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || isPaginating}
                    className="border-gray-300"
                    aria-label="Next page"
                  >
                    Next
                    {isPaginating ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ProductionTracking;

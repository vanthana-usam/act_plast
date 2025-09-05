import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { generateTaskFromProduction } from "@/utils/taskAutoGenerator";
import { generateProductionCode } from "@/utils/productionCodeGenerator";
import { useDebounce } from "use-debounce";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/AuthContext";

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
  lumpsReason: string;
  rejectionType: string;
  rejectionReason: string;
  downtime: number;
  downtimeType: string;
  defectType: string;
  targetOutput: number;
  plannedMins: number;
  operator: string;
  supervisor: string;
  status: string;
  efficiency: number;
  team?: string;
  customRejectionType?: string;
  customDefectType?: string;
  customDowntimeType?: string;
}

type ProductionFormData = {
  productionType: string;
  date: string;
  shift: string;
  machineId: string;
  productId: string;
  plannedQty: string;
  producedQty: string;
  targetOutput: string;
  plannedMins: string;
  rejectionType: string;
  customRejectionType: string;
  rejectionQty: string;
  rejectionReason: string;
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
};

type Employee = {
  employeeId: string;
  name: string;
  role?: string;
  employeeGroup?: string;
};

type Machine = {
  machineId: string;
  name: string;
};

type Product = {
  productId: string;
  name: string;
};

type Defect = {
  defectId: string;
  name: string;
  defectType: string;
  status: string;
};

const API_BASE_URL = "http://192.168.1.82:5000";

const downtimeType = [
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

const rejectionTypes = ["Startup", "In_Progress", "Re-Startup"];

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
  const [debouncedFilterProductionType] = useDebounce(filterProductionType, 300);
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingDefects, setIsLoadingDefects] = useState(false);
  const [isLoadingProduction, setIsLoadingProduction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProductionFormData, string>>
  >({});
  const [resetFiltersAfterSubmit, setResetFiltersAfterSubmit] = useState(true);

  const formInitialState: ProductionFormData = useMemo(
    () => ({
      productionType: "",
      date: new Date().toISOString().split("T")[0],
      shift: "",
      machineId: "",
      productId: "",
      plannedQty: "",
      producedQty: "",
      targetOutput: "",
      plannedMins: "",
      rejectionType: "",
      customRejectionType: "",
      rejectionQty: "",
      rejectionReason: "",
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

  const fetchInitialData = useCallback(async () => {
    setIsLoadingEmployees(true);
    setIsLoadingMachines(true);
    setIsLoadingProducts(true);
    setIsLoadingDefects(true);
    try {
      const [employeesRes, machinesRes, productsRes, defectsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/employees`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`${API_BASE_URL}/api/machines`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`${API_BASE_URL}/api/products`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`${API_BASE_URL}/api/defects`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
        ]);

      if (
        employeesRes.status === 401 ||
        machinesRes.status === 401 ||
        productsRes.status === 401 ||
        defectsRes.status === 401
      ) {
        logout();
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });
        return;
      }

      if (!employeesRes.ok || !machinesRes.ok || !productsRes.ok || !defectsRes.ok) {
        throw new Error("Failed to fetch initial data");
      }

      const [employeesData, machinesData, productsData, defectsData] =
        await Promise.all([
          employeesRes.json(),
          machinesRes.json(),
          productsRes.json(),
          defectsRes.json(),
        ]);

      const normalizedDefects = defectsData.map((def: Defect) => ({
        ...def,
        defectType: def.defectType.toLowerCase().replace(/\s+/g, "-"),
      }));

      setEmployees(employeesData);
      setMachines(machinesData);
      setProducts(productsData);
      setDefects(normalizedDefects);
      toast({
        title: "Data Loaded",
        description: "Initial data loaded successfully.",
      });
    } catch (err) {
      console.error("Error fetching initial data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch initial data. Please try again.",
      });
    } finally {
      setIsLoadingEmployees(false);
      setIsLoadingMachines(false);
      setIsLoadingProducts(false);
      setIsLoadingDefects(false);
    }
  }, [token, logout, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getEmployeeName = useCallback(
    (id: string) => {
      const emp = employees.find((e) => e.employeeId === id);
      return emp ? emp.name : id || "Unknown";
    },
    [employees]
  );

  const getMachineName = useCallback(
    (id: string) => {
      const mac = machines.find((e) => e.machineId === id);
      return mac ? mac.name : id || "Unknown";
    },
    [machines]
  );

  const getProductName = useCallback(
    (id: string) => {
      const prod = products.find((p) => p.productId === id);
      return prod ? prod.name : id || "Unknown";
    },
    [products]
  );

  const fetchProductionData = useCallback(async () => {
    setIsLoadingProduction(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearchTerm,
        date: debouncedFilterDate,
        shift: debouncedFilterShift,
        status: debouncedFilterStatus,
        productionType: debouncedFilterProductionType,
        page: page.toString(),
        limit: limit.toString(),
      }).toString();
      const response = await fetch(`${API_BASE_URL}/api/production?${query}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Please log in again.",
          });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const records = data.data?.records || data.records || [];
      const total = data.data?.total || data.total || 0;
      if (!Array.isArray(records)) {
        throw new Error("Invalid response format: records is not an array");
      }
      setProductionData(records);
      setTotalPages(Math.ceil(total / limit) || 1);
      toast({
        title: "Production Data Loaded",
        description: `Successfully loaded ${records.length} production records.`,
      });
    } catch (err: any) {
      console.error("Error fetching production data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch production data: ${err.message}`,
      });
      setProductionData([]);
      setTotalPages(1);
    } finally {
      setIsLoadingProduction(false);
    }
  }, [
    debouncedSearchTerm,
    debouncedFilterDate,
    debouncedFilterShift,
    debouncedFilterStatus,
    debouncedFilterProductionType,
    page,
    token,
    logout,
    toast,
  ]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  const handleInputChange = useCallback(
    (field: keyof ProductionFormData, value: string) => {
      setFormData((prev) => {
        const newFormData = { ...prev, [field]: value };
        const newErrors = { ...formErrors };

        if (newErrors[field]) {
          delete newErrors[field];
        }

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
        if (field === "rejectionType" && value !== "other") {
          newFormData.customRejectionType = "";
          delete newErrors.customRejectionType;
        }

        if (
          field === "downtimeType" &&
          !downtimeType.some((t) => t.value === value) &&
          value !== "none"
        ) {
          newErrors.downtimeType = "Please select a valid downtime type.";
        }
        if (
          field === "defectType" &&
          value !== "other" &&
          value !== "" &&
          !defects.some((def) => def.name === value)
        ) {
          newErrors.defectType = "Please select a valid defect type.";
        }
        if (
          field === "rejectionType" &&
          !rejectionTypes
            .map((t) => t.toLowerCase().replace(/\s+/g, "_"))
            .includes(value.toLowerCase().replace(/\s+/g, "_"))
        ) {
          newErrors.rejectionType = "Please select a valid rejection type.";
        }

        setFormErrors(newErrors);
        return newFormData;
      });
    },
    [defects, formErrors]
  );

  const generateNewProductionCode = useCallback(() => {
    if (
      formData.machineId &&
      formData.date &&
      formData.shift &&
      formData.productionType
    ) {
      const productionTypeForCode =
        formData.productionType === "injection-molding" ? "injection" : "assembly";
      return generateProductionCode(
        getMachineName(formData.machineId),
        getProductName(formData.productId) || "PRODUCT",
        formData.date,
        formData.shift,
        productionTypeForCode
      );
    }
    return "";
  }, [formData, getMachineName, getProductName]);

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof ProductionFormData, string>> = {};
    const requiredFields: (keyof ProductionFormData)[] = [
      "productionType",
      "date",
      "shift",
      "machineId",
      "productId",
      "plannedQty",
      "producedQty",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required.";
      }
    });

    const numericFields: (keyof ProductionFormData)[] = [
      "plannedQty",
      "producedQty",
      "targetOutput",
      "plannedMins",
      "rejectionQty",
      "lumpsQty",
      "downtime",
    ];
    numericFields.forEach((field) => {
      if (formData[field]) {
        const value = parseInt(formData[field]);
        if (isNaN(value) || value < 0) {
          errors[field] = "Must be a non-negative number.";
        }
      }
    });

    if (
      formData.producedQty &&
      formData.plannedQty &&
      parseInt(formData.producedQty) > parseInt(formData.plannedQty)
    ) {
      errors.producedQty = "Produced quantity cannot exceed planned quantity.";
    }

    if (formData.rejectionReason && !isNaN(Number(formData.rejectionReason))) {
      errors.rejectionReason = "Rejection reason cannot be a numeric value.";
    }

    if (formData.defectType === "other" && !formData.customDefectType) {
      errors.customDefectType = "Please specify a custom defect type.";
    }
    if (formData.downtimeType === "other" && !formData.customDowntimeType) {
      errors.customDowntimeType = "Please specify a custom downtime type.";
    }
    if (formData.rejectionType === "other" && !formData.customRejectionType) {
      errors.customRejectionType = "Please specify a custom rejection type.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmitProduction = useCallback(async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting.",
      });
      return;
    }

    const generatedCode = generateNewProductionCode();
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate production code. Please check inputs.",
      });
      return;
    }

    let rejectionTypeFinal = formData.rejectionType;
    if (rejectionTypeFinal === "other") {
      rejectionTypeFinal = formData.customRejectionType;
    }

    let defectTypeFinal = formData.defectType;
    if (defectTypeFinal === "other") {
      defectTypeFinal = formData.customDefectType;
    }

    let downtimeTypeFinal = formData.downtimeType;
    if (downtimeTypeFinal === "other") {
      downtimeTypeFinal = formData.customDowntimeType;
    }

    const efficiency =
      formData.plannedQty && parseInt(formData.plannedQty) > 0
        ? Math.round(
            (parseInt(formData.producedQty) / parseInt(formData.plannedQty)) * 100
          )
        : 0;

    const newRecord = {
      productionCode: generatedCode,
      productionType: formData.productionType,
      date: formData.date,
      shift: formData.shift,
      machineName: getMachineName(formData.machineId),
      product: getProductName(formData.productId),
      plannedQty: parseInt(formData.plannedQty) || 0,
      actualQty: parseInt(formData.producedQty) || 0,
      rejectedQty: parseInt(formData.rejectionQty) || 0,
      lumpsQty: parseInt(formData.lumpsQty) || 0,
      lumpsReason: formData.lumpsReason || null,
      rejectionType: rejectionTypeFinal,
      rejectionReason: formData.rejectionReason || null,
      downtimeType: downtimeTypeFinal || null,
      downtime: parseInt(formData.downtime) || 0,
      defectType: defectTypeFinal || null,
      targetOutput: parseInt(formData.targetOutput) || 0,
      plannedMins: parseInt(formData.plannedMins) || 0,
      operator: formData.operator,
      supervisor: formData.supervisor || "Unknown",
      status: formData.status,
      efficiency: Number(efficiency),
      team: formData.team || null,
      customRejectionType:
        formData.rejectionType === "other" ? formData.customRejectionType || null : null,
      customDefectType:
        formData.defectType === "other" ? formData.customDefectType || null : null,
      customDowntimeType:
        formData.downtimeType === "other" ? formData.customDowntimeType || null : null,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newRecord),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Please log in again.",
          });
          return;
        }
        throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
      }

      setIsAddingProduction(false);
      setFormData(formInitialState);
      setFormErrors({});
      if (resetFiltersAfterSubmit) {
        setSearchTerm("");
        setFilterDate("");
        setFilterShift("all");
        setFilterStatus("all");
        setFilterProductionType("all");
        setPage(1);
      }
      await fetchProductionData();
      toast({
        title: "Success",
        description: "Production record added successfully.",
      });
    } catch (err: any) {
      console.error("Error submitting production record:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit production record: ${err.message || "An unexpected error occurred."}`,
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
  ]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getEfficiencyColor = useCallback((efficiency: number) => {
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 85) return "text-yellow-600";
    return "text-red-600";
  }, []);

  const getProductionTypeLabel = useCallback((type: string) => {
    return type === "injection-molding" ? "Injection Molding" : "Assembly";
  }, []);

  const stats = useMemo(
    () => ({
      totalJobs: productionData.length,
      completed: productionData.filter((item) => item.status === "completed").length,
      totalPlanned: productionData.reduce((acc, item) => acc + item.plannedQty, 0),
      totalActual: productionData.reduce((acc, item) => acc + item.actualQty, 0),
      totalRejected: productionData.reduce((acc, item) => acc + item.rejectedQty, 0),
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

  if (
    isLoadingEmployees ||
    isLoadingMachines ||
    isLoadingProducts ||
    isLoadingDefects ||
    isLoadingProduction
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Production Tracking</h2>
        <Dialog open={isAddingProduction} onOpenChange={setIsAddingProduction}>
          <DialogTrigger asChild>
            <Button onClick={() => toast({ title: "Opening Form", description: "Add a new production entry." })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Production Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Production Entry</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new production record. Required fields are marked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Production Type</Label>
                  <Select
                    value={formData.productionType}
                    onValueChange={(value) => handleInputChange("productionType", value)}
                  >
                    <SelectTrigger className={formErrors.productionType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select production type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injection-molding">Injection Molding</SelectItem>
                      <SelectItem value="assembly">Assembly</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.productionType && (
                    <p className="text-red-500 text-sm">{formErrors.productionType}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Production Code (Auto-Generated)</Label>
                  <Input
                    value={generateNewProductionCode()}
                    placeholder="Will be generated automatically"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Produced Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={formErrors.date ? "border-red-500" : ""}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm">{formErrors.date}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={formData.operator}
                    onValueChange={(value) => handleInputChange("operator", value)}
                    disabled={isLoadingEmployees}
                  >
                    <SelectTrigger className={formErrors.operator ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={isLoadingEmployees ? "Loading..." : "Select Operator"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.operator && (
                    <p className="text-red-500 text-sm">{formErrors.operator}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Supervisor</Label>
                  <Select
                    value={formData.supervisor}
                    onValueChange={(value) => handleInputChange("supervisor", value)}
                    disabled={isLoadingEmployees}
                  >
                    <SelectTrigger className={formErrors.supervisor ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={isLoadingEmployees ? "Loading..." : "Select Supervisor"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.supervisor && (
                    <p className="text-red-500 text-sm">{formErrors.supervisor}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Assigned Team</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value) => handleInputChange("team", value)}
                    disabled={isLoadingEmployees}
                  >
                    <SelectTrigger className={formErrors.team ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={isLoadingEmployees ? "Loading..." : "Select Team"}
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
                    </SelectContent>
                  </Select>
                  {formErrors.team && (
                    <p className="text-red-500 text-sm">{formErrors.team}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Produced Shift</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => handleInputChange("shift", value)}
                  >
                    <SelectTrigger className={formErrors.shift ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Shift A</SelectItem>
                      <SelectItem value="B">Shift B</SelectItem>
                      <SelectItem value="C">Shift C</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.shift && (
                    <p className="text-red-500 text-sm">{formErrors.shift}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Machine Name</Label>
                  <Select
                    value={formData.machineId}
                    onValueChange={(value) => handleInputChange("machineId", value)}
                    disabled={isLoadingMachines}
                  >
                    <SelectTrigger className={formErrors.machineId ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={isLoadingMachines ? "Loading..." : "Select machine"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((mac) => (
                        <SelectItem key={mac.machineId} value={mac.machineId}>
                          {mac.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.machineId && (
                    <p className="text-red-500 text-sm">{formErrors.machineId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => handleInputChange("productId", value)}
                    disabled={isLoadingProducts}
                  >
                    <SelectTrigger className={formErrors.productId ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={isLoadingProducts ? "Loading..." : "Select product"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.productId} value={prod.productId}>
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.productId && (
                    <p className="text-red-500 text-sm">{formErrors.productId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Planned Quantity</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.plannedQty}
                    onChange={(e) => handleInputChange("plannedQty", e.target.value)}
                    className={formErrors.plannedQty ? "border-red-500" : ""}
                  />
                  {formErrors.plannedQty && (
                    <p className="text-red-500 text-sm">{formErrors.plannedQty}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Produced Quantity</Label>
                  <Input
                    type="number"
                    placeholder="950"
                    value={formData.producedQty}
                    onChange={(e) => handleInputChange("producedQty", e.target.value)}
                    className={formErrors.producedQty ? "border-red-500" : ""}
                  />
                  {formErrors.producedQty && (
                    <p className="text-red-500 text-sm">{formErrors.producedQty}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Target Output</Label>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={formData.targetOutput}
                    onChange={(e) => handleInputChange("targetOutput", e.target.value)}
                    className={formErrors.targetOutput ? "border-red-500" : ""}
                  />
                  {formErrors.targetOutput && (
                    <p className="text-red-500 text-sm">{formErrors.targetOutput}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Planned Minutes</Label>
                  <Input
                    type="number"
                    placeholder="480"
                    value={formData.plannedMins}
                    onChange={(e) => handleInputChange("plannedMins", e.target.value)}
                    className={formErrors.plannedMins ? "border-red-500" : ""}
                  />
                  {formErrors.plannedMins && (
                    <p className="text-red-500 text-sm">{formErrors.plannedMins}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rejection Type</Label>
                <Select
                  value={formData.rejectionType}
                  onValueChange={(value) => handleInputChange("rejectionType", value)}
                >
                  <SelectTrigger className={formErrors.rejectionType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select rejection type" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "_")}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.rejectionType && (
                  <p className="text-red-500 text-sm">{formErrors.rejectionType}</p>
                )}
                {formData.rejectionType.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label>Rejection Quantity</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={formData.rejectionQty}
                        onChange={(e) => handleInputChange("rejectionQty", e.target.value)}
                        className={formErrors.rejectionQty ? "border-red-500" : ""}
                      />
                      {formErrors.rejectionQty && (
                        <p className="text-red-500 text-sm">{formErrors.rejectionQty}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Rejection Reason</Label>
                      <Textarea
                        placeholder="Describe the reason for Rejection"
                        rows={2}
                        value={formData.rejectionReason}
                        onChange={(e) => handleInputChange("rejectionReason", e.target.value)}
                        className={formErrors.rejectionReason ? "border-red-500" : ""}
                      />
                      {formErrors.rejectionReason && (
                        <p className="text-red-500 text-sm">{formErrors.rejectionReason}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Defect Type</Label>
                <Select
                  value={formData.defectType}
                  onValueChange={(value) => handleInputChange("defectType", value)}
                  disabled={isLoadingDefects || !formData.productionType}
                >
                  <SelectTrigger className={formErrors.defectType ? "border-red-500" : ""}>
                    <SelectValue
                      placeholder={
                        isLoadingDefects
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
                  <p className="text-red-500 text-sm">{formErrors.defectType}</p>
                )}
                {formData.defectType === "other" && (
                  <div className="pt-2">
                    <Label>Please specify the Defect Type</Label>
                    <Textarea
                      placeholder="Enter custom defect type"
                      value={formData.customDefectType}
                      onChange={(e) => handleInputChange("customDefectType", e.target.value)}
                      className={formErrors.customDefectType ? "border-red-500" : ""}
                    />
                    {formErrors.customDefectType && (
                      <p className="text-red-500 text-sm">{formErrors.customDefectType}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Downtime Reason</Label>
                <Select
                  value={formData.downtimeType}
                  onValueChange={(value) => handleInputChange("downtimeType", value)}
                >
                  <SelectTrigger className={formErrors.downtimeType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Downtime type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Issue</SelectItem>
                    {downtimeType.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.downtimeType && (
                  <p className="text-red-500 text-sm">{formErrors.downtimeType}</p>
                )}
                {formData.downtimeType === "other" && (
                  <div className="pt-2">
                    <Label>Please specify the Downtime Type</Label>
                    <Textarea
                      placeholder="Enter custom downtime type"
                      value={formData.customDowntimeType}
                      onChange={(e) => handleInputChange("customDowntimeType", e.target.value)}
                      className={formErrors.customDowntimeType ? "border-red-500" : ""}
                    />
                    {formErrors.customDowntimeType && (
                      <p className="text-red-500 text-sm">{formErrors.customDowntimeType}</p>
                    )}
                  </div>
                )}
                {formData.downtimeType !== "none" && formData.downtimeType.length > 0 && (
                  <div className="space-y-2">
                    <Label>Downtime (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.downtime}
                      onChange={(e) => handleInputChange("downtime", e.target.value)}
                      className={formErrors.downtime ? "border-red-500" : ""}
                    />
                    {formErrors.downtime && (
                      <p className="text-red-500 text-sm">{formErrors.downtime}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid">
                <div className="space-y-2">
                  <Label>Lumps Quantity</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.lumpsQty}
                    onChange={(e) => handleInputChange("lumpsQty", e.target.value)}
                    className={formErrors.lumpsQty ? "border-red-500" : ""}
                  />
                  {formErrors.lumpsQty && (
                    <p className="text-red-500 text-sm">{formErrors.lumpsQty}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Lumps Reason</Label>
                  <Textarea
                    placeholder="Describe the reason for lumps (if applicable)"
                    rows={2}
                    value={formData.lumpsReason}
                    onChange={(e) => handleInputChange("lumpsReason", e.target.value)}
                    className={formErrors.lumpsReason ? "border-red-500" : ""}
                  />
                  {formErrors.lumpsReason && (
                    <p className="text-red-500 text-sm">{formErrors.lumpsReason}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-red-500 text-sm">{formErrors.status}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reset-filters"
                  checked={resetFiltersAfterSubmit}
                  onChange={(e) => setResetFiltersAfterSubmit(e.target.checked)}
                />
                <Label htmlFor="reset-filters">Reset filters after submission</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingProduction(false);
                  toast({ title: "Cancelled", description: "Production entry form closed." });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitProduction} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Save & Generate Tasks"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalJobs}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalPlanned.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actual</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.totalActual.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalRejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(stats.avgEfficiency)}`}>
                  {stats.avgEfficiency}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search production..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Production Type</Label>
              <Select value={filterProductionType} onValueChange={setFilterProductionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="injection-molding">Injection Molding</SelectItem>
                  <SelectItem value="assembly">Assembly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
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

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Production Records ({productionData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productionData.length === 0 && !isLoadingProduction ? (
            <div className="text-center py-4 text-gray-600">
              No production records found for the selected filters.
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
                      <div className="bg-blue-50 px-3 py-1 rounded-lg">
                        <span className="text-sm font-bold text-blue-900">
                          {record.productionCode || "N/A"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{record.product}</h3>
                      <Badge variant="outline">{getProductionTypeLabel(record.productionType)}</Badge>
                      <Badge variant="outline">Shift {record.shift}</Badge>
                      <Badge variant="outline">{record.machineName}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                      <span className={`text-sm font-bold ${getEfficiencyColor(record.efficiency)}`}>
                        {record.efficiency}% Efficiency
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Planned Qty</p>
                      <p className="text-xl font-bold text-green-900">
                        {record.plannedQty.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Actual Qty</p>
                      <p className="text-xl font-bold text-blue-900">
                        {record.actualQty.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">Target Output</p>
                      <p className="text-xl font-bold text-purple-900">
                        {record.targetOutput.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Rejected Qty</p>
                      <p className="text-xl font-bold text-red-900">{record.rejectedQty}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">Lumps Qty</p>
                      <p className="text-xl font-bold text-orange-900">{record.lumpsQty}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">Downtime</p>
                      <p className="text-lg font-bold text-gray-900">{record.downtime} min</p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-indigo-800">Planned Minutes</p>
                      <p className="text-lg font-bold text-indigo-900">{record.plannedMins} min</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-pink-800">Rejection Type</p>
                      <p className="text-sm font-bold text-pink-900">{record.rejectionType}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-cyan-800">Defect Type</p>
                      <p className="text-sm font-bold text-cyan-900">{record.defectType}</p>
                    </div>
                  </div>

                  {(record.rejectionReason || record.lumpsReason) && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-800 mb-2">Issues Reported</h4>
                          {record.rejectionReason && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-yellow-800">Rejection:</p>
                              <p className="text-yellow-700 text-sm">{record.rejectionReason}</p>
                            </div>
                          )}
                          {record.lumpsReason && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-yellow-800">Lumps:</p>
                              <p className="text-yellow-700 text-sm">{record.lumpsReason}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                              {downtimeType.find((type) => type.value === record.downtimeType)?.label ||
                                "Unknown"}
                            </Badge>
                            <span className="text-xs text-yellow-600">
                              → Task automatically created for concerned team
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Operator: <span className="font-medium">{getEmployeeName(record.operator)}</span> | Supervisor:{" "}
                      <span className="font-medium">{getEmployeeName(record.supervisor)}</span>
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <Button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ProductionTracking;
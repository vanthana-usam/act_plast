import React, { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Settings,
  Package,
  Users,
  Wrench,
  Clock,
  Loader2,
  Download,
  AlertTriangle,
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
import { useAuth } from "@/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { useTaskContext } from "@/TaskContext";

// Define interfaces for type safety
interface Mold {
  moldId: string;
  name: string;
  dimension: string;
  hotRunnerZones: number;
  sprueRadius: number;
  gateSequence: number;
  pmShotCount: number;
  openingShotCount: number;
  cores: number;
  ejectorType: string;
  status: string;
}

interface Machine {
  machineId: string;
  machineName: string;
  description: string;
  tieBarDistance: string;
  cores: number;
  maxMoldHeight: number;
  maxDaylight: number;
  screwDia: number;
  ldRatio: number;
  screwType: string;
  shotSize: number;
  screwStrokeLength: number;
  ejectorStrokeLength: number;
  minMoldHeight: number;
  hopperCapacity: number;
  status: string;
}

interface Product {
  productId: string;
  name: string;
  cycleTime: number;
  material: string;
  partWeight: number;
  runnerWeight: number;
  cavities: number;
  packingMethod: string;
  packingQty: number;
  status: string;
  machineId: string;
}

interface Employee {
  employeeId: number;
  name: string;
  role: string;
  email: string;
  employeeGroup: string;
  status: string;
}

interface Defect {
  defectId: string;
  name: string;
  defectType: string;
}

interface Changeover {
  changeoverId: string;
  moldId: string;
  machineId: string;
  productId: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface SMP {
  smpId: string;
  name: string;
  description: string;
  status: string;
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

const FormField = memo<FormFieldProps>(
  ({
    label,
    id,
    type = "text",
    value,
    onChange,
    placeholder,
    options,
    required,
    error,
    onBlur,
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {options ? (
        <Select value={value?.toString() ?? ""} onValueChange={onChange}>
          <SelectTrigger
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  )
);
FormField.displayName = "FormField";

const MasterData: React.FC = () => {
  const { token } = useAuth();
  const { refreshTaskCount } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [moldData, setMoldData] = useState<Mold[]>([]);
  const [machineData, setMachineData] = useState<Machine[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [defectData, setDefectData] = useState<Defect[]>([]);
  const [changeoverData, setChangeoverData] = useState<Changeover[]>([]);
  const [smpData, setSmpData] = useState<SMP[]>([]);
  const [isAddingMold, setIsAddingMold] = useState(false);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isAddingDefect, setIsAddingDefect] = useState(false);
  const [isAddingChangeover, setIsAddingChangeover] = useState(false);
  const [isAddingSmp, setIsAddingSmp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMold, setEditingMold] = useState<Mold | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [editingChangeover, setEditingChangeover] = useState<Changeover | null>(
    null
  );
  const [editingSmp, setEditingSmp] = useState<SMP | null>(null);
  const [isSubmittingMold, setIsSubmittingMold] = useState(false);
  const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [isSubmittingDefect, setIsSubmittingDefect] = useState(false);
  const [isSubmittingChangeover, setIsSubmittingChangeover] = useState(false);
  const [isSubmittingSmp, setIsSubmittingSmp] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [moldPage, setMoldPage] = useState(1);
  const [machinePage, setMachinePage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [employeePage, setEmployeePage] = useState(1);
  const [defectPage, setDefectPage] = useState(1);
  const [changeoverPage, setChangeoverPage] = useState(1);
  const [smpPage, setSmpPage] = useState(1);
  const [isLoadingMolds, setIsLoadingMolds] = useState(false);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingDefects, setIsLoadingDefects] = useState(false);
  const [isLoadingChangeovers, setIsLoadingChangeovers] = useState(false);
  const [isLoadingSmps, setIsLoadingSmps] = useState(false);
  const [moldFormErrors, setMoldFormErrors] = useState<
    Partial<Record<keyof typeof moldForm, string>>
  >({});
  const [machineFormErrors, setMachineFormErrors] = useState<
    Partial<Record<keyof typeof machineForm, string>>
  >({});
  const [productFormErrors, setProductFormErrors] = useState<
    Partial<Record<keyof typeof productForm, string>>
  >({});
  const [employeeFormErrors, setEmployeeFormErrors] = useState<
    Partial<Record<keyof typeof employeeForm, string>>
  >({});
  const [defectFormErrors, setDefectFormErrors] = useState<
    Partial<Record<keyof typeof defectForm, string>>
  >({});
  const [changeoverFormErrors, setChangeoverFormErrors] = useState<
    Partial<Record<keyof typeof changeoverForm, string>>
  >({});
  const [smpFormErrors, setSmpFormErrors] = useState<
    Partial<Record<keyof typeof smpForm, string>>
  >({});
  const itemsPerPage = 10;

    useEffect(()=>{
    refreshTaskCount();
  },[])

  const [moldForm, setMoldForm] = useState<Partial<Mold>>({
    name: "",
    dimension: "",
    hotRunnerZones: "",
    sprueRadius: "",
    gateSequence: "",
    pmShotCount: "",
    openingShotCount: "",
    cores: "",
    ejectorType: "",
    status: "Active",
  });
  const [machineForm, setMachineForm] = useState<Partial<Machine>>({
    machineName: "",
    description: "",
    tieBarDistance: "",
    cores: "",
    maxMoldHeight: "",
    maxDaylight: "",
    screwDia: "",
    ldRatio: "",
    screwType: "",
    shotSize: "",
    screwStrokeLength: "",
    ejectorStrokeLength: "",
    minMoldHeight: "",
    hopperCapacity: "",
    status: "Running",
  });
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    machineId: "",
    cycleTime: "",
    material: "",
    partWeight: "",
    runnerWeight: "",
    cavities: "",
    packingMethod: "",
    packingQty: "",
    status: "Active",
  });
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
    employeeGroup: "",
    status: "Active",
  });
  const [defectForm, setDefectForm] = useState({
    name: "",
    defectType: "",
  });
  const [changeoverForm, setChangeoverForm] = useState({
    moldId: "",
    machineId: "",
    productId: "",
    startTime: "",
    endTime: "",
    status: "Scheduled",
  });
  const [smpForm, setSmpForm] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const employeeGroups = [
    "Operator",
    "PDI Inspector",
    "Production",
    "Maintenance",
    "Quality",
    "HOD",
    "Admin",
  ];

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

  // Validation functions
  const validateNonNegativeNumber = useCallback(
    (value: string, fieldName: string): string | null => {
      if (!value) return null; // Allow empty for optional fields
      const num = parseFloat(value);
      if (isNaN(num)) {
        return `${fieldName} must be a valid number.`;
      }
      if (num < 0) {
        return `${fieldName} cannot be negative.`;
      }
      return null;
    },
    []
  );

  const validateEmail = useCallback((email: string): string | null => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return "Invalid email format.";
    }
    return null;
  }, []);

  const validatePassword = useCallback(
    (password: string, isEditing: boolean): string | null => {
      if (!password && !isEditing) {
        return "Password is required for new employees.";
      }
      if (password && password.length < 8) {
        return "Password must be at least 8 characters long.";
      }
      return null;
    },
    []
  );

  const validateMoldForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof moldForm, string>> = {};

    if (!moldForm.name) errors.name = "Mold name is required.";
    if (!moldForm.dimension) errors.dimension = "Mold dimension is required.";
    let err = validateNonNegativeNumber(
      moldForm.hotRunnerZones as string,
      "Hot Runner Zones"
    );
    if (err) errors.hotRunnerZones = err;
    err = validateNonNegativeNumber(
      moldForm.sprueRadius as string,
      "Sprue Radius"
    );
    if (err) errors.sprueRadius = err;
    err = validateNonNegativeNumber(
      moldForm.gateSequence as string,
      "Gate Sequence"
    );
    if (err) errors.gateSequence = err;
    err = validateNonNegativeNumber(
      moldForm.pmShotCount as string,
      "PM Shot Count"
    );
    if (err) errors.pmShotCount = err;
    err = validateNonNegativeNumber(
      moldForm.openingShotCount as string,
      "Opening Shot Count"
    );
    if (err) errors.openingShotCount = err;
    err = validateNonNegativeNumber(moldForm.cores as string, "Cores");
    if (err) errors.cores = err;

    setMoldFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [moldForm, validateNonNegativeNumber]);

  const validateMachineForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof machineForm, string>> = {};

    if (!machineForm.machineName)
      errors.machineName = "Machine name is required.";
    if (!machineForm.tieBarDistance)
      errors.tieBarDistance = "Tie bar distance is required.";
    let err = validateNonNegativeNumber(machineForm.cores as string, "Cores");
    if (err) errors.cores = err;
    err = validateNonNegativeNumber(
      machineForm.maxMoldHeight as string,
      "Max Mold Height"
    );
    if (err) errors.maxMoldHeight = err;
    err = validateNonNegativeNumber(
      machineForm.maxDaylight as string,
      "Max Daylight"
    );
    if (err) errors.maxDaylight = err;
    err = validateNonNegativeNumber(
      machineForm.screwDia as string,
      "Screw Diameter"
    );
    if (err) errors.screwDia = err;
    err = validateNonNegativeNumber(machineForm.ldRatio as string, "L/D Ratio");
    if (err) errors.ldRatio = err;
    err = validateNonNegativeNumber(
      machineForm.shotSize as string,
      "Shot Size"
    );
    if (err) errors.shotSize = err;
    err = validateNonNegativeNumber(
      machineForm.screwStrokeLength as string,
      "Screw Stroke Length"
    );
    if (err) errors.screwStrokeLength = err;
    err = validateNonNegativeNumber(
      machineForm.ejectorStrokeLength as string,
      "Ejector Stroke Length"
    );
    if (err) errors.ejectorStrokeLength = err;
    err = validateNonNegativeNumber(
      machineForm.minMoldHeight as string,
      "Min Mold Height"
    );
    if (err) errors.minMoldHeight = err;
    err = validateNonNegativeNumber(
      machineForm.hopperCapacity as string,
      "Hopper Capacity"
    );
    if (err) errors.hopperCapacity = err;

    setMachineFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [machineForm, validateNonNegativeNumber]);

  const validateProductForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof productForm, string>> = {};

    if (!productForm.name) errors.name = "Product name is required.";
    if (!productForm.machineId) errors.machineId = "Machine is required.";
    if (!productForm.material) errors.material = "Material is required.";
    let err = validateNonNegativeNumber(
      productForm.cycleTime as string,
      "Cycle Time"
    );
    if (err) errors.cycleTime = err;
    err = validateNonNegativeNumber(
      productForm.partWeight as string,
      "Part Weight"
    );
    if (err) errors.partWeight = err;
    err = validateNonNegativeNumber(
      productForm.runnerWeight as string,
      "Runner Weight"
    );
    if (err) errors.runnerWeight = err;
    err = validateNonNegativeNumber(productForm.cavities as string, "Cavities");
    if (err) errors.cavities = err;
    err = validateNonNegativeNumber(
      productForm.packingQty as string,
      "Packing Quantity"
    );
    if (err) errors.packingQty = err;

    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [productForm, validateNonNegativeNumber]);

  const validateEmployeeForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof employeeForm, string>> = {};

    if (!employeeForm.name) errors.name = "Employee name is required.";
    if (!employeeForm.email) errors.email = "Email is required.";
    else {
      const emailErr = validateEmail(employeeForm.email);
      if (emailErr) errors.email = emailErr;
    }
    if (!employeeForm.employeeGroup)
      errors.employeeGroup = "Employee group is required.";
    const passErr = validatePassword(employeeForm.password, !!editingEmployee);
    if (passErr) errors.password = passErr;

    setEmployeeFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [employeeForm, editingEmployee, validateEmail, validatePassword]);

  const validateDefectForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof defectForm, string>> = {};

    if (!defectForm.name) errors.name = "Defect name is required.";
    if (!defectForm.defectType) errors.defectType = "Defect type is required.";

    setDefectFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [defectForm]);

  const validateChangeoverForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof changeoverForm, string>> = {};

    if (!changeoverForm.moldId) errors.moldId = "Mold is required.";
    if (!changeoverForm.machineId) errors.machineId = "Machine is required.";
    if (!changeoverForm.productId) errors.productId = "Product is required.";
    if (!changeoverForm.startTime) errors.startTime = "Start time is required.";
    if (!changeoverForm.endTime) errors.endTime = "End time is required.";

    setChangeoverFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [changeoverForm]);

  const validateSmpForm = useCallback(() => {
    const errors: Partial<Record<keyof typeof smpForm, string>> = {};

    if (!smpForm.name) errors.name = "SMP name is required.";
    if (!smpForm.description) errors.description = "Description is required.";

    setSmpFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [smpForm]);

  // Real-time validation on blur
  const handleMoldInputBlur = useCallback(() => {
    validateMoldForm();
  }, [validateMoldForm]);

  const handleMachineInputBlur = useCallback(() => {
    validateMachineForm();
  }, [validateMachineForm]);

  const handleProductInputBlur = useCallback(() => {
    validateProductForm();
  }, [validateProductForm]);

  const handleEmployeeInputBlur = useCallback(() => {
    validateEmployeeForm();
  }, [validateEmployeeForm]);

  const handleDefectInputBlur = useCallback(() => {
    validateDefectForm();
  }, [validateDefectForm]);

  const handleChangeoverInputBlur = useCallback(() => {
    validateChangeoverForm();
  }, [validateChangeoverForm]);

  const handleSmpInputBlur = useCallback(() => {
    validateSmpForm();
  }, [validateSmpForm]);

  const fetchMolds = useCallback(async () => {
    setIsLoadingMolds(true);
    try {
      const query = `?page=${moldPage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/molds${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMoldData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch molds");
      }
    } catch (err) {
      setError("Failed to load molds. Displaying cached data.");
      toast.error("Failed to load molds.");
    } finally {
      setIsLoadingMolds(false);
    }
  }, [moldPage, searchTerm, token]);

  const fetchMachines = useCallback(async () => {
    setIsLoadingMachines(true);
    try {
      const query = `?page=${machinePage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/machines${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMachineData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch machines");
      }
    } catch (err) {
      setError("Failed to load machines. Displaying cached data.");
      toast.error("Failed to load machines.");
    } finally {
      setIsLoadingMachines(false);
    }
  }, [machinePage, searchTerm, token]);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const query = `?page=${productPage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/products${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProductData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (err) {
      setError("Failed to load products. Displaying cached data.");
      toast.error("Failed to load products.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [productPage, searchTerm, token]);

  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true);
    try {
      let query = `?page=${employeePage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      if (selectedGroup !== "all") {
        query += `&employeeGroup=${encodeURIComponent(selectedGroup)}`;
      }
      const response = await fetch(`${API_BASE_URL}/employees${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployeeData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch employees");
      }
    } catch (err) {
      setError("Failed to load employees. Displaying cached data.");
      toast.error("Failed to load employees.");
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [employeePage, searchTerm, selectedGroup, token]);

  const fetchDefects = useCallback(async () => {
    setIsLoadingDefects(true);
    try {
      const query = `?page=${defectPage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/defects${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDefectData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch defects");
      }
    } catch (err) {
      setError("Failed to load defects. Displaying cached data.");
      toast.error("Failed to load defects.");
    } finally {
      setIsLoadingDefects(false);
    }
  }, [defectPage, searchTerm, token]);

  const fetchChangeovers = useCallback(async () => {
    setIsLoadingChangeovers(true);
    try {
      const query = `?page=${changeoverPage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/changeover${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChangeoverData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch changeovers");
      }
    } catch (err) {
      setError("Failed to load changeovers. Displaying cached data.");
      toast.error("Failed to load changeovers.");
    } finally {
      setIsLoadingChangeovers(false);
    }
  }, [changeoverPage, searchTerm, token]);

  const fetchSmps = useCallback(async () => {
    setIsLoadingSmps(true);
    try {
      const query = `?page=${smpPage}&limit=${itemsPerPage}${
        searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
      }`;
      const response = await fetch(`${API_BASE_URL}/smps${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSmpData(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch smps");
      }
    } catch (err) {
      setError("Failed to load smps. Displaying cached data.");
      toast.error("Failed to load smps.");
    } finally {
      setIsLoadingSmps(false);
    }
  }, [smpPage, searchTerm, token]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      Promise.all([
        fetchMolds(),
        fetchMachines(),
        fetchProducts(),
        fetchEmployees(),
        fetchDefects(),
        // fetchChangeovers(),
        // fetchSmps(),
      ]);
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [
    searchTerm,
    moldPage,
    machinePage,
    productPage,
    employeePage,
    defectPage,
    changeoverPage,
    smpPage,
    selectedGroup,
  ]);

  useEffect(() => {
    setEmployeePage(1);
  }, [selectedGroup]);

  const handleInputChange = useCallback(
    <T extends object>(
      form: T,
      setForm: React.Dispatch<React.SetStateAction<T>>,
      field: keyof T,
      value: string
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  const handleSubmitMold = useCallback(async () => {
    clearError();
    if (!validateMoldForm()) {
      toast.error("Please correct the errors in the mold form.");
      return;
    }

    setIsSubmittingMold(true);
    try {
      const url = editingMold
        ? `${API_BASE_URL}/molds/${editingMold.moldId}`
        : `${API_BASE_URL}/molds`;
      const method = editingMold ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...moldForm,
          hotRunnerZones: parseInt(moldForm.hotRunnerZones as string) || 0,
          sprueRadius: parseFloat(moldForm.sprueRadius as string) || 0,
          gateSequence: parseInt(moldForm.gateSequence as string) || 0,
          pmShotCount: parseInt(moldForm.pmShotCount as string) || 0,
          openingShotCount: parseInt(moldForm.openingShotCount as string) || 0,
          cores: parseInt(moldForm.cores as string) || 0,
        }),
      });
      if (response.ok) {
        toast.success(
          editingMold
            ? "Mold updated successfully!"
            : "Mold added successfully!"
        );
        setIsAddingMold(false);
        setEditingMold(null);
        setMoldForm({
          name: "",
          dimension: "",
          hotRunnerZones: "",
          sprueRadius: "",
          gateSequence: "",
          pmShotCount: "",
          openingShotCount: "",
          cores: "",
          ejectorType: "",
          status: "Active",
        });
        setMoldFormErrors({});
        await fetchMolds();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingMold ? "update" : "add"} mold.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${editingMold ? "update" : "add"} mold.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingMold(false);
    }
  }, [moldForm, editingMold, fetchMolds, clearError, token, validateMoldForm]);

  const handleDeleteMold = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this mold?")) return;
      try {
        const response = await fetch(`${API_BASE_URL}/molds/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Mold deleted successfully!");
          fetchMolds();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message || errorData.error || "Failed to delete mold.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete mold.");
        toast.error("Failed to delete mold.");
      }
    },
    [token, fetchMolds]
  );

  const handleSubmitMachine = useCallback(async () => {
    clearError();
    if (!validateMachineForm()) {
      toast.error("Please correct the errors in the machine form.");
      return;
    }

    setIsSubmittingMachine(true);
    try {
      const url = editingMachine
        ? `${API_BASE_URL}/machines/${editingMachine.machineId}`
        : `${API_BASE_URL}/machines`;
      const method = editingMachine ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...machineForm,
          cores: parseInt(machineForm.cores as string) || 0,
          maxMoldHeight: parseInt(machineForm.maxMoldHeight as string) || 0,
          maxDaylight: parseInt(machineForm.maxDaylight as string) || 0,
          screwDia: parseInt(machineForm.screwDia as string) || 0,
          ldRatio: parseInt(machineForm.ldRatio as string) || 0,
          shotSize: parseInt(machineForm.shotSize as string) || 0,
          screwStrokeLength:
            parseInt(machineForm.screwStrokeLength as string) || 0,
          ejectorStrokeLength:
            parseInt(machineForm.ejectorStrokeLength as string) || 0,
          minMoldHeight: parseInt(machineForm.minMoldHeight as string) || 0,
          hopperCapacity: parseInt(machineForm.hopperCapacity as string) || 0,
        }),
      });

      if (response.ok) {
        toast.success(
          editingMachine
            ? "Machine updated successfully!"
            : "Machine added successfully!"
        );
        setIsAddingMachine(false);
        setEditingMachine(null);
        setMachineForm({
          machineName: "",
          description: "",
          tieBarDistance: "",
          cores: "",
          maxMoldHeight: "",
          maxDaylight: "",
          screwDia: "",
          ldRatio: "",
          screwType: "",
          shotSize: "",
          screwStrokeLength: "",
          ejectorStrokeLength: "",
          minMoldHeight: "",
          hopperCapacity: "",
          status: "Running",
        });
        setMachineFormErrors({});
        await fetchMachines();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingMachine ? "update" : "add"} machine.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${
        editingMachine ? "update" : "add"
      } machine.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingMachine(false);
    }
  }, [
    machineForm,
    editingMachine,
    clearError,
    token,
    validateMachineForm,
    fetchMachines,
  ]);

  const handleDeleteMachine = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this machine?"))
        return;
      try {
        const response = await fetch(`${API_BASE_URL}/machines/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Machine deleted successfully!");
          fetchMachines();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message || errorData.error || "Failed to delete machine.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete machine.");
        toast.error("Failed to delete machine.");
      }
    },
    [token, fetchMachines]
  );

  const handleSubmitProduct = useCallback(async () => {
    clearError();
    if (!validateProductForm()) {
      toast.error("Please correct the errors in the product form.");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const url = editingProduct
        ? `${API_BASE_URL}/products/${editingProduct.productId}`
        : `${API_BASE_URL}/products`;
      const method = editingProduct ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productForm,
          cycleTime: parseInt(productForm.cycleTime as string) || 0,
          partWeight: parseFloat(productForm.partWeight as string) || 0,
          runnerWeight: parseFloat(productForm.runnerWeight as string) || 0,
          cavities: parseInt(productForm.cavities as string) || 0,
          packingQty: parseInt(productForm.packingQty as string) || 0,
        }),
      });
      if (response.ok) {
        toast.success(
          editingProduct
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        setIsAddingProduct(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          machineId: "",
          cycleTime: "",
          material: "",
          partWeight: "",
          runnerWeight: "",
          cavities: "",
          packingMethod: "",
          packingQty: "",
          status: "Active",
        });
        setProductFormErrors({});
        await fetchProducts();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingProduct ? "update" : "add"} product.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${
        editingProduct ? "update" : "add"
      } product.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingProduct(false);
    }
  }, [
    productForm,
    editingProduct,
    clearError,
    token,
    validateProductForm,
    fetchProducts,
  ]);

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this product?"))
        return;
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Product deleted successfully!");
          fetchProducts();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message || errorData.error || "Failed to delete product.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete product.");
        toast.error("Failed to delete product.");
      }
    },
    [token, fetchProducts]
  );

  const handleSubmitEmployee = useCallback(async () => {
    clearError();
    if (!validateEmployeeForm()) {
      toast.error("Please correct the errors in the employee form.");
      return;
    }

    setIsSubmittingEmployee(true);
    try {
      if (employeeForm.email) {
        let query = `?search=${encodeURIComponent(employeeForm.email)}`;
        const response = await fetch(`${API_BASE_URL}/employees${query}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const employees = await response.json();
        if (!Array.isArray(employees)) {
          setError("Failed to fetch employees. Please try again.");
          toast.error("Failed to fetch employees. Please try again.");
          return;
        }
        if (
          employees.some(
            (emp) =>
              emp.email === employeeForm.email &&
              emp.employeeId !== (editingEmployee?.employeeId ?? -1)
          )
        ) {
          setEmployeeFormErrors((prev) => ({
            ...prev,
            email: "Email is already in use by another employee.",
          }));
          toast.error("Email is already in use by another employee.");
          return;
        }
      }

      const url = editingEmployee
        ? `${API_BASE_URL}/employees/${editingEmployee.employeeId}`
        : `${API_BASE_URL}/employees`;
      const method = editingEmployee ? "PUT" : "POST";
      const body = {
        ...employeeForm,
        ...(editingEmployee && !employeeForm.password
          ? {}
          : { password: employeeForm.password }),
      };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast.success(
          editingEmployee
            ? "Employee updated successfully!"
            : "Employee added successfully!"
        );
        setIsAddingEmployee(false);
        setEditingEmployee(null);
        setEmployeeForm({
          name: "",
          role: "",
          email: "",
          password: "",
          employeeGroup: "",
          status: "Active",
        });
        setEmployeeFormErrors({});
        await fetchEmployees();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.details ||
          errorData.error ||
          `Failed to ${editingEmployee ? "update" : "add"} employee.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${
        editingEmployee ? "update" : "add"
      } employee.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingEmployee(false);
    }
  }, [
    employeeForm,
    editingEmployee,
    clearError,
    token,
    validateEmployeeForm,
    fetchEmployees,
  ]);

  const handleDeleteEmployee = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this employee?"))
        return;
      try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Employee deleted successfully!");
          fetchEmployees();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message ||
            errorData.error ||
            "Failed to delete employee.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete employee.");
        toast.error("Failed to delete employee.");
      }
    },
    [token, fetchEmployees]
  );

  const handleSubmitDefect = useCallback(async () => {
    clearError();
    if (!validateDefectForm()) {
      toast.error("Please correct the errors in the defect form.");
      return;
    }

    setIsSubmittingDefect(true);
    try {
      const url = editingDefect
        ? `${API_BASE_URL}/defects/${editingDefect.defectId}`
        : `${API_BASE_URL}/defects`;
      const method = editingDefect ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(defectForm),
      });
      if (response.ok) {
        toast.success(
          editingDefect
            ? "Defect updated successfully!"
            : "Defect added successfully!"
        );
        setIsAddingDefect(false);
        setEditingDefect(null);
        setDefectForm({ name: "", defectType: "" });
        setDefectFormErrors({});
        await fetchDefects();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingDefect ? "update" : "add"} defect.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${
        editingDefect ? "update" : "add"
      } defect.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingDefect(false);
    }
  }, [
    defectForm,
    editingDefect,
    clearError,
    token,
    validateDefectForm,
    fetchDefects,
  ]);

  const handleDeleteDefect = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this defect?"))
        return;
      try {
        const response = await fetch(`${API_BASE_URL}/defects/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Defect deleted successfully!");
          fetchDefects();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message || errorData.error || "Failed to delete defect.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete defect.");
        toast.error("Failed to delete defect.");
      }
    },
    [token, fetchDefects]
  );

  const handleSubmitChangeover = useCallback(async () => {
    clearError();
    if (!validateChangeoverForm()) {
      toast.error("Please correct the errors in the changeover form.");
      return;
    }

    setIsSubmittingChangeover(true);
    try {
      const url = editingChangeover
        ? `${API_BASE_URL}/changeover/${editingChangeover.changeoverId}`
        : `${API_BASE_URL}/changeover`;
      const method = editingChangeover ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changeoverForm),
      });
      if (response.ok) {
        toast.success(
          editingChangeover
            ? "Changeover updated successfully!"
            : "Changeover added successfully!"
        );
        setIsAddingChangeover(false);
        setEditingChangeover(null);
        setChangeoverForm({
          moldId: "",
          machineId: "",
          productId: "",
          startTime: "",
          endTime: "",
          status: "Scheduled",
        });
        setChangeoverFormErrors({});
        await fetchChangeovers();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingChangeover ? "update" : "add"} changeover.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${
        editingChangeover ? "update" : "add"
      } changeover.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingChangeover(false);
    }
  }, [
    changeoverForm,
    editingChangeover,
    clearError,
    token,
    validateChangeoverForm,
    fetchChangeovers,
  ]);

  const handleDeleteChangeover = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this changeover?"))
        return;
      try {
        const response = await fetch(`${API_BASE_URL}/changeover/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("Changeover deleted successfully!");
          fetchChangeovers();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message ||
            errorData.error ||
            "Failed to delete changeover.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete changeover.");
        toast.error("Failed to delete changeover.");
      }
    },
    [token, fetchChangeovers]
  );

  const handleSubmitSmp = useCallback(async () => {
    clearError();
    if (!validateSmpForm()) {
      toast.error("Please correct the errors in the SMP form.");
      return;
    }

    setIsSubmittingSmp(true);
    try {
      const url = editingSmp
        ? `${API_BASE_URL}/smps/${editingSmp.smpId}`
        : `${API_BASE_URL}/smps`;
      const method = editingSmp ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(smpForm),
      });
      if (response.ok) {
        toast.success(
          editingSmp ? "SMP updated successfully!" : "SMP added successfully!"
        );
        setIsAddingSmp(false);
        setEditingSmp(null);
        setSmpForm({
          name: "",
          description: "",
          status: "Active",
        });
        setSmpFormErrors({});
        await fetchSmps();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingSmp ? "update" : "add"} SMP.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${editingSmp ? "update" : "add"} SMP.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingSmp(false);
    }
  }, [smpForm, editingSmp, clearError, token, validateSmpForm, fetchSmps]);

  const handleDeleteSmp = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this SMP?")) return;
      try {
        const response = await fetch(`${API_BASE_URL}/smps/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success("SMP deleted successfully!");
          fetchSmps();
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message || errorData.error || "Failed to delete SMP.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setError("Failed to delete SMP.");
        toast.error("Failed to delete SMP.");
      }
    },
    [token, fetchSmps]
  );

  const handleEdit = useCallback(
    <T extends Mold | Machine | Product | Employee | Defect | Changeover | SMP>(
      item: T,
      setForm: React.Dispatch<React.SetStateAction<any>>,
      setEditing: React.Dispatch<React.SetStateAction<T | null>>,
      setIsAdding: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      setForm(item);
      setEditing(item);
      setIsAdding(true);
    },
    []
  );

const exportConfig: Record<
  string,
  { omit: string[]; rename: Record<string, string> }
> = {
  Molds: {
    omit: ["moldId", "status"],
    rename: {
      name: "Name",
      dimension: "Dimension",
      hotRunnerZones: "Hot Runner Zones",
      sprueRadius: "Sprue Radius",
      gateSequence: "Gate Sequence",
      pmShotCount: "PM Shot Count",
      openingShotCount: "Opening Shot Count",
      cores: "Cores",
      ejectorType: "Ejector Type",
    },
  },
   Machines: {
    omit: ["status"], // drop internal status
    rename: {
      machineName: "Machine Name",
      tieBarDistance: "Tie Bar Distance",
      cores: "Cores",
      maxMoldHeight: "Max Mold Height",
      maxDaylight: "Max Daylight",
      screwDia: "Screw Diameter",
      ldRatio: "L/D Ratio",
      screwType: "Screw Type",
      shotSize: "Shot Size",
      screwStrokeLength: "Screw Stroke Length",
      ejectorStrokeLength: "Ejector Stroke Length",
      minMoldHeight: "Min Mold Height",
      hopperCapacity: "Hopper Capacity",
      description: "Description",
    },
  },
   Products: {
    omit: ["productId", "status", "machineId"],
    rename: {
      name: "Product Name",
      cycleTime: "Cycle Time",
      material: "Material",
      partWeight: "Part Weight",
      runnerWeight: "Runner Weight",
      cavities: "Cavities",
      packingMethod: "Packing Method",
      packingQty: "Packing Qty",
      machineName: "Machine Name",
    },
  },
  Employees: {
    omit: ["employeeId", "status"],
    rename: {
      name: "Full Name",
      role: "Role",
      email: "Email",
      employeeGroup: "Employee Group",
    },
  },
  Defects: {
    omit: ["defectId", "status"],
    rename: {
      name: "Defect Name",
      defectType: "Defect Type",
      category: "Category",
    },
  },
  // Products: { omit: [], rename: {} },
  Changeovers: { omit: [], rename: {} },
  SMPs: { omit: [], rename: {} },
};


const exportToCSV = useCallback(
  (data: any[], filename: string, sectionTitle: string) => {
    if (data.length === 0) {
      toast.error(`No data available to export for ${sectionTitle}.`);
      return;
    }

    const { omit = [], rename = {} } = exportConfig[sectionTitle] || {};

    // Filter + rename headers
    const headers = Object.keys(data[0]).filter((h) => !omit.includes(h));
    const headerLabels = headers.map((h) => rename[h] ?? h);

    const csvContent = [
      headerLabels.join(","), // ✅ only headers (no sectionTitle row)
      ...data.map((row) =>
        headers
          .map((key) =>
            `"${(row[key] ?? "").toString().replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  },
  []
);

const exportConsolidated = useCallback(() => {
  const wb = XLSX.utils.book_new();

  const addSheet = (data: any[], sheetName: string) => {
    if (data.length > 0) {
      const { omit = [], rename = {} } = exportConfig[sheetName] || {};

      const filtered = data.map((row) => {
        const obj: any = {};
        Object.keys(row).forEach((key) => {
          if (!omit.includes(key)) {
            const newKey = rename[key] ?? key;
            obj[newKey] = row[key];
          }
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(filtered);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  };

  addSheet(moldData, "Molds");
  addSheet(machineData, "Machines");
  addSheet(productData, "Products");
  // addSheet(employeeData, "Employees");
  addSheet(defectData, "Defects");
  addSheet(changeoverData, "Changeovers");
  addSheet(smpData, "SMPs");

  if (wb.SheetNames.length === 0) {
    toast.error("No data available to export.");
    return;
  }

  XLSX.writeFile(wb, "master_data_consolidated.xlsx");
}, [
  moldData,
  machineData,
  productData,
  // employeeData,
  defectData,
  changeoverData,
  smpData,
]);


  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  const formatEmployeeGroup = (group: string) => {
    if (!group) return "";
    return group
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const sortedMolds = [...moldData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedMachines = [...machineData].sort((a, b) =>
    a.machineName.localeCompare(b.machineName)
  );
  const sortedProducts = [...productData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedEmployees = [...employeeData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedDefects = [...defectData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedChangeovers = [...changeoverData].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const sortedSmps = [...smpData].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Master Data Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search masters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={exportConsolidated}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="molds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="molds" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Molds
          </TabsTrigger>
          <TabsTrigger value="machines" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Machines
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="defects" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Defects
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="changeover" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Changeover
          </TabsTrigger>
          <TabsTrigger value="smp" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SMP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="molds">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Settings className="h-5 w-5" />
                  Mold Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingMold}
                    onOpenChange={(open) => {
                      setIsAddingMold(open);
                      if (!open) {
                        setEditingMold(null);
                        setMoldForm({
                          name: "",
                          dimension: "",
                          hotRunnerZones: "",
                          sprueRadius: "",
                          gateSequence: "",
                          pmShotCount: "",
                          openingShotCount: "",
                          cores: "",
                          ejectorType: "",
                          status: "Active",
                        });
                        setMoldFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingMold ? "Edit Mold" : "Add Mold"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-2xl"
                      aria-describedby="mold-description"
                    >
                      <DialogDescription
                        id="mold-description"
                        className="sr-only"
                      >
                        Form to add or edit mold details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingMold ? "Edit Mold" : "Add New Mold"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <FormField
                          label="Mold Name"
                          id="moldName"
                          placeholder="Enter mold name"
                          value={moldForm.name as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "name",
                              value
                            )
                          }
                          required
                          error={moldFormErrors.name}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Mold Dimension"
                          id="moldDimension"
                          placeholder="L x W x H"
                          value={moldForm.dimension as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "dimension",
                              value
                            )
                          }
                          required
                          error={moldFormErrors.dimension}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Hot Runner Zones"
                          id="hotRunnerZones"
                          type="number"
                          placeholder="Number of zones"
                          value={moldForm.hotRunnerZones as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "hotRunnerZones",
                              value
                            )
                          }
                          error={moldFormErrors.hotRunnerZones}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Sprue Radius"
                          id="sprueRadius"
                          type="number"
                          placeholder="Radius in mm"
                          value={moldForm.sprueRadius as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "sprueRadius",
                              value
                            )
                          }
                          error={moldFormErrors.sprueRadius}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Gate Sequence"
                          id="gateSequence"
                          type="number"
                          placeholder="Number of gates"
                          value={moldForm.gateSequence as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "gateSequence",
                              value
                            )
                          }
                          error={moldFormErrors.gateSequence}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="PM Shot Count"
                          id="pmShotCount"
                          type="number"
                          placeholder="Shots until PM"
                          value={moldForm.pmShotCount as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "pmShotCount",
                              value
                            )
                          }
                          error={moldFormErrors.pmShotCount}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Opening Shot Count"
                          id="openingShotCount"
                          type="number"
                          placeholder="Current shot count"
                          value={moldForm.openingShotCount as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "openingShotCount",
                              value
                            )
                          }
                          error={moldFormErrors.openingShotCount}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Number of Cores"
                          id="cores"
                          type="number"
                          placeholder="Number of cores"
                          value={moldForm.cores as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "cores",
                              value
                            )
                          }
                          error={moldFormErrors.cores}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Ejector Type"
                          id="ejectorType"
                          value={moldForm.ejectorType as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "ejectorType",
                              value
                            )
                          }
                          options={[
                            { value: "hydraulic", label: "Hydraulic" },
                            { value: "pneumatic", label: "Pneumatic" },
                            { value: "mechanical", label: "Mechanical" },
                          ]}
                          placeholder="Select ejector type"
                          error={moldFormErrors.ejectorType}
                          onBlur={handleMoldInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="status"
                          value={moldForm.status as string}
                          onChange={(value) =>
                            handleInputChange(
                              moldForm,
                              setMoldForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Active", label: "Active" },
                            { value: "Maintenance", label: "Maintenance" },
                            { value: "Inactive", label: "Inactive" },
                          ]}
                          placeholder="Select status"
                          error={moldFormErrors.status}
                          onBlur={handleMoldInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingMold(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitMold}
                          disabled={isSubmittingMold}
                        >
                          {isSubmittingMold
                            ? "Saving..."
                            : editingMold
                            ? "Update Mold"
                            : "Save Mold"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(sortedMolds, "molds.csv", "Molds")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMolds ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedMolds.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No molds found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Dimension
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Hot Runner Zones
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Sprue Radius
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Gate Sequence
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          PM Shot Count
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Opening Shot Count
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Cores
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Ejector Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMolds.map((mold, index) => (
                        <tr
                          key={mold.moldId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {mold.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.dimension}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.hotRunnerZones}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.sprueRadius}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.gateSequence}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.pmShotCount}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.openingShotCount}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {mold.cores}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 capitalize">
                            {mold.ejectorType}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                mold.status === "Active"
                                  ? "default"
                                  : mold.status === "Maintenance"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {mold.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit mold"
                              onClick={() =>
                                handleEdit(
                                  mold,
                                  setMoldForm,
                                  setEditingMold,
                                  setIsAddingMold
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete mold"
                              onClick={() => handleDeleteMold(mold.moldId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setMoldPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={moldPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setMoldPage((prev) => prev + 1)}
                      disabled={moldData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machines">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Wrench className="h-5 w-5" />
                  Machine Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingMachine}
                    onOpenChange={(open) => {
                      setIsAddingMachine(open);
                      if (!open) {
                        setEditingMachine(null);
                        setMachineForm({
                          machineName: "",
                          description: "",
                          tieBarDistance: "",
                          cores: "",
                          maxMoldHeight: "",
                          maxDaylight: "",
                          screwDia: "",
                          ldRatio: "",
                          screwType: "",
                          shotSize: "",
                          screwStrokeLength: "",
                          ejectorStrokeLength: "",
                          minMoldHeight: "",
                          hopperCapacity: "",
                          status: "Running",
                        });
                        setMachineFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingMachine ? "Edit Machine" : "Add Machine"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-3xl"
                      aria-describedby="machine-description"
                    >
                      <DialogDescription
                        id="machine-description"
                        className="sr-only"
                      >
                        Form to add or edit machine details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingMachine ? "Edit Machine" : "Add New Machine"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                        <FormField
                          label="Machine Name"
                          id="machineName"
                          placeholder="Enter machine name"
                          value={machineForm.machineName as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "machineName",
                              value
                            )
                          }
                          required
                          error={machineFormErrors.machineName}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Description"
                          id="description"
                          placeholder="Enter machine description"
                          value={machineForm.description as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "description",
                              value
                            )
                          }
                          error={machineFormErrors.description}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Tie Bar Distance"
                          id="tieBarDistance"
                          placeholder="L x W (mm)"
                          value={machineForm.tieBarDistance as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "tieBarDistance",
                              value
                            )
                          }
                          required
                          error={machineFormErrors.tieBarDistance}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Number of Cores"
                          id="machineCores"
                          type="number"
                          placeholder="Number of cores"
                          value={machineForm.cores as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "cores",
                              value
                            )
                          }
                          error={machineFormErrors.cores}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Max Mold Height"
                          id="maxMoldHeight"
                          type="number"
                          placeholder="Height in mm"
                          value={machineForm.maxMoldHeight as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "maxMoldHeight",
                              value
                            )
                          }
                          error={machineFormErrors.maxMoldHeight}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Max Daylight"
                          id="maxDaylight"
                          type="number"
                          placeholder="Daylight in mm"
                          value={machineForm.maxDaylight as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "maxDaylight",
                              value
                            )
                          }
                          error={machineFormErrors.maxDaylight}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Screw Diameter"
                          id="screwDia"
                          type="number"
                          placeholder="Diameter in mm"
                          value={machineForm.screwDia as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "screwDia",
                              value
                            )
                          }
                          error={machineFormErrors.screwDia}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="L/D Ratio"
                          id="ldRatio"
                          type="number"
                          placeholder="L/D ratio"
                          value={machineForm.ldRatio as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "ldRatio",
                              value
                            )
                          }
                          error={machineFormErrors.ldRatio}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Screw Type"
                          id="screwType"
                          value={machineForm.screwType as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "screwType",
                              value
                            )
                          }
                          options={[
                            { value: "standard", label: "Standard" },
                            { value: "barrier", label: "Barrier" },
                            { value: "mixing", label: "Mixing" },
                          ]}
                          placeholder="Select screw type"
                          error={machineFormErrors.screwType}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Shot Size"
                          id="shotSize"
                          type="number"
                          placeholder="Shot size in cm³"
                          value={machineForm.shotSize as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "shotSize",
                              value
                            )
                          }
                          error={machineFormErrors.shotSize}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Screw Stroke Length"
                          id="screwStrokeLength"
                          type="number"
                          placeholder="Length in mm"
                          value={machineForm.screwStrokeLength as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "screwStrokeLength",
                              value
                            )
                          }
                          error={machineFormErrors.screwStrokeLength}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Ejector Stroke Length"
                          id="ejectorStrokeLength"
                          type="number"
                          placeholder="Length in mm"
                          value={machineForm.ejectorStrokeLength as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "ejectorStrokeLength",
                              value
                            )
                          }
                          error={machineFormErrors.ejectorStrokeLength}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Min Mold Height"
                          id="minMoldHeight"
                          type="number"
                          placeholder="Height in mm"
                          value={machineForm.minMoldHeight as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "minMoldHeight",
                              value
                            )
                          }
                          error={machineFormErrors.minMoldHeight}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Hopper Capacity"
                          id="hopperCapacity"
                          type="number"
                          placeholder="Capacity in liters"
                          value={machineForm.hopperCapacity as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "hopperCapacity",
                              value
                            )
                          }
                          error={machineFormErrors.hopperCapacity}
                          onBlur={handleMachineInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="machineStatus"
                          value={machineForm.status as string}
                          onChange={(value) =>
                            handleInputChange(
                              machineForm,
                              setMachineForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Running", label: "Running" },
                            { value: "Maintenance", label: "Maintenance" },
                            { value: "Idle", label: "Idle" },
                          ]}
                          placeholder="Select status"
                          error={machineFormErrors.status}
                          onBlur={handleMachineInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingMachine(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitMachine}
                          disabled={isSubmittingMachine}
                        >
                          {isSubmittingMachine
                            ? "Saving..."
                            : editingMachine
                            ? "Update Machine"
                            : "Save Machine"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(sortedMachines, "machines.csv", "Machines")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMachines ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedMachines.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No machines found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Tie Bar Distance
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Cores
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Max Mold Height
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Max Daylight
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Screw Dia
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          L/D Ratio
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Screw Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Shot Size
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Screw Stroke
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Ejector Stroke
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Min Mold Height
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Hopper Capacity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMachines.map((machine, index) => (
                        <tr
                          key={machine.machineId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {machine.machineName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.description || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.tieBarDistance}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.cores}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.maxMoldHeight}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.maxDaylight}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.screwDia}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.ldRatio}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 capitalize">
                            {machine.screwType}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.shotSize}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.screwStrokeLength}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.ejectorStrokeLength}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.minMoldHeight}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machine.hopperCapacity}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                machine.status === "Running"
                                  ? "default"
                                  : machine.status === "Maintenance"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {machine.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit machine"
                              onClick={() =>
                                handleEdit(
                                  machine,
                                  setMachineForm,
                                  setEditingMachine,
                                  setIsAddingMachine
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete machine"
                              onClick={() =>
                                handleDeleteMachine(machine.machineId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setMachinePage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={machinePage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setMachinePage((prev) => prev + 1)}
                      disabled={machineData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Package className="h-5 w-5" />
                  Product Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingProduct}
                    onOpenChange={(open) => {
                      setIsAddingProduct(open);
                      if (!open) {
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          machineId: "",
                          cycleTime: "",
                          material: "",
                          partWeight: "",
                          runnerWeight: "",
                          cavities: "",
                          packingMethod: "",
                          packingQty: "",
                          status: "Active",
                        });
                        setProductFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingProduct ? "Edit Product" : "Add Product"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-2xl"
                      aria-describedby="product-description"
                    >
                      <DialogDescription
                        id="product-description"
                        className="sr-only"
                      >
                        Form to add or edit product details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <FormField
                          label="Product Name"
                          id="productName"
                          placeholder="Enter product name"
                          value={productForm.name as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "name",
                              value
                            )
                          }
                          required
                          error={productFormErrors.name}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Machine"
                          id="machineId"
                          value={productForm.machineId as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "machineId",
                              value
                            )
                          }
                          options={machineData.map((machine) => ({
                            value: machine.machineId,
                            label: machine.machineName,
                          }))}
                          placeholder="Select machine"
                          required
                          error={productFormErrors.machineId}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Cycle Time (s)"
                          id="cycleTime"
                          type="number"
                          placeholder="Cycle time in seconds"
                          value={productForm.cycleTime as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "cycleTime",
                              value
                            )
                          }
                          error={productFormErrors.cycleTime}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Material"
                          id="material"
                          placeholder="Enter material type"
                          value={productForm.material as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "material",
                              value
                            )
                          }
                          required
                          error={productFormErrors.material}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Part Weight (g)"
                          id="partWeight"
                          type="number"
                          placeholder="Weight in grams"
                          value={productForm.partWeight as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "partWeight",
                              value
                            )
                          }
                          error={productFormErrors.partWeight}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Runner Weight (g)"
                          id="runnerWeight"
                          type="number"
                          placeholder="Weight in grams"
                          value={productForm.runnerWeight as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "runnerWeight",
                              value
                            )
                          }
                          error={productFormErrors.runnerWeight}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Cavities"
                          id="cavities"
                          type="number"
                          placeholder="Number of cavities"
                          value={productForm.cavities as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "cavities",
                              value
                            )
                          }
                          error={productFormErrors.cavities}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Packing Method"
                          id="packingMethod"
                          value={productForm.packingMethod as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "packingMethod",
                              value
                            )
                          }
                          options={[
                            { value: "bulk", label: "Bulk" },
                            { value: "tray", label: "Tray" },
                            { value: "carton", label: "Carton" },
                          ]}
                          placeholder="Select packing method"
                          error={productFormErrors.packingMethod}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Packing Quantity"
                          id="packingQty"
                          type="number"
                          placeholder="Quantity per pack"
                          value={productForm.packingQty as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "packingQty",
                              value
                            )
                          }
                          error={productFormErrors.packingQty}
                          onBlur={handleProductInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="status"
                          value={productForm.status as string}
                          onChange={(value) =>
                            handleInputChange(
                              productForm,
                              setProductForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Active", label: "Active" },
                            { value: "Inactive", label: "Inactive" },
                          ]}
                          placeholder="Select status"
                          error={productFormErrors.status}
                          onBlur={handleProductInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingProduct(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitProduct}
                          disabled={isSubmittingProduct}
                        >
                          {isSubmittingProduct
                            ? "Saving..."
                            : editingProduct
                            ? "Update Product"
                            : "Save Product"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(sortedProducts, "products.csv", "Products")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedProducts.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No products found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Machine
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Cycle Time (s)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Material
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Part Weight (g)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Runner Weight (g)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Cavities
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Packing Method
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Packing Qty
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map((product, index) => (
                        <tr
                          key={product.productId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {product.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machineData.find(
                              (m) => m.machineId === product.machineId
                            )?.machineName || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.cycleTime}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.material}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.partWeight}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.runnerWeight}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.cavities}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 capitalize">
                            {product.packingMethod}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {product.packingQty}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                product.status === "Active"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {product.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit product"
                              onClick={() =>
                                handleEdit(
                                  product,
                                  setProductForm,
                                  setEditingProduct,
                                  setIsAddingProduct
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete product"
                              onClick={() =>
                                handleDeleteProduct(product.productId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setProductPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={productPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setProductPage((prev) => prev + 1)}
                      disabled={productData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <AlertTriangle className="h-5 w-5" />
                  Defect Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingDefect}
                    onOpenChange={(open) => {
                      setIsAddingDefect(open);
                      if (!open) {
                        setEditingDefect(null);
                        setDefectForm({ name: "", defectType: "" });
                        setDefectFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingDefect ? "Edit Defect" : "Add Defect"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md"
                      aria-describedby="defect-description"
                    >
                      <DialogDescription
                        id="defect-description"
                        className="sr-only"
                      >
                        Form to add or edit defect details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingDefect ? "Edit Defect" : "Add New Defect"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4">
                        <FormField
                          label="Defect Name"
                          id="defectName"
                          placeholder="Enter defect name"
                          value={defectForm.name}
                          onChange={(value) =>
                            handleInputChange(
                              defectForm,
                              setDefectForm,
                              "name",
                              value
                            )
                          }
                          required
                          error={defectFormErrors.name}
                          onBlur={handleDefectInputBlur}
                        />
                        <FormField
                          label="Defect Type"
                          id="defectType"
                          value={defectForm.defectType}
                          onChange={(value) =>
                            handleInputChange(
                              defectForm,
                              setDefectForm,
                              "defectType",
                              value
                            )
                          }
                          options={[
                            {
                              value: "InjectionMolding",
                              label: "Injection Molding",
                            },
                            { value: "Assembly", label: "Assembly" },
                          ]}
                          placeholder="Select defect type"
                          required
                          error={defectFormErrors.defectType}
                          onBlur={handleDefectInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingDefect(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitDefect}
                          disabled={isSubmittingDefect}
                        >
                          {isSubmittingDefect
                            ? "Saving..."
                            : editingDefect
                            ? "Update Defect"
                            : "Save Defect"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(sortedDefects, "defects.csv", "Defects")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDefects ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedDefects.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No defects found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      {sortedDefects.map((defect, index) => (
                        <tr
                          key={defect.defectId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {defect.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {defect.defectType}
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit defect"
                              onClick={() =>
                                handleEdit(
                                  defect,
                                  setDefectForm,
                                  setEditingDefect,
                                  setIsAddingDefect
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete defect"
                              onClick={() =>
                                handleDeleteDefect(defect.defectId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody> */}
                    <tbody>
                      {sortedDefects
                        .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order
                        .map((defect, index) => (
                          <tr
                            key={defect.defectId}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition-colors`}
                          >
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                              {defect.name
                                .toLowerCase()
                                .replace(/\b\w/, (c) => c.toUpperCase())}{" "}
                              {/* Capitalize first letter */}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {defect.defectType
                                .toLowerCase()
                                .replace(/\b\w/, (c) => c.toUpperCase())}{" "}
                              {/* Optional: capitalize defectType */}
                            </td>
                            <td className="px-4 py-2 flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Edit defect"
                                onClick={() =>
                                  handleEdit(
                                    defect,
                                    setDefectForm,
                                    setEditingDefect,
                                    setIsAddingDefect
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Delete defect"
                                onClick={() =>
                                  handleDeleteDefect(defect.defectId)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setDefectPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={defectPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setDefectPage((prev) => prev + 1)}
                      disabled={defectData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Users className="h-5 w-5" />
                  Employee Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {/* <Select
                    value={selectedGroup}
                    onValueChange={setSelectedGroup}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {employeeGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {formatEmployeeGroup(group)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}
                  <Dialog
                    open={isAddingEmployee}
                    onOpenChange={(open) => {
                      setIsAddingEmployee(open);
                      if (!open) {
                        setEditingEmployee(null);
                        setEmployeeForm({
                          name: "",
                          role: "",
                          email: "",
                          password: "",
                          employeeGroup: "",
                          status: "Active",
                        });
                        setEmployeeFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingEmployee ? "Edit Employee" : "Add Employee"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md"
                      aria-describedby="employee-description"
                    >
                      <DialogDescription
                        id="employee-description"
                        className="sr-only"
                      >
                        Form to add or edit employee details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingEmployee
                            ? "Edit Employee"
                            : "Add New Employee"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4">
                        <FormField
                          label="Employee Name"
                          id="employeeName"
                          placeholder="Enter employee name"
                          value={employeeForm.name}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "name",
                              value
                            )
                          }
                          required
                          error={employeeFormErrors.name}
                          onBlur={handleEmployeeInputBlur}
                        />
                        <FormField
                          label="Role"
                          id="role"
                          placeholder="Enter role"
                          value={employeeForm.role}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "role",
                              value
                            )
                          }
                          error={employeeFormErrors.role}
                          onBlur={handleEmployeeInputBlur}
                        />
                        <FormField
                          label="Email"
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          value={employeeForm.email}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "email",
                              value
                            )
                          }
                          required
                          error={employeeFormErrors.email}
                          onBlur={handleEmployeeInputBlur}
                        />
                        <FormField
                          label="Password"
                          id="password"
                          type="password"
                          placeholder={
                            editingEmployee
                              ? "Enter new password (optional)"
                              : "Enter password"
                          }
                          value={employeeForm.password}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "password",
                              value
                            )
                          }
                          required={!editingEmployee}
                          error={employeeFormErrors.password}
                          onBlur={handleEmployeeInputBlur}
                        />
                        <FormField
                          label="Employee Group"
                          id="employeeGroup"
                          value={employeeForm.employeeGroup}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "employeeGroup",
                              value
                            )
                          }
                          options={employeeGroups.map((group) => ({
                            value: group,
                            label: formatEmployeeGroup(group),
                          }))}
                          placeholder="Select employee group"
                          required
                          error={employeeFormErrors.employeeGroup}
                          onBlur={handleEmployeeInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="status"
                          value={employeeForm.status}
                          onChange={(value) =>
                            handleInputChange(
                              employeeForm,
                              setEmployeeForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Active", label: "Active" },
                            { value: "Inactive", label: "Inactive" },
                          ]}
                          placeholder="Select status"
                          error={employeeFormErrors.status}
                          onBlur={handleEmployeeInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingEmployee(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitEmployee}
                          disabled={isSubmittingEmployee}
                        >
                          {isSubmittingEmployee
                            ? "Saving..."
                            : editingEmployee
                            ? "Update Employee"
                            : "Save Employee"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(sortedEmployees, "employees.csv", "Employees")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEmployees ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedEmployees.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No employees found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Group
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEmployees.map((employee, index) => (
                        <tr
                          key={employee.employeeId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {employee.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {employee.role || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {employee.email}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {formatEmployeeGroup(employee.employeeGroup)}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                employee.status === "Active"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit employee"
                              onClick={() =>
                                handleEdit(
                                  employee,
                                  setEmployeeForm,
                                  setEditingEmployee,
                                  setIsAddingEmployee
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete employee"
                              onClick={() =>
                                handleDeleteEmployee(employee.employeeId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setEmployeePage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={employeePage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setEmployeePage((prev) => prev + 1)}
                      disabled={employeeData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changeover">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Clock className="h-5 w-5" />
                  Changeover Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingChangeover}
                    onOpenChange={(open) => {
                      setIsAddingChangeover(open);
                      if (!open) {
                        setEditingChangeover(null);
                        setChangeoverForm({
                          moldId: "",
                          machineId: "",
                          productId: "",
                          startTime: "",
                          endTime: "",
                          status: "Scheduled",
                        });
                        setChangeoverFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingChangeover
                          ? "Edit Changeover"
                          : "Add Changeover"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md"
                      aria-describedby="changeover-description"
                    >
                      <DialogDescription
                        id="changeover-description"
                        className="sr-only"
                      >
                        Form to add or edit changeover details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingChangeover
                            ? "Edit Changeover"
                            : "Add New Changeover"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4">
                        <FormField
                          label="Mold"
                          id="moldId"
                          value={changeoverForm.moldId}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "moldId",
                              value
                            )
                          }
                          options={moldData.map((mold) => ({
                            value: mold.moldId,
                            label: mold.name,
                          }))}
                          placeholder="Select mold"
                          required
                          error={changeoverFormErrors.moldId}
                          onBlur={handleChangeoverInputBlur}
                        />
                        <FormField
                          label="Machine"
                          id="machineId"
                          value={changeoverForm.machineId}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "machineId",
                              value
                            )
                          }
                          options={machineData.map((machine) => ({
                            value: machine.machineId,
                            label: machine.machineName,
                          }))}
                          placeholder="Select machine"
                          required
                          error={changeoverFormErrors.machineId}
                          onBlur={handleChangeoverInputBlur}
                        />
                        <FormField
                          label="Product"
                          id="productId"
                          value={changeoverForm.productId}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "productId",
                              value
                            )
                          }
                          options={productData.map((product) => ({
                            value: product.productId,
                            label: product.name,
                          }))}
                          placeholder="Select product"
                          required
                          error={changeoverFormErrors.productId}
                          onBlur={handleChangeoverInputBlur}
                        />
                        <FormField
                          label="Start Time"
                          id="startTime"
                          type="datetime-local"
                          value={changeoverForm.startTime}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "startTime",
                              value
                            )
                          }
                          required
                          error={changeoverFormErrors.startTime}
                          onBlur={handleChangeoverInputBlur}
                        />
                        <FormField
                          label="End Time"
                          id="endTime"
                          type="datetime-local"
                          value={changeoverForm.endTime}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "endTime",
                              value
                            )
                          }
                          required
                          error={changeoverFormErrors.endTime}
                          onBlur={handleChangeoverInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="status"
                          value={changeoverForm.status}
                          onChange={(value) =>
                            handleInputChange(
                              changeoverForm,
                              setChangeoverForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Scheduled", label: "Scheduled" },
                            { value: "In Progress", label: "In Progress" },
                            { value: "Completed", label: "Completed" },
                          ]}
                          placeholder="Select status"
                          error={changeoverFormErrors.status}
                          onBlur={handleChangeoverInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingChangeover(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitChangeover}
                          disabled={isSubmittingChangeover}
                        >
                          {isSubmittingChangeover
                            ? "Saving..."
                            : editingChangeover
                            ? "Update Changeover"
                            : "Save Changeover"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(
                        sortedChangeovers,
                        "changeovers.csv",
                        "Changeovers"
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingChangeovers ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedChangeovers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No changeovers found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Mold
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Machine
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Start Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          End Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedChangeovers.map((changeover, index) => (
                        <tr
                          key={changeover.changeoverId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {moldData.find(
                              (m) => m.moldId === changeover.moldId
                            )?.name || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {machineData.find(
                              (m) => m.machineId === changeover.machineId
                            )?.machineName || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {productData.find(
                              (p) => p.productId === changeover.productId
                            )?.name || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(changeover.startTime).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(changeover.endTime).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                changeover.status === "Completed"
                                  ? "default"
                                  : changeover.status === "In Progress"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {changeover.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit changeover"
                              onClick={() =>
                                handleEdit(
                                  changeover,
                                  setChangeoverForm,
                                  setEditingChangeover,
                                  setIsAddingChangeover
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete changeover"
                              onClick={() =>
                                handleDeleteChangeover(changeover.changeoverId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setChangeoverPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={changeoverPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setChangeoverPage((prev) => prev + 1)}
                      disabled={changeoverData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smp">
          <Card className="border-0 shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Settings className="h-5 w-5" />
                  SMP Master
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={isAddingSmp}
                    onOpenChange={(open) => {
                      setIsAddingSmp(open);
                      if (!open) {
                        setEditingSmp(null);
                        setSmpForm({
                          name: "",
                          description: "",
                          status: "Active",
                        });
                        setSmpFormErrors({});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingSmp ? "Edit SMP" : "Add SMP"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md"
                      aria-describedby="smp-description"
                    >
                      <DialogDescription
                        id="smp-description"
                        className="sr-only"
                      >
                        Form to add or edit SMP details.
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSmp ? "Edit SMP" : "Add New SMP"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4">
                        <FormField
                          label="SMP Name"
                          id="smpName"
                          placeholder="Enter SMP name"
                          value={smpForm.name}
                          onChange={(value) =>
                            handleInputChange(
                              smpForm,
                              setSmpForm,
                              "name",
                              value
                            )
                          }
                          required
                          error={smpFormErrors.name}
                          onBlur={handleSmpInputBlur}
                        />
                        <FormField
                          label="Description"
                          id="description"
                          placeholder="Enter SMP description"
                          value={smpForm.description}
                          onChange={(value) =>
                            handleInputChange(
                              smpForm,
                              setSmpForm,
                              "description",
                              value
                            )
                          }
                          required
                          error={smpFormErrors.description}
                          onBlur={handleSmpInputBlur}
                        />
                        <FormField
                          label="Status"
                          id="status"
                          value={smpForm.status}
                          onChange={(value) =>
                            handleInputChange(
                              smpForm,
                              setSmpForm,
                              "status",
                              value
                            )
                          }
                          options={[
                            { value: "Active", label: "Active" },
                            { value: "Inactive", label: "Inactive" },
                          ]}
                          placeholder="Select status"
                          error={smpFormErrors.status}
                          onBlur={handleSmpInputBlur}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingSmp(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitSmp}
                          disabled={isSubmittingSmp}
                        >
                          {isSubmittingSmp
                            ? "Saving..."
                            : editingSmp
                            ? "Update SMP"
                            : "Save SMP"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => exportToCSV(sortedSmps, "smps.csv", "SMPs")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSmps ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : sortedSmps.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No SMPs found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSmps.map((smp, index) => (
                        <tr
                          key={smp.smpId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {smp.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {smp.description || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                smp.status === "Active" ? "default" : "outline"
                              }
                              className="text-xs"
                            >
                              {smp.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit SMP"
                              onClick={() =>
                                handleEdit(
                                  smp,
                                  setSmpForm,
                                  setEditingSmp,
                                  setIsAddingSmp
                                )
                              }
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete SMP"
                              onClick={() => handleDeleteSmp(smp.smpId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-4">
                    <Button
                      onClick={() =>
                        setSmpPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={smpPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setSmpPage((prev) => prev + 1)}
                      disabled={smpData.length < itemsPerPage}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterData;

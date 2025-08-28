// // import React, { useState, useEffect, useCallback } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import { Badge } from '@/components/ui/badge';
// // import { Plus, Edit, Trash2, Search, Settings, Package, Users, Wrench } from 'lucide-react';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { set } from 'date-fns';

// // // Define interfaces for type safety
// // interface Mold {
// //   moldId: string;
// //   name: string;
// //   dimension: string;
// //   hotRunnerZones: number;
// //   sprueRadius: number;
// //   gateSequence: number;
// //   pmShotCount: number;
// //   openingShotCount: number;
// //   cores: number;
// //   ejectorType: string;
// //   status: string;
// // }

// // interface Machine {
// //   machineId: string;
// //   name: string;
// //   tieBarDistance: string;
// //   cores: number;
// //   maxMoldHeight: number;
// //   maxDaylight: number;
// //   screwDia: number;
// //   ldRatio: number;
// //   screwType: string;
// //   shotSize: number;
// //   screwStrokeLength: number;
// //   ejectorStrokeLength: number;
// //   minMoldHeight: number;
// //   hopperCapacity: number;
// //   status: string;
// // }

// // interface Product {
// //   productId: string;
// //   name: string;
// //   cycleTime: number;
// //   material: string;
// //   partWeight: number;
// //   runnerWeight: number;
// //   cavities: number;
// //   packingMethod: string;
// //   packingQty: number;
// //   status: string;
// // }

// // interface Employee {
// //   employeeId: number;
// //   name: string;
// //   role: string;
// //   email: string;
// //   employeeGroup: string;
// //   status: string;
// // }

// // interface Defect {
// //   defectId: string;
// //   name: string;
// //   defectType: string;
// // }

// // // Reusable FormField component
// // interface FormFieldProps {
// //   label: string;
// //   id: string;
// //   type?: string;
// //   value: string | number;
// //   onChange: (value: string) => void;
// //   placeholder?: string;
// //   options?: { value: string; label: string }[];
// //   required?: boolean;
// // }

// // // const FormField: React.FC<FormFieldProps> = ({ label, id, type = 'text', value, onChange, placeholder, options, required }) => (
// // //   <div className="space-y-2">
// // //     <Label htmlFor={id}>{label}{required && <span className="text-red-500">*</span>}</Label>
// // //     {options ? (
// // //       <Select value={value?.toString() ?? ''} onValueChange={onChange}>
// // //         <SelectTrigger>
// // //           <SelectValue placeholder={placeholder} />
// // //         </SelectTrigger>
// // //         <SelectContent>
// // //           {options.map((opt) => (
// // //             <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
// // //           ))}
// // //         </SelectContent>
// // //       </Select>
// // //     ) : (
// // //       <Input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
// // //     )}
// // //   </div>
// // // );
// // const FormField: React.FC<FormFieldProps> = ({
// //   label,
// //   id,
// //   type = 'text',
// //   value,
// //   onChange,
// //   placeholder,
// //   options,
// //   required,
// // }) => (
// //   <div className="space-y-2">
// //     <Label htmlFor={id}>
// //       {label}
// //       {required && <span className="text-red-500">*</span>}
// //     </Label>
// //     {options ? (
// //       <Select value={value?.toString() ?? ''} onValueChange={(val) => onChange(val)}>
// //         <SelectTrigger>
// //           <SelectValue placeholder={placeholder} />
// //         </SelectTrigger>
// //         <SelectContent>
// //           {options.map((opt) => (
// //             <SelectItem key={opt.value} value={String(opt.value)}>
// //               {opt.label}
// //             </SelectItem>
// //           ))}
// //         </SelectContent>
// //       </Select>
// //     ) : (
// //       <Input
// //         id={id}
// //         type={type}
// //         placeholder={placeholder}
// //         value={value ?? ''}
// //         onChange={(e) => onChange(e.target.value)}
// //         required={required}
// //       />
// //     )}
// //   </div>
// // );

// // const MasterData: React.FC = () => {
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [moldData, setMoldData] = useState<Mold[]>([]);
// //   const [machineData, setMachineData] = useState<Machine[]>([]);
// //   const [productData, setProductData] = useState<Product[]>([]);
// //   const [employeeData, setEmployeeData] = useState<Employee[]>([]);
// //   const [defectData, setDefectData] = useState<Defect[]>([]);
// //   const [isAddingMold, setIsAddingMold] = useState(false);
// //   const [isAddingMachine, setIsAddingMachine] = useState(false);
// //   const [isAddingProduct, setIsAddingProduct] = useState(false);
// //   const [isAddingEmployee, setIsAddingEmployee] = useState(false);
// //   const [isAddingDefect, setIsAddingDefect] = useState(false);
// //   // const [isLoading, setIsLoading] = useState(true);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [editingMold, setEditingMold] = useState<Mold | null>(null);
// //   const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
// //   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
// //   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
// //   const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
// //   const [isSubmittingMold, setIsSubmittingMold] = useState(false);
// //   const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);
// //   const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
// //   const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
// //   const [isSubmittingDefect, setIsSubmittingDefect] = useState(false);
// //   const [loading, setLoading] = useState(false);

// // // const API_URL = 'http://192.168.1.82:5000' ;

// //   const [moldForm, setMoldForm] = useState({
// //     name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
// //     pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
// //   });
// //   const [machineForm, setMachineForm] = useState({
// //     name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
// //     screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
// //     ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
// //   });
// //   const [productForm, setProductForm] = useState({
// //     name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
// //     cavities: '', packingMethod: '', packingQty: '', status: 'Active'
// //   });
// //   const [employeeForm, setEmployeeForm] = useState({
// //     name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
// //   });
// //   const [defectForm, setDefectForm] = useState({
// //     name: '', defectType: ''
// //   });

// //   const employeeGroups = [
// //     'Operator', 'PDI Inspector', 'Production', 'Maintenance',
// //     'Quality', 'HOD', 'Admin'
// //   ];

// // const API_BASE_URL = 'http://localhost:5000/api' ;


// //   // Debounced fetch data
// //   useEffect(() => {
// //     setIsSearching(true);
// //     const debounceFetch = setTimeout(() => {
// //       const fetchData = async () => {
// //         // setLoading(true);
// //         setError(null);
// //         try {
// //           const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
// //           const [moldsRes, machinesRes, productsRes, employeesRes, defectsRes] = await Promise.all([
// //             fetch(`${API_BASE_URL}/molds${query}`).catch(() => null),
// //             fetch(`${API_BASE_URL}/machines${query}`).catch(() => null),
// //             fetch(`${API_BASE_URL}/products${query}`).catch(() => null),
// //             fetch(`${API_BASE_URL}/employees${query}`).catch(() => null),
// //             fetch(`${API_BASE_URL}/defects${query}`).catch(() => null)
// //           ]);

// //           const molds: Mold[] = moldsRes && moldsRes.ok ? await moldsRes.json() : moldData;
// //           const machines: Machine[] = machinesRes && machinesRes.ok ? await machinesRes.json() : machineData;
// //           const products: Product[] = productsRes && productsRes.ok ? await productsRes.json() : productData;
// //           const employees: Employee[] = employeesRes && employeesRes.ok ? await employeesRes.json() : employeeData;
// //           const defects: Defect[] = defectsRes && defectsRes.ok ? await defectsRes.json() : defectData;

// //           setMoldData(Array.isArray(molds) ? molds : []);
// //           setMachineData(Array.isArray(machines) ? machines : []);
// //           setProductData(Array.isArray(products) ? products : []);
// //           setEmployeeData(Array.isArray(employees) ? employees : []);
// //           setDefectData(Array.isArray(defects) ? defects : []);

// //           const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
// //           if (!moldsRes?.ok || !machinesRes?.ok || !productsRes?.ok || !employeesRes?.ok || !defectsRes?.ok) {
// //             setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Some data could not be loaded. Displaying cached data.');
// //           }
// //         } catch (err) {
// //           console.error('Error fetching master data:', err);
// //           const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
// //           setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Failed to load data. Displaying cached data.');
// //         } finally {
// //           // setIsLoading(false);
// //           setIsSearching(false);
// //         }
// //       };
// //       fetchData();
// //     }, 300);

// //     return () => clearTimeout(debounceFetch);
// //   }, [searchTerm]);

// //   const handleInputChange = useCallback(<T extends object>(
// //     form: T,
// //     setForm: React.Dispatch<React.SetStateAction<T>>,
// //     field: keyof T,
// //     value: string
// //   ) => {
// //     setForm(prev => ({ ...prev, [field]: value }));
// //   }, []);

// //   const clearError = () => setError(null);

// //   const validateNonNegativeNumber = (value: string, fieldName: string) => {
// //     const num = parseFloat(value);
// //     if (isNaN(num)) {
// //       setError(`${fieldName} must be a valid number.`);
// //       return false;
// //     }
// //     if (num < 0) {
// //       setError(`${fieldName} cannot be negative.`);
// //       return false;
// //     }
// //     return true;
// //   };

// //   const handleSubmitMold = async () => {
// //     clearError();
// //     if (!moldForm.name || !moldForm.dimension) {
// //       setError('Mold name and dimension are required.');
// //       return;
// //     }
// //     if (moldForm.hotRunnerZones && !validateNonNegativeNumber(moldForm.hotRunnerZones, 'Hot Runner Zones')) return;
// //     if (moldForm.sprueRadius && !validateNonNegativeNumber(moldForm.sprueRadius, 'Sprue Radius')) return;
// //     if (moldForm.gateSequence && !validateNonNegativeNumber(moldForm.gateSequence, 'Gate Sequence')) return;
// //     if (moldForm.pmShotCount && !validateNonNegativeNumber(moldForm.pmShotCount, 'PM Shot Count')) return;
// //     if (moldForm.openingShotCount && !validateNonNegativeNumber(moldForm.openingShotCount, 'Opening Shot Count')) return;
// //     if (moldForm.cores && !validateNonNegativeNumber(moldForm.cores, 'Cores')) return;
// //     setIsSubmittingMold(true);
// //     try {
// //       clearError();
// //       // Use the API_BASE_URL constant for the API endpoint
// //       const url = editingMold ? `${API_BASE_URL}/molds/${editingMold.moldId}` : `${API_BASE_URL}/molds`;
// //       const method = editingMold ? 'PUT' : 'POST';
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           ...moldForm,
// //           hotRunnerZones: parseInt(moldForm.hotRunnerZones) || 0,
// //           sprueRadius: parseFloat(moldForm.sprueRadius) || 0,
// //           gateSequence: parseInt(moldForm.gateSequence) || 0,
// //           pmShotCount: parseInt(moldForm.pmShotCount) || 0,
// //           openingShotCount: parseInt(moldForm.openingShotCount) || 0,
// //           cores: parseInt(moldForm.cores) || 0
// //         })
// //       });
// //       if (response.ok) {
// //         setIsAddingMold(false);
// //         setEditingMold(null);
// //         setMoldForm({
// //           name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
// //           pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
// //         });
// //         const molds = await fetch(`${API_BASE_URL}/molds${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
// //         setMoldData(Array.isArray(molds) ? molds : []);
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || `Failed to ${editingMold ? 'update' : 'add'} mold.`);
// //       }
// //     } catch (err) {
// //       setError(`Failed to ${editingMold ? 'update' : 'add'} mold.`);
// //     } finally {
// //       setIsSubmittingMold(false);
// //     }
// //   };

// //   const handleDeleteMold = async (id: string) => {
// //     const confirm = window.confirm('Are you sure you want to delete this mold?');
// //     if (!confirm) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/molds/${id}`, { method: 'DELETE' });
// //       if (response.ok) {
// //         setMoldData(moldData.filter(mold => mold.moldId !== id));
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || 'Failed to delete mold.');
// //       }
// //     } catch (err) {
// //       setError('Failed to delete mold.');
// //     }
// //   };

// //   const handleSubmitMachine = async () => {
// //     clearError();
// //     if (!machineForm.name || !machineForm.tieBarDistance) {
// //       setError('Machine name and tie bar distance are required.');
// //       return;
// //     }
// //     if (machineForm.cores && !validateNonNegativeNumber(machineForm.cores, 'Cores')) return;
// //     if (machineForm.maxMoldHeight && !validateNonNegativeNumber(machineForm.maxMoldHeight, 'Max Mold Height')) return;
// //     // Add similar checks for other numeric fields
// //     setIsSubmittingMachine(true);
// //     try {
// //       const url = editingMachine ? `${API_BASE_URL}/machines/${editingMachine.machineId}` : `${API_BASE_URL}/machines`;
// //       const method = editingMachine ? 'PUT' : 'POST';
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           ...machineForm,
// //           cores: parseInt(machineForm.cores) || 0,
// //           maxMoldHeight: parseInt(machineForm.maxMoldHeight) || 0,
// //           maxDaylight: parseInt(machineForm.maxDaylight) || 0,
// //           screwDia: parseInt(machineForm.screwDia) || 0,
// //           ldRatio: parseInt(machineForm.ldRatio) || 0,
// //           shotSize: parseInt(machineForm.shotSize) || 0,
// //           screwStrokeLength: parseInt(machineForm.screwStrokeLength) || 0,
// //           ejectorStrokeLength: parseInt(machineForm.ejectorStrokeLength) || 0,
// //           minMoldHeight: parseInt(machineForm.minMoldHeight) || 0,
// //           hopperCapacity: parseInt(machineForm.hopperCapacity) || 0
// //         })
// //       });
// //       if (response.ok) {
// //         setIsAddingMachine(false);
// //         setEditingMachine(null);
// //         setMachineForm({
// //           name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
// //           screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
// //           ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
// //         });
// //         const machines = await fetch(`${API_BASE_URL}/machines${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
// //         setMachineData(Array.isArray(machines) ? machines : []);
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || `Failed to ${editingMachine ? 'update' : 'add'} machine.`);
// //       }
// //     } catch (err) {
// //       setError(`Failed to ${editingMachine ? 'update' : 'add'} machine.`);
// //     } finally {
// //       setIsSubmittingMachine(false);
// //     }
// //   };

// //   const handleDeleteMachine = async (id: string) => {
// //     const confirm = window.confirm('Are you sure you want to delete this machine?');
// //     if (!confirm) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/machines/${id}`, { method: 'DELETE' });
// //       if (response.ok) {
// //         setMachineData(machineData.filter(machine => machine.machineId !== id));
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || 'Failed to delete machine.');
// //       }
// //     } catch (err) {
// //       setError('Failed to delete machine.');
// //     }
// //   };

// //   const handleSubmitProduct = async () => {
// //     clearError();
// //     if (!productForm.name || !productForm.material) {
// //       setError('Product name and material are required.');
// //       return;
// //     }
// //     if (productForm.cycleTime && !validateNonNegativeNumber(productForm.cycleTime, 'Cycle Time')) return;
// //     // Add similar checks for other numeric fields
// //     setIsSubmittingProduct(true);
// //     try {
// //       const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct.productId}` : `${API_BASE_URL}/products`;
// //       const method = editingProduct ? 'PUT' : 'POST';
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           ...productForm,
// //           cycleTime: parseInt(productForm.cycleTime) || 0,
// //           partWeight: parseFloat(productForm.partWeight) || 0,
// //           runnerWeight: parseFloat(productForm.runnerWeight) || 0,
// //           cavities: parseInt(productForm.cavities) || 0,
// //           packingQty: parseInt(productForm.packingQty) || 0
// //         })
// //       });
// //       if (response.ok) {
// //         setIsAddingProduct(false);
// //         setEditingProduct(null);
// //         setProductForm({
// //           name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
// //           cavities: '', packingMethod: '', packingQty: '', status: 'Active'
// //         });
// //         const products = await fetch(`${API_BASE_URL}/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
// //         setProductData(Array.isArray(products) ? products : []);
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || `Failed to ${editingProduct ? 'update' : 'add'} product.`);
// //       }
// //     } catch (err) {
// //       setError(`Failed to ${editingProduct ? 'update' : 'add'} product.`);
// //     } finally {
// //       setIsSubmittingProduct(false);
// //     }
// //   };

// //   const handleDeleteProduct = async (id: string) => {
// //     const confirm = window.confirm('Are you sure you want to delete this product?');
// //     if (!confirm) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
// //       if (response.ok) {
// //         setProductData(productData.filter(product => product.productId !== id));
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || 'Failed to delete product.');
// //       }
// //     } catch (err) {
// //       setError('Failed to delete product.');
// //     }
// //   };

// //   const handleSubmitEmployee = async () => {
// //     clearError();
// //     if (!employeeForm.name || !employeeForm.email || !employeeForm.employeeGroup) {
// //       setError('Employee name, email, and group are required.');
// //       return;
// //     }
// //     setIsSubmittingEmployee(true);
// //     try {
// //       // Validate email uniqueness for updates
// //       if (editingEmployee && employeeForm.email) {
// //         const response = await fetch(`${API_BASE_URL}/employees?search=${encodeURIComponent(employeeForm.email)}`);
// //         const employees = await response.json();
// //         // if (employees.some(emp => emp.email === employeeForm.email && emp.id !== editingEmployee.employeeId)) {
// //         //   setError('Email is already in use by another employee.');
// //         //   return;
// //         // }
// //         if (employees.some(emp => emp.email === employeeForm.email && emp.employeeId !== editingEmployee.employeeId)) {
// //           setError('Email is already in use by another employee.');
// //           return;
// //         }

// //       }

// //       const url = editingEmployee ? `${API_BASE_URL}/employees/${editingEmployee.employeeId}` : `${API_BASE_URL}/employees`;
// //       const method = editingEmployee ? 'PUT' : 'POST';
// //       const body = {
// //         ...employeeForm,
// //         ...(editingEmployee && !employeeForm.password ? {} : { password: employeeForm.password })
// //       };
// //       console.log(`Sending ${method} request to ${url} with body:`, body);
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(body)
// //       });
// //       const responseData = await response.json();
// //       console.log(`Response from ${url}:`, responseData);
// //       if (response.ok) {
// //         setIsAddingEmployee(false);
// //         setEditingEmployee(null);
// //         setEmployeeForm({
// //           name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
// //         });
// //         const employees = await fetch(`${API_BASE_URL}/employees${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
// //         setEmployeeData(Array.isArray(employees) ? employees : []);
// //       } else {
// //         const errorMessage = responseData.details || responseData.error || `Failed to ${editingEmployee ? 'update' : 'add'} employee.`;
// //         setError(errorMessage);
// //       }
// //     } catch (err) {
// //       const errorMessage = `Failed to ${editingEmployee ? 'update' : 'add'} employee: ${err.message}`;
// //       setError(errorMessage);
// //       console.error('Fetch error:', err);
// //     } finally {
// //       setIsSubmittingEmployee(false);
// //     }
// //   };

// //   const handleDeleteEmployee = async (id: number) => {
// //     const confirm = window.confirm('Are you sure you want to delete this employee?');
// //     if (!confirm) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
// //       if (response.ok) {
// //         setEmployeeData(employeeData.filter(employee => employee.employeeId !== id));
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || 'Failed to delete employee.');
// //       }
// //     } catch (err) {
// //       setError('Failed to delete employee.');
// //     }
// //   };

// //   const handleSubmitDefect = async () => {
// //     clearError();
// //     if (!defectForm.name || !defectForm.defectType) {
// //       setError('Defect name and type are required.');
// //       return;
// //     }
// //     setIsSubmittingDefect(true);
// //     try {
// //       const url = editingDefect ? `${API_BASE_URL}/defects/${editingDefect.defectId}` : `${API_BASE_URL}/defects`;
// //       const method = editingDefect ? 'PUT' : 'POST';
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(defectForm)
// //       });
// //       if (response.ok) {
// //         setIsAddingDefect(false);
// //         setEditingDefect(null);
// //         setDefectForm({ name: '', defectType: '' });
// //         const defects = await fetch(`${API_BASE_URL}/defects${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
// //         setDefectData(Array.isArray(defects) ? defects : []);
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || `Failed to ${editingDefect ? 'update' : 'add'} defect.`);
// //       }
// //     } catch (err) {
// //       setError(`Failed to ${editingDefect ? 'update' : 'add'} defect.`);
// //     } finally {
// //       setIsSubmittingDefect(false);
// //     }
// //   };

// //   const handleDeleteDefect = async (id: string) => {
// //     const confirm = window.confirm('Are you sure you want to delete this defect?');
// //     if (!confirm) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/defects/${id}`, { method: 'DELETE' });
// //       if (response.ok) {
// //         setDefectData(defectData.filter(defect => defect.defectId !== id));
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.message || errorData.error || 'Failed to delete defect.');
// //       }
// //     } catch (err) {
// //       setError('Failed to delete defect.');
// //     }
// //   };

// //   const handleEdit = <T extends Mold | Machine | Product | Employee | Defect>(
// //     item: T,
// //     setForm: React.Dispatch<React.SetStateAction<any>>,
// //     setEditing: React.Dispatch<React.SetStateAction<T | null>>,
// //     setIsAdding: React.Dispatch<React.SetStateAction<boolean>>
// //   ) => {
// //     setForm(item);
// //     setEditing(item);
// //     setIsAdding(true);
// //   };

// //   if (loading) {
// //     return <div className="text-center p-4">Loading...</div>;
// //   }

// //   if (error) {
// //     return <div className="text-center p-4 text-red-600">{error}</div>;
// //   }

// //   return (
    
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <h2 className="text-2xl font-bold text-gray-900">Master Data Management</h2>
// //         <div className="flex items-center space-x-4">
// //           <div className="relative">
// //             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
// //             <Input
// //               placeholder="Search masters..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               className="pl-10 w-64"
// //             />
// //           </div>
// //         </div>
// //       </div>
// //       {isSearching && <div className="text-sm text-gray-500">Searching...</div>}

// //       <Tabs defaultValue="molds" className="space-y-6">
// //         <TabsList className="grid w-full grid-cols-7 bg-white p-1 rounded-lg shadow-sm">
// //           <TabsTrigger value="molds" className="flex items-center gap-2">
// //             <Settings className="h-4 w-4" />
// //             Molds
// //           </TabsTrigger>
// //           <TabsTrigger value="machines" className="flex items-center gap-2">
// //             <Wrench className="h-4 w-4" />
// //             Machines
// //           </TabsTrigger>
// //           <TabsTrigger value="products" className="flex items-center gap-2">
// //             <Package className="h-4 w-4" />
// //             Products
// //           </TabsTrigger>
// //           <TabsTrigger value="defects" className="flex items-center gap-2">
// //             Defects
// //           </TabsTrigger>
// //           <TabsTrigger value="changeover" className="flex items-center gap-2">
// //             Changeover
// //           </TabsTrigger>
// //           <TabsTrigger value="smp" className="flex items-center gap-2">
// //             SMP
// //           </TabsTrigger>
// //           <TabsTrigger value="employees" className="flex items-center gap-2">
// //             <Users className="h-4 w-4" />
// //             Employees
// //           </TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="molds">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <div className="flex justify-between items-center">
// //                 <CardTitle className="flex items-center gap-2">
// //                   <Settings className="h-5 w-5" />
// //                   Mold Master
// //                 </CardTitle>
// //                 <Dialog open={isAddingMold} onOpenChange={(open) => {
// //                   setIsAddingMold(open);
// //                   if (!open) {
// //                     setEditingMold(null);
// //                     setMoldForm({
// //                       name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
// //                       pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
// //                     });
// //                   }
// //                 }}>
// //                   <DialogTrigger asChild>
// //                     <Button className="bg-blue-600 hover:bg-blue-700">
// //                       <Plus className="h-4 w-4 mr-2" />
// //                       {editingMold ? 'Edit Mold' : 'Add Mold'}
// //                     </Button>
// //                   </DialogTrigger>
// //                   <DialogContent className="max-w-2xl" aria-describedby={undefined} >
// //                     <DialogHeader>
// //                       <DialogTitle>{editingMold ? 'Edit Mold' : 'Add New Mold'}</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-2 gap-4 py-4">
// //                       <FormField
// //                         label="Mold Name"
// //                         id="moldName"
// //                         placeholder="Enter mold name"
// //                         value={moldForm.name}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'name', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Mold Dimension"
// //                         id="moldDimension"
// //                         placeholder="L x W x H"
// //                         value={moldForm.dimension}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'dimension', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Hot Runner Zones"
// //                         id="hotRunnerZones"
// //                         type="number"
// //                         placeholder="Number of zones"
// //                         value={moldForm.hotRunnerZones}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'hotRunnerZones', value)}
// //                       />
// //                       <FormField
// //                         label="Sprue Radius"
// //                         id="sprueRadius"
// //                         type="number"
// //                         placeholder="Radius in mm"
// //                         value={moldForm.sprueRadius}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'sprueRadius', value)}
// //                       />
// //                       <FormField
// //                         label="Gate Sequence"
// //                         id="gateSequence"
// //                         type="number"
// //                         placeholder="Number of gates"
// //                         value={moldForm.gateSequence}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'gateSequence', value)}
// //                       />
// //                       <FormField
// //                         label="PM Shot Count"
// //                         id="pmShotCount"
// //                         type="number"
// //                         placeholder="Shots until PM"
// //                         value={moldForm.pmShotCount}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'pmShotCount', value)}
// //                       />
// //                       <FormField
// //                         label="Opening Shot Count"
// //                         id="openingShotCount"
// //                         type="number"
// //                         placeholder="Current shot count"
// //                         value={moldForm.openingShotCount}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'openingShotCount', value)}
// //                       />
// //                       <FormField
// //                         label="Number of Cores"
// //                         id="cores"
// //                         type="number"
// //                         placeholder="Number of cores"
// //                         value={moldForm.cores}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'cores', value)}
// //                       />
// //                       <FormField
// //                         label="Ejector Type"
// //                         id="ejectorType"
// //                         value={moldForm.ejectorType}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'ejectorType', value)}
// //                         options={[
// //                           { value: 'hydraulic', label: 'Hydraulic' },
// //                           { value: 'pneumatic', label: 'Pneumatic' },
// //                           { value: 'mechanical', label: 'Mechanical' }
// //                         ]}
// //                         placeholder="Select ejector type"
// //                       />
// //                       <FormField
// //                         label="Status"
// //                         id="status"
// //                         value={moldForm.status}
// //                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'status', value)}
// //                         options={[
// //                           { value: 'Active', label: 'Active' },
// //                           { value: 'Maintenance', label: 'Maintenance' },
// //                           { value: 'Inactive', label: 'Inactive' }
// //                         ]}
// //                         placeholder="Select status"
// //                       />
// //                     </div>
// //                     <div className="flex justify-end space-x-2">
// //                       <Button variant="outline" onClick={() => setIsAddingMold(false)}>Cancel</Button>
// //                       <Button onClick={handleSubmitMold} disabled={isSubmittingMold}>
// //                         {isSubmittingMold ? 'Saving...' : editingMold ? 'Update Mold' : 'Save Mold'}
// //                       </Button>
// //                     </div>
// //                   </DialogContent>
// //                 </Dialog>
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid gap-4">
// //                 {moldData.length === 0 ? (
// //                   <p className="text-gray-600">No molds found.</p>
// //                 ) : (
// //                   moldData.map((mold) => (
// //                     <div key={mold.moldId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
// //                       <div className="flex justify-between items-start">
// //                         <div className="grid grid-cols-3 gap-4 flex-1">
// //                           <div>
// //                             <h3 className="font-semibold text-lg">{mold.name}</h3>
// //                             <p className="text-sm text-gray-600">Dimension: {mold.dimension}</p>
// //                             <p className="text-sm text-gray-600">Hot Runner Zones: {mold.hotRunnerZones}</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">Sprue Radius: {mold.sprueRadius}mm</p>
// //                             <p className="text-sm text-gray-600">Gate Sequence: {mold.gateSequence}</p>
// //                             <p className="text-sm text-gray-600">Cores: {mold.cores}</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">PM Shot Count: {mold.pmShotCount}</p>
// //                             <p className="text-sm text-gray-600">Current Shots: {mold.openingShotCount}</p>
// //                             <p className="text-sm text-gray-600">Ejector: {mold.ejectorType}</p>
// //                           </div>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Badge variant={mold.status === 'Active' ? 'default' : 'secondary'}>{mold.status}</Badge>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Edit mold"
// //                             onClick={() => handleEdit(mold, setMoldForm, setEditingMold, setIsAddingMold)}
// //                           >
// //                             <Edit className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Delete mold"
// //                             onClick={() => handleDeleteMold(mold.moldId)}
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </Button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="machines">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <div className="flex justify-between items-center">
// //                 <CardTitle className="flex items-center gap-2">
// //                   <Wrench className="h-5 w-5" />
// //                   Machine Master
// //                 </CardTitle>
// //                 <Dialog open={isAddingMachine} onOpenChange={(open) => {
// //                   setIsAddingMachine(open);
// //                   if (!open) {
// //                     setEditingMachine(null);
// //                     setMachineForm({
// //                       name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
// //                       screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
// //                       ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
// //                     });
// //                   }
// //                 }}>
// //                   <DialogTrigger asChild>
// //                     <Button className="bg-blue-600 hover:bg-blue-700">
// //                       <Plus className="h-4 w-4 mr-2" />
// //                       {editingMachine ? 'Edit Machine' : 'Add Machine'}
// //                     </Button>
// //                   </DialogTrigger>
// //                   <DialogContent className="max-w-3xl" aria-describedby={undefined} >
// //                     <DialogHeader>
// //                       <DialogTitle>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
// //                       <FormField
// //                         label="Machine Name"
// //                         id="machineName"
// //                         placeholder="Enter machine name"
// //                         value={machineForm.name}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'name', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Tie Bar Distance"
// //                         id="tieBarDistance"
// //                         placeholder="L x W (mm)"
// //                         value={machineForm.tieBarDistance}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'tieBarDistance', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Number of Cores"
// //                         id="machineCores"
// //                         type="number"
// //                         placeholder="Number of cores"
// //                         value={machineForm.cores}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'cores', value)}
// //                       />
// //                       <FormField
// //                         label="Max Mold Height"
// //                         id="maxMoldHeight"
// //                         type="number"
// //                         placeholder="Height in mm"
// //                         value={machineForm.maxMoldHeight}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxMoldHeight', value)}
// //                       />
// //                       <FormField
// //                         label="Max Daylight"
// //                         id="maxDaylight"
// //                         type="number"
// //                         placeholder="Daylight in mm"
// //                         value={machineForm.maxDaylight}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxDaylight', value)}
// //                       />
// //                       <FormField
// //                         label="Screw Diameter"
// //                         id="screwDia"
// //                         type="number"
// //                         placeholder="Diameter in mm"
// //                         value={machineForm.screwDia}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwDia', value)}
// //                       />
// //                       <FormField
// //                         label="L/D Ratio"
// //                         id="ldRatio"
// //                         type="number"
// //                         placeholder="L/D ratio"
// //                         value={machineForm.ldRatio}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ldRatio', value)}
// //                       />
// //                       <FormField
// //                         label="Screw Type"
// //                         id="screwType"
// //                         value={machineForm.screwType}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwType', value)}
// //                         options={[
// //                           { value: 'general-purpose', label: 'General Purpose' },
// //                           { value: 'mixing', label: 'Mixing' },
// //                           { value: 'barrier', label: 'Barrier' },
// //                           { value: 'vented', label: 'Vented' }
// //                         ]}
// //                         placeholder="Select screw type"
// //                       />
// //                       <FormField
// //                         label="Shot Size"
// //                         id="shotSize"
// //                         type="number"
// //                         placeholder="Shot size in grams"
// //                         value={machineForm.shotSize}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'shotSize', value)}
// //                       />
// //                       <FormField
// //                         label="Screw Stroke Length"
// //                         id="screwStrokeLength"
// //                         type="number"
// //                         placeholder="Length in mm"
// //                         value={machineForm.screwStrokeLength}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwStrokeLength', value)}
// //                       />
// //                       <FormField
// //                         label="Ejector Stroke Length"
// //                         id="ejectorStrokeLength"
// //                         type="number"
// //                         placeholder="Length in mm"
// //                         value={machineForm.ejectorStrokeLength}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ejectorStrokeLength', value)}
// //                       />
// //                       <FormField
// //                         label="Min Mold Height"
// //                         id="minMoldHeight"
// //                         type="number"
// //                         placeholder="Height in mm"
// //                         value={machineForm.minMoldHeight}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'minMoldHeight', value)}
// //                       />
// //                       <FormField
// //                         label="Hopper Capacity"
// //                         id="hopperCapacity"
// //                         type="number"
// //                         placeholder="Capacity in kg"
// //                         value={machineForm.hopperCapacity}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'hopperCapacity', value)}
// //                       />
// //                       <FormField
// //                         label="Status"
// //                         id="status"
// //                         value={machineForm.status}
// //                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'status', value)}
// //                         options={[
// //                           { value: 'Running', label: 'Running' },
// //                           { value: 'Maintenance', label: 'Maintenance' },
// //                           { value: 'Idle', label: 'Idle' }
// //                         ]}
// //                         placeholder="Select status"
// //                       />
// //                     </div>
// //                     <div className="flex justify-end space-x-2">
// //                       <Button variant="outline" onClick={() => setIsAddingMachine(false)}>Cancel</Button>
// //                       <Button onClick={handleSubmitMachine} disabled={isSubmittingMachine}>
// //                         {isSubmittingMachine ? 'Saving...' : editingMachine ? 'Update Machine' : 'Save Machine'}
// //                       </Button>
// //                     </div>
// //                   </DialogContent>
// //                 </Dialog>
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid gap-4">
// //                 {machineData.length === 0 ? (
// //                   <p className="text-gray-600">No machines found.</p>
// //                 ) : (
// //                   machineData.map((machine) => (
// //                     <div key={machine.machineId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
// //                       <div className="flex justify-between items-start">
// //                         <div className="grid grid-cols-3 gap-4 flex-1">
// //                           <div>
// //                             <h3 className="font-semibold text-lg">{machine.name}</h3>
// //                             <p className="text-sm text-gray-600">Tie Bar Distance: {machine.tieBarDistance}</p>
// //                             <p className="text-sm text-gray-600">Cores: {machine.cores}</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">Max Mold Height: {machine.maxMoldHeight}mm</p>
// //                             <p className="text-sm text-gray-600">Max Daylight: {machine.maxDaylight}mm</p>
// //                             <p className="text-sm text-gray-600">Screw Diameter: {machine.screwDia}mm</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">L/D Ratio: {machine.ldRatio}</p>
// //                             <p className="text-sm text-gray-600">Shot Size: {machine.shotSize}g</p>
// //                             <p className="text-sm text-gray-600">Hopper Capacity: {machine.hopperCapacity}kg</p>
// //                           </div>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Badge variant={machine.status === 'Running' ? 'default' : 'secondary'}>{machine.status}</Badge>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Edit machine"
// //                             onClick={() => handleEdit(machine, setMachineForm, setEditingMachine, setIsAddingMachine)}
// //                           >
// //                             <Edit className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Delete machine"
// //                             onClick={() => handleDeleteMachine(machine.machineId)}
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </Button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="products">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <div className="flex justify-between items-center">
// //                 <CardTitle className="flex items-center gap-2">
// //                   <Package className="h-5 w-5" />
// //                   Product Master
// //                 </CardTitle>
// //                 <Dialog open={isAddingProduct} onOpenChange={(open) => {
// //                   setIsAddingProduct(open);
// //                   if (!open) {
// //                     setEditingProduct(null);
// //                     setProductForm({
// //                       name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
// //                       cavities: '', packingMethod: '', packingQty: '', status: 'Active'
// //                     });
// //                   }
// //                 }}>
// //                   <DialogTrigger asChild>
// //                     <Button className="bg-blue-600 hover:bg-blue-700">
// //                       <Plus className="h-4 w-4 mr-2" />
// //                       {editingProduct ? 'Edit Product' : 'Add Product'}
// //                     </Button>
// //                   </DialogTrigger>
// //                   <DialogContent className="max-w-2xl" aria-describedby={undefined} >
// //                     <DialogHeader>
// //                       <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-2 gap-4 py-4">
// //                       <FormField
// //                         label="Product Name"
// //                         id="productName"
// //                         placeholder="Enter product name"
// //                         value={productForm.name}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'name', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Cycle Time"
// //                         id="cycleTime"
// //                         type="number"
// //                         placeholder="Cycle time in seconds"
// //                         value={productForm.cycleTime}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'cycleTime', value)}
// //                       />
// //                       <FormField
// //                         label="Material"
// //                         id="material"
// //                         value={productForm.material}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'material', value)}
// //                         options={[
// //                           { value: 'pp', label: 'PP (Polypropylene)' },
// //                           { value: 'pe', label: 'PE (Polyethylene)' },
// //                           { value: 'abs', label: 'ABS' },
// //                           { value: 'pc', label: 'PC (Polycarbonate)' },
// //                           { value: 'nylon', label: 'Nylon' },
// //                           { value: 'pom', label: 'POM' }
// //                         ]}
// //                         placeholder="Select material"
// //                         required
// //                       />
// //                       <FormField
// //                         label="Part Weight"
// //                         id="partWeight"
// //                         type="number"
// //                         placeholder="Weight in grams"
// //                         value={productForm.partWeight}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'partWeight', value)}
// //                       />
// //                       <FormField
// //                         label="Runner Weight"
// //                         id="runnerWeight"
// //                         type="number"
// //                         placeholder="Weight in grams"
// //                         value={productForm.runnerWeight}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'runnerWeight', value)}
// //                       />
// //                       <FormField
// //                         label="Number of Cavities"
// //                         id="cavities"
// //                         type="number"
// //                         placeholder="Number of cavities"
// //                         value={productForm.cavities}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'cavities', value)}
// //                       />
// //                       <FormField
// //                         label="Packing Method"
// //                         id="packingMethod"
// //                         value={productForm.packingMethod}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'packingMethod', value)}
// //                         options={[
// //                           { value: 'carton', label: 'Carton' },
// //                           { value: 'bag', label: 'Bag' },
// //                           { value: 'tray', label: 'Tray' },
// //                           { value: 'bulk', label: 'Bulk' }
// //                         ]}
// //                         placeholder="Select packing method"
// //                       />
// //                       <FormField
// //                         label="Packing Quantity"
// //                         id="packingQty"
// //                         type="number"
// //                         placeholder="Quantity per pack"
// //                         value={productForm.packingQty}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'packingQty', value)}
// //                       />
// //                       <FormField
// //                         label="Status"
// //                         id="status"
// //                         value={productForm.status}
// //                         onChange={(value) => handleInputChange(productForm, setProductForm, 'status', value)}
// //                         options={[
// //                           { value: 'Active', label: 'Active' },
// //                           { value: 'Inactive', label: 'Inactive' }
// //                         ]}
// //                         placeholder="Select status"
// //                       />
// //                     </div>
// //                     <div className="flex justify-end space-x-2">
// //                       <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
// //                       <Button onClick={handleSubmitProduct} disabled={isSubmittingProduct}>
// //                         {isSubmittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
// //                       </Button>
// //                     </div>
// //                   </DialogContent>
// //                 </Dialog>
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid gap-4">
// //                 {productData.length === 0 ? (
// //                   <p className="text-gray-600">No products found.</p>
// //                 ) : (
// //                   productData.map((product) => (
// //                     <div key={product.productId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
// //                       <div className="flex justify-between items-start">
// //                         <div className="grid grid-cols-3 gap-4 flex-1">
// //                           <div>
// //                             <h3 className="font-semibold text-lg">{product.name}</h3>
// //                             <p className="text-sm text-gray-600">Cycle Time: {product.cycleTime}s</p>
// //                             <p className="text-sm text-gray-600">Material: {product.material}</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">Part Weight: {product.partWeight}g</p>
// //                             <p className="text-sm text-gray-600">Runner Weight: {product.runnerWeight}g</p>
// //                             <p className="text-sm text-gray-600">Cavities: {product.cavities}</p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-600">Packing Method: {product.packingMethod}</p>
// //                             <p className="text-sm text-gray-600">Packing Qty: {product.packingQty}</p>
// //                           </div>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>{product.status}</Badge>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Edit product"
// //                             onClick={() => handleEdit(product, setProductForm, setEditingProduct, setIsAddingProduct)}
// //                           >
// //                             <Edit className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Delete product"
// //                             onClick={() => handleDeleteProduct(product.productId)}
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </Button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="defects">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <div className="flex justify-between items-center">
// //                 <CardTitle>Defect Master</CardTitle>
// //                 <Dialog open={isAddingDefect} onOpenChange={(open) => {
// //                   setIsAddingDefect(open);
// //                   if (!open) {
// //                     setEditingDefect(null);
// //                     setDefectForm({ name: '', defectType: '' });
// //                   }
// //                 }}>
// //                   <DialogTrigger asChild>
// //                     <Button className="bg-blue-600 hover:bg-blue-700">
// //                       <Plus className="h-4 w-4 mr-2" />
// //                       {editingDefect ? 'Edit Defect' : 'Add Defect'}
// //                     </Button>
// //                   </DialogTrigger>
// //                   <DialogContent className="max-w-md" aria-describedby={undefined} >
// //                     <DialogHeader>
// //                       <DialogTitle>{editingDefect ? 'Edit Defect' : 'Add New Defect'}</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-1 gap-4 py-4">
// //                       <FormField
// //                         label="Defect Name"
// //                         id="defectName"
// //                         placeholder="Enter defect name"
// //                         value={defectForm.name}
// //                         onChange={(value) => handleInputChange(defectForm, setDefectForm, 'name', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Defect Type"
// //                         id="defectType"
// //                         value={defectForm.defectType}
// //                         onChange={(value) => handleInputChange(defectForm, setDefectForm, 'defectType', value)}
// //                         options={[
// //                           { value: 'injection-molding', label: 'Injection Molding' },
// //                           { value: 'assembly', label: 'Assembly' }
// //                         ]}
// //                         placeholder="Select defect type"
// //                         required
// //                       />
// //                     </div>
// //                     <div className="flex justify-end space-x-2">
// //                       <Button variant="outline" onClick={() => setIsAddingDefect(false)}>Cancel</Button>
// //                       <Button onClick={handleSubmitDefect} disabled={isSubmittingDefect}>
// //                         {isSubmittingDefect ? 'Saving...' : editingDefect ? 'Update Defect' : 'Save Defect'}
// //                       </Button>
// //                     </div>
// //                   </DialogContent>
// //                 </Dialog>
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="space-y-4">
// //                 <div className="grid grid-cols-2 gap-4">
// //                   <div className="border rounded-lg p-4">
// //                     <h3 className="font-semibold mb-2">Injection Molding Defects</h3>
// //                     <div className="space-y-2">
// //                       {defectData.filter(d => d.defectType === 'injection-molding').length === 0 ? (
// //                         <p className="text-gray-600">No injection molding defects found.</p>
// //                       ) : (
// //                         defectData.filter(d => d.defectType === 'injection-molding').map(defect => (
// //                           <div key={defect.defectId} className="flex items-center space-x-2">
// //                             <Badge variant="outline">{defect.name}</Badge>
// //                             <Button
// //                               variant="outline"
// //                               size="sm"
// //                               aria-label="Edit defect"
// //                               onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
// //                             >
// //                               <Edit className="h-4 w-4" />
// //                             </Button>
// //                             <Button
// //                               variant="outline"
// //                               size="sm"
// //                               aria-label="Delete defect"
// //                               onClick={() => handleDeleteDefect(defect.defectId)}
// //                             >
// //                               <Trash2 className="h-4 w-4" />
// //                             </Button>
// //                           </div>
// //                         ))
// //                       )}
// //                     </div>
// //                   </div>
// //                   <div className="border rounded-lg p-4">
// //                     <h3 className="font-semibold mb-2">Assembly Defects</h3>
// //                     <div className="space-y-2">
// //                       {defectData.filter(d => d.defectType === 'assembly').length === 0 ? (
// //                         <p className="text-gray-600">No assembly defects found.</p>
// //                       ) : (
// //                         defectData.filter(d => d.defectType === 'assembly').map(defect => (
// //                           <div key={defect.defectId} className="flex items-center space-x-2">
// //                             <Badge variant="outline">{defect.name}</Badge>
// //                             <Button
// //                               variant="outline"
// //                               size="sm"
// //                               aria-label="Edit defect"
// //                               onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
// //                             >
// //                               <Edit className="h-4 w-4" />
// //                             </Button>
// //                             <Button
// //                               variant="outline"
// //                               size="sm"
// //                               aria-label="Delete defect"
// //                               onClick={() => handleDeleteDefect(defect.defectId)}
// //                             >
// //                               <Trash2 className="h-4 w-4" />
// //                             </Button>
// //                           </div>
// //                         ))
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="changeover">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <CardTitle>Changeover Time Matrix</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="space-y-4">
// //                 <p className="text-gray-600">
// //                   Configure changeover times for mold-machine, color-color, and material-material transitions.
// //                   This section can be expanded to include a matrix editor or table for defining specific times.
// //                 </p>
// //                 <div className="grid grid-cols-3 gap-4">
// //                   <Card>
// //                     <CardHeader>
// //                       <CardTitle className="text-sm">Mold-Machine Matrix</CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <p className="text-xs text-gray-600">Define changeover times between different mold-machine combinations.</p>
// //                       {/* Placeholder for future implementation */}
// //                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
// //                     </CardContent>
// //                   </Card>
// //                   <Card>
// //                     <CardHeader>
// //                       <CardTitle className="text-sm">Color-Color Matrix</CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <p className="text-xs text-gray-600">Setup color changeover times and purging requirements.</p>
// //                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
// //                     </CardContent>
// //                   </Card>
// //                   <Card>
// //                     <CardHeader>
// //                       <CardTitle className="text-sm">Material-Material Matrix</CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <p className="text-xs text-gray-600">Configure material changeover procedures and times.</p>
// //                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
// //                     </CardContent>
// //                   </Card>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="smp">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <CardTitle>SMP (Standard Manufacturing Procedure)</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <p className="text-gray-600">
// //                 Configure Standard Manufacturing Procedures (SMP) for production processes.
// //                 This section can be expanded to include a form for defining SMP details, such as steps, parameters, and documentation.
// //               </p>
// //               <Button variant="outline" className="mt-4">Add SMP</Button>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="employees">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <div className="flex justify-between items-center">
// //                 <CardTitle className="flex items-center gap-2">
// //                   <Users className="h-5 w-5" />
// //                   Employee Master
// //                 </CardTitle>
// //                 <Dialog open={isAddingEmployee} onOpenChange={(open) => {
// //                   setIsAddingEmployee(open);
// //                   if (!open) {
// //                     setEditingEmployee(null);
// //                     setEmployeeForm({
// //                       name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
// //                     });
// //                   }
// //                 }}>
// //                   <DialogTrigger asChild>
// //                     <Button className="bg-blue-600 hover:bg-blue-700">
// //                       <Plus className="h-4 w-4 mr-2" />
// //                       {editingEmployee ? 'Edit Employee' : 'Add Employee'}
// //                     </Button>
// //                   </DialogTrigger>
// //                   <DialogContent className="max-w-2xl" aria-describedby={undefined} >
// //                     <DialogHeader>
// //                       <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-1 gap-4 py-4">
// //                       <FormField
// //                         label="Name"
// //                         id="employeeName"
// //                         placeholder="Enter employee full name"
// //                         value={employeeForm.name}
// //                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'name', value)}
// //                         required
// //                       />
// //                       <FormField
// //                         label="Role"
// //                         id="employeeRole"
// //                         placeholder="Enter job role/designation"
// //                         value={employeeForm.role}
// //                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'role', value)}
// //                       />
// //                       <FormField
// //                         label="Mail ID"
// //                         id="employeeEmail"
// //                         type="email"
// //                         placeholder="Enter email address"
// //                         value={employeeForm.email}
// //                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'email', value)}
// //                         required
// //                       />
// //                       {!editingEmployee && (
// //                         <FormField
// //                           label="Password"
// //                           id="employeePassword"
// //                           type="password"
// //                           placeholder="Enter password"
// //                           value={employeeForm.password}
// //                           onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
// //                         />
// //                       )}
// //                       {editingEmployee && (
// //                         <FormField
// //                           label="New Password (Optional)"
// //                           id="employeePassword"
// //                           type="password"
// //                           placeholder="Enter new password"
// //                           value={employeeForm.password}
// //                           onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
// //                         />
// //                       )}
// //                       <FormField
// //                         label="Group"
// //                         id="employeeGroup"
// //                         value={employeeForm.employeeGroup}
// //                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'employeeGroup', value)}
// //                         options={employeeGroups.map(group => ({
// //                           value: group.toLowerCase().replace(' ', '-'),
// //                           label: group
// //                         }))}
// //                         placeholder="Select employee group"
// //                         required
// //                       />
// //                       <FormField
// //                         label="Status"
// //                         id="status"
// //                         value={employeeForm.status}
// //                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'status', value)}
// //                         options={[
// //                           { value: 'Active', label: 'Active' },
// //                           { value: 'Inactive', label: 'Inactive' }
// //                         ]}
// //                         placeholder="Select status"
// //                       />
// //                     </div>
// //                     <div className="flex justify-end space-x-2">
// //                       <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>Cancel</Button>
// //                       <Button onClick={handleSubmitEmployee} disabled={isSubmittingEmployee}>
// //                         {isSubmittingEmployee ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
// //                       </Button>
// //                     </div>
// //                   </DialogContent>
// //                 </Dialog>
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="mb-6">
// //                 <h3 className="text-lg font-semibold mb-4">Employee Groups</h3>
// //                 <div className="grid grid-cols-7 gap-2">
// //                   {employeeGroups.map((group) => (
// //                     <Badge key={group} variant="outline" className="justify-center p-2">{group}</Badge>
// //                   ))}
// //                 </div>
// //               </div>
// //               <div className="space-y-4">
// //                 <h3 className="text-lg font-semibold">Employees</h3>
// //                 {employeeData.length === 0 ? (
// //                   <p className="text-gray-600">No employees found.</p>
// //                 ) : (
// //                   employeeData.map((employee) => (
// //                     <div key={employee.employeeId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
// //                       <div className="flex justify-between items-start">
// //                         <div className="grid grid-cols-2 gap-4 flex-1">
// //                           <div>
// //                             <h4 className="font-semibold text-lg">{employee.name}</h4>
// //                             <p className="text-sm text-gray-600">Role: {employee.role}</p>
// //                             <p className="text-sm text-gray-600">Email: {employee.email}</p>
// //                           </div>
// //                           <div>
// //                             <Badge variant="outline" className="mb-2">{employee.employeeGroup}</Badge>
// //                             <p className="text-sm text-gray-600">Status: {employee.status}</p>
// //                           </div>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>{employee.status}</Badge>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Edit employee"
// //                             onClick={() => handleEdit(employee, setEmployeeForm, setEditingEmployee, setIsAddingEmployee)}
// //                           >
// //                             <Edit className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             aria-label="Delete employee"
// //                             onClick={() => handleDeleteEmployee(employee.employeeId)}
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </Button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // };

// // export default MasterData;


// import React, { useState, useEffect, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import { Plus, Edit, Trash2, Search, Settings, Package, Users, Wrench } from 'lucide-react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// // Define interfaces for type safety
// interface Mold {
//   moldId: string;
//   name: string;
//   dimension: string;
//   hotRunnerZones: number;
//   sprueRadius: number;
//   gateSequence: number;
//   pmShotCount: number;
//   openingShotCount: number;
//   cores: number;
//   ejectorType: string;
//   status: string;
// }

// interface Machine {
//   machineId: string;
//   name: string;
//   tieBarDistance: string;
//   cores: number;
//   maxMoldHeight: number;
//   maxDaylight: number;
//   screwDia: number;
//   ldRatio: number;
//   screwType: string;
//   shotSize: number;
//   screwStrokeLength: number;
//   ejectorStrokeLength: number;
//   minMoldHeight: number;
//   hopperCapacity: number;
//   status: string;
// }

// interface Product {
//   productId: string;
//   name: string;
//   cycleTime: number;
//   material: string;
//   partWeight: number;
//   runnerWeight: number;
//   cavities: number;
//   packingMethod: string;
//   packingQty: number;
//   status: string;
// }

// interface Employee {
//   employeeId: number;
//   name: string;
//   role: string;
//   email: string;
//   employeeGroup: string;
//   status: string;
// }

// interface Defect {
//   defectId: string;
//   name: string;
//   defectType: string;
// }

// // Reusable FormField component
// interface FormFieldProps {
//   label: string;
//   id: string;
//   type?: string;
//   value: string | number;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   options?: { value: string; label: string }[];
//   required?: boolean;
// }

// const FormField: React.FC<FormFieldProps> = ({
//   label,
//   id,
//   type = 'text',
//   value,
//   onChange,
//   placeholder,
//   options,
//   required,
// }) => (
//   <div className="space-y-2">
//     <Label htmlFor={id}>
//       {label}
//       {required && <span className="text-red-500">*</span>}
//     </Label>
//     {options ? (
//       <Select value={value?.toString() ?? ''} onValueChange={(val) => onChange(val)}>
//         <SelectTrigger>
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>
//         <SelectContent>
//           {options.map((opt) => (
//             <SelectItem key={opt.value} value={String(opt.value)}>
//               {opt.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     ) : (
//       <Input
//         id={id}
//         type={type}
//         placeholder={placeholder}
//         value={value ?? ''}
//         onChange={(e) => onChange(e.target.value)}
//         required={required}
//       />
//     )}
//   </div>
// );

// const MasterData: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [moldData, setMoldData] = useState<Mold[]>([]);
//   const [machineData, setMachineData] = useState<Machine[]>([]);
//   const [productData, setProductData] = useState<Product[]>([]);
//   const [employeeData, setEmployeeData] = useState<Employee[]>([]);
//   const [defectData, setDefectData] = useState<Defect[]>([]);
//   const [isAddingMold, setIsAddingMold] = useState(false);
//   const [isAddingMachine, setIsAddingMachine] = useState(false);
//   const [isAddingProduct, setIsAddingProduct] = useState(false);
//   const [isAddingEmployee, setIsAddingEmployee] = useState(false);
//   const [isAddingDefect, setIsAddingDefect] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [editingMold, setEditingMold] = useState<Mold | null>(null);
//   const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
//   const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
//   const [isSubmittingMold, setIsSubmittingMold] = useState(false);
//   const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);
//   const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
//   const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
//   const [isSubmittingDefect, setIsSubmittingDefect] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const API_BASE_URL = 'http://192.168.1.82:5000/api';

//   const [moldForm, setMoldForm] = useState({
//     name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
//     pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
//   });
//   const [machineForm, setMachineForm] = useState({
//     name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
//     screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
//     ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
//   });
//   const [productForm, setProductForm] = useState({
//     name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
//     cavities: '', packingMethod: '', packingQty: '', status: 'Active'
//   });
//   const [employeeForm, setEmployeeForm] = useState({
//     name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
//   });
//   const [defectForm, setDefectForm] = useState({
//     name: '', defectType: ''
//   });

//   const employeeGroups = [
//     'Operator', 'PDI Inspector', 'Production', 'Maintenance',
//     'Quality', 'HOD', 'Admin'
//   ];

//   // Debounced fetch data
//   useEffect(() => {
//     setIsSearching(true);
//     const debounceFetch = setTimeout(() => {
//       const fetchData = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//           const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
//           const [moldsRes, machinesRes, productsRes, employeesRes, defectsRes] = await Promise.all([
//             fetch(`${API_BASE_URL}/molds${query}`).catch(() => null),
//             fetch(`${API_BASE_URL}/machines${query}`).catch(() => null),
//             fetch(`${API_BASE_URL}/products${query}`).catch(() => null),
//             fetch(`${API_BASE_URL}/employees${query}`).catch(() => null),
//             fetch(`${API_BASE_URL}/defects${query}`).catch(() => null)
//           ]);

//           const molds = moldsRes && moldsRes.ok ? await moldsRes.json().catch(() => []) : moldData;
//           const machines = machinesRes && machinesRes.ok ? await machinesRes.json().catch(() => []) : machineData;
//           const products = productsRes && productsRes.ok ? await productsRes.json().catch(() => []) : productData;
//           const employees = employeesRes && employeesRes.ok ? await employeesRes.json().catch(() => []) : employeeData;
//           const defects = defectsRes && defectsRes.ok ? await defectsRes.json().catch(() => []) : defectData;

//           setMoldData(Array.isArray(molds) ? molds : []);
//           setMachineData(Array.isArray(machines) ? machines : []);
//           setProductData(Array.isArray(products) ? products : []);
//           setEmployeeData(Array.isArray(employees) ? employees : []);
//           setDefectData(Array.isArray(defects) ? defects : []);

//           const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
//           if (!moldsRes?.ok || !machinesRes?.ok || !productsRes?.ok || !employeesRes?.ok || !defectsRes?.ok) {
//             setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Some data could not be loaded. Displaying cached data.');
//           }
//         } catch (err) {
//           console.error('Error fetching master data:', err);
//           const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
//           setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Failed to load data. Displaying cached data.');
//         } finally {
//           setLoading(false);
//           setIsSearching(false);
//         }
//       };
//       fetchData();
//     }, 300);

//     return () => clearTimeout(debounceFetch);
//   }, [searchTerm]);

//   const handleInputChange = useCallback(<T extends object>(
//     form: T,
//     setForm: React.Dispatch<React.SetStateAction<T>>,
//     field: keyof T,
//     value: string
//   ) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   }, []);

//   const clearError = () => setError(null);

//   const validateNonNegativeNumber = (value: string, fieldName: string) => {
//     if (value === '') return true;
//     const num = parseFloat(value);
//     if (isNaN(num)) {
//       setError(`${fieldName} must be a valid number.`);
//       return false;
//     }
//     if (num < 0) {
//       setError(`${fieldName} cannot be negative.`);
//       return false;
//     }
//     return true;
//   };

//   const handleSubmitMold = async () => {
//     clearError();
//     if (!moldForm.name || !moldForm.dimension) {
//       setError('Mold name and dimension are required.');
//       return;
//     }
//     if (moldForm.hotRunnerZones && !validateNonNegativeNumber(moldForm.hotRunnerZones, 'Hot Runner Zones')) return;
//     if (moldForm.sprueRadius && !validateNonNegativeNumber(moldForm.sprueRadius, 'Sprue Radius')) return;
//     if (moldForm.gateSequence && !validateNonNegativeNumber(moldForm.gateSequence, 'Gate Sequence')) return;
//     if (moldForm.pmShotCount && !validateNonNegativeNumber(moldForm.pmShotCount, 'PM Shot Count')) return;
//     if (moldForm.openingShotCount && !validateNonNegativeNumber(moldForm.openingShotCount, 'Opening Shot Count')) return;
//     if (moldForm.cores && !validateNonNegativeNumber(moldForm.cores, 'Cores')) return;
//     setIsSubmittingMold(true);
//     try {
//       clearError();
//       const url = editingMold ? `${API_BASE_URL}/molds/${editingMold.moldId}` : `${API_BASE_URL}/molds`;
//       const method = editingMold ? 'PUT' : 'POST';
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...moldForm,
//           hotRunnerZones: parseInt(moldForm.hotRunnerZones) || 0,
//           sprueRadius: parseFloat(moldForm.sprueRadius) || 0,
//           gateSequence: parseInt(moldForm.gateSequence) || 0,
//           pmShotCount: parseInt(moldForm.pmShotCount) || 0,
//           openingShotCount: parseInt(moldForm.openingShotCount) || 0,
//           cores: parseInt(moldForm.cores) || 0
//         })
//       });
//       if (response.ok) {
//         setIsAddingMold(false);
//         setEditingMold(null);
//         setMoldForm({
//           name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
//           pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
//         });
//         const molds = await fetch(`${API_BASE_URL}/molds${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
//         setMoldData(Array.isArray(molds) ? molds : []);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || `Failed to ${editingMold ? 'update' : 'add'} mold.`);
//       }
//     } catch (err) {
//       setError(`Failed to ${editingMold ? 'update' : 'add'} mold.`);
//     } finally {
//       setIsSubmittingMold(false);
//     }
//   };

//   const handleDeleteMold = async (id: string) => {
//     const confirm = window.confirm('Are you sure you want to delete this mold?');
//     if (!confirm) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/molds/${id}`, { method: 'DELETE' });
//       if (response.ok) {
//         setMoldData(moldData.filter(mold => mold.moldId !== id));
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || 'Failed to delete mold.');
//       }
//     } catch (err) {
//       setError('Failed to delete mold.');
//     }
//   };

//   const handleSubmitMachine = async () => {
//     clearError();
//     if (!machineForm.name || !machineForm.tieBarDistance) {
//       setError('Machine name and tie bar distance are required.');
//       return;
//     }
//     if (machineForm.cores && !validateNonNegativeNumber(machineForm.cores, 'Cores')) return;
//     if (machineForm.maxMoldHeight && !validateNonNegativeNumber(machineForm.maxMoldHeight, 'Max Mold Height')) return;
//     setIsSubmittingMachine(true);
//     try {
//       const url = editingMachine ? `${API_BASE_URL}/machines/${editingMachine.machineId}` : `${API_BASE_URL}/machines`;
//       const method = editingMachine ? 'PUT' : 'POST';
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...machineForm,
//           cores: parseInt(machineForm.cores) || 0,
//           maxMoldHeight: parseInt(machineForm.maxMoldHeight) || 0,
//           maxDaylight: parseInt(machineForm.maxDaylight) || 0,
//           screwDia: parseInt(machineForm.screwDia) || 0,
//           ldRatio: parseInt(machineForm.ldRatio) || 0,
//           shotSize: parseInt(machineForm.shotSize) || 0,
//           screwStrokeLength: parseInt(machineForm.screwStrokeLength) || 0,
//           ejectorStrokeLength: parseInt(machineForm.ejectorStrokeLength) || 0,
//           minMoldHeight: parseInt(machineForm.minMoldHeight) || 0,
//           hopperCapacity: parseInt(machineForm.hopperCapacity) || 0
//         })
//       });
//       if (response.ok) {
//         setIsAddingMachine(false);
//         setEditingMachine(null);
//         setMachineForm({
//           name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
//           screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
//           ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
//         });
//         const machines = await fetch(`${API_BASE_URL}/machines${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
//         setMachineData(Array.isArray(machines) ? machines : []);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || `Failed to ${editingMachine ? 'update' : 'add'} machine.`);
//       }
//     } catch (err) {
//       setError(`Failed to ${editingMachine ? 'update' : 'add'} machine.`);
//     } finally {
//       setIsSubmittingMachine(false);
//     }
//   };

//   const handleDeleteMachine = async (id: string) => {
//     const confirm = window.confirm('Are you sure you want to delete this machine?');
//     if (!confirm) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/machines/${id}`, { method: 'DELETE' });
//       if (response.ok) {
//         setMachineData(machineData.filter(machine => machine.machineId !== id));
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || 'Failed to delete machine.');
//       }
//     } catch (err) {
//       setError('Failed to delete machine.');
//     }
//   };

//   const handleSubmitProduct = async () => {
//     clearError();
//     if (!productForm.name || !productForm.material) {
//       setError('Product name and material are required.');
//       return;
//     }
//     if (productForm.cycleTime && !validateNonNegativeNumber(productForm.cycleTime, 'Cycle Time')) return;
//     setIsSubmittingProduct(true);
//     try {
//       const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct.productId}` : `${API_BASE_URL}/products`;
//       const method = editingProduct ? 'PUT' : 'POST';
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...productForm,
//           cycleTime: parseInt(productForm.cycleTime) || 0,
//           partWeight: parseFloat(productForm.partWeight) || 0,
//           runnerWeight: parseFloat(productForm.runnerWeight) || 0,
//           cavities: parseInt(productForm.cavities) || 0,
//           packingQty: parseInt(productForm.packingQty) || 0
//         })
//       });
//       if (response.ok) {
//         setIsAddingProduct(false);
//         setEditingProduct(null);
//         setProductForm({
//           name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
//           cavities: '', packingMethod: '', packingQty: '', status: 'Active'
//         });
//         const products = await fetch(`${API_BASE_URL}/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
//         setProductData(Array.isArray(products) ? products : []);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || `Failed to ${editingProduct ? 'update' : 'add'} product.`);
//       }
//     } catch (err) {
//       setError(`Failed to ${editingProduct ? 'update' : 'add'} product.`);
//     } finally {
//       setIsSubmittingProduct(false);
//     }
//   };

//   const handleDeleteProduct = async (id: string) => {
//     const confirm = window.confirm('Are you sure you want to delete this product?');
//     if (!confirm) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
//       if (response.ok) {
//         setProductData(productData.filter(product => product.productId !== id));
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || 'Failed to delete product.');
//       }
//     } catch (err) {
//       setError('Failed to delete product.');
//     }
//   };

//   const handleSubmitEmployee = async () => {
//     clearError();
//     if (!employeeForm.name || !employeeForm.email || !employeeForm.employeeGroup) {
//       setError('Employee name, email, and group are required.');
//       return;
//     }
//     setIsSubmittingEmployee(true);
//     try {
//       if (editingEmployee && employeeForm.email) {
//         const response = await fetch(`${API_BASE_URL}/employees?search=${encodeURIComponent(employeeForm.email)}`);
//         if (!response.ok) {
//           throw new Error('Failed to check email uniqueness.');
//         }
//         const employees = await response.json();
//         if (!Array.isArray(employees)) {
//           throw new Error('Invalid response format from server.');
//         }
//         if (employees.some(emp => emp.email === employeeForm.email && emp.employeeId !== editingEmployee.employeeId)) {
//           setError('Email is already in use by another employee.');
//           return;
//         }
//       }

//       const url = editingEmployee ? `${API_BASE_URL}/employees/${editingEmployee.employeeId}` : `${API_BASE_URL}/employees`;
//       const method = editingEmployee ? 'PUT' : 'POST';
//       const body = {
//         ...employeeForm,
//         ...(editingEmployee && !employeeForm.password ? {} : { password: employeeForm.password })
//       };
//       console.log(`Sending ${method} request to ${url} with body:`, body);
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });
//       const responseData = await response.json();
//       console.log(`Response from ${url}:`, responseData);
//       if (response.ok) {
//         setIsAddingEmployee(false);
//         setEditingEmployee(null);
//         setEmployeeForm({
//           name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
//         });
//         const employees = await fetch(`${API_BASE_URL}/employees${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
//         setEmployeeData(Array.isArray(employees) ? employees : []);
//       } else {
//         const errorMessage = responseData.details || responseData.error || `Failed to ${editingEmployee ? 'update' : 'add'} employee.`;
//         setError(errorMessage);
//       }
//     } catch (err) {
//       const errorMessage = `Failed to ${editingEmployee ? 'update' : 'add'} employee: ${err.message}`;
//       setError(errorMessage);
//       console.error('Fetch error:', err);
//     } finally {
//       setIsSubmittingEmployee(false);
//     }
//   };

//   const handleDeleteEmployee = async (id: number) => {
//     const confirm = window.confirm('Are you sure you want to delete this employee?');
//     if (!confirm) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
//       if (response.ok) {
//         setEmployeeData(employeeData.filter(employee => employee.employeeId !== id));
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || 'Failed to delete employee.');
//       }
//     } catch (err) {
//       setError('Failed to delete employee.');
//     }
//   };

//   const handleSubmitDefect = async () => {
//     clearError();
//     if (!defectForm.name || !defectForm.defectType) {
//       setError('Defect name and type are required.');
//       return;
//     }
//     setIsSubmittingDefect(true);
//     try {
//       const url = editingDefect ? `${API_BASE_URL}/defects/${editingDefect.defectId}` : `${API_BASE_URL}/defects`;
//       const method = editingDefect ? 'PUT' : 'POST';
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(defectForm)
//       });
//       if (response.ok) {
//         setIsAddingDefect(false);
//         setEditingDefect(null);
//         setDefectForm({ name: '', defectType: '' });
//         const defects = await fetch(`${API_BASE_URL}/defects${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
//         setDefectData(Array.isArray(defects) ? defects : []);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || `Failed to ${editingDefect ? 'update' : 'add'} defect.`);
//       }
//     } catch (err) {
//       setError(`Failed to ${editingDefect ? 'update' : 'add'} defect.`);
//     } finally {
//       setIsSubmittingDefect(false);
//     }
//   };

//   const handleDeleteDefect = async (id: string) => {
//     const confirm = window.confirm('Are you sure you want to delete this defect?');
//     if (!confirm) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/defects/${id}`, { method: 'DELETE' });
//       if (response.ok) {
//         setDefectData(defectData.filter(defect => defect.defectId !== id));
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || errorData.error || 'Failed to delete defect.');
//       }
//     } catch (err) {
//       setError('Failed to delete defect.');
//     }
//   };

//   const handleEdit = <T extends Mold | Machine | Product | Employee | Defect>(
//     item: T,
//     setForm: React.Dispatch<React.SetStateAction<any>>,
//     setEditing: React.Dispatch<React.SetStateAction<T | null>>,
//     setIsAdding: React.Dispatch<React.SetStateAction<boolean>>
//   ) => {
//     setForm(item);
//     setEditing(item);
//     setIsAdding(true);
//   };

//   if (loading) {
//     return <div className="text-center p-4">Loading master data...</div>;
//   }

//   if (error) {
//     return <div className="text-center p-4 text-red-600">{error}</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Master Data Management</h2>
//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search masters..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-64"
//             />
//           </div>
//         </div>
//       </div>
//       {isSearching && <div className="text-sm text-gray-500">Searching...</div>}

//       <Tabs defaultValue="molds" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-7 bg-white p-1 rounded-lg shadow-sm">
//           <TabsTrigger value="molds" className="flex items-center gap-2">
//             <Settings className="h-4 w-4" />
//             Molds
//           </TabsTrigger>
//           <TabsTrigger value="machines" className="flex items-center gap-2">
//             <Wrench className="h-4 w-4" />
//             Machines
//           </TabsTrigger>
//           <TabsTrigger value="products" className="flex items-center gap-2">
//             <Package className="h-4 w-4" />
//             Products
//           </TabsTrigger>
//           <TabsTrigger value="defects" className="flex items-center gap-2">
//             Defects
//           </TabsTrigger>
//           <TabsTrigger value="changeover" className="flex items-center gap-2">
//             Changeover
//           </TabsTrigger>
//           <TabsTrigger value="smp" className="flex items-center gap-2">
//             SMP
//           </TabsTrigger>
//           <TabsTrigger value="employees" className="flex items-center gap-2">
//             <Users className="h-4 w-4" />
//             Employees
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="molds">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="flex items-center gap-2">
//                   <Settings className="h-5 w-5" />
//                   Mold Master
//                 </CardTitle>
//                 <Dialog open={isAddingMold} onOpenChange={(open) => {
//                   setIsAddingMold(open);
//                   if (!open) {
//                     setEditingMold(null);
//                     setMoldForm({
//                       name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
//                       pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
//                     });
//                   }
//                 }}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-blue-600 hover:bg-blue-700">
//                       <Plus className="h-4 w-4 mr-2" />
//                       {editingMold ? 'Edit Mold' : 'Add Mold'}
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle>{editingMold ? 'Edit Mold' : 'Add New Mold'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-2 gap-4 py-4">
//                       <FormField
//                         label="Mold Name"
//                         id="moldName"
//                         placeholder="Enter mold name"
//                         value={moldForm.name}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'name', value)}
//                         required
//                       />
//                       <FormField
//                         label="Mold Dimension"
//                         id="moldDimension"
//                         placeholder="L x W x H"
//                         value={moldForm.dimension}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'dimension', value)}
//                         required
//                       />
//                       <FormField
//                         label="Hot Runner Zones"
//                         id="hotRunnerZones"
//                         type="number"
//                         placeholder="Number of zones"
//                         value={moldForm.hotRunnerZones}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'hotRunnerZones', value)}
//                       />
//                       <FormField
//                         label="Sprue Radius"
//                         id="sprueRadius"
//                         type="number"
//                         placeholder="Radius in mm"
//                         value={moldForm.sprueRadius}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'sprueRadius', value)}
//                       />
//                       <FormField
//                         label="Gate Sequence"
//                         id="gateSequence"
//                         type="number"
//                         placeholder="Number of gates"
//                         value={moldForm.gateSequence}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'gateSequence', value)}
//                       />
//                       <FormField
//                         label="PM Shot Count"
//                         id="pmShotCount"
//                         type="number"
//                         placeholder="Shots until PM"
//                         value={moldForm.pmShotCount}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'pmShotCount', value)}
//                       />
//                       <FormField
//                         label="Opening Shot Count"
//                         id="openingShotCount"
//                         type="number"
//                         placeholder="Current shot count"
//                         value={moldForm.openingShotCount}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'openingShotCount', value)}
//                       />
//                       <FormField
//                         label="Number of Cores"
//                         id="cores"
//                         type="number"
//                         placeholder="Number of cores"
//                         value={moldForm.cores}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'cores', value)}
//                       />
//                       <FormField
//                         label="Ejector Type"
//                         id="ejectorType"
//                         value={moldForm.ejectorType}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'ejectorType', value)}
//                         options={[
//                           { value: 'hydraulic', label: 'Hydraulic' },
//                           { value: 'pneumatic', label: 'Pneumatic' },
//                           { value: 'mechanical', label: 'Mechanical' }
//                         ]}
//                         placeholder="Select ejector type"
//                       />
//                       <FormField
//                         label="Status"
//                         id="status"
//                         value={moldForm.status}
//                         onChange={(value) => handleInputChange(moldForm, setMoldForm, 'status', value)}
//                         options={[
//                           { value: 'Active', label: 'Active' },
//                           { value: 'Maintenance', label: 'Maintenance' },
//                           { value: 'Inactive', label: 'Inactive' }
//                         ]}
//                         placeholder="Select status"
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button variant="outline" onClick={() => setIsAddingMold(false)}>Cancel</Button>
//                       <Button onClick={handleSubmitMold} disabled={isSubmittingMold}>
//                         {isSubmittingMold ? 'Saving...' : editingMold ? 'Update Mold' : 'Save Mold'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4">
//                 {moldData.length === 0 ? (
//                   <p className="text-gray-600">No molds found.</p>
//                 ) : (
//                   moldData.map((mold) => (
//                     <div key={mold.moldId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start">
//                         <div className="grid grid-cols-3 gap-4 flex-1">
//                           <div>
//                             <h3 className="font-semibold text-lg">{mold.name}</h3>
//                             <p className="text-sm text-gray-600">Dimension: {mold.dimension}</p>
//                             <p className="text-sm text-gray-600">Hot Runner Zones: {mold.hotRunnerZones}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Sprue Radius: {mold.sprueRadius}mm</p>
//                             <p className="text-sm text-gray-600">Gate Sequence: {mold.gateSequence}</p>
//                             <p className="text-sm text-gray-600">Cores: {mold.cores}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">PM Shot Count: {mold.pmShotCount}</p>
//                             <p className="text-sm text-gray-600">Current Shots: {mold.openingShotCount}</p>
//                             <p className="text-sm text-gray-600">Ejector: {mold.ejectorType}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge variant={mold.status === 'Active' ? 'default' : 'secondary'}>{mold.status}</Badge>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Edit mold"
//                             onClick={() => handleEdit(mold, setMoldForm, setEditingMold, setIsAddingMold)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Delete mold"
//                             onClick={() => handleDeleteMold(mold.moldId)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="machines">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="flex items-center gap-2">
//                   <Wrench className="h-5 w-5" />
//                   Machine Master
//                 </CardTitle>
//                 <Dialog open={isAddingMachine} onOpenChange={(open) => {
//                   setIsAddingMachine(open);
//                   if (!open) {
//                     setEditingMachine(null);
//                     setMachineForm({
//                       name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
//                       screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
//                       ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
//                     });
//                   }
//                 }}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-blue-600 hover:bg-blue-700">
//                       <Plus className="h-4 w-4 mr-2" />
//                       {editingMachine ? 'Edit Machine' : 'Add Machine'}
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                       <DialogTitle>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
//                       <FormField
//                         label="Machine Name"
//                         id="machineName"
//                         placeholder="Enter machine name"
//                         value={machineForm.name}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'name', value)}
//                         required
//                       />
//                       <FormField
//                         label="Tie Bar Distance"
//                         id="tieBarDistance"
//                         placeholder="L x W (mm)"
//                         value={machineForm.tieBarDistance}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'tieBarDistance', value)}
//                         required
//                       />
//                       <FormField
//                         label="Number of Cores"
//                         id="machineCores"
//                         type="number"
//                         placeholder="Number of cores"
//                         value={machineForm.cores}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'cores', value)}
//                       />
//                       <FormField
//                         label="Max Mold Height"
//                         id="maxMoldHeight"
//                         type="number"
//                         placeholder="Height in mm"
//                         value={machineForm.maxMoldHeight}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxMoldHeight', value)}
//                       />
//                       <FormField
//                         label="Max Daylight"
//                         id="maxDaylight"
//                         type="number"
//                         placeholder="Daylight in mm"
//                         value={machineForm.maxDaylight}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxDaylight', value)}
//                       />
//                       <FormField
//                         label="Screw Diameter"
//                         id="screwDia"
//                         type="number"
//                         placeholder="Diameter in mm"
//                         value={machineForm.screwDia}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwDia', value)}
//                       />
//                       <FormField
//                         label="L/D Ratio"
//                         id="ldRatio"
//                         type="number"
//                         placeholder="L/D ratio"
//                         value={machineForm.ldRatio}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ldRatio', value)}
//                       />
//                       <FormField
//                         label="Screw Type"
//                         id="screwType"
//                         value={machineForm.screwType}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwType', value)}
//                         options={[
//                           { value: 'general-purpose', label: 'General Purpose' },
//                           { value: 'mixing', label: 'Mixing' },
//                           { value: 'barrier', label: 'Barrier' },
//                           { value: 'vented', label: 'Vented' }
//                         ]}
//                         placeholder="Select screw type"
//                       />
//                       <FormField
//                         label="Shot Size"
//                         id="shotSize"
//                         type="number"
//                         placeholder="Shot size in grams"
//                         value={machineForm.shotSize}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'shotSize', value)}
//                       />
//                       <FormField
//                         label="Screw Stroke Length"
//                         id="screwStrokeLength"
//                         type="number"
//                         placeholder="Length in mm"
//                         value={machineForm.screwStrokeLength}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwStrokeLength', value)}
//                       />
//                       <FormField
//                         label="Ejector Stroke Length"
//                         id="ejectorStrokeLength"
//                         type="number"
//                         placeholder="Length in mm"
//                         value={machineForm.ejectorStrokeLength}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ejectorStrokeLength', value)}
//                       />
//                       <FormField
//                         label="Min Mold Height"
//                         id="minMoldHeight"
//                         type="number"
//                         placeholder="Height in mm"
//                         value={machineForm.minMoldHeight}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'minMoldHeight', value)}
//                       />
//                       <FormField
//                         label="Hopper Capacity"
//                         id="hopperCapacity"
//                         type="number"
//                         placeholder="Capacity in kg"
//                         value={machineForm.hopperCapacity}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'hopperCapacity', value)}
//                       />
//                       <FormField
//                         label="Status"
//                         id="status"
//                         value={machineForm.status}
//                         onChange={(value) => handleInputChange(machineForm, setMachineForm, 'status', value)}
//                         options={[
//                           { value: 'Running', label: 'Running' },
//                           { value: 'Maintenance', label: 'Maintenance' },
//                           { value: 'Idle', label: 'Idle' }
//                         ]}
//                         placeholder="Select status"
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button variant="outline" onClick={() => setIsAddingMachine(false)}>Cancel</Button>
//                       <Button onClick={handleSubmitMachine} disabled={isSubmittingMachine}>
//                         {isSubmittingMachine ? 'Saving...' : editingMachine ? 'Update Machine' : 'Save Machine'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4">
//                 {machineData.length === 0 ? (
//                   <p className="text-gray-600">No machines found.</p>
//                 ) : (
//                   machineData.map((machine) => (
//                     <div key={machine.machineId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start">
//                         <div className="grid grid-cols-3 gap-4 flex-1">
//                           <div>
//                             <h3 className="font-semibold text-lg">{machine.name}</h3>
//                             <p className="text-sm text-gray-600">Tie Bar Distance: {machine.tieBarDistance}</p>
//                             <p className="text-sm text-gray-600">Cores: {machine.cores}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Max Mold Height: {machine.maxMoldHeight}mm</p>
//                             <p className="text-sm text-gray-600">Max Daylight: {machine.maxDaylight}mm</p>
//                             <p className="text-sm text-gray-600">Screw Diameter: {machine.screwDia}mm</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">L/D Ratio: {machine.ldRatio}</p>
//                             <p className="text-sm text-gray-600">Shot Size: {machine.shotSize}g</p>
//                             <p className="text-sm text-gray-600">Hopper Capacity: {machine.hopperCapacity}kg</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge variant={machine.status === 'Running' ? 'default' : 'secondary'}>{machine.status}</Badge>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Edit machine"
//                             onClick={() => handleEdit(machine, setMachineForm, setEditingMachine, setIsAddingMachine)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Delete machine"
//                             onClick={() => handleDeleteMachine(machine.machineId)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="products">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="flex items-center gap-2">
//                   <Package className="h-5 w-5" />
//                   Product Master
//                 </CardTitle>
//                 <Dialog open={isAddingProduct} onOpenChange={(open) => {
//                   setIsAddingProduct(open);
//                   if (!open) {
//                     setEditingProduct(null);
//                     setProductForm({
//                       name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
//                       cavities: '', packingMethod: '', packingQty: '', status: 'Active'
//                     });
//                   }
//                 }}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-blue-600 hover:bg-blue-700">
//                       <Plus className="h-4 w-4 mr-2" />
//                       {editingProduct ? 'Edit Product' : 'Add Product'}
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-2 gap-4 py-4">
//                       <FormField
//                         label="Product Name"
//                         id="productName"
//                         placeholder="Enter product name"
//                         value={productForm.name}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'name', value)}
//                         required
//                       />
//                       <FormField
//                         label="Cycle Time"
//                         id="cycleTime"
//                         type="number"
//                         placeholder="Cycle time in seconds"
//                         value={productForm.cycleTime}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'cycleTime', value)}
//                       />
//                       <FormField
//                         label="Material"
//                         id="material"
//                         value={productForm.material}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'material', value)}
//                         options={[
//                           { value: 'pp', label: 'PP (Polypropylene)' },
//                           { value: 'pe', label: 'PE (Polyethylene)' },
//                           { value: 'abs', label: 'ABS' },
//                           { value: 'pc', label: 'PC (Polycarbonate)' },
//                           { value: 'nylon', label: 'Nylon' },
//                           { value: 'pom', label: 'POM' }
//                         ]}
//                         placeholder="Select material"
//                         required
//                       />
//                       <FormField
//                         label="Part Weight"
//                         id="partWeight"
//                         type="number"
//                         placeholder="Weight in grams"
//                         value={productForm.partWeight}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'partWeight', value)}
//                       />
//                       <FormField
//                         label="Runner Weight"
//                         id="runnerWeight"
//                         type="number"
//                         placeholder="Weight in grams"
//                         value={productForm.runnerWeight}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'runnerWeight', value)}
//                       />
//                       <FormField
//                         label="Number of Cavities"
//                         id="cavities"
//                         type="number"
//                         placeholder="Number of cavities"
//                         value={productForm.cavities}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'cavities', value)}
//                       />
//                       <FormField
//                         label="Packing Method"
//                         id="packingMethod"
//                         value={productForm.packingMethod}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'packingMethod', value)}
//                         options={[
//                           { value: 'carton', label: 'Carton' },
//                           { value: 'bag', label: 'Bag' },
//                           { value: 'tray', label: 'Tray' },
//                           { value: 'bulk', label: 'Bulk' }
//                         ]}
//                         placeholder="Select packing method"
//                       />
//                       <FormField
//                         label="Packing Quantity"
//                         id="packingQty"
//                         type="number"
//                         placeholder="Quantity per pack"
//                         value={productForm.packingQty}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'packingQty', value)}
//                       />
//                       <FormField
//                         label="Status"
//                         id="status"
//                         value={productForm.status}
//                         onChange={(value) => handleInputChange(productForm, setProductForm, 'status', value)}
//                         options={[
//                           { value: 'Active', label: 'Active' },
//                           { value: 'Inactive', label: 'Inactive' }
//                         ]}
//                         placeholder="Select status"
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
//                       <Button onClick={handleSubmitProduct} disabled={isSubmittingProduct}>
//                         {isSubmittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4">
//                 {productData.length === 0 ? (
//                   <p className="text-gray-600">No products found.</p>
//                 ) : (
//                   productData.map((product) => (
//                     <div key={product.productId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start">
//                         <div className="grid grid-cols-3 gap-4 flex-1">
//                           <div>
//                             <h3 className="font-semibold text-lg">{product.name}</h3>
//                             <p className="text-sm text-gray-600">Cycle Time: {product.cycleTime}s</p>
//                             <p className="text-sm text-gray-600">Material: {product.material}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Part Weight: {product.partWeight}g</p>
//                             <p className="text-sm text-gray-600">Runner Weight: {product.runnerWeight}g</p>
//                             <p className="text-sm text-gray-600">Cavities: {product.cavities}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Packing Method: {product.packingMethod}</p>
//                             <p className="text-sm text-gray-600">Packing Qty: {product.packingQty}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>{product.status}</Badge>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Edit product"
//                             onClick={() => handleEdit(product, setProductForm, setEditingProduct, setIsAddingProduct)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Delete product"
//                             onClick={() => handleDeleteProduct(product.productId)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="defects">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>Defect Master</CardTitle>
//                 <Dialog open={isAddingDefect} onOpenChange={(open) => {
//                   setIsAddingDefect(open);
//                   if (!open) {
//                     setEditingDefect(null);
//                     setDefectForm({ name: '', defectType: '' });
//                   }
//                 }}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-blue-600 hover:bg-blue-700">
//                       <Plus className="h-4 w-4 mr-2" />
//                       {editingDefect ? 'Edit Defect' : 'Add Defect'}
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-md">
//                     <DialogHeader>
//                       <DialogTitle>{editingDefect ? 'Edit Defect' : 'Add New Defect'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-1 gap-4 py-4">
//                       <FormField
//                         label="Defect Name"
//                         id="defectName"
//                         placeholder="Enter defect name"
//                         value={defectForm.name}
//                         onChange={(value) => handleInputChange(defectForm, setDefectForm, 'name', value)}
//                         required
//                       />
//                       <FormField
//                         label="Defect Type"
//                         id="defectType"
//                         value={defectForm.defectType}
//                         onChange={(value) => handleInputChange(defectForm, setDefectForm, 'defectType', value)}
//                         options={[
//                           { value: 'injection-molding', label: 'Injection Molding' },
//                           { value: 'assembly', label: 'Assembly' }
//                         ]}
//                         placeholder="Select defect type"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button variant="outline" onClick={() => setIsAddingDefect(false)}>Cancel</Button>
//                       <Button onClick={handleSubmitDefect} disabled={isSubmittingDefect}>
//                         {isSubmittingDefect ? 'Saving...' : editingDefect ? 'Update Defect' : 'Save Defect'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="border rounded-lg p-4">
//                     <h3 className="font-semibold mb-2">Injection Molding Defects</h3>
//                     <div className="space-y-2">
//                       {defectData.filter(d => d.defectType === 'injection-molding').length === 0 ? (
//                         <p className="text-gray-600">No injection molding defects found.</p>
//                       ) : (
//                         defectData.filter(d => d.defectType === 'injection-molding').map(defect => (
//                           <div key={defect.defectId} className="flex items-center space-x-2">
//                             <Badge variant="outline">{defect.name}</Badge>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               aria-label="Edit defect"
//                               onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
//                             >
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               aria-label="Delete defect"
//                               onClick={() => handleDeleteDefect(defect.defectId)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                   <div className="border rounded-lg p-4">
//                     <h3 className="font-semibold mb-2">Assembly Defects</h3>
//                     <div className="space-y-2">
//                       {defectData.filter(d => d.defectType === 'assembly').length === 0 ? (
//                         <p className="text-gray-600">No assembly defects found.</p>
//                       ) : (
//                         defectData.filter(d => d.defectType === 'assembly').map(defect => (
//                           <div key={defect.defectId} className="flex items-center space-x-2">
//                             <Badge variant="outline">{defect.name}</Badge>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               aria-label="Edit defect"
//                               onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
//                             >
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               aria-label="Delete defect"
//                               onClick={() => handleDeleteDefect(defect.defectId)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="changeover">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <CardTitle>Changeover Time Matrix</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <p className="text-gray-600">
//                   Configure changeover times for mold-machine, color-color, and material-material transitions.
//                   This section can be expanded to include a matrix editor or table for defining specific times.
//                 </p>
//                 <div className="grid grid-cols-3 gap-4">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-sm">Mold-Machine Matrix</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-xs text-gray-600">Define changeover times between different mold-machine combinations.</p>
//                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-sm">Color-Color Matrix</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-xs text-gray-600">Setup color changeover times and purging requirements.</p>
//                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-sm">Material-Material Matrix</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-xs text-gray-600">Configure material changeover procedures and times.</p>
//                       <Button variant="outline" className="mt-2">Configure Matrix</Button>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="smp">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <CardTitle>SMP (Standard Manufacturing Procedure)</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-600">
//                 Configure Standard Manufacturing Procedures (SMP) for production processes.
//                 This section can be expanded to include a form for defining SMP details, such as steps, parameters, and documentation.
//               </p>
//               <Button variant="outline" className="mt-4">Add SMP</Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="employees">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="h-5 w-5" />
//                   Employee Master
//                 </CardTitle>
//                 <Dialog open={isAddingEmployee} onOpenChange={(open) => {
//                   setIsAddingEmployee(open);
//                   if (!open) {
//                     setEditingEmployee(null);
//                     setEmployeeForm({
//                       name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
//                     });
//                   }
//                 }}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-blue-600 hover:bg-blue-700">
//                       <Plus className="h-4 w-4 mr-2" />
//                       {editingEmployee ? 'Edit Employee' : 'Add Employee'}
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-1 gap-4 py-4">
//                       <FormField
//                         label="Name"
//                         id="employeeName"
//                         placeholder="Enter employee full name"
//                         value={employeeForm.name}
//                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'name', value)}
//                         required
//                       />
//                       <FormField
//                         label="Role"
//                         id="employeeRole"
//                         placeholder="Enter job role/designation"
//                         value={employeeForm.role}
//                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'role', value)}
//                       />
//                       <FormField
//                         label="Mail ID"
//                         id="employeeEmail"
//                         type="email"
//                         placeholder="Enter email address"
//                         value={employeeForm.email}
//                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'email', value)}
//                         required
//                       />
//                       {!editingEmployee && (
//                         <FormField
//                           label="Password"
//                           id="employeePassword"
//                           type="password"
//                           placeholder="Enter password"
//                           value={employeeForm.password}
//                           onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
//                         />
//                       )}
//                       {editingEmployee && (
//                         <FormField
//                           label="New Password (Optional)"
//                           id="employeePassword"
//                           type="password"
//                           placeholder="Enter new password"
//                           value={employeeForm.password}
//                           onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
//                         />
//                       )}
//                       <FormField
//                         label="Group"
//                         id="employeeGroup"
//                         value={employeeForm.employeeGroup}
//                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'employeeGroup', value)}
//                         options={employeeGroups.map(group => ({
//                           value: group.toLowerCase().replace(' ', '-'),
//                           label: group
//                         }))}
//                         placeholder="Select employee group"
//                         required
//                       />
//                       <FormField
//                         label="Status"
//                         id="status"
//                         value={employeeForm.status}
//                         onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'status', value)}
//                         options={[
//                           { value: 'Active', label: 'Active' },
//                           { value: 'Inactive', label: 'Inactive' }
//                         ]}
//                         placeholder="Select status"
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>Cancel</Button>
//                       <Button onClick={handleSubmitEmployee} disabled={isSubmittingEmployee}>
//                         {isSubmittingEmployee ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold mb-4">Employee Groups</h3>
//                 <div className="grid grid-cols-7 gap-2">
//                   {employeeGroups.map((group) => (
//                     <Badge key={group} variant="outline" className="justify-center p-2">{group}</Badge>
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold">Employees</h3>
//                 {employeeData.length === 0 ? (
//                   <p className="text-gray-600">No employees found.</p>
//                 ) : (
//                   employeeData.map((employee) => (
//                     <div key={employee.employeeId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start">
//                         <div className="grid grid-cols-2 gap-4 flex-1">
//                           <div>
//                             <h4 className="font-semibold text-lg">{employee.name}</h4>
//                             <p className="text-sm text-gray-600">Role: {employee.role}</p>
//                             <p className="text-sm text-gray-600">Email: {employee.email}</p>
//                           </div>
//                           <div>
//                             <Badge variant="outline" className="mb-2">{employee.employeeGroup}</Badge>
//                             <p className="text-sm text-gray-600">Status: {employee.status}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>{employee.status}</Badge>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Edit employee"
//                             onClick={() => handleEdit(employee, setEmployeeForm, setEditingEmployee, setIsAddingEmployee)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             aria-label="Delete employee"
//                             onClick={() => handleDeleteEmployee(employee.employeeId)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default MasterData;



import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Settings, Package, Users, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { set } from 'date-fns';

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
  name: string;
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

// Reusable FormField component
interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

// const FormField: React.FC<FormFieldProps> = ({ label, id, type = 'text', value, onChange, placeholder, options, required }) => (
//   <div className="space-y-2">
//     <Label htmlFor={id}>{label}{required && <span className="text-red-500">*</span>}</Label>
//     {options ? (
//       <Select value={value?.toString() ?? ''} onValueChange={onChange}>
//         <SelectTrigger>
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>
//         <SelectContent>
//           {options.map((opt) => (
//             <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     ) : (
//       <Input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
//     )}
//   </div>
// );
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  required,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {options ? (
      <Select value={value?.toString() ?? ''} onValueChange={(val) => onChange(val)}>
        <SelectTrigger>
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
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    )}
  </div>
);

const MasterData: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moldData, setMoldData] = useState<Mold[]>([]);
  const [machineData, setMachineData] = useState<Machine[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [defectData, setDefectData] = useState<Defect[]>([]);
  const [isAddingMold, setIsAddingMold] = useState(false);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isAddingDefect, setIsAddingDefect] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMold, setEditingMold] = useState<Mold | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [isSubmittingMold, setIsSubmittingMold] = useState(false);
  const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [isSubmittingDefect, setIsSubmittingDefect] = useState(false);
  const [loading, setLoading] = useState(false);


  const [moldForm, setMoldForm] = useState({
    name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
    pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
  });
  const [machineForm, setMachineForm] = useState({
    name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
    screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
    ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
  });
  const [productForm, setProductForm] = useState({
    name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
    cavities: '', packingMethod: '', packingQty: '', status: 'Active'
  });
  const [employeeForm, setEmployeeForm] = useState({
    name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
  });
  const [defectForm, setDefectForm] = useState({
    name: '', defectType: ''
  });

  const employeeGroups = [
    'Operator', 'PDI Inspector', 'Production', 'Maintenance',
    'Quality', 'HOD', 'Admin'
  ];

  const API_BASE_URL = 'http://192.168.1.158:5000/api';

  // Debounced fetch data
  useEffect(() => {
    setIsSearching(true);
    const debounceFetch = setTimeout(() => {
      const fetchData = async () => {
        // setLoading(true);
        setError(null);
        try {
          const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
          const [moldsRes, machinesRes, productsRes, employeesRes, defectsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/molds${query}`).catch(() => null),
            fetch(`${API_BASE_URL}/machines${query}`).catch(() => null),
            fetch(`${API_BASE_URL}/products${query}`).catch(() => null),
            fetch(`${API_BASE_URL}/employees${query}`).catch(() => null),
            fetch(`${API_BASE_URL}/defects${query}`).catch(() => null)
          ]);

          const molds: Mold[] = moldsRes && moldsRes.ok ? await moldsRes.json() : moldData;
          const machines: Machine[] = machinesRes && machinesRes.ok ? await machinesRes.json() : machineData;
          const products: Product[] = productsRes && productsRes.ok ? await productsRes.json() : productData;
          const employees: Employee[] = employeesRes && employeesRes.ok ? await employeesRes.json() : employeeData;
          const defects: Defect[] = defectsRes && defectsRes.ok ? await defectsRes.json() : defectData;

          setMoldData(Array.isArray(molds) ? molds : []);
          setMachineData(Array.isArray(machines) ? machines : []);
          setProductData(Array.isArray(products) ? products : []);
          setEmployeeData(Array.isArray(employees) ? employees : []);
          setDefectData(Array.isArray(defects) ? defects : []);

          const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
          if (!moldsRes?.ok || !machinesRes?.ok || !productsRes?.ok || !employeesRes?.ok || !defectsRes?.ok) {
            setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Some data could not be loaded. Displaying cached data.');
          }
        } catch (err) {
          console.error('Error fetching master data:', err);
          const isInitialLoad = !moldData.length && !machineData.length && !productData.length && !employeeData.length && !defectData.length;
          setError(isInitialLoad ? 'Failed to load data. Please check your connection and try again.' : 'Failed to load data. Displaying cached data.');
        } finally {
          // setIsLoading(false);
          setIsSearching(false);
        }
      };
      fetchData();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  const handleInputChange = useCallback(<T extends object>(
    form: T,
    setForm: React.Dispatch<React.SetStateAction<T>>,
    field: keyof T,
    value: string
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearError = () => setError(null);

  const validateNonNegativeNumber = (value: string, fieldName: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setError(`${fieldName} must be a valid number.`);
      return false;
    }
    if (num < 0) {
      setError(`${fieldName} cannot be negative.`);
      return false;
    }
    return true;
  };

  const handleSubmitMold = async () => {
    clearError();
    if (!moldForm.name || !moldForm.dimension) {
      setError('Mold name and dimension are required.');
      return;
    }
    if (moldForm.hotRunnerZones && !validateNonNegativeNumber(moldForm.hotRunnerZones, 'Hot Runner Zones')) return;
    if (moldForm.sprueRadius && !validateNonNegativeNumber(moldForm.sprueRadius, 'Sprue Radius')) return;
    if (moldForm.gateSequence && !validateNonNegativeNumber(moldForm.gateSequence, 'Gate Sequence')) return;
    if (moldForm.pmShotCount && !validateNonNegativeNumber(moldForm.pmShotCount, 'PM Shot Count')) return;
    if (moldForm.openingShotCount && !validateNonNegativeNumber(moldForm.openingShotCount, 'Opening Shot Count')) return;
    if (moldForm.cores && !validateNonNegativeNumber(moldForm.cores, 'Cores')) return;
    setIsSubmittingMold(true);
    try {
      clearError();
      // Use the API_BASE_URL constant for the API endpoint
      const url = editingMold ? `${API_BASE_URL}/molds/${editingMold.moldId}` : `${API_BASE_URL}/molds`;
      const method = editingMold ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moldForm,
          hotRunnerZones: parseInt(moldForm.hotRunnerZones) || 0,
          sprueRadius: parseFloat(moldForm.sprueRadius) || 0,
          gateSequence: parseInt(moldForm.gateSequence) || 0,
          pmShotCount: parseInt(moldForm.pmShotCount) || 0,
          openingShotCount: parseInt(moldForm.openingShotCount) || 0,
          cores: parseInt(moldForm.cores) || 0
        })
      });
      if (response.ok) {
        setIsAddingMold(false);
        setEditingMold(null);
        setMoldForm({
          name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
          pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
        });
        const molds = await fetch(`${API_BASE_URL}/molds${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
        setMoldData(Array.isArray(molds) ? molds : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || `Failed to ${editingMold ? 'update' : 'add'} mold.`);
      }
    } catch (err) {
      setError(`Failed to ${editingMold ? 'update' : 'add'} mold.`);
    } finally {
      setIsSubmittingMold(false);
    }
  };

  const handleDeleteMold = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this mold?');
    if (!confirm) return;
    try {
      const response = await fetch(`${API_BASE_URL}/molds/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMoldData(moldData.filter(mold => mold.moldId !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to delete mold.');
      }
    } catch (err) {
      setError('Failed to delete mold.');
    }
  };

  const handleSubmitMachine = async () => {
    clearError();
    if (!machineForm.name || !machineForm.tieBarDistance) {
      setError('Machine name and tie bar distance are required.');
      return;
    }
    if (machineForm.cores && !validateNonNegativeNumber(machineForm.cores, 'Cores')) return;
    if (machineForm.maxMoldHeight && !validateNonNegativeNumber(machineForm.maxMoldHeight, 'Max Mold Height')) return;
    // Add similar checks for other numeric fields
    setIsSubmittingMachine(true);
    try {
      const url = editingMachine ? `${API_BASE_URL}/machines/${editingMachine.machineId}` : `${API_BASE_URL}/machines`;
      const method = editingMachine ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...machineForm,
          cores: parseInt(machineForm.cores) || 0,
          maxMoldHeight: parseInt(machineForm.maxMoldHeight) || 0,
          maxDaylight: parseInt(machineForm.maxDaylight) || 0,
          screwDia: parseInt(machineForm.screwDia) || 0,
          ldRatio: parseInt(machineForm.ldRatio) || 0,
          shotSize: parseInt(machineForm.shotSize) || 0,
          screwStrokeLength: parseInt(machineForm.screwStrokeLength) || 0,
          ejectorStrokeLength: parseInt(machineForm.ejectorStrokeLength) || 0,
          minMoldHeight: parseInt(machineForm.minMoldHeight) || 0,
          hopperCapacity: parseInt(machineForm.hopperCapacity) || 0
        })
      });
      if (response.ok) {
        setIsAddingMachine(false);
        setEditingMachine(null);
        setMachineForm({
          name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
          screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
          ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
        });
        const machines = await fetch(`${API_BASE_URL}/machines${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
        setMachineData(Array.isArray(machines) ? machines : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || `Failed to ${editingMachine ? 'update' : 'add'} machine.`);
      }
    } catch (err) {
      setError(`Failed to ${editingMachine ? 'update' : 'add'} machine.`);
    } finally {
      setIsSubmittingMachine(false);
    }
  };

  const handleDeleteMachine = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this machine?');
    if (!confirm) return;
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMachineData(machineData.filter(machine => machine.machineId !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to delete machine.');
      }
    } catch (err) {
      setError('Failed to delete machine.');
    }
  };

  const handleSubmitProduct = async () => {
    clearError();
    if (!productForm.name || !productForm.material) {
      setError('Product name and material are required.');
      return;
    }
    if (productForm.cycleTime && !validateNonNegativeNumber(productForm.cycleTime, 'Cycle Time')) return;
    // Add similar checks for other numeric fields
    setIsSubmittingProduct(true);
    try {
      const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct.productId}` : `${API_BASE_URL}/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          cycleTime: parseInt(productForm.cycleTime) || 0,
          partWeight: parseFloat(productForm.partWeight) || 0,
          runnerWeight: parseFloat(productForm.runnerWeight) || 0,
          cavities: parseInt(productForm.cavities) || 0,
          packingQty: parseInt(productForm.packingQty) || 0
        })
      });
      if (response.ok) {
        setIsAddingProduct(false);
        setEditingProduct(null);
        setProductForm({
          name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
          cavities: '', packingMethod: '', packingQty: '', status: 'Active'
        });
        const products = await fetch(`${API_BASE_URL}/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
        setProductData(Array.isArray(products) ? products : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || `Failed to ${editingProduct ? 'update' : 'add'} product.`);
      }
    } catch (err) {
      setError(`Failed to ${editingProduct ? 'update' : 'add'} product.`);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this product?');
    if (!confirm) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProductData(productData.filter(product => product.productId !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to delete product.');
      }
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  const handleSubmitEmployee = async () => {
    clearError();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.employeeGroup) {
      setError('Employee name, email, and group are required.');
      return;
    }
    setIsSubmittingEmployee(true);
    try {
      // Validate email uniqueness for updates
      if (editingEmployee && employeeForm.email) {
        const response = await fetch(`${API_BASE_URL}/employees?search=${encodeURIComponent(employeeForm.email)}`);
        const employees = await response.json();
        // if (employees.some(emp => emp.email === employeeForm.email && emp.id !== editingEmployee.employeeId)) {
        //   setError('Email is already in use by another employee.');
        //   return;
        // }
        if (employees.some(emp => emp.email === employeeForm.email && emp.employeeId !== editingEmployee.employeeId)) {
          setError('Email is already in use by another employee.');
          return;
        }

      }

      const url = editingEmployee ? `${API_BASE_URL}/employees/${editingEmployee.employeeId}` : `${API_BASE_URL}/employees`;
      const method = editingEmployee ? 'PUT' : 'POST';
      const body = {
        ...employeeForm,
        ...(editingEmployee && !employeeForm.password ? {} : { password: employeeForm.password })
      };
      console.log(`Sending ${method} request to ${url} with body:`, body);
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const responseData = await response.json();
      console.log(`Response from ${url}:`, responseData);
      if (response.ok) {
        setIsAddingEmployee(false);
        setEditingEmployee(null);
        setEmployeeForm({
          name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
        });
        const employees = await fetch(`${API_BASE_URL}/employees${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
        setEmployeeData(Array.isArray(employees) ? employees : []);
      } else {
        const errorMessage = responseData.details || responseData.error || `Failed to ${editingEmployee ? 'update' : 'add'} employee.`;
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Failed to ${editingEmployee ? 'update' : 'add'} employee: ${err.message}`;
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this employee?');
    if (!confirm) return;
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEmployeeData(employeeData.filter(employee => employee.employeeId !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to delete employee.');
      }
    } catch (err) {
      setError('Failed to delete employee.');
    }
  };

  const handleSubmitDefect = async () => {
    clearError();
    if (!defectForm.name || !defectForm.defectType) {
      setError('Defect name and type are required.');
      return;
    }
    setIsSubmittingDefect(true);
    try {
      const url = editingDefect ? `${API_BASE_URL}/defects/${editingDefect.defectId}` : `${API_BASE_URL}/defects`;
      const method = editingDefect ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defectForm)
      });
      if (response.ok) {
        setIsAddingDefect(false);
        setEditingDefect(null);
        setDefectForm({ name: '', defectType: '' });
        const defects = await fetch(`${API_BASE_URL}/defects${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`).then(res => res.json());
        setDefectData(Array.isArray(defects) ? defects : []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || `Failed to ${editingDefect ? 'update' : 'add'} defect.`);
      }
    } catch (err) {
      setError(`Failed to ${editingDefect ? 'update' : 'add'} defect.`);
    } finally {
      setIsSubmittingDefect(false);
    }
  };

  const handleDeleteDefect = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this defect?');
    if (!confirm) return;
    try {
      const response = await fetch(`${API_BASE_URL}/defects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDefectData(defectData.filter(defect => defect.defectId !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to delete defect.');
      }
    } catch (err) {
      setError('Failed to delete defect.');
    }
  };

  const handleEdit = <T extends Mold | Machine | Product | Employee | Defect>(
    item: T,
    setForm: React.Dispatch<React.SetStateAction<any>>,
    setEditing: React.Dispatch<React.SetStateAction<T | null>>,
    setIsAdding: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setForm(item);
    setEditing(item);
    setIsAdding(true);
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Master Data Management</h2>
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
        </div>
      </div>
      {isSearching && <div className="text-sm text-gray-500">Searching...</div>}

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
            Defects
          </TabsTrigger>
          <TabsTrigger value="changeover" className="flex items-center gap-2">
            Changeover
          </TabsTrigger>
          <TabsTrigger value="smp" className="flex items-center gap-2">
            SMP
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="molds">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Mold Master
                </CardTitle>
                <Dialog open={isAddingMold} onOpenChange={(open) => {
                  setIsAddingMold(open);
                  if (!open) {
                    setEditingMold(null);
                    setMoldForm({
                      name: '', dimension: '', hotRunnerZones: '', sprueRadius: '', gateSequence: '',
                      pmShotCount: '', openingShotCount: '', cores: '', ejectorType: '', status: 'Active'
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingMold ? 'Edit Mold' : 'Add Mold'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" aria-describedby={undefined} >
                    <DialogHeader>
                      <DialogTitle>{editingMold ? 'Edit Mold' : 'Add New Mold'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <FormField
                        label="Mold Name"
                        id="moldName"
                        placeholder="Enter mold name"
                        value={moldForm.name}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'name', value)}
                        required
                      />
                      <FormField
                        label="Mold Dimension"
                        id="moldDimension"
                        placeholder="L x W x H"
                        value={moldForm.dimension}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'dimension', value)}
                        required
                      />
                      <FormField
                        label="Hot Runner Zones"
                        id="hotRunnerZones"
                        type="number"
                        placeholder="Number of zones"
                        value={moldForm.hotRunnerZones}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'hotRunnerZones', value)}
                      />
                      <FormField
                        label="Sprue Radius"
                        id="sprueRadius"
                        type="number"
                        placeholder="Radius in mm"
                        value={moldForm.sprueRadius}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'sprueRadius', value)}
                      />
                      <FormField
                        label="Gate Sequence"
                        id="gateSequence"
                        type="number"
                        placeholder="Number of gates"
                        value={moldForm.gateSequence}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'gateSequence', value)}
                      />
                      <FormField
                        label="PM Shot Count"
                        id="pmShotCount"
                        type="number"
                        placeholder="Shots until PM"
                        value={moldForm.pmShotCount}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'pmShotCount', value)}
                      />
                      <FormField
                        label="Opening Shot Count"
                        id="openingShotCount"
                        type="number"
                        placeholder="Current shot count"
                        value={moldForm.openingShotCount}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'openingShotCount', value)}
                      />
                      <FormField
                        label="Number of Cores"
                        id="cores"
                        type="number"
                        placeholder="Number of cores"
                        value={moldForm.cores}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'cores', value)}
                      />
                      <FormField
                        label="Ejector Type"
                        id="ejectorType"
                        value={moldForm.ejectorType}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'ejectorType', value)}
                        options={[
                          { value: 'hydraulic', label: 'Hydraulic' },
                          { value: 'pneumatic', label: 'Pneumatic' },
                          { value: 'mechanical', label: 'Mechanical' }
                        ]}
                        placeholder="Select ejector type"
                      />
                      <FormField
                        label="Status"
                        id="status"
                        value={moldForm.status}
                        onChange={(value) => handleInputChange(moldForm, setMoldForm, 'status', value)}
                        options={[
                          { value: 'Active', label: 'Active' },
                          { value: 'Maintenance', label: 'Maintenance' },
                          { value: 'Inactive', label: 'Inactive' }
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingMold(false)}>Cancel</Button>
                      <Button onClick={handleSubmitMold} disabled={isSubmittingMold}>
                        {isSubmittingMold ? 'Saving...' : editingMold ? 'Update Mold' : 'Save Mold'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {moldData.length === 0 ? (
                  <p className="text-gray-600">No molds found.</p>
                ) : (
                  moldData.map((mold) => (
                    <div key={mold.moldId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{mold.name}</h3>
                            <p className="text-sm text-gray-600">Dimension: {mold.dimension}</p>
                            <p className="text-sm text-gray-600">Hot Runner Zones: {mold.hotRunnerZones}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Sprue Radius: {mold.sprueRadius}mm</p>
                            <p className="text-sm text-gray-600">Gate Sequence: {mold.gateSequence}</p>
                            <p className="text-sm text-gray-600">Cores: {mold.cores}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">PM Shot Count: {mold.pmShotCount}</p>
                            <p className="text-sm text-gray-600">Current Shots: {mold.openingShotCount}</p>
                            <p className="text-sm text-gray-600">Ejector: {mold.ejectorType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={mold.status === 'Active' ? 'default' : 'secondary'}>{mold.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Edit mold"
                            onClick={() => handleEdit(mold, setMoldForm, setEditingMold, setIsAddingMold)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Delete mold"
                            onClick={() => handleDeleteMold(mold.moldId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machines">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Machine Master
                </CardTitle>
                <Dialog open={isAddingMachine} onOpenChange={(open) => {
                  setIsAddingMachine(open);
                  if (!open) {
                    setEditingMachine(null);
                    setMachineForm({
                      name: '', tieBarDistance: '', cores: '', maxMoldHeight: '', maxDaylight: '',
                      screwDia: '', ldRatio: '', screwType: '', shotSize: '', screwStrokeLength: '',
                      ejectorStrokeLength: '', minMoldHeight: '', hopperCapacity: '', status: 'Running'
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingMachine ? 'Edit Machine' : 'Add Machine'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl" aria-describedby={undefined} >
                    <DialogHeader>
                      <DialogTitle>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                      <FormField
                        label="Machine Name"
                        id="machineName"
                        placeholder="Enter machine name"
                        value={machineForm.name}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'name', value)}
                        required
                      />
                      <FormField
                        label="Tie Bar Distance"
                        id="tieBarDistance"
                        placeholder="L x W (mm)"
                        value={machineForm.tieBarDistance}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'tieBarDistance', value)}
                        required
                      />
                      <FormField
                        label="Number of Cores"
                        id="machineCores"
                        type="number"
                        placeholder="Number of cores"
                        value={machineForm.cores}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'cores', value)}
                      />
                      <FormField
                        label="Max Mold Height"
                        id="maxMoldHeight"
                        type="number"
                        placeholder="Height in mm"
                        value={machineForm.maxMoldHeight}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxMoldHeight', value)}
                      />
                      <FormField
                        label="Max Daylight"
                        id="maxDaylight"
                        type="number"
                        placeholder="Daylight in mm"
                        value={machineForm.maxDaylight}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'maxDaylight', value)}
                      />
                      <FormField
                        label="Screw Diameter"
                        id="screwDia"
                        type="number"
                        placeholder="Diameter in mm"
                        value={machineForm.screwDia}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwDia', value)}
                      />
                      <FormField
                        label="L/D Ratio"
                        id="ldRatio"
                        type="number"
                        placeholder="L/D ratio"
                        value={machineForm.ldRatio}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ldRatio', value)}
                      />
                      <FormField
                        label="Screw Type"
                        id="screwType"
                        value={machineForm.screwType}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwType', value)}
                        options={[
                          { value: 'general-purpose', label: 'General Purpose' },
                          { value: 'mixing', label: 'Mixing' },
                          { value: 'barrier', label: 'Barrier' },
                          { value: 'vented', label: 'Vented' }
                        ]}
                        placeholder="Select screw type"
                      />
                      <FormField
                        label="Shot Size"
                        id="shotSize"
                        type="number"
                        placeholder="Shot size in grams"
                        value={machineForm.shotSize}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'shotSize', value)}
                      />
                      <FormField
                        label="Screw Stroke Length"
                        id="screwStrokeLength"
                        type="number"
                        placeholder="Length in mm"
                        value={machineForm.screwStrokeLength}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'screwStrokeLength', value)}
                      />
                      <FormField
                        label="Ejector Stroke Length"
                        id="ejectorStrokeLength"
                        type="number"
                        placeholder="Length in mm"
                        value={machineForm.ejectorStrokeLength}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'ejectorStrokeLength', value)}
                      />
                      <FormField
                        label="Min Mold Height"
                        id="minMoldHeight"
                        type="number"
                        placeholder="Height in mm"
                        value={machineForm.minMoldHeight}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'minMoldHeight', value)}
                      />
                      <FormField
                        label="Hopper Capacity"
                        id="hopperCapacity"
                        type="number"
                        placeholder="Capacity in kg"
                        value={machineForm.hopperCapacity}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'hopperCapacity', value)}
                      />
                      <FormField
                        label="Status"
                        id="status"
                        value={machineForm.status}
                        onChange={(value) => handleInputChange(machineForm, setMachineForm, 'status', value)}
                        options={[
                          { value: 'Running', label: 'Running' },
                          { value: 'Maintenance', label: 'Maintenance' },
                          { value: 'Idle', label: 'Idle' }
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingMachine(false)}>Cancel</Button>
                      <Button onClick={handleSubmitMachine} disabled={isSubmittingMachine}>
                        {isSubmittingMachine ? 'Saving...' : editingMachine ? 'Update Machine' : 'Save Machine'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {machineData.length === 0 ? (
                  <p className="text-gray-600">No machines found.</p>
                ) : (
                  machineData.map((machine) => (
                    <div key={machine.machineId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{machine.name}</h3>
                            <p className="text-sm text-gray-600">Tie Bar Distance: {machine.tieBarDistance}</p>
                            <p className="text-sm text-gray-600">Cores: {machine.cores}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Max Mold Height: {machine.maxMoldHeight}mm</p>
                            <p className="text-sm text-gray-600">Max Daylight: {machine.maxDaylight}mm</p>
                            <p className="text-sm text-gray-600">Screw Diameter: {machine.screwDia}mm</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">L/D Ratio: {machine.ldRatio}</p>
                            <p className="text-sm text-gray-600">Shot Size: {machine.shotSize}g</p>
                            <p className="text-sm text-gray-600">Hopper Capacity: {machine.hopperCapacity}kg</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={machine.status === 'Running' ? 'default' : 'secondary'}>{machine.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Edit machine"
                            onClick={() => handleEdit(machine, setMachineForm, setEditingMachine, setIsAddingMachine)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Delete machine"
                            onClick={() => handleDeleteMachine(machine.machineId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Master
                </CardTitle>
                <Dialog open={isAddingProduct} onOpenChange={(open) => {
                  setIsAddingProduct(open);
                  if (!open) {
                    setEditingProduct(null);
                    setProductForm({
                      name: '', cycleTime: '', material: '', partWeight: '', runnerWeight: '',
                      cavities: '', packingMethod: '', packingQty: '', status: 'Active'
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Edit Product' : 'Add Product'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" aria-describedby={undefined} >
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <FormField
                        label="Product Name"
                        id="productName"
                        placeholder="Enter product name"
                        value={productForm.name}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'name', value)}
                        required
                      />
                      <FormField
                        label="Cycle Time"
                        id="cycleTime"
                        type="number"
                        placeholder="Cycle time in seconds"
                        value={productForm.cycleTime}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'cycleTime', value)}
                      />
                      <FormField
                        label="Material"
                        id="material"
                        value={productForm.material}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'material', value)}
                        options={[
                          { value: 'pp', label: 'PP (Polypropylene)' },
                          { value: 'pe', label: 'PE (Polyethylene)' },
                          { value: 'abs', label: 'ABS' },
                          { value: 'pc', label: 'PC (Polycarbonate)' },
                          { value: 'nylon', label: 'Nylon' },
                          { value: 'pom', label: 'POM' }
                        ]}
                        placeholder="Select material"
                        required
                      />
                      <FormField
                        label="Part Weight"
                        id="partWeight"
                        type="number"
                        placeholder="Weight in grams"
                        value={productForm.partWeight}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'partWeight', value)}
                      />
                      <FormField
                        label="Runner Weight"
                        id="runnerWeight"
                        type="number"
                        placeholder="Weight in grams"
                        value={productForm.runnerWeight}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'runnerWeight', value)}
                      />
                      <FormField
                        label="Number of Cavities"
                        id="cavities"
                        type="number"
                        placeholder="Number of cavities"
                        value={productForm.cavities}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'cavities', value)}
                      />
                      <FormField
                        label="Packing Method"
                        id="packingMethod"
                        value={productForm.packingMethod}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'packingMethod', value)}
                        options={[
                          { value: 'carton', label: 'Carton' },
                          { value: 'bag', label: 'Bag' },
                          { value: 'tray', label: 'Tray' },
                          { value: 'bulk', label: 'Bulk' }
                        ]}
                        placeholder="Select packing method"
                      />
                      <FormField
                        label="Packing Quantity"
                        id="packingQty"
                        type="number"
                        placeholder="Quantity per pack"
                        value={productForm.packingQty}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'packingQty', value)}
                      />
                      <FormField
                        label="Status"
                        id="status"
                        value={productForm.status}
                        onChange={(value) => handleInputChange(productForm, setProductForm, 'status', value)}
                        options={[
                          { value: 'Active', label: 'Active' },
                          { value: 'Inactive', label: 'Inactive' }
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                      <Button onClick={handleSubmitProduct} disabled={isSubmittingProduct}>
                        {isSubmittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {productData.length === 0 ? (
                  <p className="text-gray-600">No products found.</p>
                ) : (
                  productData.map((product) => (
                    <div key={product.productId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-600">Cycle Time: {product.cycleTime}s</p>
                            <p className="text-sm text-gray-600">Material: {product.material}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Part Weight: {product.partWeight}g</p>
                            <p className="text-sm text-gray-600">Runner Weight: {product.runnerWeight}g</p>
                            <p className="text-sm text-gray-600">Cavities: {product.cavities}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Packing Method: {product.packingMethod}</p>
                            <p className="text-sm text-gray-600">Packing Qty: {product.packingQty}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>{product.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Edit product"
                            onClick={() => handleEdit(product, setProductForm, setEditingProduct, setIsAddingProduct)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Delete product"
                            onClick={() => handleDeleteProduct(product.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Defect Master</CardTitle>
                <Dialog open={isAddingDefect} onOpenChange={(open) => {
                  setIsAddingDefect(open);
                  if (!open) {
                    setEditingDefect(null);
                    setDefectForm({ name: '', defectType: '' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingDefect ? 'Edit Defect' : 'Add Defect'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" aria-describedby={undefined} >
                    <DialogHeader>
                      <DialogTitle>{editingDefect ? 'Edit Defect' : 'Add New Defect'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <FormField
                        label="Defect Name"
                        id="defectName"
                        placeholder="Enter defect name"
                        value={defectForm.name}
                        onChange={(value) => handleInputChange(defectForm, setDefectForm, 'name', value)}
                        required
                      />
                      <FormField
                        label="Defect Type"
                        id="defectType"
                        value={defectForm.defectType}
                        onChange={(value) => handleInputChange(defectForm, setDefectForm, 'defectType', value)}
                        options={[
                          { value: 'injection-molding', label: 'Injection Molding' },
                          { value: 'assembly', label: 'Assembly' }
                        ]}
                        placeholder="Select defect type"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingDefect(false)}>Cancel</Button>
                      <Button onClick={handleSubmitDefect} disabled={isSubmittingDefect}>
                        {isSubmittingDefect ? 'Saving...' : editingDefect ? 'Update Defect' : 'Save Defect'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Injection Molding Defects</h3>
                    <div className="space-y-2">
                      {defectData.filter(d => d.defectType === 'injection-molding').length === 0 ? (
                        <p className="text-gray-600">No injection molding defects found.</p>
                      ) : (
                        defectData.filter(d => d.defectType === 'injection-molding').map(defect => (
                          <div key={defect.defectId} className="flex items-center space-x-2">
                            <Badge variant="outline">{defect.name}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Edit defect"
                              onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Delete defect"
                              onClick={() => handleDeleteDefect(defect.defectId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Assembly Defects</h3>
                    <div className="space-y-2">
                      {defectData.filter(d => d.defectType === 'assembly').length === 0 ? (
                        <p className="text-gray-600">No assembly defects found.</p>
                      ) : (
                        defectData.filter(d => d.defectType === 'assembly').map(defect => (
                          <div key={defect.defectId} className="flex items-center space-x-2">
                            <Badge variant="outline">{defect.name}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Edit defect"
                              onClick={() => handleEdit(defect, setDefectForm, setEditingDefect, setIsAddingDefect)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Delete defect"
                              onClick={() => handleDeleteDefect(defect.defectId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changeover">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Changeover Time Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Configure changeover times for mold-machine, color-color, and material-material transitions.
                  This section can be expanded to include a matrix editor or table for defining specific times.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Mold-Machine Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">Define changeover times between different mold-machine combinations.</p>
                      {/* Placeholder for future implementation */}
                      <Button variant="outline" className="mt-2">Configure Matrix</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Color-Color Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">Setup color changeover times and purging requirements.</p>
                      <Button variant="outline" className="mt-2">Configure Matrix</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Material-Material Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">Configure material changeover procedures and times.</p>
                      <Button variant="outline" className="mt-2">Configure Matrix</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smp">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>SMP (Standard Manufacturing Procedure)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Configure Standard Manufacturing Procedures (SMP) for production processes.
                This section can be expanded to include a form for defining SMP details, such as steps, parameters, and documentation.
              </p>
              <Button variant="outline" className="mt-4">Add SMP</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Master
                </CardTitle>
                <Dialog open={isAddingEmployee} onOpenChange={(open) => {
                  setIsAddingEmployee(open);
                  if (!open) {
                    setEditingEmployee(null);
                    setEmployeeForm({
                      name: '', role: '', email: '', password: '', employeeGroup: '', status: 'Active'
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" aria-describedby={undefined} >
                    <DialogHeader>
                      <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <FormField
                        label="Name"
                        id="employeeName"
                        placeholder="Enter employee full name"
                        value={employeeForm.name}
                        onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'name', value)}
                        required
                      />
                      <FormField
                        label="Role"
                        id="employeeRole"
                        placeholder="Enter job role/designation"
                        value={employeeForm.role}
                        onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'role', value)}
                      />
                      <FormField
                        label="Mail ID"
                        id="employeeEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={employeeForm.email}
                        onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'email', value)}
                        required
                      />
                      {!editingEmployee && (
                        <FormField
                          label="Password"
                          id="employeePassword"
                          type="password"
                          placeholder="Enter password"
                          value={employeeForm.password}
                          onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
                        />
                      )}
                      {editingEmployee && (
                        <FormField
                          label="New Password (Optional)"
                          id="employeePassword"
                          type="password"
                          placeholder="Enter new password"
                          value={employeeForm.password}
                          onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'password', value)}
                        />
                      )}
                      <FormField
                        label="Group"
                        id="employeeGroup"
                        value={employeeForm.employeeGroup}
                        onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'employeeGroup', value)}
                        options={employeeGroups.map(group => ({
                          value: group.toLowerCase().replace(' ', '-'),
                          label: group
                        }))}
                        placeholder="Select employee group"
                        required
                      />
                      <FormField
                        label="Status"
                        id="status"
                        value={employeeForm.status}
                        onChange={(value) => handleInputChange(employeeForm, setEmployeeForm, 'status', value)}
                        options={[
                          { value: 'Active', label: 'Active' },
                          { value: 'Inactive', label: 'Inactive' }
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>Cancel</Button>
                      <Button onClick={handleSubmitEmployee} disabled={isSubmittingEmployee}>
                        {isSubmittingEmployee ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Employee Groups</h3>
                <div className="grid grid-cols-7 gap-2">
                  {employeeGroups.map((group) => (
                    <Badge key={group} variant="outline" className="justify-center p-2">{group}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employees</h3>
                {employeeData.length === 0 ? (
                  <p className="text-gray-600">No employees found.</p>
                ) : (
                  employeeData.map((employee) => (
                    <div key={employee.employeeId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <div>
                            <h4 className="font-semibold text-lg">{employee.name}</h4>
                            <p className="text-sm text-gray-600">Role: {employee.role}</p>
                            <p className="text-sm text-gray-600">Email: {employee.email}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">{employee.employeeGroup}</Badge>
                            <p className="text-sm text-gray-600">Status: {employee.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>{employee.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Edit employee"
                            onClick={() => handleEdit(employee, setEmployeeForm, setEditingEmployee, setIsAddingEmployee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Delete employee"
                            onClick={() => handleDeleteEmployee(employee.employeeId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterData;
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { format, parseISO } from 'date-fns';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Badge } from '@/components/ui/badge';
// // import { Plus, CheckCircle, Link, Trash2, Clock } from 'lucide-react';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Textarea } from '@/components/ui/textarea';
// // // import { generateUUID } from '@/utils/utils';
// // import { v4 as uuidv4 } from "uuid";

// // interface Action {
// //   actionId: string;
// //   action: string;
// //   responsible: string;
// //   dueDate: string;
// // }

// // interface PdiEntry {
// //   pdiId: string;
// //   productionCode: string;
// //   product: string;
// //   date: string;
// //   shift: string;
// //   defectName: string;
// //   quantity: number;
// //   inspector: string;
// //   status: string;
// //   severity: string;
// //   correctiveActions: Action[];
// //   preventiveActions: Action[];
// // }

// // interface ProductionData {
// //   recordId: string;
// //   productionCode: string;
// // }

// // interface Employee {
// //   employeeId: string;
// //   name: string;
// //   role: string;
// // }

// // const generateUUID = () => uuidv4();

// // const API_BASE_URL = 'http://192.168.1.158:5000';

// // const isValidPdiEntry = (entry: any): entry is PdiEntry => {
// //   return (
// //     entry &&
// //     typeof entry.pdiId === 'string' &&
// //     typeof entry.productionCode === 'string' &&
// //     typeof entry.product === 'string' &&
// //     typeof entry.date === 'string' &&
// //     typeof entry.shift === 'string' &&
// //     typeof entry.defectName === 'string' &&
// //     typeof entry.quantity === 'number' &&
// //     typeof entry.inspector === 'string' &&
// //     typeof entry.status === 'string' &&
// //     typeof entry.severity === 'string' &&
// //     Array.isArray(entry.correctiveActions) &&
// //     Array.isArray(entry.preventiveActions)
// //   );
// // };

// // const Downtime = () => {
// //   const [isAddingPDI, setIsAddingPDI] = useState(false);
// //   const [pdiData, setPdiData] = useState<PdiEntry[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [pdiForm, setPdiForm] = useState({
// //     productionCode: '',
// //     defectName: '',
// //     quantity: '',
// //     inspector: '',
// //     severity: '',
// //     date: '',
// //     shift: '',
// //     product: '',
// //   });
// //   const [pdiCorrectiveActions, setPdiCorrectiveActions] = useState<Action[]>([]);
// //   const [pdiPreventiveActions, setPdiPreventiveActions] = useState<Action[]>([]);
// //   const [editingPdiId, setEditingPdiId] = useState<string | null>(null);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
// //   const [productionData, setProductionData] = useState<ProductionData[]>([]);
// //   const [employees, setEmployees] = useState<Employee[]>([]);
// //   const [filterStatus, setFilterStatus] = useState<string>('All');

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsLoading(true);
// //       setError(null);
// //       try {
// //         const [pdiRes, productionRes, employeeRes] = await Promise.all([
// //           fetch(`${API_BASE_URL}/api/pdi`),
// //           fetch(`${API_BASE_URL}/api/production`),
// //           fetch(`${API_BASE_URL}/api/employees`),
// //         ]);

// //         const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
// //         const normalizedPdiData = Array.isArray(pdiJson)
// //           ? pdiJson
// //               .map((pdi: PdiEntry, index: number) => ({
// //                 ...pdi,
// //                 pdiId: pdi.pdiId || `generated-${index}-${generateUUID()()}`,
// //                 correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
// //                   ...action,
// //                   actionId: action.actionId || generateUUID()(),
// //                 })),
// //                 preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
// //                   ...action,
// //                   actionId: action.actionId || generateUUID()(),
// //                 })),
// //               }))
// //               .filter((pdi, index, self) => {
// //                 if (!pdi.pdiId) {
// //                   console.warn('PDI entry missing pdiId:', pdi);
// //                   return false;
// //                 }
// //                 const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
// //                 if (!isUnique) {
// //                   console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
// //                 }
// //                 return isUnique;
// //               })
// //           : [];
// //         setPdiData(normalizedPdiData);

// //         const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
// //         setProductionData(productionJson.records || []);

// //         const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
// //         setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
// //       } catch (err) {
// //         console.error('Error fetching data:', err);
// //         setError('Failed to load some data. Partial data may be displayed.');
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //       const getEmployeeName = useCallback((id: string) => {
// //       return employees.find((emp) => emp.employeeId === id)?.name || id;
// //     }, [employees]);

// //   const filteredPdiData = pdiData.filter(pdi => {
// //     if (!pdi.pdiId) {
// //       console.warn('PDI entry missing pdiId in filteredPdiData:', pdi);
// //       return false;
// //     }
// //     return filterStatus === 'All' ? true : pdi.status === filterStatus;
// //   });

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case 'Open': return 'bg-red-100 text-red-800 border-red-800';
// //       case 'Closed': return 'bg-green-100 text-green-800 border-green-800';
// //       case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-800';
// //       default: return 'bg-gray-100 text-gray-800 border-gray-800';
// //     }
// //   };

// //   const getSeverityColor = (status: string) => {
// //     switch (status) {
// //       case 'high': return 'bg-red-500';
// //       case 'medium': return 'bg-yellow-500';
// //       case 'low': return 'bg-green-500';
// //       default: return 'bg-gray-500';
// //     }
// //   };

// //   const addAction = useCallback((setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
// //     const newActionId = generateUUID()();
// //     setter(prev => {
// //       const existingIds = new Set(prev.map(action => action.actionId));
// //       if (existingIds.has(newActionId)) {
// //         console.warn('Duplicate actionId generated:', newActionId);
// //       }
// //       return [...prev, {
// //         actionId: newActionId,
// //         action: '',
// //         responsible: '',
// //         dueDate: format(new Date(), 'yyyy-MM-dd'),
// //       }];
// //     });
// //   }, []);

// //   const removeAction = useCallback((index: number, setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
// //     setter(prev => prev.filter((_, i) => i !== index));
// //   }, []);

// //   const updateAction = useCallback((index: number, field: keyof Action, value: string, setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
// //     setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
// //   }, []);

// //   const handleInputChange = useCallback((field: keyof typeof pdiForm, value: string) => {
// //     setPdiForm(prev => ({ ...prev, [field]: value }));
// //   }, []);

// //   const validateForm = useCallback(() => {
// //     const errors: string[] = [];
// //     if (!pdiForm.productionCode) errors.push('Production code is required.');
// //     if (!pdiForm.defectName) errors.push('Defect name is required.');
// //     if (!pdiForm.quantity || isNaN(parseInt(pdiForm.quantity, 10))) errors.push('Quantity must be a valid number.');
// //     if (parseInt(pdiForm.quantity, 10) < 0) errors.push('Quantity cannot be negative.');
// //     if (!pdiForm.inspector) errors.push('Inspector name is required.');
// //     if (!pdiForm.severity) errors.push('Severity is required.');
// //     if (!pdiForm.date) errors.push('Date is required.');
// //     if (new Date(pdiForm.date) > new Date()) errors.push('Date cannot be in the future.');
// //     if (!pdiForm.shift) errors.push('Shift is required.');
// //     if (pdiCorrectiveActions.length === 0) errors.push('At least one corrective action is required.');
// //     if (pdiPreventiveActions.length === 0) errors.push('At least one preventive action is required.');
// //     if (pdiCorrectiveActions.some(a => !a.action || !a.responsible || !a.dueDate || new Date(a.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
// //       console.log('Invalid corrective actions:', pdiCorrectiveActions);
// //       errors.push('All corrective actions must be complete and have valid due dates.');
// //     }
// //     if (pdiPreventiveActions.some(a => !a.action || !a.responsible || !a.dueDate || new Date(a.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
// //       console.log('Invalid preventive actions:', pdiPreventiveActions);
// //       errors.push('All preventive actions must be complete and have valid due dates.');
// //     }
// //     return errors.length > 0 ? errors.join(' ') : null;
// //   }, [pdiForm, pdiCorrectiveActions, pdiPreventiveActions]);

// //   const handleEditActions = useCallback((pdi: PdiEntry) => {
// //     setEditingPdiId(pdi.pdiId);
// //     setPdiForm({
// //       productionCode: pdi.productionCode,
// //       defectName: pdi.defectName,
// //       quantity: pdi.quantity.toString(),
// //       inspector: pdi.inspector,
// //       severity: pdi.severity,
// //       date: pdi.date ? format(parseISO(pdi.date), 'yyyy-MM-dd') : '',
// //       shift: pdi.shift,
// //       product: pdi.product,
// //     });
// //     setPdiCorrectiveActions(pdi.correctiveActions.length > 0 ? pdi.correctiveActions.map(action => ({
// //       actionId: action.actionId || generateUUID()(),
// //       action: action.action,
// //       responsible: action.responsible,
// //       dueDate: action.dueDate ? format(parseISO(action.dueDate), 'yyyy-MM-dd') : '',
// //     })) : []);
// //     setPdiPreventiveActions(pdi.preventiveActions.length > 0 ? pdi.preventiveActions.map(action => ({
// //       actionId: action.actionId || generateUUID()(),
// //       action: action.action,
// //       responsible: action.responsible,
// //       dueDate: action.dueDate ? format(parseISO(action.dueDate), 'yyyy-MM-dd') : '',
// //     })) : []);
// //     setIsAddingPDI(true);
// //   }, []);

// //   const resetForm = () => {
// //     setPdiForm({
// //       productionCode: '',
// //       defectName: '',
// //       quantity: '',
// //       inspector: '',
// //       severity: '',
// //       date: '',
// //       shift: '',
// //       product: '',
// //     });
// //     setPdiCorrectiveActions([]);
// //     setPdiPreventiveActions([]);
// //     setEditingPdiId(null);
// //     setError(null);
// //   };

// //   const handleSubmitPDI = async () => {
// //     const validationError = validateForm();
// //     if (validationError) {
// //       setError(validationError);
// //       return;
// //     }
// //     setIsSubmitting(true);
// //     try {
// //       const newEntry = {
// //         ...pdiForm,
// //         quantity: parseInt(pdiForm.quantity, 10),
// //         correctiveActions: pdiCorrectiveActions,
// //         preventiveActions: pdiPreventiveActions,
// //         status: editingPdiId ? pdiData.find(p => p.pdiId === editingPdiId)?.status || 'Open' : 'Open',
// //       };
// //       const url = editingPdiId ? `${API_BASE_URL}/api/pdi/${editingPdiId}` : `${API_BASE_URL}/api/pdi`;
// //       const method = editingPdiId ? 'PATCH' : 'POST';
// //       const response = await fetch(url, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(newEntry),
// //       });
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(errorData.message || `Failed to ${editingPdiId ? 'update' : 'save'} PDI entry.`);
// //       }
// //       const savedEntry = await response.json();
// //       console.log(`API response from ${method}:`, savedEntry);

// //       let validatedEntry: PdiEntry;
// //       if (!isValidPdiEntry(savedEntry)) {
// //         console.warn(`Invalid API response from ${method}:`, savedEntry);
// //         if (savedEntry.message) {
// //           console.log('API success message:', savedEntry.message);
// //         }
// //         if (editingPdiId) {
// //           const existingEntry = pdiData.find(p => p.pdiId === editingPdiId);
// //           if (!existingEntry) {
// //             throw new Error('Existing PDI entry not found for update.');
// //           }
// //           validatedEntry = {
// //             ...existingEntry,
// //             ...newEntry,
// //             correctiveActions: newEntry.correctiveActions.map((action: Action) => ({
// //               ...action,
// //               actionId: action.actionId || generateUUID()(),
// //             })),
// //             preventiveActions: newEntry.preventiveActions.map((action: Action) => ({
// //               ...action,
// //               actionId: action.actionId || generateUUID()(),
// //             })),
// //           };
// //         } else {
// //           validatedEntry = {
// //             ...newEntry,
// //             pdiId: generateUUID()(),
// //             correctiveActions: newEntry.correctiveActions.map((action: Action) => ({
// //               ...action,
// //               actionId: action.actionId || generateUUID()(),
// //             })),
// //             preventiveActions: newEntry.preventiveActions.map((action: Action) => ({
// //               ...action,
// //               actionId: action.actionId || generateUUID()(),
// //             })),
// //           };
// //           const pdiRes = await fetch(`${API_BASE_URL}/api/pdi`);
// //           if (pdiRes.ok) {
// //             const pdiJson = await pdiRes.json();
// //             console.log('Refetched PDI data:', pdiJson);
// //             const normalizedPdiData = Array.isArray(pdiJson)
// //               ? pdiJson
// //                   .map((pdi: PdiEntry, index: number) => ({
// //                     ...pdi,
// //                     pdiId: pdi.pdiId || `generated-${index}-${generateUUID()()}`,
// //                     correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
// //                       ...action,
// //                       actionId: action.actionId || generateUUID()(),
// //                     })),
// //                     preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
// //                       ...action,
// //                       actionId: action.actionId || generateUUID()(),
// //                     })),
// //                   }))
// //                   .filter((pdi, index, self) => {
// //                     if (!pdi.pdiId) {
// //                       console.warn('PDI entry missing pdiId:', pdi);
// //                       return false;
// //                     }
// //                     const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
// //                     if (!isUnique) {
// //                       console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
// //                     }
// //                     return isUnique;
// //                   })
// //               : [];
// //             setPdiData(normalizedPdiData);
// //             setIsAddingPDI(false);
// //             resetForm();
// //             return;
// //           } else {
// //             console.warn('Failed to refetch PDI data, using temporary entry.');
// //           }
// //         }
// //       } else {
// //         validatedEntry = {
// //           ...savedEntry,
// //           correctiveActions: (savedEntry.correctiveActions || []).map((action: Action) => ({
// //             ...action,
// //             actionId: action.actionId || generateUUID()(),
// //           })),
// //           preventiveActions: (savedEntry.preventiveActions || []).map((action: Action) => ({
// //             ...action,
// //             actionId: action.actionId || generateUUID()(),
// //           })),
// //         };
// //       }

// //       setPdiData(prev => {
// //         const newData = editingPdiId
// //           ? prev.map(p => p.pdiId === editingPdiId ? validatedEntry : p)
// //           : [...prev, validatedEntry];
// //         const uniqueIds = new Set(newData.map(pdi => pdi.pdiId));
// //         if (uniqueIds.size !== newData.length) {
// //           console.warn('Duplicate pdiId detected in pdiData:', newData);
// //         }
// //         return newData;
// //       });
// //       setIsAddingPDI(false);
// //       resetForm();
// //     } catch (err) {
// //       const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
// //       setError(message);
// //       console.error(`Error ${editingPdiId ? 'updating' : 'saving'} PDI entry:`, err);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handleUpdateStatus = useCallback(async (pdiId: string, newStatus: string) => {
// //     setIsUpdatingStatus(pdiId);
// //     try {
// //       console.log('Updating status for pdiId:', pdiId, 'to:', newStatus);
// //       const validStatuses = ['Open', 'In Progress', 'Closed'];
// //       if (!validStatuses.includes(newStatus)) {
// //         throw new Error(`Invalid status value: ${newStatus}`);
// //       }
// //       const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
// //         method: 'PATCH',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ status: newStatus }),
// //       });
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         console.error(`Failed to update status: HTTP ${response.status}`, errorData);
// //         if (response.status === 404) {
// //           throw new Error('PDI entry not found. It may have been deleted.');
// //         }
// //         throw new Error(errorData.message || `Failed to update status: HTTP ${response.status}`);
// //       }
// //       const responseData = await response.json();
// //       if (!isValidPdiEntry(responseData)) {
// //         console.warn('Invalid API response for status update:', responseData);
// //         setPdiData(prev => prev.map(p => p.pdiId === pdiId ? { ...p, status: newStatus } : p));
// //       } else {
// //         setPdiData(prev => prev.map(p => p.pdiId === pdiId ? { ...responseData, status: newStatus } : p));
// //       }
// //     } catch (err) {
// //       console.error('Error updating status:', err);
// //       setError(err instanceof Error ? err.message : 'Failed to update status. Please try again.');
// //     } finally {
// //       setIsUpdatingStatus(null);
// //     }
// //   }, []);

// //   const handleDeletePDI = useCallback(async (pdiId: string) => {
// //     if (!window.confirm('Are you sure you want to delete this PDI entry?')) return;
// //     setIsUpdatingStatus(pdiId);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
// //         method: 'DELETE',
// //       });
// //       if (!response.ok) {
// //         if (response.status === 404) {
// //           throw new Error('PDI entry not found. It may have already been deleted.');
// //         }
// //         throw new Error('Failed to delete PDI entry.');
// //       }
// //       setPdiData(prev => prev.filter(p => p.pdiId !== pdiId));
// //     } catch (err) {
// //       console.error('Error deleting PDI entry:', err);
// //       setError(err instanceof Error ? err.message : 'Failed to delete PDI entry. Please try again.');
// //     } finally {
// //       setIsUpdatingStatus(null);
// //     }
// //   }, []);

// //   const ActionInputs = React.memo(({ actions, setActions, title }: { actions: Action[], setActions: React.Dispatch<React.SetStateAction<Action[]>>, title: string }) => {
// //     const getFieldError = (action: Action, field: keyof Action) => {
// //       if (field === 'dueDate') {
// //         return !action[field] ? `${title} ${field} is required.` :
// //                new Date(action[field]).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'Due date cannot be in the past.' : '';
// //       }
// //       return !action[field] ? `${title} ${field} is required.` : '';
// //     };

// //     return (
// //       <div className="space-y-4">
// //         <div className="flex justify-between items-center">
// //           <Label className="text-base font-medium">{title}</Label>
// //           <Button type="button" variant="outline" size="sm" onClick={() => addAction(setActions)}>
// //             <Plus className="h-4 w-4 mr-1" />
// //             Add {title.split(' ')[0]}
// //           </Button>
// //         </div>
// //         {actions.map((item, index) => (
// //           <div key={item.actionId} className="grid grid-cols-12 gap-2 items-end">
// //             <div className="col-span-5">
// //               <Label htmlFor={`action-${index}`}>Action</Label>
// //               <Textarea
// //                 id={`action-${index}`}
// //                 value={item.action}
// //                 onChange={(e) => updateAction(index, 'action', e.target.value, setActions)}
// //                 placeholder="Describe the action"
// //                 className={`min-h-[60px] ${getFieldError(item, 'action') ? 'border-red-500' : ''}`}
// //                 aria-label={`${title} action ${index + 1}`}
// //               />
// //               {/* {getFieldError(item, 'action') && (
// //                 <p className="text-red-600 text-sm">{getFieldError(item, 'action')}</p>
// //               )} */}
// //             </div>
// //             <div className="col-span-3">
// //               <Label htmlFor={`responsible-${index}`}>Responsible Person</Label>
// //               {/* <Input
// //                 id={`responsible-${index}`}
// //                 value={item.responsible}
// //                 onChange={(e) => updateAction(index, 'responsible', e.target.value, setActions)}
// //                 placeholder="Enter name"
// //                 className={getFieldError(item, 'responsible') ? 'border-red-500' : ''}
// //                 aria-label={`${title} responsible person ${index + 1}`}
// //               /> */}
// //               <Select
// //                 value={item.responsible}
// //                 onValueChange={(value) => updateAction(index, 'responsible', value, setActions)}
// //               >
// //                 <SelectTrigger aria-label="Select inspector">
// //                   <SelectValue placeholder="Select inspector" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {employees.map(emp => (
// //                     <SelectItem key={emp.employeeId} value={emp.employeeId}>
// //                       {emp.name}
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //               {/* {getFieldError(item, 'responsible') && (
// //                 <p className="text-red-600 text-sm">{getFieldError(item, 'responsible')}</p>
// //               )} */}
// //             </div>
// //             <div className="col-span-3">
// //               <Label htmlFor={`dueDate-${index}`}>Due Date</Label>
// //               <Input
// //                 id={`dueDate-${index}`}
// //                 type="date"
// //                 value={item.dueDate}
// //                 onChange={(e) => updateAction(index, 'dueDate', e.target.value, setActions)}
// //                 className={getFieldError(item, 'dueDate') ? 'border-red-500' : ''}
// //                 aria-label={`${title} due date ${index + 1}`}
// //               />
// //               {getFieldError(item, 'dueDate') && (
// //                 <p className="text-red-600 text-sm">{getFieldError(item, 'dueDate')}</p>
// //               )}
// //             </div>
// //             <div className="col-span-1">
// //               <Button
// //                 type="button"
// //                 variant="outline"
// //                 size="sm"
// //                 onClick={() => removeAction(index, setActions)}
// //                 disabled={actions.length === 1}
// //                 aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
// //               >
// //                 <Trash2 className="h-4 w-4" />
// //               </Button>
// //             </div>
// //           </div>
// //         ))}
// //         {actions.length === 0 && (
// //           <p className="text-sm text-gray-500">No actions added yet. Click "Add" to start.</p>
// //         )}
// //       </div>
// //     );
// //   });

// //   const PdiItem = React.memo(({ pdi }: { pdi: PdiEntry }) => (
// //     <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
// //       <div className="flex justify-between items-start mb-4">
// //         <div className="flex items-center space-x-4">
// //           <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
// //             <Link className="h-4 w-4 text-blue-600" />
// //             <span className="text-sm font-bold text-blue-900">
// //               {pdi.productionCode}
// //             </span>
// //           </div>
// //           <h3 className="font-semibold text-lg">{pdi.product}</h3>
// //           <Badge variant="outline">{pdi.defectName}</Badge>
// //           <div className="flex items-center space-x-2">
// //             <div
// //               className={`w-3 h-3 rounded-full ${getSeverityColor(
// //                 pdi.severity
// //               )}`}
// //             ></div>
// //             <span className="text-sm font-medium">
// //               {pdi.severity}
// //             </span>
// //           </div>
// //         </div>
// //         <div className="flex items-center space-x-2">
// //           <Select
// //             value={pdi.status}
// //             onValueChange={(value) => handleUpdateStatus(pdi.pdiId, value)}
// //             disabled={isUpdatingStatus === pdi.pdiId}
// //           >
// //             <SelectTrigger
// //               className={getStatusColor(pdi.status)}
// //               aria-label={`Status for PDI entry ${pdi.pdiId}`}
// //             >
// //               <SelectValue />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="Open">Open</SelectItem>
// //               <SelectItem value="In Progress">In Progress</SelectItem>
// //               <SelectItem value="Closed">Closed</SelectItem>
// //             </SelectContent>
// //           </Select>
// //           <Button
// //             variant="destructive"
// //             size="sm"
// //             onClick={() => handleDeletePDI(pdi.pdiId)}
// //             disabled={isUpdatingStatus === pdi.pdiId}
// //             aria-label={`Delete PDI entry ${pdi.pdiId}`}
// //           >
// //             {isUpdatingStatus === pdi.pdiId ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
// //           </Button>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-4 gap-4 mb-4">
// //         <div className="bg-blue-50 p-3 rounded-lg">
// //           <p className="text-sm font-medium text-blue-800">
// //             Date & Shift
// //           </p>
// //           <p className="text-lg font-bold text-blue-900">
// //             {pdi.date
// //               ? format(parseISO(pdi.date), "yyyy-MM-dd")
// //               : "N/A"}
// //           </p>
// //           <p className="text-sm text-blue-600">Shift {pdi.shift}</p>
// //         </div>
// //         <div className="bg-red-50 p-3 rounded-lg">
// //           <p className="text-sm font-medium text-red-800">
// //             Defect Quantity
// //           </p>
// //           <p className="text-2xl font-bold text-red-900">
// //             {pdi.quantity}
// //           </p>
// //           <p className="text-sm text-red-600">Units affected</p>
// //         </div>
// //         <div className="bg-green-50 p-3 rounded-lg">
// //           <p className="text-sm font-medium text-green-800">
// //             Inspector
// //           </p>
// //           <p className="text-lg font-bold text-green-900">
// //             {/* {pdi.inspector} */} {getEmployeeName(pdi.inspector)}
// //           </p>
// //           <p className="text-sm text-green-600">
// //             Quality inspector
// //           </p>
// //         </div>
// //         <div className="bg-orange-50 p-3 rounded-lg">
// //           <p className="text-sm font-medium text-orange-800">
// //             Action Required
// //           </p>
// //           <Button
// //             size="sm"
// //             className="mt-2 w-full"
// //             onClick={() => handleEditActions(pdi)}
// //             aria-label={
// //               pdi.status === "Open"
// //                 ? "Update actions for PDI entry"
// //                 : "View details for PDI entry"
// //             }
// //           >
// //             {pdi.status === "Open"
// //               ? "Update Actions"
// //               : "View Details"}
// //           </Button>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-2 gap-4">
// //         <div className="bg-yellow-50 p-3 rounded-lg">
// //           <h4 className="font-medium text-yellow-800 mb-2">
// //             Corrective Actions
// //           </h4>
// //           {(pdi.correctiveActions || []).map((action) => (
// //             <div
// //               key={action.actionId}
// //               className="text-sm text-yellow-700 mb-2"
// //             >
// //               <p className="font-medium">{action.action}</p>
// //               {/* <p>Responsible: {action.responsible}</p> */}
// //               <p>Responsible: {getEmployeeName(action.responsible)}</p>

// //               <p>
// //                 Due: {action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "N/A"}
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //         <div className="bg-green-50 p-3 rounded-lg">
// //           <h4 className="font-medium text-green-800 mb-2">
// //             Preventive Actions
// //           </h4>
// //           {(pdi.preventiveActions || []).map((action) => (
// //             <div
// //               key={action.actionId}
// //               className="text-sm text-green-700 mb-2"
// //             >
// //               <p className="font-medium">{action.action}</p>
// //               {/* <p>Responsible: {action.responsible}</p> */}
// //               <p>Responsible: {getEmployeeName(action.responsible)}</p>
// //               <p>
// //                 Due: {action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "N/A"}
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   ));

// //   if (isLoading) {
// //     return <div className="text-center p-4">Loading...</div>;
// //   }

// //   if (error && pdiData.length === 0) {
// //     return (
// //       <div className="text-center p-4 text-red-600">
// //         {error}
// //         <Button
// //           onClick={() => {
// //             setError(null);
// //             setIsLoading(true);
// //             const fetchData = async () => {
// //               try {
// //                 const [pdiRes, productionRes, employeeRes] = await Promise.all([
// //                   fetch(`${API_BASE_URL}/api/pdi`),
// //                   fetch(`${API_BASE_URL}/api/production`),
// //                   fetch(`${API_BASE_URL}/api/employees`),
// //                 ]);

// //                 const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
// //                 const normalizedPdiData = Array.isArray(pdiJson)
// //                   ? pdiJson
// //                       .map((pdi: PdiEntry, index: number) => ({
// //                         ...pdi,
// //                         pdiId: pdi.pdiId || `generated-${index}-${generateUUID()()}`,
// //                         correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
// //                           ...action,
// //                           actionId: action.actionId || generateUUID()(),
// //                         })),
// //                         preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
// //                           ...action,
// //                           actionId: action.actionId || generateUUID()(),
// //                         })),
// //                       }))
// //                       .filter((pdi, index, self) => {
// //                         if (!pdi.pdiId) {
// //                           console.warn('PDI entry missing pdiId:', pdi);
// //                           return false;
// //                         }
// //                         const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
// //                         if (!isUnique) {
// //                           console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
// //                         }
// //                         return isUnique;
// //                       })
// //                   : [];
// //                 setPdiData(normalizedPdiData);

// //                 const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
// //                 setProductionData(productionJson.records || []);

// //                 const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
// //                 setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
// //               } catch (err) {
// //                 console.error('Error fetching data:', err);
// //                 setError('Failed to load some data. Partial data may be displayed.');
// //               } finally {
// //                 setIsLoading(false);
// //               }
// //             };
// //             fetchData();
// //           }}
// //           className="ml-4"
// //           aria-label="Retry loading PDI data"
// //         >
// //           Retry
// //         </Button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <h2 className="text-2xl font-bold text-gray-900">PDI Inspection</h2>
// //         <div className="flex items-center space-x-4">
// //           <Badge variant="outline" className="text-red-600">
// //             {pdiData.filter((pdi) => pdi.status === "Open").length} Open Issues
// //           </Badge>
// //           <Badge variant="outline" className="text-green-600">
// //             <CheckCircle className="h-4 w-4 mr-1" />
// //             {pdiData.filter((pdi) => pdi.status === "Closed").length} Resolved
// //           </Badge>
// //           <Select value={filterStatus} onValueChange={setFilterStatus}>
// //             <SelectTrigger aria-label="Filter by status" className="w-[180px]">
// //               <SelectValue placeholder="Filter by status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="All">All</SelectItem>
// //               <SelectItem value="Open">Open</SelectItem>
// //               <SelectItem value="In Progress">In Progress</SelectItem>
// //               <SelectItem value="Closed">Closed</SelectItem>
// //             </SelectContent>
// //           </Select>
// //         </div>
// //       </div>

// //       <Card className="border-0 shadow-md">
// //         <CardHeader>
// //           <div className="flex justify-between items-center">
// //             <CardTitle className="flex items-center gap-2">
// //               <CheckCircle className="h-5 w-5" />
// //               Pre-Delivery Inspection (PDI)
// //             </CardTitle>
// //             <Dialog
// //               open={isAddingPDI}
// //               onOpenChange={(open) => {
// //                 setIsAddingPDI(open);
// //                 if (!open) {
// //                   resetForm();
// //                 }
// //               }}
// //             >
// //               <DialogTrigger asChild>
// //                 <Button
// //                   className="bg-blue-600 hover:bg-blue-700"
// //                   aria-label="Add new PDI entry"
// //                 >
// //                   <Plus className="h-4 w-4 mr-2" />
// //                   Add PDI Entry
// //                 </Button>
// //               </DialogTrigger>
// //               <DialogContent
// //                 className="max-w-4xl max-h-[90vh] overflow-y-auto"
// //                 aria-describedby="dialog-description"
// //                 onOpenAutoFocus={(e) => {
// //                   const firstInput = e.currentTarget.querySelector('#productionCodePDI');
// //                   firstInput?.focus();
// //                 }}
// //               >
// //                 <DialogHeader>
// //                   <DialogTitle>
// //                     {editingPdiId ? "Edit PDI Entry" : "Add PDI Entry"}
// //                   </DialogTitle>
// //                   <DialogDescription>
// //                     {editingPdiId
// //                       ? "Update the details of the PDI entry."
// //                       : "Enter the details for a new PDI entry."}
// //                   </DialogDescription>
// //                 </DialogHeader>
// //                 <div className="space-y-6 py-4">
// //                   {error && (
// //                     <div role="alert" className="text-red-600 text-sm mb-4">
// //                       {error}
// //                     </div>
// //                   )}
// //                   <div className="grid grid-cols-2 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="productionCodePDI">Production Code</Label>
// //                       <Select
// //                         value={pdiForm.productionCode}
// //                         onValueChange={(value) =>
// //                           handleInputChange("productionCode", value)
// //                         }
// //                       >
// //                         <SelectTrigger id="productionCodePDI" aria-label="Select production code">
// //                           <SelectValue placeholder="Select production code" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           {productionData.map((prod) => (
// //                             <SelectItem
// //                               key={prod.recordId}
// //                               value={prod.productionCode}
// //                             >
// //                               {prod.productionCode}
// //                             </SelectItem>
// //                           ))}
// //                         </SelectContent>
// //                       </Select>
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="defectName">Defect Name</Label>
// //                       <Select
// //                         value={pdiForm.defectName}
// //                         onValueChange={(value) =>
// //                           handleInputChange("defectName", value)
// //                         }
// //                       >
// //                         <SelectTrigger aria-label="Select defect name">
// //                           <SelectValue placeholder="Select defect" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           <SelectItem value="flash">Flash</SelectItem>
// //                           <SelectItem value="shortshot">Short Shot</SelectItem>
// //                           <SelectItem value="sinkmarks">Sink Marks</SelectItem>
// //                           <SelectItem value="warpage">Warpage</SelectItem>
// //                           <SelectItem value="burn-marks">Burn Marks</SelectItem>
// //                           <SelectItem value="contamination">
// //                             Contamination
// //                           </SelectItem>
// //                         </SelectContent>
// //                       </Select>
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-3 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="quantity">Quantity</Label>
// //                       <Input
// //                         id="quantity"
// //                         type="number"
// //                         value={pdiForm.quantity}
// //                         onChange={(e) =>
// //                           handleInputChange("quantity", e.target.value)
// //                         }
// //                         placeholder="Enter quantity"
// //                         aria-label="Defect quantity"
// //                         aria-invalid={!!error && !pdiForm.quantity}
// //                       />
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="inspector">Inspector Name</Label>
// //                       {employees.some(emp => emp.role === "Quality Inspector") ? (
// //                         <Select
// //                           value={pdiForm.inspector}
// //                           onValueChange={(value) => handleInputChange("inspector", value)}
// //                         >
// //                           <SelectTrigger aria-label="Select inspector">
// //                             <SelectValue placeholder="Select inspector" />
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             {employees
// //                               .filter(emp => emp.role === "Quality Inspector")
// //                               .map(emp => (
// //                                 <SelectItem key={emp.employeeId} value={emp.employeeId}>
// //                                   {emp.name}
// //                                 </SelectItem>
// //                               ))}
// //                           </SelectContent>
// //                         </Select>
// //                       ) : (
// //                         <p className="text-sm text-red-600">No quality inspectors available.</p>
// //                       )}
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="severity">Severity</Label>
// //                       <Select
// //                         value={pdiForm.severity}
// //                         onValueChange={(value) =>
// //                           handleInputChange("severity", value)
// //                         }
// //                       >
// //                         <SelectTrigger aria-label="Select severity">
// //                           <SelectValue placeholder="Select severity" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           <SelectItem value="low">Low</SelectItem>
// //                           <SelectItem value="medium">Medium</SelectItem>
// //                           <SelectItem value="high">High</SelectItem>
// //                         </SelectContent>
// //                       </Select>
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="date">Date</Label>
// //                       <Input
// //                         id="date"
// //                         type="date"
// //                         value={pdiForm.date}
// //                         onChange={(e) =>
// //                           handleInputChange("date", e.target.value)
// //                         }
// //                         aria-label="Inspection date"
// //                         aria-invalid={!!error && !pdiForm.date}
// //                       />
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="shift">Shift</Label>
// //                       <Select
// //                         value={pdiForm.shift}
// //                         onValueChange={(value) =>
// //                           handleInputChange("shift", value)
// //                         }
// //                       >
// //                         <SelectTrigger aria-label="Select shift">
// //                           <SelectValue placeholder="Select shift" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           <SelectItem value="A">A</SelectItem>
// //                           <SelectItem value="B">B</SelectItem>
// //                           <SelectItem value="C">C</SelectItem>
// //                         </SelectContent>
// //                       </Select>
// //                     </div>
// //                     <div className="space-y-2">
// //                       <Label htmlFor="product">Product</Label>
// //                       <Input
// //                         id="product"
// //                         value={pdiForm.product}
// //                         onChange={(e) =>
// //                           handleInputChange("product", e.target.value)
// //                         }
// //                         placeholder="Enter product name"
// //                         aria-label="Product name"
// //                         aria-invalid={!!error && !pdiForm.product}
// //                       />
// //                     </div>
// //                   </div>

// //                   <ActionInputs
// //                     actions={pdiCorrectiveActions}
// //                     setActions={setPdiCorrectiveActions}
// //                     title="Corrective Actions"
// //                   />

// //                   <ActionInputs
// //                     actions={pdiPreventiveActions}
// //                     setActions={setPdiPreventiveActions}
// //                     title="Preventive Actions"
// //                   />
// //                 </div>
// //                 <div className="flex justify-end space-x-2">
// //                   <Button
// //                     variant="outline"
// //                     onClick={() => {
// //                       setIsAddingPDI(false);
// //                       resetForm();
// //                     }}
// //                     aria-label="Cancel PDI entry"
// //                   >
// //                     Cancel
// //                   </Button>
// //                   <Button
// //                     onClick={handleSubmitPDI}
// //                     disabled={isSubmitting}
// //                     aria-label={
// //                       editingPdiId ? "Update PDI entry" : "Save PDI entry"
// //                     }
// //                   >
// //                     {isSubmitting
// //                       ? "Saving..."
// //                       : editingPdiId
// //                       ? "Update PDI Entry"
// //                       : "Save PDI Entry"}
// //                   </Button>
// //                 </div>
// //               </DialogContent>
// //             </Dialog>
// //           </div>
// //         </CardHeader>
// //         <CardContent>
// //           <div className="grid gap-4">
// //             {filteredPdiData.length === 0 ? (
// //               // <p className="text-gray-600">No PDI entries found.</p>
// //               <div className="text-center py-12">
// //                 <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //                 <h3 className="text-lg font-medium text-gray-900 mb-2">
// //                   No PDI entries found.
// //                 </h3>
// //                 <p className="text-gray-500">
// //                   Try adjusting your search or filters
// //                 </p>
// //               </div>
// //             ) : (
// //               filteredPdiData.map((pdi) => (
// //                 <PdiItem key={pdi.pdiId} pdi={pdi} />
// //               ))
// //             )}
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default Downtime;

// import React, { useState, useEffect, useCallback } from 'react';
// import { format, parseISO } from 'date-fns';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Plus, CheckCircle, Link, Trash2, Clock } from 'lucide-react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { generateUUID } from '@/utils/utils';

// interface Action {
//   actionId: string;
//   action: string;
//   responsible: string;
//   dueDate: string;
// }

// interface PdiEntry {
//   pdiId: string;
//   productionCode: string;
//   product: string;
//   date: string;
//   shift: string;
//   defectName: string;
//   quantity: number;
//   inspector: string;
//   status: string;
//   severity: string;
//   correctiveActions: Action[];
//   preventiveActions: Action[];
// }

// interface ProductionData {
//   recordId: string;
//   productionCode: string;
// }

// interface Employee {
//   employeeId: string;
//   name: string;
//   role: string;
// }

// const API_BASE_URL = 'http://192.168.1.158:5000';

// const isValidPdiEntry = (entry: any): entry is PdiEntry => {
//   return (
//     entry &&
//     typeof entry.pdiId === 'string' &&
//     typeof entry.productionCode === 'string' &&
//     typeof entry.product === 'string' &&
//     typeof entry.date === 'string' &&
//     typeof entry.shift === 'string' &&
//     typeof entry.defectName === 'string' &&
//     typeof entry.quantity === 'number' &&
//     typeof entry.inspector === 'string' &&
//     typeof entry.status === 'string' &&
//     typeof entry.severity === 'string' &&
//     Array.isArray(entry.correctiveActions) &&
//     Array.isArray(entry.preventiveActions)
//   );
// };

// const Downtime = () => {
//   const [isAddingPDI, setIsAddingPDI] = useState(false);
//   const [pdiData, setPdiData] = useState<PdiEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pdiForm, setPdiForm] = useState({
//     productionCode: '',
//     defectName: '',
//     quantity: '',
//     inspector: '',
//     severity: '',
//     date: '',
//     shift: '',
//     product: '',
//   });
//   const [pdiCorrectiveActions, setPdiCorrectiveActions] = useState<Action[]>([]);
//   const [pdiPreventiveActions, setPdiPreventiveActions] = useState<Action[]>([]);
//   const [editingPdiId, setEditingPdiId] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
//   const [productionData, setProductionData] = useState<ProductionData[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filterStatus, setFilterStatus] = useState<string>('All');

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const [pdiRes, productionRes, employeeRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/api/pdi`),
//           fetch(`${API_BASE_URL}/api/production`),
//           fetch(`${API_BASE_URL}/api/employees`),
//         ]);

//         const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
//         const normalizedPdiData = Array.isArray(pdiJson)
//           ? pdiJson
//               .map((pdi: PdiEntry, index: number) => ({
//                 ...pdi,
//                 pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
//                 correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
//                   ...action,
//                   actionId: action.actionId || generateUUID(),
//                 })),
//                 preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
//                   ...action,
//                   actionId: action.actionId || generateUUID(),
//                 })),
//               }))
//               .filter((pdi, index, self) => {
//                 if (!pdi.pdiId) {
//                   console.warn('PDI entry missing pdiId:', pdi);
//                   return false;
//                 }
//                 const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
//                 if (!isUnique) {
//                   console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
//                 }
//                 return isUnique;
//               })
//           : [];
//         setPdiData(normalizedPdiData);

//         const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
//         setProductionData(productionJson.records || []);

//         const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
//         setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to load some data. Partial data may be displayed.');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//       const getEmployeeName = useCallback((id: string) => {
//       return employees.find((emp) => emp.employeeId === id)?.name || id;
//     }, [employees]);

//   const filteredPdiData = pdiData.filter(pdi => {
//     if (!pdi.pdiId) {
//       console.warn('PDI entry missing pdiId in filteredPdiData:', pdi);
//       return false;
//     }
//     return filterStatus === 'All' ? true : pdi.status === filterStatus;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Open': return 'bg-red-100 text-red-800 border-red-800';
//       case 'Closed': return 'bg-green-100 text-green-800 border-green-800';
//       case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-800';
//       default: return 'bg-gray-100 text-gray-800 border-gray-800';
//     }
//   };

//   const getSeverityColor = (status: string) => {
//     switch (status) {
//       case 'high': return 'bg-red-500';
//       case 'medium': return 'bg-yellow-500';
//       case 'low': return 'bg-green-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const addAction = useCallback((setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
//     const newActionId = generateUUID();
//     setter(prev => {
//       const existingIds = new Set(prev.map(action => action.actionId));
//       if (existingIds.has(newActionId)) {
//         console.warn('Duplicate actionId generated:', newActionId);
//       }
//       return [...prev, {
//         actionId: newActionId,
//         action: '',
//         responsible: '',
//         dueDate: format(new Date(), 'yyyy-MM-dd'),
//       }];
//     });
//   }, []);

//   const removeAction = useCallback((index: number, setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
//     setter(prev => prev.filter((_, i) => i !== index));
//   }, []);

//   const updateAction = useCallback((index: number, field: keyof Action, value: string, setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
//     setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
//   }, []);

//   const handleInputChange = useCallback((field: keyof typeof pdiForm, value: string) => {
//     setPdiForm(prev => ({ ...prev, [field]: value }));
//   }, []);

//   const validateForm = useCallback(() => {
//     const errors: string[] = [];
//     if (!pdiForm.productionCode) errors.push('Production code is required.');
//     if (!pdiForm.defectName) errors.push('Defect name is required.');
//     if (!pdiForm.quantity || isNaN(parseInt(pdiForm.quantity, 10))) errors.push('Quantity must be a valid number.');
//     if (parseInt(pdiForm.quantity, 10) < 0) errors.push('Quantity cannot be negative.');
//     if (!pdiForm.inspector) errors.push('Inspector name is required.');
//     if (!pdiForm.severity) errors.push('Severity is required.');
//     if (!pdiForm.date) errors.push('Date is required.');
//     if (new Date(pdiForm.date) > new Date()) errors.push('Date cannot be in the future.');
//     if (!pdiForm.shift) errors.push('Shift is required.');
//     // if (pdiCorrectiveActions.length === 0) errors.push('At least one corrective action is required.');
//     // if (pdiPreventiveActions.length === 0) errors.push('At least one preventive action is required.');
//     // if (pdiCorrectiveActions.some(a => !a.action || !a.responsible || !a.dueDate || new Date(a.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
//     //   console.log('Invalid corrective actions:', pdiCorrectiveActions);
//     //   errors.push('All corrective actions must be complete and have valid due dates.');
//     // }
//     // if (pdiPreventiveActions.some(a => !a.action || !a.responsible || !a.dueDate || new Date(a.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
//     //   console.log('Invalid preventive actions:', pdiPreventiveActions);
//     //   errors.push('All preventive actions must be complete and have valid due dates.');
//     // }
//     return errors.length > 0 ? errors.join(' ') : null;
//   }, [pdiForm, pdiCorrectiveActions, pdiPreventiveActions]);

//   const handleEditActions = useCallback((pdi: PdiEntry) => {
//     setEditingPdiId(pdi.pdiId);
//     setPdiForm({
//       productionCode: pdi.productionCode,
//       defectName: pdi.defectName,
//       quantity: pdi.quantity.toString(),
//       inspector: pdi.inspector,
//       severity: pdi.severity,
//       date: pdi.date ? format(parseISO(pdi.date), 'yyyy-MM-dd') : '',
//       shift: pdi.shift,
//       product: pdi.product,
//     });
//     setPdiCorrectiveActions(pdi.correctiveActions.length > 0 ? pdi.correctiveActions.map(action => ({
//       actionId: action.actionId || generateUUID(),
//       action: action.action,
//       responsible: action.responsible,
//       dueDate: action.dueDate ? format(parseISO(action.dueDate), 'yyyy-MM-dd') : '',
//     })) : []);
//     setPdiPreventiveActions(pdi.preventiveActions.length > 0 ? pdi.preventiveActions.map(action => ({
//       actionId: action.actionId || generateUUID(),
//       action: action.action,
//       responsible: action.responsible,
//       dueDate: action.dueDate ? format(parseISO(action.dueDate), 'yyyy-MM-dd') : '',
//     })) : []);
//     setIsAddingPDI(true);
//   }, []);

//   const resetForm = () => {
//     setPdiForm({
//       productionCode: '',
//       defectName: '',
//       quantity: '',
//       inspector: '',
//       severity: '',
//       date: '',
//       shift: '',
//       product: '',
//     });
//     setPdiCorrectiveActions([]);
//     setPdiPreventiveActions([]);
//     setEditingPdiId(null);
//     setError(null);
//   };

//   const handleSubmitPDI = async () => {
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const newEntry = {
//         ...pdiForm,
//         quantity: parseInt(pdiForm.quantity, 10),
//         correctiveActions: pdiCorrectiveActions,
//         preventiveActions: pdiPreventiveActions,
//         status: editingPdiId ? pdiData.find(p => p.pdiId === editingPdiId)?.status || 'Open' : 'Open',
//       };
//       const url = editingPdiId ? `${API_BASE_URL}/api/pdi/${editingPdiId}` : `${API_BASE_URL}/api/pdi`;
//       const method = editingPdiId ? 'PATCH' : 'POST';
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newEntry),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `Failed to ${editingPdiId ? 'update' : 'save'} PDI entry.`);
//       }
//       const savedEntry = await response.json();
//       console.log(`API response from ${method}:`, savedEntry);

//       let validatedEntry: PdiEntry;
//       if (!isValidPdiEntry(savedEntry)) {
//         console.warn(`Invalid API response from ${method}:`, savedEntry);
//         if (savedEntry.message) {
//           console.log('API success message:', savedEntry.message);
//         }
//         if (editingPdiId) {
//           const existingEntry = pdiData.find(p => p.pdiId === editingPdiId);
//           if (!existingEntry) {
//             throw new Error('Existing PDI entry not found for update.');
//           }
//           validatedEntry = {
//             ...existingEntry,
//             ...newEntry,
//             correctiveActions: newEntry.correctiveActions.map((action: Action) => ({
//               ...action,
//               actionId: action.actionId || generateUUID(),
//             })),
//             preventiveActions: newEntry.preventiveActions.map((action: Action) => ({
//               ...action,
//               actionId: action.actionId || generateUUID(),
//             })),
//           };
//         } else {
//           validatedEntry = {
//             ...newEntry,
//             pdiId: generateUUID(),
//             correctiveActions: newEntry.correctiveActions.map((action: Action) => ({
//               ...action,
//               actionId: action.actionId || generateUUID(),
//             })),
//             preventiveActions: newEntry.preventiveActions.map((action: Action) => ({
//               ...action,
//               actionId: action.actionId || generateUUID(),
//             })),
//           };
//           const pdiRes = await fetch(`${API_BASE_URL}/api/pdi`);
//           if (pdiRes.ok) {
//             const pdiJson = await pdiRes.json();
//             console.log('Refetched PDI data:', pdiJson);
//             const normalizedPdiData = Array.isArray(pdiJson)
//               ? pdiJson
//                   .map((pdi: PdiEntry, index: number) => ({
//                     ...pdi,
//                     pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
//                     correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
//                       ...action,
//                       actionId: action.actionId || generateUUID(),
//                     })),
//                     preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
//                       ...action,
//                       actionId: action.actionId || generateUUID(),
//                     })),
//                   }))
//                   .filter((pdi, index, self) => {
//                     if (!pdi.pdiId) {
//                       console.warn('PDI entry missing pdiId:', pdi);
//                       return false;
//                     }
//                     const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
//                     if (!isUnique) {
//                       console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
//                     }
//                     return isUnique;
//                   })
//               : [];
//             setPdiData(normalizedPdiData);
//             setIsAddingPDI(false);
//             resetForm();
//             return;
//           } else {
//             console.warn('Failed to refetch PDI data, using temporary entry.');
//           }
//         }
//       } else {
//         validatedEntry = {
//           ...savedEntry,
//           correctiveActions: (savedEntry.correctiveActions || []).map((action: Action) => ({
//             ...action,
//             actionId: action.actionId || generateUUID(),
//           })),
//           preventiveActions: (savedEntry.preventiveActions || []).map((action: Action) => ({
//             ...action,
//             actionId: action.actionId || generateUUID(),
//           })),
//         };
//       }

//       setPdiData(prev => {
//         const newData = editingPdiId
//           ? prev.map(p => p.pdiId === editingPdiId ? validatedEntry : p)
//           : [...prev, validatedEntry];
//         const uniqueIds = new Set(newData.map(pdi => pdi.pdiId));
//         if (uniqueIds.size !== newData.length) {
//           console.warn('Duplicate pdiId detected in pdiData:', newData);
//         }
//         return newData;
//       });
//       setIsAddingPDI(false);
//       resetForm();
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
//       setError(message);
//       console.error(`Error ${editingPdiId ? 'updating' : 'saving'} PDI entry:`, err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleUpdateStatus = useCallback(async (pdiId: string, newStatus: string) => {
//     setIsUpdatingStatus(pdiId);
//     try {
//       console.log('Updating status for pdiId:', pdiId, 'to:', newStatus);
//       const validStatuses = ['Open', 'In Progress', 'Closed'];
//       if (!validStatuses.includes(newStatus)) {
//         throw new Error(`Invalid status value: ${newStatus}`);
//       }
//       const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error(`Failed to update status: HTTP ${response.status}`, errorData);
//         if (response.status === 404) {
//           throw new Error('PDI entry not found. It may have been deleted.');
//         }
//         throw new Error(errorData.message || `Failed to update status: HTTP ${response.status}`);
//       }
//       const responseData = await response.json();
//       if (!isValidPdiEntry(responseData)) {
//         console.warn('Invalid API response for status update:', responseData);
//         setPdiData(prev => prev.map(p => p.pdiId === pdiId ? { ...p, status: newStatus } : p));
//       } else {
//         setPdiData(prev => prev.map(p => p.pdiId === pdiId ? { ...responseData, status: newStatus } : p));
//       }
//     } catch (err) {
//       console.error('Error updating status:', err);
//       setError(err instanceof Error ? err.message : 'Failed to update status. Please try again.');
//     } finally {
//       setIsUpdatingStatus(null);
//     }
//   }, []);

//   const handleDeletePDI = useCallback(async (pdiId: string) => {
//     if (!window.confirm('Are you sure you want to delete this PDI entry?')) return;
//     setIsUpdatingStatus(pdiId);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
//         method: 'DELETE',
//       });
//       if (!response.ok) {
//         if (response.status === 404) {
//           throw new Error('PDI entry not found. It may have already been deleted.');
//         }
//         throw new Error('Failed to delete PDI entry.');
//       }
//       setPdiData(prev => prev.filter(p => p.pdiId !== pdiId));
//     } catch (err) {
//       console.error('Error deleting PDI entry:', err);
//       setError(err instanceof Error ? err.message : 'Failed to delete PDI entry. Please try again.');
//     } finally {
//       setIsUpdatingStatus(null);
//     }
//   }, []);

//   const ActionInputs = React.memo(({ actions, setActions, title }: { actions: Action[], setActions: React.Dispatch<React.SetStateAction<Action[]>>, title: string }) => {
//     const getFieldError = (action: Action, field: keyof Action) => {
//       if (field === 'dueDate') {
//         return !action[field] ? `${title} ${field} is required.` :
//                new Date(action[field]).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'Due date cannot be in the past.' : '';
//       }
//       return !action[field] ? `${title} ${field} is required.` : '';
//     };

//     return (
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <Label className="text-base font-medium">{title}</Label>
//           <Button type="button" variant="outline" size="sm" onClick={() => addAction(setActions)}>
//             <Plus className="h-4 w-4 mr-1" />
//             Add {title.split(' ')[0]}
//           </Button>
//         </div>
//         {actions.map((item, index) => (
//           <div key={item.actionId} className="grid grid-cols-12 gap-2 items-end">
//             <div className="col-span-5">
//               <Label htmlFor={`action-${index}`}>Action</Label>
//               <Textarea
//                 id={`action-${index}`}
//                 value={item.action}
//                 onChange={(e) => updateAction(index, 'action', e.target.value, setActions)}
//                 placeholder="Describe the action"
//                 className={`min-h-[60px] ${getFieldError(item, 'action') ? 'border-red-500' : ''}`}
//                 aria-label={`${title} action ${index + 1}`}
//               />
//               {/* {getFieldError(item, 'action') && (
//                 <p className="text-red-600 text-sm">{getFieldError(item, 'action')}</p>
//               )} */}
//             </div>
//             <div className="col-span-3">
//               <Label htmlFor={`responsible-${index}`}>Responsible Person</Label>
//               {/* <Input
//                 id={`responsible-${index}`}
//                 value={item.responsible}
//                 onChange={(e) => updateAction(index, 'responsible', e.target.value, setActions)}
//                 placeholder="Enter name"
//                 className={getFieldError(item, 'responsible') ? 'border-red-500' : ''}
//                 aria-label={`${title} responsible person ${index + 1}`}
//               /> */}
//               <Select
//                 value={item.responsible}
//                 onValueChange={(value) => updateAction(index, 'responsible', value, setActions)}
//               >
//                 <SelectTrigger aria-label="Select inspector">
//                   <SelectValue placeholder="Select inspector" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {employees.map(emp => (
//                     <SelectItem key={emp.employeeId} value={emp.employeeId}>
//                       {emp.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {/* {getFieldError(item, 'responsible') && (
//                 <p className="text-red-600 text-sm">{getFieldError(item, 'responsible')}</p>
//               )} */}
//             </div>
//             <div className="col-span-3">
//               <Label htmlFor={`dueDate-${index}`}>Due Date</Label>
//               <Input
//                 id={`dueDate-${index}`}
//                 type="date"
//                 value={item.dueDate}
//                 onChange={(e) => updateAction(index, 'dueDate', e.target.value, setActions)}
//                 className={getFieldError(item, 'dueDate') ? 'border-red-500' : ''}
//                 aria-label={`${title} due date ${index + 1}`}
//               />
//               {getFieldError(item, 'dueDate') && (
//                 <p className="text-red-600 text-sm">{getFieldError(item, 'dueDate')}</p>
//               )}
//             </div>
//             <div className="col-span-1">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => removeAction(index, setActions)}
//                 disabled={actions.length === 1}
//                 aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         ))}
//         {actions.length === 0 && (
//           <p className="text-sm text-gray-500">No actions added yet. Click "Add" to start.</p>
//         )}
//       </div>
//     );
//   });

//   const PdiItem = React.memo(({ pdi }: { pdi: PdiEntry }) => (
//     <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
//       <div className="flex justify-between items-start mb-4">
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
//             <Link className="h-4 w-4 text-blue-600" />
//             <span className="text-sm font-bold text-blue-900">
//               {pdi.productionCode}
//             </span>
//           </div>
//           <h3 className="font-semibold text-lg">{pdi.product}</h3>
//           <Badge variant="outline">{pdi.defectName}</Badge>
//           <div className="flex items-center space-x-2">
//             <div
//               className={`w-3 h-3 rounded-full ${getSeverityColor(
//                 pdi.severity
//               )}`}
//             ></div>
//             <span className="text-sm font-medium">
//               {pdi.severity}
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Select
//             value={pdi.status}
//             onValueChange={(value) => handleUpdateStatus(pdi.pdiId, value)}
//             disabled={isUpdatingStatus === pdi.pdiId}
//           >
//             <SelectTrigger
//               className={getStatusColor(pdi.status)}
//               aria-label={`Status for PDI entry ${pdi.pdiId}`}
//             >
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Open">Open</SelectItem>
//               <SelectItem value="In Progress">In Progress</SelectItem>
//               <SelectItem value="Closed">Closed</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button
//             variant="destructive"
//             size="sm"
//             onClick={() => handleDeletePDI(pdi.pdiId)}
//             disabled={isUpdatingStatus === pdi.pdiId}
//             aria-label={`Delete PDI entry ${pdi.pdiId}`}
//           >
//             {isUpdatingStatus === pdi.pdiId ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-4 gap-4 mb-4">
//         <div className="bg-blue-50 p-3 rounded-lg">
//           <p className="text-sm font-medium text-blue-800">
//             Date & Shift
//           </p>
//           <p className="text-lg font-bold text-blue-900">
//             {pdi.date
//               ? format(parseISO(pdi.date), "yyyy-MM-dd")
//               : "N/A"}
//           </p>
//           <p className="text-sm text-blue-600">Shift {pdi.shift}</p>
//         </div>
//         <div className="bg-red-50 p-3 rounded-lg">
//           <p className="text-sm font-medium text-red-800">
//             Defect Quantity
//           </p>
//           <p className="text-2xl font-bold text-red-900">
//             {pdi.quantity}
//           </p>
//           <p className="text-sm text-red-600">Units affected</p>
//         </div>
//         <div className="bg-green-50 p-3 rounded-lg">
//           <p className="text-sm font-medium text-green-800">
//             Inspector
//           </p>
//           <p className="text-lg font-bold text-green-900">
//             {/* {pdi.inspector} */} {getEmployeeName(pdi.inspector)}
//           </p>
//           <p className="text-sm text-green-600">
//             Quality inspector
//           </p>
//         </div>
//         <div className="bg-orange-50 p-3 rounded-lg">
//           <p className="text-sm font-medium text-orange-800">
//             Action Required
//           </p>
//           <Button
//             size="sm"
//             className="mt-2 w-full"
//             onClick={() => handleEditActions(pdi)}
//             aria-label={
//               pdi.status === "Open"
//                 ? "Update actions for PDI entry"
//                 : "View details for PDI entry"
//             }
//           >
//             {pdi.status === "Open"
//               ? "Update Actions"
//               : "View Details"}
//           </Button>
//         </div>
//       </div>

//     </div>
//   ));

//   if (isLoading) {
//     return <div className="text-center p-4">Loading...</div>;
//   }

//   if (error && pdiData.length === 0) {
//     return (
//       <div className="text-center p-4 text-red-600">
//         {error}
//         <Button
//           onClick={() => {
//             setError(null);
//             setIsLoading(true);
//             const fetchData = async () => {
//               try {
//                 const [pdiRes, productionRes, employeeRes] = await Promise.all([
//                   fetch(`${API_BASE_URL}/api/pdi`),
//                   fetch(`${API_BASE_URL}/api/production`),
//                   fetch(`${API_BASE_URL}/api/employees`),
//                 ]);

//                 const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
//                 const normalizedPdiData = Array.isArray(pdiJson)
//                   ? pdiJson
//                       .map((pdi: PdiEntry, index: number) => ({
//                         ...pdi,
//                         pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
//                         correctiveActions: (pdi.correctiveActions || []).map((action: Action) => ({
//                           ...action,
//                           actionId: action.actionId || generateUUID(),
//                         })),
//                         preventiveActions: (pdi.preventiveActions || []).map((action: Action) => ({
//                           ...action,
//                           actionId: action.actionId || generateUUID(),
//                         })),
//                       }))
//                       .filter((pdi, index, self) => {
//                         if (!pdi.pdiId) {
//                           console.warn('PDI entry missing pdiId:', pdi);
//                           return false;
//                         }
//                         const isUnique = self.findIndex(p => p.pdiId === pdi.pdiId) === index;
//                         if (!isUnique) {
//                           console.warn('Duplicate pdiId detected:', pdi.pdiId, pdi);
//                         }
//                         return isUnique;
//                       })
//                   : [];
//                 setPdiData(normalizedPdiData);

//                 const productionJson = productionRes.ok ? await productionRes.json() : { records: [] };
//                 setProductionData(productionJson.records || []);

//                 const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
//                 setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
//               } catch (err) {
//                 console.error('Error fetching data:', err);
//                 setError('Failed to load some data. Partial data may be displayed.');
//               } finally {
//                 setIsLoading(false);
//               }
//             };
//             fetchData();
//           }}
//           className="ml-4"
//           aria-label="Retry loading PDI data"
//         >
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">PDI Inspection</h2>
//         <div className="flex items-center space-x-4">
//           <Badge variant="outline" className="text-red-600">
//             {pdiData.filter((pdi) => pdi.status === "Open").length} Open Issues
//           </Badge>
//           <Badge variant="outline" className="text-green-600">
//             <CheckCircle className="h-4 w-4 mr-1" />
//             {pdiData.filter((pdi) => pdi.status === "Closed").length} Resolved
//           </Badge>
//           <Select value={filterStatus} onValueChange={setFilterStatus}>
//             <SelectTrigger aria-label="Filter by status" className="w-[180px]">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="All">All</SelectItem>
//               <SelectItem value="Open">Open</SelectItem>
//               <SelectItem value="In Progress">In Progress</SelectItem>
//               <SelectItem value="Closed">Closed</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <Card className="border-0 shadow-md">
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <CardTitle className="flex items-center gap-2">
//               <CheckCircle className="h-5 w-5" />
//               Pre-Delivery Inspection (PDI)
//             </CardTitle>
//             <Dialog
//               open={isAddingPDI}
//               onOpenChange={(open) => {
//                 setIsAddingPDI(open);
//                 if (!open) {
//                   resetForm();
//                 }
//               }}
//             >
//               <DialogTrigger asChild>
//                 <Button
//                   className="bg-blue-600 hover:bg-blue-700"
//                   aria-label="Add new PDI entry"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add PDI Entry
//                 </Button>
//               </DialogTrigger>
//               <DialogContent
//                 className="max-w-4xl max-h-[90vh] overflow-y-auto"
//                 aria-describedby="dialog-description"
//                 onOpenAutoFocus={(e) => {
//                   const firstInput = e.currentTarget.querySelector('#productionCodePDI');
//                   firstInput?.focus();
//                 }}
//               >
//                 <DialogHeader>
//                   <DialogTitle>
//                     {editingPdiId ? "Edit PDI Entry" : "Add PDI Entry"}
//                   </DialogTitle>
//                   <DialogDescription>
//                     {editingPdiId
//                       ? "Update the details of the PDI entry."
//                       : "Enter the details for a new PDI entry."}
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-6 py-4">
//                   {error && (
//                     <div role="alert" className="text-red-600 text-sm mb-4">
//                       {error}
//                     </div>
//                   )}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="productionCodePDI">Production Code</Label>
//                       <Select
//                         value={pdiForm.productionCode}
//                         onValueChange={(value) =>
//                           handleInputChange("productionCode", value)
//                         }
//                       >
//                         <SelectTrigger id="productionCodePDI" aria-label="Select production code">
//                           <SelectValue placeholder="Select production code" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {productionData.map((prod) => (
//                             <SelectItem
//                               key={prod.recordId}
//                               value={prod.productionCode}
//                             >
//                               {prod.productionCode}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="defectName">Defect Name</Label>
//                       <Select
//                         value={pdiForm.defectName}
//                         onValueChange={(value) =>
//                           handleInputChange("defectName", value)
//                         }
//                       >
//                         <SelectTrigger aria-label="Select defect name">
//                           <SelectValue placeholder="Select defect" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="flash">Flash</SelectItem>
//                           <SelectItem value="shortshot">Short Shot</SelectItem>
//                           <SelectItem value="sinkmarks">Sink Marks</SelectItem>
//                           <SelectItem value="warpage">Warpage</SelectItem>
//                           <SelectItem value="burn-marks">Burn Marks</SelectItem>
//                           <SelectItem value="contamination">
//                             Contamination
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="quantity">Quantity</Label>
//                       <Input
//                         id="quantity"
//                         type="number"
//                         value={pdiForm.quantity}
//                         onChange={(e) =>
//                           handleInputChange("quantity", e.target.value)
//                         }
//                         placeholder="Enter quantity"
//                         aria-label="Defect quantity"
//                         aria-invalid={!!error && !pdiForm.quantity}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="inspector">Inspector Name</Label>
//                       {employees.some(emp => emp.role === "Quality Inspector") ? (
//                         <Select
//                           value={pdiForm.inspector}
//                           onValueChange={(value) => handleInputChange("inspector", value)}
//                         >
//                           <SelectTrigger aria-label="Select inspector">
//                             <SelectValue placeholder="Select inspector" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {employees
//                               .filter(emp => emp.role === "Quality Inspector")
//                               .map(emp => (
//                                 <SelectItem key={emp.employeeId} value={emp.employeeId}>
//                                   {emp.name}
//                                 </SelectItem>
//                               ))}
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         <p className="text-sm text-red-600">No quality inspectors available.</p>
//                       )}
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="severity">Severity</Label>
//                       <Select
//                         value={pdiForm.severity}
//                         onValueChange={(value) =>
//                           handleInputChange("severity", value)
//                         }
//                       >
//                         <SelectTrigger aria-label="Select severity">
//                           <SelectValue placeholder="Select severity" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="low">Low</SelectItem>
//                           <SelectItem value="medium">Medium</SelectItem>
//                           <SelectItem value="high">High</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="date">Date</Label>
//                       <Input
//                         id="date"
//                         type="date"
//                         value={pdiForm.date}
//                         onChange={(e) =>
//                           handleInputChange("date", e.target.value)
//                         }
//                         aria-label="Inspection date"
//                         aria-invalid={!!error && !pdiForm.date}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="shift">Shift</Label>
//                       <Select
//                         value={pdiForm.shift}
//                         onValueChange={(value) =>
//                           handleInputChange("shift", value)
//                         }
//                       >
//                         <SelectTrigger aria-label="Select shift">
//                           <SelectValue placeholder="Select shift" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="A">A</SelectItem>
//                           <SelectItem value="B">B</SelectItem>
//                           <SelectItem value="C">C</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="product">Product</Label>
//                       <Input
//                         id="product"
//                         value={pdiForm.product}
//                         onChange={(e) =>
//                           handleInputChange("product", e.target.value)
//                         }
//                         placeholder="Enter product name"
//                         aria-label="Product name"
//                         aria-invalid={!!error && !pdiForm.product}
//                       />
//                     </div>
//                   </div>

//                   {/* <ActionInputs
//                     actions={pdiCorrectiveActions}
//                     setActions={setPdiCorrectiveActions}
//                     title="Corrective Actions"
//                   />

//                   <ActionInputs
//                     actions={pdiPreventiveActions}
//                     setActions={setPdiPreventiveActions}
//                     title="Preventive Actions"
//                   /> */}
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setIsAddingPDI(false);
//                       resetForm();
//                     }}
//                     aria-label="Cancel PDI entry"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleSubmitPDI}
//                     disabled={isSubmitting}
//                     aria-label={
//                       editingPdiId ? "Update PDI entry" : "Save PDI entry"
//                     }
//                   >
//                     {isSubmitting
//                       ? "Saving..."
//                       : editingPdiId
//                       ? "Update PDI Entry"
//                       : "Save PDI Entry"}
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4">
//             {filteredPdiData.length === 0 ? (
//               // <p className="text-gray-600">No PDI entries found.</p>
//               <div className="text-center py-12">
//                 <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">
//                   No PDI entries found.
//                 </h3>
//                 <p className="text-gray-500">
//                   Try adjusting your search or filters
//                 </p>
//               </div>
//             ) : (
//               filteredPdiData.map((pdi) => (
//                 <PdiItem key={pdi.pdiId} pdi={pdi} />
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Downtime;

//       // <div className="grid grid-cols-2 gap-4">
//       //   <div className="bg-yellow-50 p-3 rounded-lg">
//       //     <h4 className="font-medium text-yellow-800 mb-2">
//       //       Corrective Actions
//       //     </h4>
//       //     {(pdi.correctiveActions || []).map((action) => (
//       //       <div
//       //         key={action.actionId}
//       //         className="text-sm text-yellow-700 mb-2"
//       //       >
//       //         <p className="font-medium">{action.action}</p>
//       //         {/* <p>Responsible: {action.responsible}</p> */}
//       //         <p>Responsible: {getEmployeeName(action.responsible)}</p>

//       //         <p>
//       //           Due: {action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "N/A"}
//       //         </p>
//       //       </div>
//       //     ))}
//       //   </div>
//       //   <div className="bg-green-50 p-3 rounded-lg">
//       //     <h4 className="font-medium text-green-800 mb-2">
//       //       Preventive Actions
//       //     </h4>
//       //     {(pdi.preventiveActions || []).map((action) => (
//       //       <div
//       //         key={action.actionId}
//       //         className="text-sm text-green-700 mb-2"
//       //       >
//       //         <p className="font-medium">{action.action}</p>
//       //         <p>Responsible: {action.responsible}</p>
//       //         <p>Responsible: {getEmployeeName(action.responsible)}</p>
//       //         <p>
//       //           Due: {action.dueDate ? format(parseISO(action.dueDate), "yyyy-MM-dd") : "N/A"}
//       //         </p>
//       //       </div>
//       //     ))}
//       //   </div>
//       // </div>

import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Link, Trash2, Clock } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { generateUUID } from "@/utils/utils";

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
  quantity: number;
  inspector: string;
  status: string;
  severity: string;
  correctiveActions: Action[];
  preventiveActions: Action[];
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

const API_BASE_URL = "http://192.168.1.158:5000";

const isValidPdiEntry = (entry: any): entry is PdiEntry => {
  return (
    entry &&
    typeof entry.pdiId === "string" &&
    typeof entry.productionCode === "string" &&
    typeof entry.product === "string" &&
    typeof entry.date === "string" &&
    typeof entry.shift === "string" &&
    typeof entry.defectName === "string" &&
    typeof entry.quantity === "number" &&
    typeof entry.inspector === "string" &&
    typeof entry.status === "string" &&
    typeof entry.severity === "string" &&
    Array.isArray(entry.correctiveActions) &&
    Array.isArray(entry.preventiveActions)
  );
};

const Downtime = () => {
  const [isAddingPDI, setIsAddingPDI] = useState(false);
  const [pdiData, setPdiData] = useState<PdiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdiForm, setPdiForm] = useState({
    productionCode: "",
    defectName: "",
    quantity: "",
    inspector: "",
    severity: "",
    date: "",
    shift: "",
    product: "",
  });
  const [pdiCorrectiveActions, setPdiCorrectiveActions] = useState<Action[]>(
    []
  );
  const [pdiPreventiveActions, setPdiPreventiveActions] = useState<Action[]>(
    []
  );
  const [editingPdiId, setEditingPdiId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [pdiRes, productionRes, employeeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/pdi`),
          fetch(`${API_BASE_URL}/api/production`),
          fetch(`${API_BASE_URL}/api/employees`),
        ]);

        const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
        const normalizedPdiData = Array.isArray(pdiJson)
          ? pdiJson
              .map((pdi: PdiEntry, index: number) => ({
                ...pdi,
                pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
                correctiveActions: (pdi.correctiveActions || []).map(
                  (action: Action) => ({
                    ...action,
                    actionId: action.actionId || generateUUID(),
                  })
                ),
                preventiveActions: (pdi.preventiveActions || []).map(
                  (action: Action) => ({
                    ...action,
                    actionId: action.actionId || generateUUID(),
                  })
                ),
              }))
              .filter((pdi, index, self) => {
                if (!pdi.pdiId) {
                  console.warn("PDI entry missing pdiId:", pdi);
                  return false;
                }
                const isUnique =
                  self.findIndex((p) => p.pdiId === pdi.pdiId) === index;
                if (!isUnique) {
                  console.warn("Duplicate pdiId detected:", pdi.pdiId, pdi);
                }
                return isUnique;
              })
          : [];
        setPdiData(normalizedPdiData);

        const productionJson = productionRes.ok
          ? await productionRes.json()
          : { records: [] };
        setProductionData(productionJson.records || []);

        const employeeJson = employeeRes.ok ? await employeeRes.json() : [];
        setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load some data. Partial data may be displayed.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEmployeeName = useCallback(
    (id: string) => {
      return employees.find((emp) => emp.employeeId === id)?.name || id;
    },
    [employees]
  );

  const filteredPdiData = pdiData.filter((pdi) => {
    if (!pdi.pdiId) {
      console.warn("PDI entry missing pdiId in filteredPdiData:", pdi);
      return false;
    }
    return filterStatus === "All" ? true : pdi.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 border-red-800";
      case "Closed":
        return "bg-green-100 text-green-800 border-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-800";
    }
  };

  const getSeverityColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const addAction = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Action[]>>) => {
      const newActionId = generateUUID();
      setter((prev) => {
        const existingIds = new Set(prev.map((action) => action.actionId));
        if (existingIds.has(newActionId)) {
          console.warn("Duplicate actionId generated:", newActionId);
        }
        return [
          ...prev,
          {
            actionId: newActionId,
            action: "",
            responsible: "",
            dueDate: format(new Date(), "yyyy-MM-dd"),
          },
        ];
      });
    },
    []
  );

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
      setter((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleInputChange = useCallback(
    (field: keyof typeof pdiForm, value: string) => {
      setPdiForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    if (!pdiForm.productionCode) errors.push("Production code is required.");
    if (!pdiForm.defectName) errors.push("Defect name is required.");
    if (!pdiForm.quantity || isNaN(parseInt(pdiForm.quantity, 10)))
      errors.push("Quantity must be a valid number.");
    if (parseInt(pdiForm.quantity, 10) < 0)
      errors.push("Quantity cannot be negative.");
    if (!pdiForm.inspector) errors.push("Inspector name is required.");
    if (!pdiForm.severity) errors.push("Severity is required.");
    if (!pdiForm.date) errors.push("Date is required.");
    if (new Date(pdiForm.date) > new Date())
      errors.push("Date cannot be in the future.");
    if (!pdiForm.shift) errors.push("Shift is required.");
    if (editingPdiId) {
      if (pdiCorrectiveActions.length === 0)
        errors.push("At least one corrective action is required.");
      if (pdiPreventiveActions.length === 0)
        errors.push("At least one preventive action is required.");
      if (
        pdiCorrectiveActions.some(
          (a) =>
            !a.action ||
            !a.responsible ||
            !a.dueDate ||
            new Date(a.dueDate).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0)
        )
      ) {
        errors.push(
          "All corrective actions must be complete and have valid due dates."
        );
      }
      if (
        pdiPreventiveActions.some(
          (a) =>
            !a.action ||
            !a.responsible ||
            !a.dueDate ||
            new Date(a.dueDate).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0)
        )
      ) {
        errors.push(
          "All preventive actions must be complete and have valid due dates."
        );
      }
    }
    return errors.length > 0 ? errors.join(" ") : null;
  }, [pdiForm, pdiCorrectiveActions, pdiPreventiveActions, editingPdiId]);

  const handleEditActions = useCallback((pdi: PdiEntry) => {
    setEditingPdiId(pdi.pdiId);
    setPdiForm({
      productionCode: pdi.productionCode,
      defectName: pdi.defectName,
      quantity: pdi.quantity.toString(),
      inspector: pdi.inspector,
      severity: pdi.severity,
      date: pdi.date ? format(parseISO(pdi.date), "yyyy-MM-dd") : "",
      shift: pdi.shift,
      product: pdi.product,
    });
    setPdiCorrectiveActions(
      pdi.correctiveActions.length > 0
        ? pdi.correctiveActions.map((action) => ({
            actionId: action.actionId || generateUUID(),
            action: action.action,
            responsible: action.responsible,
            dueDate: action.dueDate
              ? format(parseISO(action.dueDate), "yyyy-MM-dd")
              : "",
          }))
        : []
    );
    setPdiPreventiveActions(
      pdi.preventiveActions.length > 0
        ? pdi.preventiveActions.map((action) => ({
            actionId: action.actionId || generateUUID(),
            action: action.action,
            responsible: action.responsible,
            dueDate: action.dueDate
              ? format(parseISO(action.dueDate), "yyyy-MM-dd")
              : "",
          }))
        : []
    );
    setIsAddingPDI(true);
  }, []);

  const resetForm = () => {
    setPdiForm({
      productionCode: "",
      defectName: "",
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
  };

  const handleSubmitPDI = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const newEntry = {
        ...pdiForm,
        quantity: parseInt(pdiForm.quantity, 10),
        correctiveActions: editingPdiId ? pdiCorrectiveActions : [],
        preventiveActions: editingPdiId ? pdiPreventiveActions : [],
        status: editingPdiId
          ? pdiData.find((p) => p.pdiId === editingPdiId)?.status || "Open"
          : "Open",
      };
      const url = editingPdiId
        ? `${API_BASE_URL}/api/pdi/${editingPdiId}`
        : `${API_BASE_URL}/api/pdi`;
      const method = editingPdiId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${editingPdiId ? "update" : "save"} PDI entry.`
        );
      }
      const savedEntry = await response.json();
      console.log(`API response from ${method}:`, savedEntry);

      let validatedEntry: PdiEntry;
      if (!isValidPdiEntry(savedEntry)) {
        console.warn(`Invalid API response from ${method}:`, savedEntry);
        if (savedEntry.message) {
          console.log("API success message:", savedEntry.message);
        }
        if (editingPdiId) {
          const existingEntry = pdiData.find((p) => p.pdiId === editingPdiId);
          if (!existingEntry) {
            throw new Error("Existing PDI entry not found for update.");
          }
          validatedEntry = {
            ...existingEntry,
            ...newEntry,
            correctiveActions: newEntry.correctiveActions.map(
              (action: Action) => ({
                ...action,
                actionId: action.actionId || generateUUID(),
              })
            ),
            preventiveActions: newEntry.preventiveActions.map(
              (action: Action) => ({
                ...action,
                actionId: action.actionId || generateUUID(),
              })
            ),
          };
        } else {
          validatedEntry = {
            ...newEntry,
            pdiId: generateUUID(),
            correctiveActions: [],
            preventiveActions: [],
          };
          const pdiRes = await fetch(`${API_BASE_URL}/api/pdi`);
          if (pdiRes.ok) {
            const pdiJson = await pdiRes.json();
            console.log("Refetched PDI data:", pdiJson);
            const normalizedPdiData = Array.isArray(pdiJson)
              ? pdiJson
                  .map((pdi: PdiEntry, index: number) => ({
                    ...pdi,
                    pdiId: pdi.pdiId || `generated-${index}-${generateUUID()}`,
                    correctiveActions: (pdi.correctiveActions || []).map(
                      (action: Action) => ({
                        ...action,
                        actionId: action.actionId || generateUUID(),
                      })
                    ),
                    preventiveActions: (pdi.preventiveActions || []).map(
                      (action: Action) => ({
                        ...action,
                        actionId: action.actionId || generateUUID(),
                      })
                    ),
                  }))
                  .filter((pdi, index, self) => {
                    if (!pdi.pdiId) {
                      console.warn("PDI entry missing pdiId:", pdi);
                      return false;
                    }
                    const isUnique =
                      self.findIndex((p) => p.pdiId === pdi.pdiId) === index;
                    if (!isUnique) {
                      console.warn("Duplicate pdiId detected:", pdi.pdiId, pdi);
                    }
                    return isUnique;
                  })
              : [];
            setPdiData(normalizedPdiData);
            setIsAddingPDI(false);
            resetForm();
            return;
          } else {
            console.warn("Failed to refetch PDI data, using temporary entry.");
          }
        }
      } else {
        validatedEntry = {
          ...savedEntry,
          correctiveActions: (savedEntry.correctiveActions || []).map(
            (action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })
          ),
          preventiveActions: (savedEntry.preventiveActions || []).map(
            (action: Action) => ({
              ...action,
              actionId: action.actionId || generateUUID(),
            })
          ),
        };
      }

      setPdiData((prev) => {
        const newData = editingPdiId
          ? prev.map((p) => (p.pdiId === editingPdiId ? validatedEntry : p))
          : [...prev, validatedEntry];
        const uniqueIds = new Set(newData.map((pdi) => pdi.pdiId));
        if (uniqueIds.size !== newData.length) {
          console.warn("Duplicate pdiId detected in pdiData:", newData);
        }
        return newData;
      });
      setIsAddingPDI(false);
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      console.error(
        `Error ${editingPdiId ? "updating" : "saving"} PDI entry:`,
        err
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = useCallback(
    async (pdiId: string, newStatus: string) => {
      setIsUpdatingStatus(pdiId);
      try {
        console.log("Updating status for pdiId:", pdiId, "to:", newStatus);
        const validStatuses = ["Open", "In Progress", "Closed"];
        if (!validStatuses.includes(newStatus)) {
          throw new Error(`Invalid status value: ${newStatus}`);
        }
        const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `Failed to update status: HTTP ${response.status}`,
            errorData
          );
          if (response.status === 404) {
            throw new Error("PDI entry not found. It may have been deleted.");
          }
          throw new Error(
            errorData.message ||
              `Failed to update status: HTTP ${response.status}`
          );
        }
        const responseData = await response.json();
        if (!isValidPdiEntry(responseData)) {
          console.warn("Invalid API response for status update:", responseData);
          setPdiData((prev) =>
            prev.map((p) =>
              p.pdiId === pdiId ? { ...p, status: newStatus } : p
            )
          );
        } else {
          setPdiData((prev) =>
            prev.map((p) =>
              p.pdiId === pdiId ? { ...responseData, status: newStatus } : p
            )
          );
        }
      } catch (err) {
        console.error("Error updating status:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update status. Please try again."
        );
      } finally {
        setIsUpdatingStatus(null);
      }
    },
    []
  );

  const handleDeletePDI = useCallback(async (pdiId: string) => {
    if (!window.confirm("Are you sure you want to delete this PDI entry?"))
      return;
    setIsUpdatingStatus(pdiId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdi/${pdiId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "PDI entry not found. It may have already been deleted."
          );
        }
        throw new Error("Failed to delete PDI entry.");
      }
      setPdiData((prev) => prev.filter((p) => p.pdiId !== pdiId));
    } catch (err) {
      console.error("Error deleting PDI entry:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete PDI entry. Please try again."
      );
    } finally {
      setIsUpdatingStatus(null);
    }
  }, []);

  const ActionInputs = React.memo(
    ({
      actions,
      setActions,
      title,
    }: {
      actions: Action[];
      setActions: React.Dispatch<React.SetStateAction<Action[]>>;
      title: string;
    }) => {
      const getFieldError = (action: Action, field: keyof Action) => {
        if (field === "dueDate") {
          return !action[field]
            ? `${title} ${field} is required.`
            : new Date(action[field]).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0)
            ? "Due date cannot be in the past."
            : "";
        }
        return !action[field] ? `${title} ${field} is required.` : "";
      };
      const [localActionValues, setLocalActionValues] = useState<{
        [key: string]: string;
      }>(
        Object.fromEntries(
          actions.map((action) => [action.actionId, action.action])
        )
      );

      useEffect(() => {
        setLocalActionValues(
          Object.fromEntries(
            actions.map((action) => [action.actionId, action.action])
          )
        );
      }, [actions]);

      const handleActionChange = (id: string, value: string) => {
        setLocalActionValues((prev) => ({ ...prev, [id]: value }));
      };

      const handleActionBlur = (index: number, id: string) => {
        updateAction(index, "action", localActionValues[id] || "", setActions);
      };

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">{title}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAction(setActions)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add {title.split(" ")[0]}
            </Button>
          </div>
          {actions.map((item, index) => (
            <div
              key={item.actionId}
              className="grid grid-cols-12 gap-2 items-end"
            >
              <div className="col-span-5">
                <Label htmlFor={`action-${index}`}>Action</Label>
                {/* <Textarea
                  id={`action-${index}`}
                  value={item.action}
                  onChange={(e) =>
                    updateAction(index, "action", e.target.value, setActions)
                  }
                  placeholder="Describe the action"
                  className={`min-h-[60px] ${
                    getFieldError(item, "action") ? "border-red-500" : ""
                  }`}
                  aria-label={`${title} action ${index + 1}`}
                /> */}
                <Textarea
                  id={`action-${index}`}
                  value={localActionValues[item.actionId] || ""}
                  onChange={(e) =>
                    handleActionChange(item.actionId, e.target.value)
                  }
                  onBlur={() => handleActionBlur(index, item.actionId)}
                  placeholder="Describe the action"
                  className={`min-h-[60px] ${
                    getFieldError(item, "action") ? "border-red-500" : ""
                  }`}
                  aria-label={`${title} action ${index + 1}`}
                />

                {getFieldError(item, "action") && (
                  <p className="text-red-600 text-sm">
                    {getFieldError(item, "action")}
                  </p>
                )}
              </div>
              <div className="col-span-3">
                <Label htmlFor={`responsible-${index}`}>
                  Responsible Person
                </Label>
                <Select
                  value={item.responsible}
                  onValueChange={(value) =>
                    updateAction(index, "responsible", value, setActions)
                  }
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
                {getFieldError(item, "responsible") && (
                  <p className="text-red-600 text-sm">
                    {getFieldError(item, "responsible")}
                  </p>
                )}
              </div>
              <div className="col-span-3">
                <Label htmlFor={`dueDate-${index}`}>Due Date</Label>
                <Input
                  id={`dueDate-${index}`}
                  type="date"
                  value={item.dueDate}
                  onChange={(e) =>
                    updateAction(index, "dueDate", e.target.value, setActions)
                  }
                  className={
                    getFieldError(item, "dueDate") ? "border-red-500" : ""
                  }
                  aria-label={`${title} due date ${index + 1}`}
                />
                {getFieldError(item, "dueDate") && (
                  <p className="text-red-600 text-sm">
                    {getFieldError(item, "dueDate")}
                  </p>
                )}
              </div>
              <div className="col-span-1">
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
              </div>
            </div>
          ))}
          {actions.length === 0 && (
            <p className="text-sm text-gray-500">
              No actions added yet. Click "Add" to start.
            </p>
          )}
        </div>
      );
    }
  );

  const PdiItem = React.memo(({ pdi }: { pdi: PdiEntry }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
            <Link className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-900">
              {pdi.productionCode}
            </span>
          </div>
          <h3 className="font-semibold text-lg">{pdi.product}</h3>
          <Badge variant="outline">{pdi.defectName}</Badge>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${getSeverityColor(
                pdi.severity
              )}`}
            ></div>
            <span className="text-sm font-medium">{pdi.severity}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={pdi.status}
            onValueChange={(value) => handleUpdateStatus(pdi.pdiId, value)}
            disabled={isUpdatingStatus === pdi.pdiId}
          >
            <SelectTrigger
              className={getStatusColor(pdi.status)}
              aria-label={`Status for PDI entry ${pdi.pdiId}`}
            >
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
            {isUpdatingStatus === pdi.pdiId ? (
              "Deleting..."
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Date & Shift</p>
          <p className="text-lg font-bold text-blue-900">
            {pdi.date ? format(parseISO(pdi.date), "yyyy-MM-dd") : "N/A"}
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
          <p className="text-lg font-bold text-green-900">
            {getEmployeeName(pdi.inspector)}
          </p>
          <p className="text-sm text-green-600">Quality inspector</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-orange-800">Action Required</p>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => handleEditActions(pdi)}
            aria-label={
              pdi.status === "Open"
                ? "Update actions for PDI entry"
                : "View details for PDI entry"
            }
          >
            {pdi.status === "Open" ? "Update Actions" : "View Details"}
          </Button>
        </div>
      </div>
    </div>
  ));

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error && pdiData.length === 0) {
    return (
      <div className="text-center p-4 text-red-600">
        {error}
        <Button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            const fetchData = async () => {
              try {
                const [pdiRes, productionRes, employeeRes] = await Promise.all([
                  fetch(`${API_BASE_URL}/api/pdi`),
                  fetch(`${API_BASE_URL}/api/production`),
                  fetch(`${API_BASE_URL}/api/employees`),
                ]);

                const pdiJson = pdiRes.ok ? await pdiRes.json() : [];
                const normalizedPdiData = Array.isArray(pdiJson)
                  ? pdiJson
                      .map((pdi: PdiEntry, index: number) => ({
                        ...pdi,
                        pdiId:
                          pdi.pdiId || `generated-${index}-${generateUUID()}`,
                        correctiveActions: (pdi.correctiveActions || []).map(
                          (action: Action) => ({
                            ...action,
                            actionId: action.actionId || generateUUID(),
                          })
                        ),
                        preventiveActions: (pdi.preventiveActions || []).map(
                          (action: Action) => ({
                            ...action,
                            actionId: action.actionId || generateUUID(),
                          })
                        ),
                      }))
                      .filter((pdi, index, self) => {
                        if (!pdi.pdiId) {
                          console.warn("PDI entry missing pdiId:", pdi);
                          return false;
                        }
                        const isUnique =
                          self.findIndex((p) => p.pdiId === pdi.pdiId) ===
                          index;
                        if (!isUnique) {
                          console.warn(
                            "Duplicate pdiId detected:",
                            pdi.pdiId,
                            pdi
                          );
                        }
                        return isUnique;
                      })
                  : [];
                setPdiData(normalizedPdiData);

                const productionJson = productionRes.ok
                  ? await productionRes.json()
                  : { records: [] };
                setProductionData(productionJson.records || []);

                const employeeJson = employeeRes.ok
                  ? await employeeRes.json()
                  : [];
                setEmployees(Array.isArray(employeeJson) ? employeeJson : []);
              } catch (err) {
                console.error("Error fetching data:", err);
                setError(
                  "Failed to load some data. Partial data may be displayed."
                );
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
    );
  }

  return (
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
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  aria-label="Add new PDI entry"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add PDI Entry
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-y-auto"
                aria-describedby="dialog-description"
                onOpenAutoFocus={(e) => {
                  const firstInput =
                    e.currentTarget.querySelector("#productionCodePDI");
                  firstInput?.focus();
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingPdiId ? "Edit PDI Entry" : "Add PDI Entry"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPdiId
                      ? "Update the details of the PDI entry."
                      : "Enter the details for a new PDI entry."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {error && (
                    <div role="alert" className="text-red-600 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productionCodePDI">Production Code</Label>
                      <Select
                        value={pdiForm.productionCode}
                        onValueChange={(value) =>
                          handleInputChange("productionCode", value)
                        }
                      >
                        <SelectTrigger
                          id="productionCodePDI"
                          aria-label="Select production code"
                        >
                          <SelectValue placeholder="Select production code" />
                        </SelectTrigger>
                        <SelectContent>
                          {productionData.map((prod) => (
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
                      <Label htmlFor="defectName">Defect Name</Label>
                      <Select
                        value={pdiForm.defectName}
                        onValueChange={(value) =>
                          handleInputChange("defectName", value)
                        }
                      >
                        <SelectTrigger aria-label="Select defect name">
                          <SelectValue placeholder="Select defect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flash">Flash</SelectItem>
                          <SelectItem value="shortshot">Short Shot</SelectItem>
                          <SelectItem value="sinkmarks">Sink Marks</SelectItem>
                          <SelectItem value="warpage">Warpage</SelectItem>
                          <SelectItem value="burn-marks">Burn Marks</SelectItem>
                          <SelectItem value="contamination">
                            Contamination
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={pdiForm.quantity}
                        onChange={(e) =>
                          handleInputChange("quantity", e.target.value)
                        }
                        placeholder="Enter quantity"
                        aria-label="Defect quantity"
                        aria-invalid={!!error && !pdiForm.quantity}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inspector">Inspector Name</Label>
                      {employees.some(
                        (emp) => emp.role === "Quality Inspector"
                      ) ? (
                        <Select
                          value={pdiForm.inspector}
                          onValueChange={(value) =>
                            handleInputChange("inspector", value)
                          }
                        >
                          <SelectTrigger aria-label="Select inspector">
                            <SelectValue placeholder="Select inspector" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees
                              .filter((emp) => emp.role === "Quality Inspector")
                              .map((emp) => (
                                <SelectItem
                                  key={emp.employeeId}
                                  value={emp.employeeId}
                                >
                                  {emp.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-red-600">
                          No quality inspectors available.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={pdiForm.severity}
                        onValueChange={(value) =>
                          handleInputChange("severity", value)
                        }
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={pdiForm.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        aria-label="Inspection date"
                        aria-invalid={!!error && !pdiForm.date}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift">Shift</Label>
                      <Select
                        value={pdiForm.shift}
                        onValueChange={(value) =>
                          handleInputChange("shift", value)
                        }
                      >
                        <SelectTrigger aria-label="Select shift">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Input
                        id="product"
                        value={pdiForm.product}
                        onChange={(e) =>
                          handleInputChange("product", e.target.value)
                        }
                        placeholder="Enter product name"
                        aria-label="Product name"
                        aria-invalid={!!error && !pdiForm.product}
                      />
                    </div>
                  </div>

                  {editingPdiId && (
                    <>
                      <ActionInputs
                        actions={pdiCorrectiveActions}
                        setActions={setPdiCorrectiveActions}
                        title="Corrective Actions"
                      />
                      <ActionInputs
                        actions={pdiPreventiveActions}
                        setActions={setPdiPreventiveActions}
                        title="Preventive Actions"
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
                    aria-label={
                      editingPdiId ? "Update PDI entry" : "Save PDI entry"
                    }
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingPdiId
                      ? "Update PDI Entry"
                      : "Save PDI Entry"}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No PDI entries found.
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              filteredPdiData.map((pdi) => (
                <PdiItem key={pdi.pdiId} pdi={pdi} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Downtime;

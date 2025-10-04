import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateUUID } from "@/utils/utils";

interface Action {
  id: string;
  action: string;
  responsible?: string; // Now optional
  dueDate?: string; 
}

interface ActionInputsProps {
  actions: Action[];
  setActions: (actions: Action[]) => void;
  title: string;
  employees: { employeeId: string; name: string }[];
  errors?: Record<number, Record<string, string>>;
  showDueDate?: boolean;
  showResponsible?: boolean; // New prop
}

export default function ActionInputs({
  actions,
  setActions,
  title,
  employees,
  errors,
  showDueDate = true,
  showResponsible = true, // Default true for backward compatibility
}: ActionInputsProps) {
  // Add new action
  const addAction = useCallback(() => {
    const newAction: Action = {
      id: generateUUID(),
      action: "",
      ...(showResponsible && { responsible: "" }),
      ...(showDueDate && { dueDate: "" }),
    };
    setActions([...actions, newAction]);
  }, [actions, setActions, showResponsible, showDueDate]);

  // Remove action
  const removeAction = useCallback(
    (index: number) => {
      setActions(actions.filter((_, i) => i !== index));
    },
    [actions, setActions]
  );

  // Update field
  const handleChange = useCallback(
    (index: number, field: keyof Action, value: string) => {
      const updated = [...actions];
      updated[index] = { ...updated[index], [field]: value };
      setActions(updated);
    },
    [actions, setActions]
  );

  return (
    <div className="space-y-4 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addAction}>
          <Plus className="h-4 w-4 mr-1" />
          Add Action
        </Button>
      </div>

      {actions.length === 0 && (
        <p className="text-gray-500 text-sm">No corrective actions added yet.</p>
      )}

      {actions.map((act, index) => (
        <div
          key={act.id}
          className={`grid ${
            showDueDate && showResponsible
              ? "grid-cols-12"
              : showResponsible || showDueDate
              ? "grid-cols-9"
              : "grid-cols-6"
          } gap-2 items-end border p-3 rounded-lg bg-white shadow-sm`}
        >
          {/* Action Description */}
          <div
            className={
              showDueDate && showResponsible
                ? "col-span-5"
                : showResponsible || showDueDate
                ? "col-span-4"
                : "col-span-5"
            }
          >
            <Label>Action</Label>
            <Textarea
              value={act.action}
              onChange={(e) => handleChange(index, "action", e.target.value)}
              placeholder="Describe corrective action"
              className={`min-h-[60px] ${
                errors?.[index]?.action ? "border-red-500" : ""
              }`}
            />
            {errors?.[index]?.action && (
              <p className="text-red-500 text-sm">{errors[index].action}</p>
            )}
          </div>

          {/* Responsible (Conditional) */}
          {showResponsible && (
            <div className="col-span-3">
              <Label>Responsible</Label>
              <Select
                value={act.responsible ?? ""}
                onValueChange={(value) =>
                  handleChange(index, "responsible", value)
                }
              >
                <SelectTrigger
                  className={`${
                    errors?.[index]?.responsible ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.name}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.[index]?.responsible && (
                <p className="text-red-500 text-sm">
                  {errors[index].responsible}
                </p>
              )}
            </div>
          )}

          {/* Due Date (Conditional) */}
          {showDueDate && (
            <div className="col-span-3">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={act.dueDate ?? ""}
                onChange={(e) => handleChange(index, "dueDate", e.target.value)}
                className={errors?.[index]?.dueDate ? "border-red-500" : ""}
              />
              {errors?.[index]?.dueDate && (
                <p className="text-red-500 text-sm">{errors[index].dueDate}</p>
              )}
            </div>
          )}

          {/* Remove Button */}
          <div className="col-span-1 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeAction(index)}
              disabled={actions.length === 1}
              aria-label={`Remove action ${index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}


// import { useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Trash2, Plus } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { generateUUID } from "@/utils/utils";

// interface Action {
//   id: string;
//   action: string;
//   responsible: string;
//   dueDate?: string; // Made optional to support cases where due date is not needed
// }

// interface ActionInputsProps {
//   actions: Action[];
//   setActions: (actions: Action[]) => void;
//   title: string;
//   employees: { employeeId: string; name: string }[];
//   errors?: Record<number, Record<string, string>>;
//   showDueDate?: boolean; // New prop to toggle due date visibility
// }

// export default function ActionInputs({
//   actions,
//   setActions,
//   title,
//   employees,
//   errors,
//   showDueDate = true, // Default to true for backward compatibility
// }: ActionInputsProps) {
//   // Add new action
//   const addAction = useCallback(() => {
//     const newAction: Action = {
//       id: generateUUID(),
//       action: "",
//       responsible: "",
//       ...(showDueDate && { dueDate: "" }), // Only include dueDate if showDueDate is true
//     };
//     setActions([...actions, newAction]);
//   }, [actions, setActions, showDueDate]);

//   // Remove action
//   const removeAction = useCallback(
//     (index: number) => {
//       setActions(actions.filter((_, i) => i !== index));
//     },
//     [actions, setActions]
//   );

//   // Update field
//   const handleChange = useCallback(
//     (index: number, field: keyof Action, value: string) => {
//       const updated = [...actions];
//       updated[index] = { ...updated[index], [field]: value };
//       setActions(updated);
//     },
//     [actions, setActions]
//   );

//   return (
//     <div className="space-y-4 mt-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <Label className="text-base font-medium">{title}</Label>
//         <Button type="button" variant="outline" size="sm" onClick={addAction}>
//           <Plus className="h-4 w-4 mr-1" />
//           Add Action
//         </Button>
//       </div>

//       {actions.length === 0 && (
//         <p className="text-gray-500 text-sm">No corrective actions added yet.</p>
//       )}

//       {actions.map((act, index) => (
//         <div
//           key={act.id}
//           className={`grid ${
//             showDueDate ? "grid-cols-12" : "grid-cols-8"
//           } gap-2 items-end border p-3 rounded-lg bg-white shadow-sm`}
//         >
//           {/* Action Description */}
//           <div className={showDueDate ? "col-span-5" : "col-span-4"}>
//             <Label>Action</Label>
//             <Textarea
//               value={act.action}
//               onChange={(e) => handleChange(index, "action", e.target.value)}
//               placeholder="Describe corrective action"
//               className={`min-h-[60px] ${
//                 errors?.[index]?.action ? "border-red-500" : ""
//               }`}
//             />
//             {errors?.[index]?.action && (
//               <p className="text-red-500 text-sm">{errors[index].action}</p>
//             )}
//           </div>

//           {/* Responsible */}
//           <div className={showDueDate ? "col-span-3" : "col-span-3"}>
//             <Label>Responsible</Label>
//             <Select
//               value={act.responsible}
//               onValueChange={(value) =>
//                 handleChange(index, "responsible", value)
//               }
//             >
//               <SelectTrigger
//                 className={`${
//                   errors?.[index]?.responsible ? "border-red-500" : ""
//                 }`}
//               >
//                 <SelectValue placeholder="Select employee" />
//               </SelectTrigger>
//               <SelectContent>
//                 {employees.map((emp) => (
//                   <SelectItem key={emp.employeeId} value={emp.name}>
//                     {emp.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {errors?.[index]?.responsible && (
//               <p className="text-red-500 text-sm">
//                 {errors[index].responsible}
//               </p>
//             )}
//           </div>

//           {/* Due Date (Conditional) */}
//           {showDueDate && (
//             <div className="col-span-3">
//               <Label>Due Date</Label>
//               <Input
//                 type="date"
//                 value={act.dueDate ?? ""}
//                 onChange={(e) => handleChange(index, "dueDate", e.target.value)}
//                 className={errors?.[index]?.dueDate ? "border-red-500" : ""}
//               />
//               {errors?.[index]?.dueDate && (
//                 <p className="text-red-500 text-sm">{errors[index].dueDate}</p>
//               )}
//             </div>
//           )}

//           {/* Remove Button */}
//           <div className="col-span-1 flex justify-center">
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={() => removeAction(index)}
//               disabled={actions.length === 1}
//               aria-label={`Remove action ${index + 1}`}
//             >
//               <Trash2 className="h-4 w-4 text-red-500" />
//             </Button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // import { useCallback } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Trash2, Plus } from "lucide-react";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Label } from "@/components/ui/label";

// // interface Action {
// //   id: string;
// //   action: string;
// //   responsible: string;
// // }

// // interface ActionInputsProps {
// //   actions: Action[];
// //   setActions: (actions: Action[]) => void;
// //   title: string;
// //   employees: { employeeId: string; name: string }[];
// //   errors?: Record<number, Record<string, string>>;
// // }

// // export default function ActionInputs({
// //   actions,
// //   setActions,
// //   title,
// //   employees,
// //   errors,
// // }: ActionInputsProps) {
// //   // Add new action
// //   const addAction = useCallback(() => {
// //     const newAction: Action = {
// //       id: crypto.randomUUID(), // Using crypto.randomUUID() for simplicity; replace with generateUUID if needed
// //       action: "",
// //       responsible: "",
// //     };
// //     setActions([...actions, newAction]);
// //   }, [actions, setActions]);

// //   // Remove action
// //   const removeAction = useCallback(
// //     (index: number) => {
// //       setActions(actions.filter((_, i) => i !== index));
// //     },
// //     [actions, setActions]
// //   );

// //   // Update field
// //   const handleChange = useCallback(
// //     (index: number, field: keyof Action, value: string) => {
// //       const updated = [...actions];
// //       updated[index] = { ...updated[index], [field]: value };
// //       setActions(updated);
// //     },
// //     [actions, setActions]
// //   );

// //   return (
// //     <div className="space-y-4 mt-6">
// //       {/* Header */}
// //       <div className="flex justify-between items-center">
// //         <Label className="text-base font-medium">{title}</Label>
// //         <Button
// //           type="button"
// //           variant="outline"
// //           size="sm"
// //           onClick={addAction}
// //           disabled={employees.length === 0}
// //         >
// //           <Plus className="h-4 w-4 mr-1" />
// //           Add Action
// //         </Button>
// //       </div>

// //       {actions.length === 0 && (
// //         <div className="text-center">
// //           <p className="text-gray-500 text-sm mb-2">
// //             No corrective actions added yet.
// //           </p>
// //           <Button type="button" variant="outline" size="sm" onClick={addAction}>
// //             <Plus className="h-4 w-4 mr-1" />
// //             Add Your First Action
// //           </Button>
// //         </div>
// //       )}

// //       {actions.map((act, index) => (
// //         <div
// //           key={act.id}
// //           className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end border p-3 rounded-lg bg-white shadow-sm"
// //         >
// //           {/* Action Description */}
// //           <div className="col-span-1 md:col-span-4">
// //             <Label>Action</Label>
// //             <Textarea
// //               value={act.action}
// //               onChange={(e) => handleChange(index, "action", e.target.value)}
// //               placeholder="Describe corrective action"
// //               className={`min-h-[60px] ${
// //                 errors?.[index]?.action ? "border-red-500" : ""
// //               }`}
// //             />
// //             {errors?.[index]?.action && (
// //               <p className="text-red-500 text-sm">{errors[index].action}</p>
// //             )}
// //           </div>

// //           {/* Responsible */}
// //           <div className="col-span-1 md:col-span-3">
// //             <Label>Responsible</Label>
// //             <Select
// //               value={act.responsible}
// //               onValueChange={(value) =>
// //                 handleChange(index, "responsible", value)
// //               }
// //             >
// //               <SelectTrigger
// //                 className={`${
// //                   errors?.[index]?.responsible ? "border-red-500" : ""
// //                 }`}
// //               >
// //                 <SelectValue placeholder="Select employee" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {employees.length === 0 ? (
// //                   <p className="text-gray-500 text-sm p-2">
// //                     No employees available
// //                   </p>
// //                 ) : (
// //                   employees.map((emp) => (
// //                     <SelectItem key={emp.employeeId} value={emp.name}>
// //                       {emp.name}
// //                     </SelectItem>
// //                   ))
// //                 )}
// //               </SelectContent>
// //             </Select>
// //             {errors?.[index]?.responsible && (
// //               <p className="text-red-500 text-sm">
// //                 {errors[index].responsible}
// //               </p>
// //             )}
// //           </div>

// //           {/* Remove Button */}
// //           <div className="col-span-1 flex justify-center">
// //             <Button
// //               type="button"
// //               variant="outline"
// //               size="sm"
// //               onClick={() => removeAction(index)}
// //               disabled={actions.length === 1}
// //               aria-label={`Remove action ${index + 1}`}
// //               title="Remove this action"
// //             >
// //               <Trash2 className="h-4 w-4 text-red-500" />
// //             </Button>
// //           </div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// // // import { useCallback } from "react";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { Trash2, Plus } from "lucide-react";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import { generateUUID } from "@/utils/utils";

// // // interface Action {
// // //   id: string;
// // //   action: string;
// // //   responsible: string;
// // //   dueDate: string;
// // // }

// // // interface ActionInputsProps {
// // //   actions: Action[];
// // //   setActions: (actions: Action[]) => void;
// // //   title: string;
// // //   employees: { employeeId: string; name: string }[];
// // //   errors?: Record<number, Record<string, string>>; 
// // // }

// // // export default function ActionInputs({
// // //   actions,
// // //   setActions,
// // //   title,
// // //   employees,
// // //   errors,
// // // }: ActionInputsProps) {
  
// // //   // Add new action
// // //   const addAction = useCallback(() => {
// // //     const newAction: Action = {
// // //       id: generateUUID(),
// // //       action: "",
// // //       responsible: "",
// // //       dueDate: "",
// // //     };
// // //     setActions([...actions, newAction]);
// // //   }, [actions, setActions]);

// // //   // Remove action
// // //   const removeAction = useCallback(
// // //     (index: number) => {
// // //       setActions(actions.filter((_, i) => i !== index));
// // //     },
// // //     [actions, setActions]
// // //   );

// // //   // Update field
// // //   const handleChange = useCallback(
// // //     (index: number, field: keyof Action, value: string) => {
// // //       const updated = [...actions];
// // //       updated[index] = { ...updated[index], [field]: value };
// // //       setActions(updated);
// // //     },
// // //     [actions, setActions]
// // //   );

// // //   return (
// // //     <div className="space-y-4 mt-6">
// // //       {/* Header */}
// // //       <div className="flex justify-between items-center">
// // //         <Label className="text-base font-medium">{title}</Label>
// // //         <Button type="button" variant="outline" size="sm" onClick={addAction}>
// // //           <Plus className="h-4 w-4 mr-1" />
// // //           Add Action
// // //         </Button>
// // //       </div>

// // //       {actions.length === 0 && (
// // //         <p className="text-gray-500 text-sm">No corrective actions added yet.</p>
// // //       )}

// // //       {actions.map((act, index) => (
// // //         <div
// // //           key={act.id}
// // //           className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-white shadow-sm"
// // //         >
// // //           {/* Action Description */}
// // //           <div className="col-span-5">
// // //             <Label>Action</Label>
// // //             <Textarea
// // //               value={act.action}
// // //               onChange={(e) => handleChange(index, "action", e.target.value)}
// // //               placeholder="Describe corrective action"
// // //               className={`min-h-[60px] ${
// // //                 errors?.[index]?.action ? "border-red-500" : ""
// // //               }`}
// // //             />
// // //             {errors?.[index]?.action && (
// // //               <p className="text-red-500 text-sm">{errors[index].action}</p>
// // //             )}
// // //           </div>

// // //           {/* Responsible */}
// // //           <div className="col-span-3">
// // //             <Label>Responsible</Label>
// // //             <Select
// // //               value={act.responsible}
// // //               onValueChange={(value) =>
// // //                 handleChange(index, "responsible", value)
// // //               }
// // //             >
// // //               <SelectTrigger
// // //                 className={`${
// // //                   errors?.[index]?.responsible ? "border-red-500" : ""
// // //                 }`}
// // //               >
// // //                 <SelectValue placeholder="Select employee" />
// // //               </SelectTrigger>
// // //               <SelectContent>
// // //                 {employees.map((emp) => (
// // //                   <SelectItem key={emp.employeeId} value={emp.name}>
// // //                     {emp.name}
// // //                   </SelectItem>
// // //                 ))}
// // //               </SelectContent>
// // //             </Select>
// // //             {errors?.[index]?.responsible && (
// // //               <p className="text-red-500 text-sm">
// // //                 {errors[index].responsible}
// // //               </p>
// // //             )}
// // //           </div>

// // //           {/* Due Date */}
// // //           <div className="col-span-3">
// // //             <Label>Due Date</Label>
// // //             <Input
// // //               type="date"
// // //               value={act.dueDate}
// // //               onChange={(e) => handleChange(index, "dueDate", e.target.value)}
// // //               className={errors?.[index]?.dueDate ? "border-red-500" : ""}
// // //             />
// // //             {errors?.[index]?.dueDate && (
// // //               <p className="text-red-500 text-sm">{errors[index].dueDate}</p>
// // //             )}
// // //           </div>

// // //           {/* Remove Button */}
// // //           <div className="col-span-1 flex justify-center">
// // //             <Button
// // //               type="button"
// // //               variant="outline"
// // //               size="sm"
// // //               onClick={() => removeAction(index)}
// // //               disabled={actions.length === 1}
// // //               aria-label={`Remove action ${index + 1}`}
// // //             >
// // //               <Trash2 className="h-4 w-4 text-red-500" />
// // //             </Button>
// // //           </div>
// // //         </div>
// // //       ))}
// // //     </div>
// // //   );
// // // }

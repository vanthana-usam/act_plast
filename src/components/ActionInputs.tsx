import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "lodash";
import { generateUUID } from "../utils/utils";

interface Action {
  id: string;
  action: string;
  responsible: string;
  dueDate: string;
}

interface ActionInputsProps {
  actions: Action[];
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
  title: string;
  employees: any[];
}

const ActionInputs: React.FC<ActionInputsProps> = React.memo(
  ({ actions, setActions, title, employees }) => {
    const [localActionValues, setLocalActionValues] = useState<{ [key: string]: string }>(
      Object.fromEntries(actions.map((action) => [action.id, action.action]))
    );

    useEffect(() => {
      setLocalActionValues(
        Object.fromEntries(actions.map((action) => [action.id, action.action]))
      );
    }, [actions]);

    const addAction = useCallback(() => {
      const newId = generateUUID();
      setActions((prev) => [
        ...prev,
        { id: newId, action: "", responsible: "", dueDate: "" },
      ]);
      setLocalActionValues((prev) => ({ ...prev, [newId]: "" }));
    }, [setActions]);

    const removeAction = useCallback(
      (id: string) => {
        setActions((prev) => prev.filter((action) => action.id !== id));
        setLocalActionValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      },
      [setActions]
    );

    const updateAction = useCallback(
      (id: string, field: keyof Action, value: string) => {
        setActions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
      },
      [setActions]
    );

    const debouncedUpdateAction = useCallback(
      debounce((id: string, field: keyof Action, value: string) => {
        updateAction(id, field, value);
      }, 300),
      [updateAction]
    );

    const handleActionChange = useCallback((id: string, value: string) => {
      setLocalActionValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleActionBlur = useCallback(
      (id: string) => {
        updateAction(id, "action", localActionValues[id] || "");
      },
      [localActionValues, updateAction]
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">{title}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAction}>
            <Plus className="h-4 w-4 mr-1" />
            Add Action
          </Button>
        </div>
        {actions.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <Label htmlFor={`${title}-action-${item.id}`}>Action</Label>
              <Textarea
                id={`${title}-action-${item.id}`}
                value={localActionValues[item.id] || ""}
                onChange={(e) => handleActionChange(item.id, e.target.value)}
                onBlur={() => handleActionBlur(item.id)}
                placeholder="Describe the action"
                className="min-h-[60px]"
                aria-label={`${title} action ${item.id}`}
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor={`${title}-responsible-${item.id}`}>Responsible Person</Label>
              <Select
                value={item.responsible}
                onValueChange={(value) => debouncedUpdateAction(item.id, "responsible", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label htmlFor={`${title}-dueDate-${item.id}`}>Due Date</Label>
              <Input
                id={`${title}-dueDate-${item.id}`}
                type="date"
                value={item.dueDate}
                onChange={(e) => debouncedUpdateAction(item.id, "dueDate", e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAction(item.id)}
                disabled={actions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default ActionInputs;
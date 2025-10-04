
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/AuthContext';

const allTabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "production", label: "Production" },
  { id: "pdi", label: "PDI Inspection" },
  { id: "tasks", label: "Tasks" },
  { id: "reports", label: "Reports" },
  { id: "mom", label: "MOM" },
  { id: "masters", label: "Masters" },
];

const TabPermissions = () => {
  const { token } = useAuth();
  // const [employeeGroups, setEmployeeGroups] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // // Fetch employee groups
  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     const res = await fetch(`${API_BASE_URL}/api/employees`, { headers });
  //     const data = await res.json();
  //     const groups = Array.from(new Set(data.map((emp: any) => emp.employeeGroup)));
  //     setEmployeeGroups(groups);
  //   };
  //   fetchGroups();
  // }, []);

      const employeeGroups = [
    "Admin",
    "Accounts",
    "Human Resource",
    "Production",
    "Quality",
    "Maintenance",
    "Purchase",
  ];

  
  // Fetch existing permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      const res = await fetch(`${API_BASE_URL}/api/permissions`, { headers });
      const data = await res.json();
      setPermissions(data);
    };
    fetchPermissions();
  }, []);

  const togglePermission = (group: string, tabId: string) => {
    setPermissions(prev => {
      const current = prev[group] || [];
      return {
        ...prev,
        [group]: current.includes(tabId)
          ? current.filter(id => id !== tabId)
          : [...current, tabId]
      };
    });
  };

  const toggleAll = (group: string) => {
    setPermissions(prev => ({
      ...prev,
      [group]: prev[group]?.length === allTabs.length ? [] : allTabs.map(t => t.id)
    }));
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/permissions`, {
        method: "POST",
        headers,
        body: JSON.stringify(permissions)
      });
      alert("Permissions saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Tab Permissions</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-5 py-3">Employee Group</th>
              {allTabs.map(tab => <th key={tab.id} className="border px-2 py-1">{tab.label}</th>)}
              <th className="border px-2 py-1">Select All</th>
            </tr>
          </thead>
          <tbody>
            {employeeGroups.map((group,index) => (
              <tr key={group} className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors text-center`}>
                <td className="border px-2 py-1 font-bold">{group}</td>
                {allTabs.map(tab => (
                  <td key={tab.id} className="border px-6 py-3">
                    <Checkbox
                      checked={permissions[group]?.includes(tab.id) || false}
                      onCheckedChange={() => togglePermission(group, tab.id)}
                    />
                  </td>
                ))}
                <td className="border px-2 py-1">
                  <Checkbox
                    checked={permissions[group]?.length === allTabs.length}
                    onCheckedChange={() => toggleAll(group)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-4" onClick={savePermissions} disabled={loading}>
          {loading ? "Saving..." : "Save Permissions"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TabPermissions;

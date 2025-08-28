import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle, Factory } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateTaskFromProduction } from '@/utils/taskAutoGenerator';
import { generateProductionCode } from '@/utils/productionCodeGenerator';

const ProductionTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterShift, setFilterShift] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProductionType, setFilterProductionType] = useState('all');
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [productionData, setProductionData] = useState([]);
  // const [productionData, setProductionData] = useState<any[]>([]);

  type ProductionFormData = {
  productionType: string;
  date: string;
  shift: string;
  machineName: string;
  productName: string;
  plannedQty: string;
  producedQty: string;
  targetOutput: string;
  plannedMins: string;
  rejectionQty: string;
  lumpsQty: string;
  downtime: string;
  rejectionType: string;
  defectType: string;
  issueType: string;
  rejectionReason: string;
  lumpsReason: string;
  operator: string;
  supervisor: string;
  status: string;
  efficiency: string | number;
};

const [formData, setFormData] = useState<ProductionFormData>({
  productionType: '',
  date: '',
  shift: '',
  machineName: '',
  productName: '',
  plannedQty: '',
  producedQty: '',
  targetOutput: '',
  plannedMins: '',
  rejectionQty: '',
  lumpsQty: '',
  downtime: '',
  rejectionType: '',
  defectType: '',
  issueType: '',
  rejectionReason: '',
  lumpsReason: '',
  operator: '',
  supervisor: '',
  status: 'completed',  // ✅ default
  efficiency: ''        // ✅ can be string or number
});

  const issueTypes = [
    { value: 'machine-breakdown', label: 'Machine Breakdown' },
    { value: 'material-shortage', label: 'Material Shortage' },
    { value: 'quality-issue', label: 'Quality Issue' },
    { value: 'changeover', label: 'Changeover' },
    { value: 'maintenance', label: 'Planned Maintenance' },
    { value: 'power-failure', label: 'Power Failure' },
    { value: 'mold-issue', label: 'Mold Issue' },
    { value: 'temperature-issue', label: 'Temperature Issue' },
    { value: 'pressure-issue', label: 'Pressure Issue' },
    { value: 'cycle-time-deviation', label: 'Cycle Time Deviation' },
    { value: 'other', label: 'Other' }
  ];

  const rejectionTypes = [
    'Quality Issue',
    'Machine Issue',
    'Material Issue',
    'Process Issue',
    'Operator Error',
    'Environmental Issue',
    'Other'
  ];

  const defectTypes = [
    'Flash',
    'Short Shot',
    'Sink Mark',
    'Warpage',
    'Color Variation',
    'Dimensional',
    'Surface Defect',
    'Assembly Error',
    'Mechanical',
    'Other'
  ];

  // const [employees, setEmployees] = useState<any[]>([]);
  type Employee = {
  employeeId: string;
  name: string;
  role?: string;
};


  type Machines = {
  machineId: string;
  name: string;
};

const [employees, setEmployees] = useState<Employee[]>([]);
const [machines, setMachines] = useState<Machines[]>([]);

  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://192.168.1.158:5000/api/employees");
        const data = await res.json();
        // console.log("Fetched employees:", data); // 👈 check this
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const getEmployeeName = (id: string) => {
  const emp = employees.find(e => e.employeeId === id);
  return emp ? emp.name : id;
};

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch("http://192.168.1.158:5000/api/machines");
        const data = await res.json();
        // console.log("Fetched employees:", data); // 👈 check this
        setMachines(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchMachines();
  }, []);

  const getMachineName = (id: string) => {
  const mac = machines.find(e => e.machineId === id);
  return mac ? mac.name : id;
};


useEffect(() => {
  const fetchProductionData = async () => {
    try {
      const query = new URLSearchParams({
        search: searchTerm,
        date: filterDate,
        shift: filterShift,
        status: filterStatus,
        productionType: filterProductionType
      }).toString();
      const response = await fetch(`http://192.168.1.158:5000/api/production?${query}`);
      const data = await response.json();

      // console.log('Fetched production data:', data); // check what you actually get
      // setProductionData(Array.isArray(data) ? data : []);

      //  console.log('Fetched production data:', data);

      // ✅ API returns an object with `records`
      setProductionData(Array.isArray(data.records) ? data.records : []);

    } catch (err) {
      console.error('Error fetching production data:', err);
    }
  };
  fetchProductionData();
}, [searchTerm, filterDate, filterShift, filterStatus, filterProductionType]);



  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateNewProductionCode = () => {
    if (formData.machineName && formData.date && formData.shift && formData.productionType) {
      const productionTypeForCode = formData.productionType === 'injection-molding' ? 'injection' : 'assembly';
      return generateProductionCode(
        formData.machineName,
        formData.productName || 'PRODUCT',
        formData.date,
        formData.shift,
        productionTypeForCode
      );
    }
    return '';
  };

  const handleSubmitProduction = async () => {
    const generatedCode = generateNewProductionCode();
    const efficiency = formData.plannedQty && formData.producedQty
      ? Math.round((formData.producedQty / formData.plannedQty) * 100)
      : 0;

    const newRecord = {
      productionCode: generatedCode,
      productionType: formData.productionType,
      date: formData.date,
      shift: formData.shift,
      machineName: formData.machineName,
      product: formData.productName,
      plannedQty: parseInt(formData.plannedQty) || 0,
      actualQty: parseInt(formData.producedQty) || 0,
      rejectedQty: parseInt(formData.rejectionQty) || 0,
      lumpsQty: parseInt(formData.lumpsQty) || 0,
      lumpsReason: formData.lumpsReason,
      rejectionType: formData.rejectionType,
      rejectionReason: formData.rejectionReason,
      issueType: formData.issueType,
      downtime: parseInt(formData.downtime) || 0,
      defectType: formData.defectType,
      targetOutput: parseInt(formData.targetOutput) || 0,
      plannedMins: parseInt(formData.plannedMins) || 0,
      operator: formData.operator,
      supervisor: formData.supervisor || 'Unknown',
      status: formData.status,
      efficiency
    };

    try {
      const response = await fetch('http://192.168.1.158:5000/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (response.ok) {
        if (formData.issueType && formData.issueType !== 'none') {
          const tasks = generateTaskFromProduction(
            generatedCode,
            formData.rejectionReason,
            parseInt(formData.rejectionQty) || 0,
            formData.issueType,
            formData.date
          );
          // console.log('Generated Tasks:', tasks);
        }
        setIsAddingProduction(false);
        setFormData({
          productionType: '',
          date: '',
          shift: '',
          machineName: '',
          productName: '',
          plannedQty: '',
          producedQty: '',
          targetOutput: '',
          plannedMins: '',
          rejectionQty: '',
          lumpsQty: '',
          downtime: '',
          rejectionType: '',
          defectType: '',
          issueType: '',
          rejectionReason: '',
          lumpsReason: '',
          operator: '',
          supervisor: '',
          status: 'completed',
          efficiency: ''
        });
        // Refresh data
        const query = new URLSearchParams({
          search: searchTerm,
          date: filterDate,
          shift: filterShift,
          status: filterStatus,
          productionType: filterProductionType
        }).toString();
        const newData = await fetch(`http://192.168.1.158:5000/api/production?${query}`).then(res => res.json());
        // setProductionData(newData);
        setProductionData(Array.isArray(newData.records) ? newData.records : []);

      } else {
        console.error('Error submitting production record:', await response.text());
      }
    } catch (err) {
      console.error('Error submitting production record:', err);
    }
  };

  // console.log("Form data ", formData);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 95) return 'text-green-600';
    if (efficiency >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductionTypeLabel = (type) => type === 'injection-molding' ? 'Injection Molding' : 'Assembly';

const stats = {
  totalJobs: Array.isArray(productionData) ? productionData.length : 0,
  completed: Array.isArray(productionData) ? productionData.filter(item => item.status === 'completed').length : 0,
  totalPlanned: Array.isArray(productionData) ? productionData.reduce((acc, item) => acc + item.plannedQty, 0) : 0,
  totalActual: Array.isArray(productionData) ? productionData.reduce((acc, item) => acc + item.actualQty, 0) : 0,
  totalRejected: Array.isArray(productionData) ? productionData.reduce((acc, item) => acc + item.rejectedQty, 0) : 0,
  avgEfficiency: Array.isArray(productionData) && productionData.length
    ? Math.round(productionData.reduce((acc, item) => acc + item.efficiency, 0) / productionData.length)
    : 0
};

// const records = Array.isArray(productionData)
//   ? productionData
//   : productionData?.records || [];

const records = productionData;
  // Ensure productionData is an array before mapping
  if (!Array.isArray(records)) {
    console.error("productionData is not an array:", productionData);
    return <div>Error loading production data.</div>;
  }

  // Debugging output
  // console.log("Production Data Records:", records);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Production Tracking
        </h2>
        <Dialog open={isAddingProduction} onOpenChange={setIsAddingProduction}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Production Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Production Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Production Type</Label>
                  <Select
                    value={formData.productionType}
                    onValueChange={(value) =>
                      handleInputChange("productionType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select production type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injection-molding">
                        Injection Molding
                      </SelectItem>
                      <SelectItem value="assembly">Assembly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Production Code (Auto-Generated)</Label>
                  <Input
                    // value={generateNewProductionCode()}
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Produced Shift</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => handleInputChange("shift", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Shift A</SelectItem>
                      <SelectItem value="B">Shift B</SelectItem>
                      <SelectItem value="C">Shift C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Machine Name</Label>
                  <Select
                    value={formData.machineName}
                    onValueChange={(value) =>
                      handleInputChange("machineName", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                    {machines.map((mac) => (
                      <SelectItem key={mac.machineId} value={mac.name}>
                        {mac.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>

                </div>
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="Product name"
                    value={formData.productName}
                    onChange={(e) =>
                      handleInputChange("productName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Planned Quantity</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.plannedQty}
                    onChange={(e) =>
                      handleInputChange("plannedQty", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Produced Quantity</Label>
                  <Input
                    type="number"
                    placeholder="950"
                    value={formData.producedQty}
                    onChange={(e) =>
                      handleInputChange("producedQty", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Output</Label>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={formData.targetOutput}
                    onChange={(e) =>
                      handleInputChange("targetOutput", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Planned Minutes</Label>
                  <Input
                    type="number"
                    placeholder="480"
                    value={formData.plannedMins}
                    onChange={(e) =>
                      handleInputChange("plannedMins", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rejection Quantity</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={formData.rejectionQty}
                    onChange={(e) =>
                      handleInputChange("rejectionQty", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lumps Quantity</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.lumpsQty}
                    onChange={(e) =>
                      handleInputChange("lumpsQty", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Downtime (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.downtime}
                    onChange={(e) =>
                      handleInputChange("downtime", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rejection Type</Label>
                  <Select
                    value={formData.rejectionType}
                    onValueChange={(value) =>
                      handleInputChange("rejectionType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rejection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {rejectionTypes.map((type) => (
                        <SelectItem
                          key={type}
                          value={type.toLowerCase().replace(/\s+/g, "-")}
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Defect Type</Label>
                  <Select
                    value={formData.defectType}
                    onValueChange={(value) =>
                      handleInputChange("defectType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select defect type" />
                    </SelectTrigger>
                    <SelectContent>
                      {defectTypes.map((type) => (
                        <SelectItem
                          key={type}
                          value={type.toLowerCase().replace(/\s+/g, "-")}
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) =>
                    handleInputChange("issueType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Issue</SelectItem>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Describe the reason for rejection"
                  rows={2}
                  value={formData.rejectionReason}
                  onChange={(e) =>
                    handleInputChange("rejectionReason", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Lumps Reason</Label>
                <Textarea
                  placeholder="Describe the reason for lumps (if applicable)"
                  rows={2}
                  value={formData.lumpsReason}
                  onChange={(e) =>
                    handleInputChange("lumpsReason", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Operator</Label>
                {/* <Input 
                  placeholder="Operator name" 
                  value={formData.operator}
                  onChange={(e) => handleInputChange('operator', e.target.value)}
                /> */}
                <Select
                  value={formData.operator}
                  onValueChange={(value) =>
                    handleInputChange("operator", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue color="" placeholder="Select Operator" />
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

              <div className="space-y-2">
                <Label>Supervisor</Label>
                {/* <Input 
                  placeholder="Supervisor name" 
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange('supervisor', e.target.value)}
                /> */}
                <Select
                  value={formData.supervisor}
                  onValueChange={(value) =>
                    handleInputChange("supervisor", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue color="" placeholder="Select Supervisor" />
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingProduction(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitProduction}>
                Save & Generate Tasks
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalJobs}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalRejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Efficiency
                </p>
                <p
                  className={`text-2xl font-bold ${getEfficiencyColor(
                    stats.avgEfficiency
                  )}`}
                >
                  {stats.avgEfficiency}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
              <Select
                value={filterProductionType}
                onValueChange={setFilterProductionType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="injection-molding">
                    Injection Molding
                  </SelectItem>
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

      {/* Production Data */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Production Records ({productionData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
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
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 mb-4">
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
                    {/* <p className="text-sm text-gray-600">{record.date} </p> */}
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
                    <p className="text-sm font-medium text-indigo-800">
                      Planned Minutes
                    </p>
                    <p className="text-lg font-bold text-indigo-900">
                      {record.plannedMins} min
                    </p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-pink-800">
                      Rejection Type
                    </p>
                    <p className="text-sm font-bold text-pink-900">
                      {record.rejectionType}
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-cyan-800">
                      Defect Type
                    </p>
                    <p className="text-sm font-bold text-cyan-900">
                      {record.defectType}
                    </p>
                  </div>
                </div>

                {(record.rejectionReason || record.lumpsReason) && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          Issues Reported
                        </h4>
                        {record.rejectionReason && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-yellow-800">
                              Rejection:
                            </p>
                            <p className="text-yellow-700 text-sm">
                              {record.rejectionReason}
                            </p>
                          </div>
                        )}
                        {record.lumpsReason && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-yellow-800">
                              Lumps:
                            </p>
                            <p className="text-yellow-700 text-sm">
                              {record.lumpsReason}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-yellow-700 border-yellow-300"
                          >
                            {issueTypes.find(
                              (type) => type.value === record.issueType
                            )?.label || "Unknown"}
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
                    {/* Operator: <span className="font-medium">{record.operator}</span> | 
                    Supervisor: <span className="font-medium">{record.supervisor}</span> */}
                    Operator:{" "}
                    <span className="font-medium">
                      {getEmployeeName(record.operator)}
                    </span>{" "}
                    | Supervisor:{" "}
                    <span className="font-medium">
                      {getEmployeeName(record.supervisor)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionTracking;
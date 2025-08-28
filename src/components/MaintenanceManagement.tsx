import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Wrench, Calendar, Clock, User, AlertTriangle, CheckCircle, Settings, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MaintenanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Sample maintenance data (removed raw material and planning entries)
  const maintenanceData = [
    {
      id: 'PM-001',
      type: 'preventive',
      equipment: 'Injection Molding Machine 01',
      description: 'Monthly preventive maintenance - lubrication and inspection',
      scheduledDate: '2024-08-05',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Maintenance Team A',
      estimatedDuration: '4 hours',
      lastMaintenance: '2024-07-05',
      category: 'machine'
    },
    {
      id: 'CM-002',
      type: 'corrective',
      equipment: 'Conveyor Belt System',
      description: 'Belt tension adjustment and motor bearing replacement',
      scheduledDate: '2024-08-03',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'Maintenance Team B',
      estimatedDuration: '6 hours',
      lastMaintenance: '2024-06-15',
      category: 'mechanical'
    },
    {
      id: 'PM-003',
      type: 'preventive',
      equipment: 'Quality Control Station 02',
      description: 'Calibration of measuring instruments and sensors',
      scheduledDate: '2024-08-07',
      status: 'completed',
      priority: 'medium',
      assignedTo: 'Maintenance Team A',
      estimatedDuration: '3 hours',
      lastMaintenance: '2024-07-07',
      category: 'calibration'
    },
    {
      id: 'CM-004',
      type: 'corrective',
      equipment: 'Hydraulic Press 03',
      description: 'Hydraulic pump replacement due to pressure loss',
      scheduledDate: '2024-08-04',
      status: 'pending',
      priority: 'high',
      assignedTo: 'Maintenance Team B',
      estimatedDuration: '8 hours',
      lastMaintenance: '2024-05-20',
      category: 'hydraulic'
    }
  ];

  const filteredData = maintenanceData.filter(item => {
    const matchesSearch = item.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'machine': return <Settings className="h-4 w-4" />;
      case 'mechanical': return <Wrench className="h-4 w-4" />;
      case 'calibration': return <CheckCircle className="h-4 w-4" />;
      case 'hydraulic': return <Settings className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const maintenanceStats = {
    total: maintenanceData.length,
    pending: maintenanceData.filter(item => item.status === 'pending').length,
    inProgress: maintenanceData.filter(item => item.status === 'in-progress').length,
    completed: maintenanceData.filter(item => item.status === 'completed').length,
    overdue: maintenanceData.filter(item => item.status === 'overdue').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Maintenance</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Equipment</Label>
                <Input placeholder="Enter equipment name" />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Enter maintenance description" />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input placeholder="Enter assignee" />
              </div>
              <div className="space-y-2">
                <Label>Estimated Duration</Label>
                <Input placeholder="e.g., 4 hours" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Schedule Maintenance</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{maintenanceStats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{maintenanceStats.inProgress}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{maintenanceStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search maintenance records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Records ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 mt-1">
                      {getCategoryIcon(item.category)}
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.equipment}</h3>
                        <Badge variant="outline" className="text-blue-600">
                          {item.id}
                        </Badge>
                        <Badge variant={item.type === 'preventive' ? 'default' : 'secondary'}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">{item.scheduledDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Assigned:</span>
                    <span className="font-medium">{item.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{item.estimatedDuration}</span>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceManagement;

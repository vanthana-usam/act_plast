
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, Search, Calendar, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DataViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Sample consolidated data - in real app, this would come from your data store
  const allEntries = [
    {
      id: 1,
      module: 'Production',
      type: 'Injection Molding',
      date: '2024-01-15',
      shift: 'A',
      machine: 'M-001',
      product: 'PRODUCT-A',
      targetOutput: 1000,
      actualOutput: 950,
      rejection: 50,
      rejectionType: 'Flash',
      downtime: 30,
      downtimeReason: 'Machine Breakdown',
      operator: 'John Doe',
      supervisor: 'Jane Smith'
    },
    {
      id: 2,
      module: 'Production',
      type: 'Assembly',
      date: '2024-01-15',
      shift: 'B',
      machine: 'A-001',
      product: 'PRODUCT-B',
      targetOutput: 800,
      actualOutput: 780,
      rejection: 20,
      rejectionType: 'Misalignment',
      downtime: 15,
      downtimeReason: 'Material Shortage',
      operator: 'Mike Johnson',
      supervisor: 'Sarah Wilson'
    },
    {
      id: 3,
      module: 'Quality',
      type: 'PDI',
      date: '2024-01-15',
      shift: 'A',
      product: 'PRODUCT-A',
      defectName: 'Flash',
      quantity: 15,
      inspector: 'Alice Johnson',
      status: 'Open',
      severity: 'Medium'
    },
    {
      id: 4,
      module: 'Quality',
      type: 'MOM',
      date: '2024-01-15',
      discussedPoints: 'Quality issues in Machine-001',
      responsibility: 'Production Manager',
      targetDate: '2024-01-20',
      status: 'Open'
    },
    {
      id: 5,
      module: 'Maintenance',
      type: 'Machine',
      date: '2024-01-14',
      machine: 'M-001',
      maintenanceType: 'Corrective',
      issue: 'Hydraulic pressure low',
      technician: 'Bob Wilson',
      status: 'Completed',
      downtime: 120
    }
  ];

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        Object.values(entry).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesModule = filterModule === 'all' || entry.module.toLowerCase() === filterModule.toLowerCase();
      const matchesDate = filterDate === '' || entry.date === filterDate;
      
      return matchesSearch && matchesModule && matchesDate;
    });
  }, [allEntries, searchTerm, filterModule, filterDate]);

  const exportToExcel = () => {
    // Convert data to CSV format for Excel export
    const headers = ['ID', 'Module', 'Type', 'Date', 'Shift', 'Machine', 'Product', 'Target Output', 'Actual Output', 'Rejection', 'Rejection Type', 'Downtime', 'Downtime Reason', 'Operator', 'Supervisor', 'Inspector', 'Status', 'Severity'];
    
    const csvData = filteredEntries.map(entry => [
      entry.id,
      entry.module,
      entry.type,
      entry.date,
      entry.shift || '',
      entry.machine || '',
      entry.product || '',
      entry.targetOutput || '',
      entry.actualOutput || '',
      entry.rejection || '',
      entry.rejectionType || entry.defectName || '',
      entry.downtime || '',
      entry.downtimeReason || '',
      entry.operator || '',
      entry.supervisor || '',
      entry.inspector || entry.technician || '',
      entry.status || '',
      entry.severity || ''
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manufacturing-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Data Viewer</h2>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-blue-600">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            {filteredEntries.length} Records
          </Badge>
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Actions</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterModule('all');
                  setFilterDate('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables by Module */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="all">All Data</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Consolidated Data View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Machine/Product</TableHead>
                      <TableHead>Key Metrics</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Responsible</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.module}</Badge>
                        </TableCell>
                        <TableCell>{entry.type}</TableCell>
                        <TableCell>
                          <div>
                            {entry.machine && <div className="font-medium">{entry.machine}</div>}
                            {entry.product && <div className="text-sm text-gray-600">{entry.product}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.actualOutput && (
                            <div className="text-sm">
                              <div>Output: {entry.actualOutput}/{entry.targetOutput}</div>
                              <div>Rejection: {entry.rejection}</div>
                            </div>
                          )}
                          {entry.quantity && (
                            <div className="text-sm">Defect Qty: {entry.quantity}</div>
                          )}
                          {entry.downtime && (
                            <div className="text-sm">Downtime: {entry.downtime}min</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.rejectionType && <div>Rejection: {entry.rejectionType}</div>}
                            {entry.defectName && <div>Defect: {entry.defectName}</div>}
                            {entry.downtimeReason && <div>Downtime: {entry.downtimeReason}</div>}
                            {entry.issue && <div>Issue: {entry.issue}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.operator && <div>Op: {entry.operator}</div>}
                            {entry.inspector && <div>Insp: {entry.inspector}</div>}
                            {entry.technician && <div>Tech: {entry.technician}</div>}
                            {entry.supervisor && <div>Sup: {entry.supervisor}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {entry.status && (
                              <Badge className={getStatusColor(entry.status)}>
                                {entry.status}
                              </Badge>
                            )}
                            {entry.severity && (
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(entry.severity)}`}></div>
                                <span className="text-sm">{entry.severity}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Production Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Rejection</TableHead>
                      <TableHead>Downtime</TableHead>
                      <TableHead>Operator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries
                      .filter(entry => entry.module === 'Production')
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Shift {entry.shift}</Badge>
                          </TableCell>
                          <TableCell>{entry.machine}</TableCell>
                          <TableCell>{entry.product}</TableCell>
                          <TableCell>{entry.targetOutput}</TableCell>
                          <TableCell className="font-medium">{entry.actualOutput}</TableCell>
                          <TableCell className="text-red-600">{entry.rejection}</TableCell>
                          <TableCell className="text-orange-600">{entry.downtime}min</TableCell>
                          <TableCell>{entry.operator}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quality Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries
                      .filter(entry => entry.module === 'Quality')
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.type}</Badge>
                          </TableCell>
                          <TableCell>{entry.product}</TableCell>
                          <TableCell>{entry.defectName || entry.discussedPoints}</TableCell>
                          <TableCell>{entry.quantity}</TableCell>
                          <TableCell>{entry.inspector || entry.responsibility}</TableCell>
                          <TableCell>
                            {entry.severity && (
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(entry.severity)}`}></div>
                                <span>{entry.severity}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Maintenance Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Downtime</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries
                      .filter(entry => entry.module === 'Maintenance')
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.machine}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.maintenanceType}</Badge>
                          </TableCell>
                          <TableCell>{entry.issue}</TableCell>
                          <TableCell>{entry.technician}</TableCell>
                          <TableCell className="text-orange-600">{entry.downtime}min</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataViewer;

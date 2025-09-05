
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, AlertTriangle, XCircle, Search, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const QualityControl = () => {
  const [isAddingPDI, setIsAddingPDI] = useState(false);
  const [isAddingMOM, setIsAddingMOM] = useState(false);

  // Sample production codes for selection
  const availableProductionCodes = [
    'IM01150124AA',
    'IM02150124BA',
    'AS01150124AA',
    'IM01160124AB',
    'IM02160124BB'
  ];


  const pdiData = [
    {
      id: 1,
      productionCode: 'IM01150124AA',
      product: 'PRODUCT-A',
      date: '2024-01-15',
      shift: 'A',
      defectName: 'Flash',
      quantity: 15,
      inspector: 'Alice Johnson',
      status: 'Open',
      severity: 'Medium',
      correctiveAction: '',
      preventiveAction: ''
    },
    {
      id: 2,
      productionCode: 'IM02150124BA',
      product: 'PRODUCT-B',
      date: '2024-01-15',
      shift: 'B',
      defectName: 'Short Shot',
      quantity: 8,
      inspector: 'Bob Wilson',
      status: 'Closed',
      severity: 'High',
      correctiveAction: 'Adjusted injection pressure and temperature',
      preventiveAction: 'Daily machine calibration check'
    }
  ];

  const momReportData = [
    {
      id: 1,
      productionCode: 'IM01150124AA',
      date: '2024-01-15',
      discussedPoints: 'Quality issues in Machine-001, High rejection rate in Product-A',
      responsibility: 'Production Manager',
      targetDate: '2024-01-20',
      correctiveAction: 'Implement additional quality checks',
      preventiveAction: 'Operator training and machine calibration',
      actionClosedDate: null,
      status: 'Open'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quality Control</h2>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            5 Open Issues
          </Badge>
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            12 Resolved
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pdi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="pdi" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            PDI (Pre-Delivery Inspection)
          </TabsTrigger>
          <TabsTrigger value="mom" className="flex items-center gap-2">
            MOM Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdi">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Pre-Delivery Inspection (PDI)
                </CardTitle>
                <Dialog open={isAddingPDI} onOpenChange={setIsAddingPDI}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add PDI Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add PDI Entry</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="productionCode">Production Code</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select production code to link" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProductionCodes.map(code => (
                              <SelectItem key={code} value={code}>
                                <div className="flex items-center space-x-2">
                                  <Link className="h-4 w-4" />
                                  <span>{code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-600">Select the production code to link this quality issue</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defectName">Defect Name</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select defect" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flash">Flash</SelectItem>
                            <SelectItem value="shortshot">Short Shot</SelectItem>
                            <SelectItem value="sinkmarks">Sink Marks</SelectItem>
                            <SelectItem value="warpage">Warpage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="Enter quantity" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inspector">Inspector Name</Label>
                        <Input id="inspector" placeholder="Enter inspector name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="correctiveAction">Corrective Action</Label>
                        <Textarea 
                          id="correctiveAction" 
                          placeholder="Describe the immediate corrective action taken"
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="preventiveAction">Preventive Action</Label>
                        <Textarea 
                          id="preventiveAction" 
                          placeholder="Describe the preventive action to avoid recurrence"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingPDI(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingPDI(false)}>
                        Save PDI Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pdiData.map((pdi) => (
                  <div key={pdi.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-900">{pdi.productionCode}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{pdi.product}</h3>
                        <Badge variant="outline">{pdi.defectName}</Badge>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(pdi.severity)}`}></div>
                          <span className="text-sm font-medium">{pdi.severity}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(pdi.status)}>
                        {pdi.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Date & Shift</p>
                        <p className="text-lg font-bold text-blue-900">{pdi.date}</p>
                        <p className="text-sm text-blue-600">Shift {pdi.shift}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Defect Quantity</p>
                        <p className="text-2xl font-bold text-red-900">{pdi.quantity}</p>
                        <p className="text-sm text-red-600">Units affected</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Inspector</p>
                        <p className="text-lg font-bold text-green-900">{pdi.inspector}</p>
                        <p className="text-sm text-green-600">Quality inspector</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-orange-800">Action Required</p>
                        <Button size="sm" className="mt-2 w-full">
                          {pdi.status === 'Open' ? 'Update Actions' : 'View Details'}
                        </Button>
                      </div>
                    </div>

                    {(pdi.correctiveAction || pdi.preventiveAction) && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {pdi.correctiveAction && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Corrective Action</h4>
                            <p className="text-yellow-700 text-sm">{pdi.correctiveAction}</p>
                          </div>
                        )}
                        {pdi.preventiveAction && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Preventive Action</h4>
                            <p className="text-green-700 text-sm">{pdi.preventiveAction}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mom">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>MOM (Minutes of Meeting) Report</CardTitle>
                <Dialog open={isAddingMOM} onOpenChange={setIsAddingMOM}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add MOM Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add MOM Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="productionCodeMOM">Related Production Code (Optional)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select production code if related" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProductionCodes.map(code => (
                              <SelectItem key={code} value={code}>
                                <div className="flex items-center space-x-2">
                                  <Link className="h-4 w-4" />
                                  <span>{code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meetingDate">Meeting Date</Label>
                        <Input id="meetingDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discussedPoints">Discussed Points</Label>
                        <Textarea 
                          id="discussedPoints" 
                          placeholder="Enter the main points discussed in the meeting"
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsibility">Responsibility</Label>
                        <Input id="responsibility" placeholder="Enter responsible person/department" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetDate">Target Date</Label>
                        <Input id="targetDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="correctiveActionMOM">Corrective Action</Label>
                        <Textarea 
                          id="correctiveActionMOM" 
                          placeholder="Describe the immediate corrective action to be taken"
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preventiveActionMOM">Preventive Action</Label>
                        <Textarea 
                          id="preventiveActionMOM" 
                          placeholder="Describe the preventive action to avoid recurrence"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingMOM(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingMOM(false)}>
                        Save MOM Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {momReportData.map((mom) => (
                  <div key={mom.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        {mom.productionCode && (
                          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                            <Link className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900">{mom.productionCode}</span>
                          </div>
                        )}
                        <h3 className="font-semibold text-lg">Meeting - {mom.date}</h3>
                      </div>
                      <Badge className={getStatusColor(mom.status)}>
                        {mom.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Discussed Points</h4>
                        <p className="text-blue-700">{mom.discussedPoints}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Responsibility</h4>
                          <p className="text-green-700">{mom.responsibility}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-2">Target Date</h4>
                          <p className="text-orange-700">{mom.targetDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">Corrective Action</h4>
                          <p className="text-yellow-700">{mom.correctiveAction}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">Preventive Action</h4>
                          <p className="text-purple-700">{mom.preventiveAction}</p>
                        </div>
                      </div>
                      
                      {mom.actionClosedDate && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Action Closed Date</h4>
                          <p className="text-green-700">{mom.actionClosedDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityControl;

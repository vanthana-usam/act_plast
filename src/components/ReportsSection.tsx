
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Filter, Calendar, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportsSection = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('7days');

  const [rejection, setRejection] = useState<any[]>([]);

  
useEffect(() => {
  const fetchRejection = async () => {
    try {
      const res = await fetch("http://192.168.1.158:5000/api/production");
      const data = await res.json();
      if (!res.ok) {
        throw new Error("Failed to fetch rejection data");
      }

      setRejection(Array.isArray(data.records) ? data.records : []);
      console.log("Rejection data set:", rejection);
    } catch (err) {
      console.error("Error fetching rejection data:", err);
    }
  };

  fetchRejection();
}, []);

  // Sample data for OEE Report
  const oeeData = [
    { machine: 'M-001', oee: 87.5, availability: 92, performance: 95, quality: 98 },
    { machine: 'M-002', oee: 82.3, availability: 88, performance: 92, quality: 96 },
    { machine: 'M-003', oee: 91.2, availability: 95, performance: 96, quality: 98 },
    { machine: 'M-004', oee: 78.9, availability: 85, performance: 90, quality: 95 }
  ];

  // Sample data for Downtime Analysis
  const downtimeData = [
    { category: 'Process', hours: 45, percentage: 35 },
    { category: 'Machine', hours: 32, percentage: 25 },
    { category: 'Mold', hours: 28, percentage: 22 },
    { category: 'Material/Packing', hours: 15, percentage: 12 },
    { category: 'Planning', hours: 8, percentage: 6 }
  ];

  // Sample data for Rejection Analysis
  const rejectionData = [
    { defect: 'Flash', quantity: 245, percentage: 30 },
    { defect: 'Short Shot', quantity: 180, percentage: 22 },
    { defect: 'Sink Marks', quantity: 165, percentage: 20 },
    { defect: 'Warpage', quantity: 130, percentage: 16 },
    { defect: 'Burn Marks', quantity: 98, percentage: 12 }
  ];

  // Sample data for Trend Analysis
  const trendData = [
    { month: 'Jan', rejection: 2.5, oee: 85, downtime: 12 },
    { month: 'Feb', rejection: 2.8, oee: 82, downtime: 15 },
    { month: 'Mar', rejection: 2.2, oee: 87, downtime: 10 },
    { month: 'Apr', rejection: 2.1, oee: 89, downtime: 9 },
    { month: 'May', rejection: 1.9, oee: 91, downtime: 8 },
    { month: 'Jun', rejection: 2.0, oee: 88, downtime: 11 }
  ];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="oee" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="oee" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            OEE
          </TabsTrigger>
          <TabsTrigger value="downtime" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Downtime
          </TabsTrigger>
          <TabsTrigger value="rejection" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Rejection
          </TabsTrigger>
          <TabsTrigger value="mom" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            MOM Report
          </TabsTrigger>
          <TabsTrigger value="pm" className="flex items-center gap-2">
            PM Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oee">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Equipment Effectiveness (OEE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-800">Average OEE</p>
                    <p className="text-3xl font-bold text-blue-900">84.9%</p>
                    <p className="text-sm text-blue-600">vs 85% target</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-800">Best Performer</p>
                    <p className="text-2xl font-bold text-green-900">M-003</p>
                    <p className="text-sm text-green-600">91.2% OEE</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-red-800">Needs Attention</p>
                    <p className="text-2xl font-bold text-red-900">M-004</p>
                    <p className="text-sm text-red-600">78.9% OEE</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-orange-800">Improvement</p>
                    <p className="text-2xl font-bold text-orange-900">+2.1%</p>
                    <p className="text-sm text-orange-600">vs last month</p>
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={oeeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="machine" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="availability" fill="#3B82F6" name="Availability %" />
                      <Bar dataKey="performance" fill="#10B981" name="Performance %" />
                      <Bar dataKey="quality" fill="#F59E0B" name="Quality %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>OEE Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="oee" stroke="#3B82F6" strokeWidth={3} name="OEE %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="downtime">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Downtime Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Downtime by Category</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={downtimeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="hours"
                          >
                            {downtimeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Downtime Hours</h3>
                    <div className="space-y-3">
                      {downtimeData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                            <span className="font-medium">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{item.hours}h</span>
                            <span className="text-sm text-gray-600 ml-2">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rejection">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Rejection Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-red-800">Injection Molding</p>
                    <p className="text-3xl font-bold text-red-900">2.1%</p>
                    <p className="text-sm text-red-600">Rejection Rate</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-orange-800">Assembly</p>
                    <p className="text-3xl font-bold text-orange-900">0.8%</p>
                    <p className="text-sm text-orange-600">Rejection Rate</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-yellow-800">PDI</p>
                    <p className="text-3xl font-bold text-yellow-900">0.3%</p>
                    <p className="text-sm text-yellow-600">Rejection Rate</p>
                  </div>


                  {rejection.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm font-medium text-gray-800">{item.defect}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                        <p className="text-sm text-gray-600">{item.percentage}% of total</p>                  
                    </div>
                  ))}


                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Defect Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rejectionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="defect" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="quantity" fill="#EF4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rejection Trend</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="rejection" stroke="#EF4444" strokeWidth={3} name="Rejection %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mom">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                MOM (Minutes of Meeting) Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-800">Total Actions</p>
                  <p className="text-3xl font-bold text-blue-900">24</p>
                  <p className="text-sm text-blue-600">This month</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-800">Completed</p>
                  <p className="text-3xl font-bold text-green-900">18</p>
                  <p className="text-sm text-green-600">75% completion</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-red-800">Overdue</p>
                  <p className="text-3xl font-bold text-red-900">3</p>
                  <p className="text-sm text-red-600">Need attention</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Preventive Action Status Report</h3>
                    <Badge className="bg-green-100 text-green-800">75% Complete</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Actions taken to prevent quality issues and downtime recurrence</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Machine PM Plan vs Actual</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">85% Adherence</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Comparison of planned vs actual preventive maintenance activities</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Mold PM Plan vs Actual</h3>
                    <Badge className="bg-blue-100 text-blue-800">92% Adherence</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Mold maintenance schedule compliance tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pm">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>PM (Preventive Maintenance) Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Machine Maintenance Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Completed This Month</span>
                      <Badge className="bg-green-500">12</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>Scheduled This Week</span>
                      <Badge className="bg-yellow-500">5</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Overdue</span>
                      <Badge className="bg-red-500">2</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mold Maintenance Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Completed This Month</span>
                      <Badge className="bg-green-500">8</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>Scheduled This Week</span>
                      <Badge className="bg-yellow-500">3</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Overdue</span>
                      <Badge className="bg-red-500">1</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Lumps Report</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Date-wise Lumps</h4>
                    <p className="text-sm text-gray-600">Daily tracking of material waste and lumps generation</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Reason-wise Analysis</h4>
                    <p className="text-sm text-gray-600">Root cause analysis of material waste and corrective actions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsSection;

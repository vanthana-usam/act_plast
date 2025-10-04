import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Download, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/AuthContext';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useTaskContext } from '@/TaskContext';

const ReportsSection = () => {
  const { user, token } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const [productionRecords, setProductionRecords] = useState([]);
  const [oeeData, setOeeData] = useState([]);
  const [downtimeData, setDowntimeData] = useState([]);
  const [rejectionData, setRejectionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [momRecords, setMomRecords] = useState([]);
  const { refreshTaskCount } = useTaskContext();

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  const API_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/production`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data && data.data && data.data.records) {
          setProductionRecords(data.data.records);
        }
      } catch (error) {
        console.error('Error fetching production data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMOM = async () => {
      try {
        const response = await fetch(`${API_URL}/api/mom`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setMomRecords(data);
        
      } catch (error) {
        console.error('Error fetching MOM data:', error);
      }
    };
    fetchMOM();
  }, []);

  useEffect(() => {
    if (!productionRecords.length) return;

    // OEE Data
    const oee = productionRecords.map((rec) => {
      const availableMins = rec.plannedMins - rec.downtime;
      const machinePerf = availableMins / rec.plannedMins;
      const producedQty = rec.actualQty + rec.rejectedQty;
      const productionPerf = producedQty / rec.plannedQty;
      const okQty = rec.actualQty - rec.rejectedQty;
      const qualityPerf = okQty / producedQty;
      const oeeValue = machinePerf * productionPerf * qualityPerf;

      return {
        machine: rec.machineName,
        oee: parseFloat((oeeValue * 100).toFixed(1)),
        availability: parseFloat((machinePerf * 100).toFixed(1)),
        performance: parseFloat((productionPerf * 100).toFixed(1)),
        quality: parseFloat((qualityPerf * 100).toFixed(1)),
      };
    });
    setOeeData(oee);

    // Downtime Analysis
    const downtimeMap = {};
    productionRecords.forEach((rec) => {
      const type = rec.downtimeType || 'Other';
      downtimeMap[type] = (downtimeMap[type] || 0) + rec.downtime;
    });
    const totalDowntime = Object.values(downtimeMap).reduce((sum, val) => sum + val, 0);
    const downtime = Object.entries(downtimeMap).map(([type, hours]) => ({
      category: type,
      hours,
      percentage: totalDowntime ? parseFloat(((hours / totalDowntime) * 100).toFixed(1)) : 0,
    }));
    setDowntimeData(downtime);

    // Rejection Analysis
    const rejectionMap = {};
    productionRecords.forEach((rec) => {
      const defect = rec.defectType || 'Other';
      rejectionMap[defect] = (rejectionMap[defect] || 0) + rec.rejectedQty;
    });
    const totalRejected = Object.values(rejectionMap).reduce((sum, val) => sum + val, 0);
    const rejection = Object.entries(rejectionMap).map(([defect, quantity]) => ({
      defect,
      quantity,
      percentage: totalRejected ? parseFloat(((quantity / totalRejected) * 100).toFixed(1)) : 0,
    }));
    setRejectionData(rejection);

    // Trend Analysis
    const trendMap = {};
    productionRecords.forEach((rec) => {
      const month = new Date(rec.date).toLocaleString('default', { month: 'short' });
      if (!trendMap[month]) {
        trendMap[month] = { rejection: 0, oee: 0, downtime: 0, count: 0 };
      }
      const availableMins = rec.plannedMins - rec.downtime;
      const machinePerf = rec.plannedMins ? availableMins / rec.plannedMins : 0;
      const productionPerf = rec.targetOutput ? rec.actualQty / rec.targetOutput : 0;
      const okQty = rec.actualQty - rec.rejectedQty;
      const qualityPerf = rec.actualQty ? okQty / rec.actualQty : 0;
      const oeeValue = machinePerf * productionPerf * qualityPerf * 100;

      trendMap[month].rejection += rec.rejectedQty;
      trendMap[month].oee += oeeValue;
      trendMap[month].downtime += rec.downtime;
      trendMap[month].count += 1;
    });
    const trend = Object.entries(trendMap).map(([month, val]) => ({
      month,
      rejection: parseFloat((val.rejection / val.count).toFixed(1)),
      oee: parseFloat((val.oee / val.count).toFixed(1)),
      downtime: parseFloat((val.downtime / val.count).toFixed(1)),
    }));
    setTrendData(trend);
  }, [productionRecords]);

  // Export Functions for Individual Tabs (CSV)
  const exportToCSV = (data, filename, headers) => {
    const csvRows = [headers.join(',')];
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header.toLowerCase()] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

  const exportOEEData = () => {
    const headers = ['Machine', 'OEE', 'Availability', 'Performance', 'Quality'];
    exportToCSV(oeeData, 'oee_report.csv', headers);
  };

  const exportDowntimeData = () => {
    const headers = ['Category', 'Hours', 'Percentage'];
    exportToCSV(downtimeData, 'downtime_report.csv', headers);
  };

  const exportRejectionData = () => {
    const headers = ['Defect', 'Quantity', 'Percentage'];
    exportToCSV(rejectionData, 'rejection_report.csv', headers);
  };

  const exportTrendData = () => {
    const headers = ['Month', 'Rejection', 'OEE', 'Downtime'];
    exportToCSV(trendData, 'trend_report.csv', headers);
  };

  const exportMOMData = () => {
    const headers = ['ID', 'Title', 'Status', 'Date'];
    exportToCSV(momRecords, 'mom_report.csv', headers);
  };

  const exportPMData = () => {
    const headers = ['MachineName', 'Status', 'Downtime', 'Date'];
    exportToCSV(productionRecords, 'pm_report.csv', headers);
  };

  // Consolidated Export (Excel with Multiple Sheets)
  const exportConsolidatedData = () => {
    const wb = XLSX.utils.book_new();

    // OEE Sheet
    const oeeSheetData = oeeData.map(item => ({
      Machine: item.machine,
      OEE: `${item.oee}%`,
      Availability: `${item.availability}%`,
      Performance: `${item.performance}%`,
      Quality: `${item.quality}%`,
    }));
    const oeeWs = XLSX.utils.json_to_sheet(oeeSheetData);
    XLSX.utils.book_append_sheet(wb, oeeWs, 'OEE');

    // Downtime Sheet
    const downtimeSheetData = downtimeData.map(item => ({
      Category: item.category,
      Hours: `${item.hours}h`,
      Percentage: `${item.percentage}%`,
    }));
    const downtimeWs = XLSX.utils.json_to_sheet(downtimeSheetData);
    XLSX.utils.book_append_sheet(wb, downtimeWs, 'Downtime');

    // Rejection Sheet
    const rejectionSheetData = rejectionData.map(item => ({
      Defect: item.defect,
      Quantity: item.quantity,
      Percentage: `${item.percentage}%`,
    }));
    const rejectionWs = XLSX.utils.json_to_sheet(rejectionSheetData);
    XLSX.utils.book_append_sheet(wb, rejectionWs, 'Rejection');

    // Trend Sheet
    const trendSheetData = trendData.map(item => ({
      Month: item.month,
      Rejection: item.rejection,
      OEE: `${item.oee}%`,
      Downtime: `${item.downtime}h`,
    }));
    const trendWs = XLSX.utils.json_to_sheet(trendSheetData);
    XLSX.utils.book_append_sheet(wb, trendWs, 'Trend');

    // MOM Sheet
    const momSheetData = momRecords.map(item => ({
      ID: item.id,
      Title: item.title || '',
      Status: item.status,
      Date: item.date || '',
    }));
    const momWs = XLSX.utils.json_to_sheet(momSheetData);
    XLSX.utils.book_append_sheet(wb, momWs, 'MOM');

    // PM Sheet
    const pmSheetData = productionRecords.map(item => ({
      MachineName: item.machineName,
      Status: item.status,
      Downtime: `${item.downtime}h`,
      Date: item.date,
    }));
    const pmWs = XLSX.utils.json_to_sheet(pmSheetData);
    XLSX.utils.book_append_sheet(wb, pmWs, 'PM');

    // Write and download the Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'consolidated_report.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportConsolidatedData}>
            <Download className="h-4 w-4 mr-2" />
            Export All 
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

        {/* OEE Tab */}
        <TabsContent value="oee">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall Equipment Effectiveness (OEE)
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={exportOEEData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export OEE 
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-800">Average OEE</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {oeeData.length ? parseFloat((oeeData.reduce((sum, rec) => sum + rec.oee, 0) / oeeData.length).toFixed(1)) + '%' : 'N/A'}
                    </p>
                    <p className="text-sm text-blue-600">vs 85% target</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-800">Best Performer</p>
                    <p className="text-2xl font-bold text-green-900">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).machine : 'N/A'}</p>
                    <p className="text-sm text-green-600">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).oee + '%' : ''}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-red-800">Needs Attention</p>
                    <p className="text-2xl font-bold text-red-900">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).machine : 'N/A'}</p>
                    <p className="text-sm text-red-600">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).oee + '%' : ''}</p>
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
                <div className="flex justify-between items-center">
                  <CardTitle>OEE Trend Analysis</CardTitle>
                  <Button variant="outline" size="sm" onClick={exportTrendData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Trend
                  </Button>
                </div>
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

        {/* Downtime Tab */}
        <TabsContent value="downtime">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Downtime Analysis
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={exportDowntimeData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Downtime 
                  </Button>
                </div>
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
                            <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
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

        {/* Rejection Tab */}
        <TabsContent value="rejection">
          <div className="grid gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Rejection Analysis
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={exportRejectionData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Rejection 
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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

        {/* MOM Tab */}
        <TabsContent value="mom">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  MOM (Minutes of Meeting) Reports
                </CardTitle>
                <Button variant="outline" size="sm" onClick={exportMOMData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export MOM 
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-800">Total Actions</p>
                  <p className="text-3xl font-bold text-blue-900">{momRecords.length}</p>
                  <p className="text-sm text-blue-600">This month</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-800">Completed</p>
                  <p className="text-3xl font-bold text-green-900">{momRecords.filter(rec => rec.status === 'completed').length}</p>
                  <p className="text-sm text-green-600">Completion Rate</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-red-800">Pending</p>
                  <p className="text-3xl font-bold text-red-900">{momRecords.filter(rec => rec.status !== 'completed').length}</p>
                  <p className="text-sm text-red-600">Need Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PM Tab */}
        <TabsContent value="pm">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>PM (Preventive Maintenance) Status Report</CardTitle>
                <Button variant="outline" size="sm" onClick={exportPMData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PM 
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Machine Maintenance Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Completed This Month</span>
                      <Badge className="bg-green-500">{productionRecords.filter(rec => rec.status === 'completed').length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>Pending Maintenance</span>
                      <Badge className="bg-yellow-500">{productionRecords.filter(rec => rec.status !== 'completed').length}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Actions Required</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Overdue Checks</span>
                      <Badge className="bg-red-500">{productionRecords.filter(rec => rec.downtime > 50).length}</Badge>
                    </div>
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

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import { TrendingUp, Download, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
// import { useAuth } from '@/AuthContext';
// import { saveAs } from 'file-saver';

// const ReportsSection = () => {
//   const { user, token } = useAuth();
//   const [selectedDateRange, setSelectedDateRange] = useState('7days');
//   const [productionRecords, setProductionRecords] = useState([]);
//   const [oeeData, setOeeData] = useState([]);
//   const [downtimeData, setDowntimeData] = useState([]);
//   const [rejectionData, setRejectionData] = useState([]);
//   const [trendData, setTrendData] = useState([]);
//   const [momRecords, setMomRecords] = useState([]);

//   const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
//   const API_URL = import.meta.env.VITE_API_BASE_URL;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/production`, {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         if (data && data.data && data.data.records) {
//           setProductionRecords(data.data.records);
//         }
//       } catch (error) {
//         console.error('Error fetching production data:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const fetchMOM = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/mom`, {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         setMomRecords(data);
//       } catch (error) {
//         console.error('Error fetching MOM data:', error);
//       }
//     };
//     fetchMOM();
//   }, []);

//   useEffect(() => {
//     if (!productionRecords.length) return;

//     // OEE Data
//     const oee = productionRecords.map((rec) => {
//       const availableMins = rec.plannedMins - rec.downtime;
//       const machinePerf = availableMins / rec.plannedMins;
//       const producedQty = rec.actualQty + rec.rejectedQty;
//       const productionPerf = producedQty / rec.plannedQty;
//       const okQty = rec.actualQty - rec.rejectedQty;
//       const qualityPerf = okQty / producedQty;
//       const oeeValue = machinePerf * productionPerf * qualityPerf;

//       return {
//         machine: rec.machineName,
//         oee: parseFloat((oeeValue * 100).toFixed(1)),
//         availability: parseFloat((machinePerf * 100).toFixed(1)),
//         performance: parseFloat((productionPerf * 100).toFixed(1)),
//         quality: parseFloat((qualityPerf * 100).toFixed(1)),
//       };
//     });
//     setOeeData(oee);

//     // Downtime Analysis
//     const downtimeMap = {};
//     productionRecords.forEach((rec) => {
//       const type = rec.downtimeType || 'Other';
//       downtimeMap[type] = (downtimeMap[type] || 0) + rec.downtime;
//     });
//     const totalDowntime = Object.values(downtimeMap).reduce((sum, val) => sum + val, 0);
//     const downtime = Object.entries(downtimeMap).map(([type, hours]) => ({
//       category: type,
//       hours,
//       percentage: totalDowntime ? parseFloat(((hours / totalDowntime) * 100).toFixed(1)) : 0,
//     }));
//     setDowntimeData(downtime);

//     // Rejection Analysis
//     const rejectionMap = {};
//     productionRecords.forEach((rec) => {
//       const defect = rec.defectType || 'Other';
//       rejectionMap[defect] = (rejectionMap[defect] || 0) + rec.rejectedQty;
//     });
//     const totalRejected = Object.values(rejectionMap).reduce((sum, val) => sum + val, 0);
//     const rejection = Object.entries(rejectionMap).map(([defect, quantity]) => ({
//       defect,
//       quantity,
//       percentage: totalRejected ? parseFloat(((quantity / totalRejected) * 100).toFixed(1)) : 0,
//     }));
//     setRejectionData(rejection);

//     // Trend Analysis
//     const trendMap = {};
//     productionRecords.forEach((rec) => {
//       const month = new Date(rec.date).toLocaleString('default', { month: 'short' });
//       if (!trendMap[month]) {
//         trendMap[month] = { rejection: 0, oee: 0, downtime: 0, count: 0 };
//       }
//       const availableMins = rec.plannedMins - rec.downtime;
//       const machinePerf = rec.plannedMins ? availableMins / rec.plannedMins : 0;
//       const productionPerf = rec.targetOutput ? rec.actualQty / rec.targetOutput : 0;
//       const okQty = rec.actualQty - rec.rejectedQty;
//       const qualityPerf = rec.actualQty ? okQty / rec.actualQty : 0;
//       const oeeValue = machinePerf * productionPerf * qualityPerf * 100;

//       trendMap[month].rejection += rec.rejectedQty;
//       trendMap[month].oee += oeeValue;
//       trendMap[month].downtime += rec.downtime;
//       trendMap[month].count += 1;
//     });
//     const trend = Object.entries(trendMap).map(([month, val]) => ({
//       month,
//       rejection: parseFloat((val.rejection / val.count).toFixed(1)),
//       oee: parseFloat((val.oee / val.count).toFixed(1)),
//       downtime: parseFloat((val.downtime / val.count).toFixed(1)),
//     }));
//     setTrendData(trend);
//   }, [productionRecords]);

//   // Export Functions
//   const exportToCSV = (data, filename, headers) => {
//     const csvRows = [headers.join(',')];
//     data.forEach(item => {
//       const values = headers.map(header => {
//         const value = item[header.toLowerCase()] || '';
//         return `"${value.toString().replace(/"/g, '""')}"`;
//       });
//       csvRows.push(values.join(','));
//     });
//     const csvContent = csvRows.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, filename);
//   };

//   const exportOEEData = () => {
//     const headers = ['Machine', 'OEE', 'Availability', 'Performance', 'Quality'];
//     exportToCSV(oeeData, 'oee_report.csv', headers);
//   };

//   const exportDowntimeData = () => {
//     const headers = ['Category', 'Hours', 'Percentage'];
//     exportToCSV(downtimeData, 'downtime_report.csv', headers);
//   };

//   const exportRejectionData = () => {
//     const headers = ['Defect', 'Quantity', 'Percentage'];
//     exportToCSV(rejectionData, 'rejection_report.csv', headers);
//   };

//   const exportTrendData = () => {
//     const headers = ['Month', 'Rejection', 'OEE', 'Downtime'];
//     exportToCSV(trendData, 'trend_report.csv', headers);
//   };

//   const exportMOMData = () => {
//     const headers = ['ID', 'Title', 'Status', 'Date'];
//     exportToCSV(momRecords, 'mom_report.csv', headers);
//   };

//   const exportPMData = () => {
//     const headers = ['MachineName', 'Status', 'Downtime', 'Date'];
//     exportToCSV(productionRecords, 'pm_report.csv', headers);
//   };

//   const exportConsolidatedData = () => {
//     const csvRows = [];

//     // OEE Data
//     csvRows.push('OEE Report');
//     csvRows.push('Machine,OEE,Availability,Performance,Quality');
//     oeeData.forEach(item => {
//       csvRows.push(`"${item.machine}","${item.oee}%","${item.availability}%","${item.performance}%","${item.quality}%"`);
//     });
//     csvRows.push('');

//     // Downtime Data
//     csvRows.push('Downtime Report');
//     csvRows.push('Category,Hours,Percentage');
//     downtimeData.forEach(item => {
//       csvRows.push(`"${item.category}","${item.hours}h","${item.percentage}%"`);
//     });
//     csvRows.push('');

//     // Rejection Data
//     csvRows.push('Rejection Report');
//     csvRows.push('Defect,Quantity,Percentage');
//     rejectionData.forEach(item => {
//       csvRows.push(`"${item.defect}",${item.quantity},"${item.percentage}%"`);
//     });
//     csvRows.push('');

//     // Trend Data
//     csvRows.push('Trend Report');
//     csvRows.push('Month,Rejection,OEE,Downtime');
//     trendData.forEach(item => {
//       csvRows.push(`"${item.month}",${item.rejection},"${item.oee}%","${item.downtime}h"`);
//     });
//     csvRows.push('');

//     // MOM Data
//     csvRows.push('MOM Report');
//     csvRows.push('ID,Title,Status,Date');
//     momRecords.forEach(item => {
//       csvRows.push(`"${item.id}","${item.title || ''}","${item.status}","${item.date || ''}"`);
//     });
//     csvRows.push('');

//     // PM Data
//     csvRows.push('PM Report');
//     csvRows.push('MachineName,Status,Downtime,Date');
//     productionRecords.forEach(item => {
//       csvRows.push(`"${item.machineName}","${item.status}","${item.downtime}h","${item.date}"`);
//     });

//     const csvContent = csvRows.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, 'consolidated_report.csv');
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
//         <div className="flex items-center space-x-4">
//           <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Select date range" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="7days">Last 7 Days</SelectItem>
//               <SelectItem value="30days">Last 30 Days</SelectItem>
//               <SelectItem value="90days">Last 90 Days</SelectItem>
//               <SelectItem value="custom">Custom Range</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" onClick={exportConsolidatedData}>
//             <Download className="h-4 w-4 mr-2" />
//             Export All
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="oee" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
//           <TabsTrigger value="oee" className="flex items-center gap-2">
//             <TrendingUp className="h-4 w-4" />
//             OEE
//           </TabsTrigger>
//           <TabsTrigger value="downtime" className="flex items-center gap-2">
//             <BarChart3 className="h-4 w-4" />
//             Downtime
//           </TabsTrigger>
//           <TabsTrigger value="rejection" className="flex items-center gap-2">
//             <PieChartIcon className="h-4 w-4" />
//             Rejection
//           </TabsTrigger>
//           <TabsTrigger value="mom" className="flex items-center gap-2">
//             <FileText className="h-4 w-4" />
//             MOM Report
//           </TabsTrigger>
//           <TabsTrigger value="pm" className="flex items-center gap-2">
//             PM Status
//           </TabsTrigger>
//         </TabsList>

//         {/* OEE Tab */}
//         <TabsContent value="oee">
//           <div className="grid gap-6">
//             <Card className="border-0 shadow-md">
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <CardTitle className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5" />
//                     Overall Equipment Effectiveness (OEE)
//                   </CardTitle>
//                   <Button variant="outline" size="sm" onClick={exportOEEData}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Export OEE
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-4 gap-4 mb-6">
//                   <div className="bg-blue-50 p-4 rounded-lg text-center">
//                     <p className="text-sm font-medium text-blue-800">Average OEE</p>
//                     <p className="text-3xl font-bold text-blue-900">
//                       {oeeData.length ? parseFloat((oeeData.reduce((sum, rec) => sum + rec.oee, 0) / oeeData.length).toFixed(1)) + '%' : 'N/A'}
//                     </p>
//                     <p className="text-sm text-blue-600">vs 85% target</p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg text-center">
//                     <p className="text-sm font-medium text-green-800">Best Performer</p>
//                     <p className="text-2xl font-bold text-green-900">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).machine : 'N/A'}</p>
//                     <p className="text-sm text-green-600">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).oee + '%' : ''}</p>
//                   </div>
//                   <div className="bg-red-50 p-4 rounded-lg text-center">
//                     <p className="text-sm font-medium text-red-800">Needs Attention</p>
//                     <p className="text-2xl font-bold text-red-900">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).machine : 'N/A'}</p>
//                     <p className="text-sm text-red-600">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).oee + '%' : ''}</p>
//                   </div>
//                   <div className="bg-orange-50 p-4 rounded-lg text-center">
//                     <p className="text-sm font-medium text-orange-800">Improvement</p>
//                     <p className="text-2xl font-bold text-orange-900">+2.1%</p>
//                     <p className="text-sm text-orange-600">vs last month</p>
//                   </div>
//                 </div>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={oeeData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="machine" />
//                       <YAxis />
//                       <Tooltip />
//                       <Bar dataKey="availability" fill="#3B82F6" name="Availability %" />
//                       <Bar dataKey="performance" fill="#10B981" name="Performance %" />
//                       <Bar dataKey="quality" fill="#F59E0B" name="Quality %" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-md">
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <CardTitle>OEE Trend Analysis</CardTitle>
//                   <Button variant="outline" size="sm" onClick={exportTrendData}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Export Trend
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={trendData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip />
//                       <Line type="monotone" dataKey="oee" stroke="#3B82F6" strokeWidth={3} name="OEE %" />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Downtime Tab */}
//         <TabsContent value="downtime">
//           <div className="grid gap-6">
//             <Card className="border-0 shadow-md">
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <CardTitle className="flex items-center gap-2">
//                     <BarChart3 className="h-5 w-5" />
//                     Downtime Analysis
//                   </CardTitle>
//                   <Button variant="outline" size="sm" onClick={exportDowntimeData}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Export Downtime
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4">Downtime by Category</h3>
//                     <div className="h-80">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={downtimeData}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percentage }) => `${name} ${percentage}%`}
//                             outerRadius={80}
//                             fill="#8884d8"
//                             dataKey="hours"
//                           >
//                             {downtimeData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4">Downtime Hours</h3>
//                     <div className="space-y-3">
//                       {downtimeData.map((item, index) => (
//                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                           <div className="flex items-center space-x-3">
//                             <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
//                             <span className="font-medium">{item.category}</span>
//                           </div>
//                           <div className="text-right">
//                             <span className="font-bold">{item.hours}h</span>
//                             <span className="text-sm text-gray-600 ml-2">({item.percentage}%)</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Rejection Tab */}
//         <TabsContent value="rejection">
//           <div className="grid gap-6">
//             <Card className="border-0 shadow-md">
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <CardTitle className="flex items-center gap-2">
//                     <PieChartIcon className="h-5 w-5" />
//                     Rejection Analysis
//                   </CardTitle>
//                   <Button variant="outline" size="sm" onClick={exportRejectionData}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Export Rejection
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4">Defect Distribution</h3>
//                     <div className="h-64">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={rejectionData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="defect" />
//                           <YAxis />
//                           <Tooltip />
//                           <Bar dataKey="quantity" fill="#EF4444" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4">Rejection Trend</h3>
//                     <div className="h-64">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <LineChart data={trendData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="month" />
//                           <YAxis />
//                           <Tooltip />
//                           <Line type="monotone" dataKey="rejection" stroke="#EF4444" strokeWidth={3} name="Rejection %" />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* MOM Tab */}
//         <TabsContent value="mom">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   MOM (Minutes of Meeting) Reports
//                 </CardTitle>
//                 <Button variant="outline" size="sm" onClick={exportMOMData}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Export MOM
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div className="bg-blue-50 p-4 rounded-lg text-center">
//                   <p className="text-sm font-medium text-blue-800">Total Actions</p>
//                   <p className="text-3xl font-bold text-blue-900">{momRecords.length}</p>
//                   <p className="text-sm text-blue-600">This month</p>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg text-center">
//                   <p className="text-sm font-medium text-green-800">Completed</p>
//                   <p className="text-3xl font-bold text-green-900">{momRecords.filter(rec => rec.status === 'completed').length}</p>
//                   <p className="text-sm text-green-600">Completion Rate</p>
//                 </div>
//                 <div className="bg-red-50 p-4 rounded-lg text-center">
//                   <p className="text-sm font-medium text-red-800">Pending</p>
//                   <p className="text-3xl font-bold text-red-900">{momRecords.filter(rec => rec.status !== 'completed').length}</p>
//                   <p className="text-sm text-red-600">Need Attention</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* PM Tab */}
//         <TabsContent value="pm">
//           <Card className="border-0 shadow-md">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>PM (Preventive Maintenance) Status Report</CardTitle>
//                 <Button variant="outline" size="sm" onClick={exportPMData}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Export PM
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Machine Maintenance Status</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//                       <span>Completed This Month</span>
//                       <Badge className="bg-green-500">{productionRecords.filter(rec => rec.status === 'completed').length}</Badge>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
//                       <span>Pending Maintenance</span>
//                       <Badge className="bg-yellow-500">{productionRecords.filter(rec => rec.status !== 'completed').length}</Badge>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Actions Required</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
//                       <span>Overdue Checks</span>
//                       <Badge className="bg-red-500">{productionRecords.filter(rec => rec.downtime > 50).length}</Badge>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ReportsSection;

// // import React, { useState, useEffect } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import { Badge } from '@/components/ui/badge';
// // import { TrendingUp, Download, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
// // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
// // import { useAuth } from '@/AuthContext';

// // const ReportsSection = () => {
// //   const { user, token } = useAuth();

// //   // console.log('Auth Context User:', user, token);
  

// //   const [selectedDateRange, setSelectedDateRange] = useState('7days');
// //   const [productionRecords, setProductionRecords] = useState([]);

// //   const [oeeData, setOeeData] = useState([]);
// //   const [downtimeData, setDowntimeData] = useState([]);
// //   const [rejectionData, setRejectionData] = useState([]);
// //   const [trendData, setTrendData] = useState([]);
// //   const [momRecords, setMomRecords] = useState([]);

// //   const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

// //   const API_URL = import.meta.env.VITE_API_BASE_URL;

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const response = await fetch(`${API_URL}/api/production`, {
// //           headers: {
// //             'Content-Type': 'application/json',
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });
// //         const data = await response.json();
// //         if (data && data.data && data.data.records) {
// //           setProductionRecords(data.data.records);
// //         }
// //         console.log('Fetched Production Data:', data);
// //       } catch (error) {
// //         console.error('Error fetching production data:', error);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   useEffect(() => {
// //   const fetchMOM = async () => {
// //     try {
// //       const response = await fetch(`${API_URL}/api/mom`, {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });
// //       const data = await response.json();
// //       setMomRecords(data);
// //       console.log('Fetched MOM Data:', data);
// //     } catch (error) {
// //       console.error('Error fetching MOM data:', error);
// //     }
// //   };

// //   fetchMOM();
// // }, []);


// //   useEffect(() => {
// //     if (!productionRecords.length) return;

// //     // OEE Data
// //     const oee = productionRecords.map((rec) => {
// //       const availableMins = rec.plannedMins - rec.downtime;
// //       const machinePerf =  availableMins / rec.plannedMins ;

// //       // Use produced qty (actual + rejected)
// //       const producedQty = rec.actualQty + rec.rejectedQty;
// //       const productionPerf = producedQty / rec.plannedQty;

// //       // OK qty = actual only
// //       const okQty = rec.actualQty - rec.rejectedQty;
// //       const qualityPerf = okQty / producedQty;

// //       const oeeValue = machinePerf * productionPerf * qualityPerf;

// //       return {
// //         machine: rec.machineName,
// //         oee: parseFloat((oeeValue * 100).toFixed(1)),
// //         availability: parseFloat((machinePerf * 100).toFixed(1)),
// //         performance: parseFloat((productionPerf * 100).toFixed(1)),
// //         quality: parseFloat((qualityPerf * 100).toFixed(1)),
// //       };
// //     });

// //     setOeeData(oee);


// //     // Downtime Analysis
// //     const downtimeMap = {};
// //     productionRecords.forEach((rec) => {
// //       const type = rec.downtimeType || 'Other';
// //       downtimeMap[type] = (downtimeMap[type] || 0) + rec.downtime;
// //     });
// //     const totalDowntime = Object.values(downtimeMap).reduce((sum, val) => sum + val, 0);
// //     const downtime = Object.entries(downtimeMap).map(([type, hours]) => ({
// //       category: type,
// //       hours,
// //       percentage: totalDowntime ? parseFloat(((hours / totalDowntime) * 100).toFixed(1)) : 0,
// //     }));
// //     setDowntimeData(downtime);

// //     // Rejection Analysis
// //     const rejectionMap = {};
// //     productionRecords.forEach((rec) => {
// //       const defect = rec.defectType || 'Other';
// //       rejectionMap[defect] = (rejectionMap[defect] || 0) + rec.rejectedQty;
// //     });
// //     const totalRejected = Object.values(rejectionMap).reduce((sum, val) => sum + val, 0);
// //     const rejection = Object.entries(rejectionMap).map(([defect, quantity]) => ({
// //       defect,
// //       quantity,
// //       percentage: totalRejected ? parseFloat(((quantity / totalRejected) * 100).toFixed(1)) : 0,
// //     }));
// //     setRejectionData(rejection);

// //     // Trend Analysis
// //     const trendMap = {};
// //     productionRecords.forEach((rec) => {
// //       const month = new Date(rec.date).toLocaleString('default', { month: 'short' });
// //       if (!trendMap[month]) {
// //         trendMap[month] = { rejection: 0, oee: 0, downtime: 0, count: 0 };
// //       }
// //       const availableMins = rec.plannedMins - rec.downtime;
// //       const machinePerf = rec.plannedMins ? availableMins / rec.plannedMins : 0;
// //       const productionPerf = rec.targetOutput ? rec.actualQty / rec.targetOutput : 0;
// //       const okQty = rec.actualQty - rec.rejectedQty;
// //       const qualityPerf = rec.actualQty ? okQty / rec.actualQty : 0;
// //       const oeeValue = machinePerf * productionPerf * qualityPerf * 100;

// //       trendMap[month].rejection += rec.rejectedQty;
// //       trendMap[month].oee += oeeValue;
// //       trendMap[month].downtime += rec.downtime;
// //       trendMap[month].count += 1;
// //     });
// //     const trend = Object.entries(trendMap).map(([month, val]) => ({
// //       month,
// //       rejection: parseFloat((val.rejection / val.count).toFixed(1)),
// //       oee: parseFloat((val.oee / val.count).toFixed(1)),
// //       downtime: parseFloat((val.downtime / val.count).toFixed(1)),
// //     }));
// //     setTrendData(trend);
// //   }, [productionRecords]);

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
// //         <div className="flex items-center space-x-4">
// //           <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
// //             <SelectTrigger className="w-32">
// //               <SelectValue placeholder="Select date range" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="7days">Last 7 Days</SelectItem>
// //               <SelectItem value="30days">Last 30 Days</SelectItem>
// //               <SelectItem value="90days">Last 90 Days</SelectItem>
// //               <SelectItem value="custom">Custom Range</SelectItem>
// //             </SelectContent>
// //           </Select>
// //           <Button variant="outline">
// //             <Download className="h-4 w-4 mr-2" />
// //             Export
// //           </Button>
// //         </div>
// //       </div>

// //       <Tabs defaultValue="oee" className="space-y-6">
// //         <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
// //           <TabsTrigger value="oee" className="flex items-center gap-2">
// //             <TrendingUp className="h-4 w-4" />
// //             OEE
// //           </TabsTrigger>
// //           <TabsTrigger value="downtime" className="flex items-center gap-2">
// //             <BarChart3 className="h-4 w-4" />
// //             Downtime
// //           </TabsTrigger>
// //           <TabsTrigger value="rejection" className="flex items-center gap-2">
// //             <PieChartIcon className="h-4 w-4" />
// //             Rejection
// //           </TabsTrigger>
// //           <TabsTrigger value="mom" className="flex items-center gap-2">
// //             <FileText className="h-4 w-4" />
// //             MOM Report
// //           </TabsTrigger>
// //           <TabsTrigger value="pm" className="flex items-center gap-2">
// //             PM Status
// //           </TabsTrigger>
// //         </TabsList>

// //         {/* OEE Tab */}
// //         <TabsContent value="oee">
// //           <div className="grid gap-6">
// //             <Card className="border-0 shadow-md">
// //               <CardHeader>
// //                 <CardTitle className="flex items-center gap-2">
// //                   <TrendingUp className="h-5 w-5" />
// //                   Overall Equipment Effectiveness (OEE)
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <div className="grid grid-cols-4 gap-4 mb-6">
// //                   <div className="bg-blue-50 p-4 rounded-lg text-center">
// //                     <p className="text-sm font-medium text-blue-800">Average OEE</p>
// //                     <p className="text-3xl font-bold text-blue-900">
// //                       {oeeData.length ? parseFloat((oeeData.reduce((sum, rec) => sum + rec.oee, 0) / oeeData.length).toFixed(1)) + '%' : 'N/A'}
// //                     </p>
// //                     <p className="text-sm text-blue-600">vs 85% target</p>
// //                   </div>
// //                   <div className="bg-green-50 p-4 rounded-lg text-center">
// //                     <p className="text-sm font-medium text-green-800">Best Performer</p>
// //                     <p className="text-2xl font-bold text-green-900">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).machine : 'N/A'}</p>
// //                     <p className="text-sm text-green-600">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).oee + '%' : ''}</p>
// //                   </div>
// //                   <div className="bg-red-50 p-4 rounded-lg text-center">
// //                     <p className="text-sm font-medium text-red-800">Needs Attention</p>
// //                     <p className="text-2xl font-bold text-red-900">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).machine : 'N/A'}</p>
// //                     <p className="text-sm text-red-600">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).oee + '%' : ''}</p>
// //                   </div>
// //                   <div className="bg-orange-50 p-4 rounded-lg text-center">
// //                     <p className="text-sm font-medium text-orange-800">Improvement</p>
// //                     <p className="text-2xl font-bold text-orange-900">+2.1%</p>
// //                     <p className="text-sm text-orange-600">vs last month</p>
// //                   </div>
// //                 </div>
// //                 <div className="h-80">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <BarChart data={oeeData}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="machine" />
// //                       <YAxis />
// //                       <Tooltip />
// //                       <Bar dataKey="availability" fill="#3B82F6" name="Availability %" />
// //                       <Bar dataKey="performance" fill="#10B981" name="Performance %" />
// //                       <Bar dataKey="quality" fill="#F59E0B" name="Quality %" />
// //                     </BarChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </CardContent>
// //             </Card>

// //             <Card className="border-0 shadow-md">
// //               <CardHeader>
// //                 <CardTitle>OEE Trend Analysis</CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <div className="h-80">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <LineChart data={trendData}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="month" />
// //                       <YAxis />
// //                       <Tooltip />
// //                       <Line type="monotone" dataKey="oee" stroke="#3B82F6" strokeWidth={3} name="OEE %" />
// //                     </LineChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </TabsContent>

// //         {/* Downtime Tab */}
// //         <TabsContent value="downtime">
// //           <div className="grid gap-6">
// //             <Card className="border-0 shadow-md">
// //               <CardHeader>
// //                 <CardTitle className="flex items-center gap-2">
// //                   <BarChart3 className="h-5 w-5" />
// //                   Downtime Analysis
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <div className="grid grid-cols-2 gap-6">
// //                   <div>
// //                     <h3 className="text-lg font-semibold mb-4">Downtime by Category</h3>
// //                     <div className="h-80">
// //                       <ResponsiveContainer width="100%" height="100%">
// //                         <PieChart>
// //                           <Pie
// //                             data={downtimeData}
// //                             cx="50%"
// //                             cy="50%"
// //                             labelLine={false}
// //                             label={({ name, percentage }) => `${name} ${percentage}%`}
// //                             outerRadius={80}
// //                             fill="#8884d8"
// //                             dataKey="hours"
// //                           >
// //                             {downtimeData.map((entry, index) => (
// //                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //                             ))}
// //                           </Pie>
// //                           <Tooltip />
// //                         </PieChart>
// //                       </ResponsiveContainer>
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <h3 className="text-lg font-semibold mb-4">Downtime Hours</h3>
// //                     <div className="space-y-3">
// //                       {downtimeData.map((item, index) => (
// //                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
// //                           <div className="flex items-center space-x-3">
// //                             <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
// //                             <span className="font-medium">{item.category}</span>
// //                           </div>
// //                           <div className="text-right">
// //                             <span className="font-bold">{item.hours}h</span>
// //                             <span className="text-sm text-gray-600 ml-2">({item.percentage}%)</span>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </TabsContent>

// //         {/* Rejection Tab */}
// //         <TabsContent value="rejection">
// //           <div className="grid gap-6">
// //             <Card className="border-0 shadow-md">
// //               <CardHeader>
// //                 <CardTitle className="flex items-center gap-2">
// //                   <PieChartIcon className="h-5 w-5" />
// //                   Rejection Analysis
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <div className="grid grid-cols-2 gap-6">
// //                   <div>
// //                     <h3 className="text-lg font-semibold mb-4">Defect Distribution</h3>
// //                     <div className="h-64">
// //                       <ResponsiveContainer width="100%" height="100%">
// //                         <BarChart data={rejectionData}>
// //                           <CartesianGrid strokeDasharray="3 3" />
// //                           <XAxis dataKey="defect" />
// //                           <YAxis />
// //                           <Tooltip />
// //                           <Bar dataKey="quantity" fill="#EF4444" />
// //                         </BarChart>
// //                       </ResponsiveContainer>
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <h3 className="text-lg font-semibold mb-4">Rejection Trend</h3>
// //                     <div className="h-64">
// //                       <ResponsiveContainer width="100%" height="100%">
// //                         <LineChart data={trendData}>
// //                           <CartesianGrid strokeDasharray="3 3" />
// //                           <XAxis dataKey="month" />
// //                           <YAxis />
// //                           <Tooltip />
// //                           <Line type="monotone" dataKey="rejection" stroke="#EF4444" strokeWidth={3} name="Rejection %" />
// //                         </LineChart>
// //                       </ResponsiveContainer>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </TabsContent>

// //         {/* MOM Tab */}
      
// //         {/* MOM Tab */}
// //         <TabsContent value="mom">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <CardTitle className="flex items-center gap-2">
// //                 <FileText className="h-5 w-5" />
// //                 MOM (Minutes of Meeting) Reports
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid grid-cols-3 gap-4 mb-6">
// //                 <div className="bg-blue-50 p-4 rounded-lg text-center">
// //                   <p className="text-sm font-medium text-blue-800">Total Actions</p>
// //                   <p className="text-3xl font-bold text-blue-900">{momRecords.length}</p>
// //                   <p className="text-sm text-blue-600">This month</p>
// //                 </div>
// //                 <div className="bg-green-50 p-4 rounded-lg text-center">
// //                   <p className="text-sm font-medium text-green-800">Completed</p>
// //                   <p className="text-3xl font-bold text-green-900">{momRecords.filter(rec => rec.status === 'completed').length}</p>
// //                   <p className="text-sm text-green-600">Completion Rate</p>
// //                 </div>
// //                 <div className="bg-red-50 p-4 rounded-lg text-center">
// //                   <p className="text-sm font-medium text-red-800">Pending</p>
// //                   <p className="text-3xl font-bold text-red-900">{momRecords.filter(rec => rec.status !== 'completed').length}</p>
// //                   <p className="text-sm text-red-600">Need Attention</p>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>


// //         {/* PM Tab */}
// //         <TabsContent value="pm">
// //           <Card className="border-0 shadow-md">
// //             <CardHeader>
// //               <CardTitle>PM (Preventive Maintenance) Status Report</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid grid-cols-2 gap-6">
// //                 <div>
// //                   <h3 className="text-lg font-semibold mb-4">Machine Maintenance Status</h3>
// //                   <div className="space-y-3">
// //                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
// //                       <span>Completed This Month</span>
// //                       <Badge className="bg-green-500">{productionRecords.filter(rec => rec.status === 'completed').length}</Badge>
// //                     </div>
// //                     <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
// //                       <span>Pending Maintenance</span>
// //                       <Badge className="bg-yellow-500">{productionRecords.filter(rec => rec.status !== 'completed').length}</Badge>
// //                     </div>
// //                   </div>
// //                 </div>
// //                 <div>
// //                   <h3 className="text-lg font-semibold mb-4">Actions Required</h3>
// //                   <div className="space-y-3">
// //                     <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
// //                       <span>Overdue Checks</span>
// //                       <Badge className="bg-red-500">{productionRecords.filter(rec => rec.downtime > 50).length}</Badge>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // };

// // export default ReportsSection;


// // // import React, { useState, useEffect } from 'react';
// // // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // // import { Button } from '@/components/ui/button';
// // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // // import { Badge } from '@/components/ui/badge';
// // // import { TrendingUp, Download, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
// // // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
// // // import { useAuth } from '@/AuthContext';

// // // const ReportsSection = () => {
// // //   const { user, token } = useAuth();

// // //   // console.log('Auth Context User:', user, token);
  

// // //   const [selectedDateRange, setSelectedDateRange] = useState('7days');
// // //   const [productionRecords, setProductionRecords] = useState([]);

// // //   const [oeeData, setOeeData] = useState([]);
// // //   const [downtimeData, setDowntimeData] = useState([]);
// // //   const [rejectionData, setRejectionData] = useState([]);
// // //   const [trendData, setTrendData] = useState([]);

// // //   const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

// // //   const API_URL = import.meta.env.VITE_API_BASE_URL;

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         const response = await fetch(`${API_URL}/api/production`, {
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             Authorization: `Bearer ${token}`,
// // //           },
// // //         });
// // //         const data = await response.json();
// // //         if (data && data.data && data.data.records) {
// // //           setProductionRecords(data.data.records);
// // //         }
// // //         console.log('Fetched Production Data:', data);
// // //       } catch (error) {
// // //         console.error('Error fetching production data:', error);
// // //       }
// // //     };
// // //     fetchData();
// // //   }, []);

// // //   useEffect(() => {
// // //     if (!productionRecords.length) return;

// // //     // OEE Data
// // //     // const oee = productionRecords.map((rec) => {
// // //     //   const availableMins = rec.plannedMins - rec.downtime;
// // //     //   const machinePerf = rec.plannedMins ? availableMins / rec.plannedMins : 0;
// // //     //   const productionPerf = rec.targetOutput ? rec.actualQty / rec.targetOutput : 0;
// // //     //   const okQty = rec.actualQty - rec.rejectedQty;
// // //     //   const qualityPerf = rec.actualQty ? okQty / rec.actualQty : 0;
// // //     //   const oeeValue = machinePerf * productionPerf * qualityPerf;
// // //     //   return {
// // //     //     machine: rec.machineName,
// // //     //     oee: parseFloat((oeeValue * 100).toFixed(1)),
// // //     //     availability: parseFloat((machinePerf * 100).toFixed(1)),
// // //     //     performance: parseFloat((productionPerf * 100).toFixed(1)),
// // //     //     quality: parseFloat((qualityPerf * 100).toFixed(1)),
// // //     //   };
// // //     // });
// // //     // setOeeData(oee);

// // //     // OEE Data
// // //     const oee = productionRecords.map((rec) => {
// // //       const availableMins = rec.plannedMins - rec.downtime;
// // //       const machinePerf =  availableMins / rec.plannedMins ;

// // //       // Use produced qty (actual + rejected)
// // //       const producedQty = rec.actualQty + rec.rejectedQty;
// // //       const productionPerf = producedQty / rec.plannedQty;

// // //       // OK qty = actual only
// // //       const okQty = rec.actualQty - rec.rejectedQty;
// // //       const qualityPerf = okQty / producedQty;

// // //       const oeeValue = machinePerf * productionPerf * qualityPerf;

// // //       return {
// // //         machine: rec.machineName,
// // //         oee: parseFloat((oeeValue * 100).toFixed(1)),
// // //         availability: parseFloat((machinePerf * 100).toFixed(1)),
// // //         performance: parseFloat((productionPerf * 100).toFixed(1)),
// // //         quality: parseFloat((qualityPerf * 100).toFixed(1)),
// // //       };
// // //     });

// // //     setOeeData(oee);


// // //     // Downtime Analysis
// // //     const downtimeMap = {};
// // //     productionRecords.forEach((rec) => {
// // //       const type = rec.downtimeType || 'Other';
// // //       downtimeMap[type] = (downtimeMap[type] || 0) + rec.downtime;
// // //     });
// // //     const totalDowntime = Object.values(downtimeMap).reduce((sum, val) => sum + val, 0);
// // //     const downtime = Object.entries(downtimeMap).map(([type, hours]) => ({
// // //       category: type,
// // //       hours,
// // //       percentage: totalDowntime ? parseFloat(((hours / totalDowntime) * 100).toFixed(1)) : 0,
// // //     }));
// // //     setDowntimeData(downtime);

// // //     // Rejection Analysis
// // //     const rejectionMap = {};
// // //     productionRecords.forEach((rec) => {
// // //       const defect = rec.defectType || 'Other';
// // //       rejectionMap[defect] = (rejectionMap[defect] || 0) + rec.rejectedQty;
// // //     });
// // //     const totalRejected = Object.values(rejectionMap).reduce((sum, val) => sum + val, 0);
// // //     const rejection = Object.entries(rejectionMap).map(([defect, quantity]) => ({
// // //       defect,
// // //       quantity,
// // //       percentage: totalRejected ? parseFloat(((quantity / totalRejected) * 100).toFixed(1)) : 0,
// // //     }));
// // //     setRejectionData(rejection);

// // //     // Trend Analysis
// // //     const trendMap = {};
// // //     productionRecords.forEach((rec) => {
// // //       const month = new Date(rec.date).toLocaleString('default', { month: 'short' });
// // //       if (!trendMap[month]) {
// // //         trendMap[month] = { rejection: 0, oee: 0, downtime: 0, count: 0 };
// // //       }
// // //       const availableMins = rec.plannedMins - rec.downtime;
// // //       const machinePerf = rec.plannedMins ? availableMins / rec.plannedMins : 0;
// // //       const productionPerf = rec.targetOutput ? rec.actualQty / rec.targetOutput : 0;
// // //       const okQty = rec.actualQty - rec.rejectedQty;
// // //       const qualityPerf = rec.actualQty ? okQty / rec.actualQty : 0;
// // //       const oeeValue = machinePerf * productionPerf * qualityPerf * 100;

// // //       trendMap[month].rejection += rec.rejectedQty;
// // //       trendMap[month].oee += oeeValue;
// // //       trendMap[month].downtime += rec.downtime;
// // //       trendMap[month].count += 1;
// // //     });
// // //     const trend = Object.entries(trendMap).map(([month, val]) => ({
// // //       month,
// // //       rejection: parseFloat((val.rejection / val.count).toFixed(1)),
// // //       oee: parseFloat((val.oee / val.count).toFixed(1)),
// // //       downtime: parseFloat((val.downtime / val.count).toFixed(1)),
// // //     }));
// // //     setTrendData(trend);
// // //   }, [productionRecords]);

// // //   return (
// // //     <div className="space-y-6">
// // //       <div className="flex justify-between items-center">
// // //         <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
// // //         <div className="flex items-center space-x-4">
// // //           <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
// // //             <SelectTrigger className="w-32">
// // //               <SelectValue placeholder="Select date range" />
// // //             </SelectTrigger>
// // //             <SelectContent>
// // //               <SelectItem value="7days">Last 7 Days</SelectItem>
// // //               <SelectItem value="30days">Last 30 Days</SelectItem>
// // //               <SelectItem value="90days">Last 90 Days</SelectItem>
// // //               <SelectItem value="custom">Custom Range</SelectItem>
// // //             </SelectContent>
// // //           </Select>
// // //           <Button variant="outline">
// // //             <Download className="h-4 w-4 mr-2" />
// // //             Export
// // //           </Button>
// // //         </div>
// // //       </div>

// // //       <Tabs defaultValue="oee" className="space-y-6">
// // //         <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
// // //           <TabsTrigger value="oee" className="flex items-center gap-2">
// // //             <TrendingUp className="h-4 w-4" />
// // //             OEE
// // //           </TabsTrigger>
// // //           <TabsTrigger value="downtime" className="flex items-center gap-2">
// // //             <BarChart3 className="h-4 w-4" />
// // //             Downtime
// // //           </TabsTrigger>
// // //           <TabsTrigger value="rejection" className="flex items-center gap-2">
// // //             <PieChartIcon className="h-4 w-4" />
// // //             Rejection
// // //           </TabsTrigger>
// // //           <TabsTrigger value="mom" className="flex items-center gap-2">
// // //             <FileText className="h-4 w-4" />
// // //             MOM Report
// // //           </TabsTrigger>
// // //           <TabsTrigger value="pm" className="flex items-center gap-2">
// // //             PM Status
// // //           </TabsTrigger>
// // //         </TabsList>

// // //         {/* OEE Tab */}
// // //         <TabsContent value="oee">
// // //           <div className="grid gap-6">
// // //             <Card className="border-0 shadow-md">
// // //               <CardHeader>
// // //                 <CardTitle className="flex items-center gap-2">
// // //                   <TrendingUp className="h-5 w-5" />
// // //                   Overall Equipment Effectiveness (OEE)
// // //                 </CardTitle>
// // //               </CardHeader>
// // //               <CardContent>
// // //                 <div className="grid grid-cols-4 gap-4 mb-6">
// // //                   <div className="bg-blue-50 p-4 rounded-lg text-center">
// // //                     <p className="text-sm font-medium text-blue-800">Average OEE</p>
// // //                     <p className="text-3xl font-bold text-blue-900">
// // //                       {oeeData.length ? parseFloat((oeeData.reduce((sum, rec) => sum + rec.oee, 0) / oeeData.length).toFixed(1)) + '%' : 'N/A'}
// // //                     </p>
// // //                     <p className="text-sm text-blue-600">vs 85% target</p>
// // //                   </div>
// // //                   <div className="bg-green-50 p-4 rounded-lg text-center">
// // //                     <p className="text-sm font-medium text-green-800">Best Performer</p>
// // //                     <p className="text-2xl font-bold text-green-900">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).machine : 'N/A'}</p>
// // //                     <p className="text-sm text-green-600">{oeeData.length ? oeeData.reduce((max, rec) => rec.oee > max.oee ? rec : max, oeeData[0]).oee + '%' : ''}</p>
// // //                   </div>
// // //                   <div className="bg-red-50 p-4 rounded-lg text-center">
// // //                     <p className="text-sm font-medium text-red-800">Needs Attention</p>
// // //                     <p className="text-2xl font-bold text-red-900">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).machine : 'N/A'}</p>
// // //                     <p className="text-sm text-red-600">{oeeData.length ? oeeData.reduce((min, rec) => rec.oee < min.oee ? rec : min, oeeData[0]).oee + '%' : ''}</p>
// // //                   </div>
// // //                   <div className="bg-orange-50 p-4 rounded-lg text-center">
// // //                     <p className="text-sm font-medium text-orange-800">Improvement</p>
// // //                     <p className="text-2xl font-bold text-orange-900">+2.1%</p>
// // //                     <p className="text-sm text-orange-600">vs last month</p>
// // //                   </div>
// // //                 </div>
// // //                 <div className="h-80">
// // //                   <ResponsiveContainer width="100%" height="100%">
// // //                     <BarChart data={oeeData}>
// // //                       <CartesianGrid strokeDasharray="3 3" />
// // //                       <XAxis dataKey="machine" />
// // //                       <YAxis />
// // //                       <Tooltip />
// // //                       <Bar dataKey="availability" fill="#3B82F6" name="Availability %" />
// // //                       <Bar dataKey="performance" fill="#10B981" name="Performance %" />
// // //                       <Bar dataKey="quality" fill="#F59E0B" name="Quality %" />
// // //                     </BarChart>
// // //                   </ResponsiveContainer>
// // //                 </div>
// // //               </CardContent>
// // //             </Card>

// // //             <Card className="border-0 shadow-md">
// // //               <CardHeader>
// // //                 <CardTitle>OEE Trend Analysis</CardTitle>
// // //               </CardHeader>
// // //               <CardContent>
// // //                 <div className="h-80">
// // //                   <ResponsiveContainer width="100%" height="100%">
// // //                     <LineChart data={trendData}>
// // //                       <CartesianGrid strokeDasharray="3 3" />
// // //                       <XAxis dataKey="month" />
// // //                       <YAxis />
// // //                       <Tooltip />
// // //                       <Line type="monotone" dataKey="oee" stroke="#3B82F6" strokeWidth={3} name="OEE %" />
// // //                     </LineChart>
// // //                   </ResponsiveContainer>
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //           </div>
// // //         </TabsContent>

// // //         {/* Downtime Tab */}
// // //         <TabsContent value="downtime">
// // //           <div className="grid gap-6">
// // //             <Card className="border-0 shadow-md">
// // //               <CardHeader>
// // //                 <CardTitle className="flex items-center gap-2">
// // //                   <BarChart3 className="h-5 w-5" />
// // //                   Downtime Analysis
// // //                 </CardTitle>
// // //               </CardHeader>
// // //               <CardContent>
// // //                 <div className="grid grid-cols-2 gap-6">
// // //                   <div>
// // //                     <h3 className="text-lg font-semibold mb-4">Downtime by Category</h3>
// // //                     <div className="h-80">
// // //                       <ResponsiveContainer width="100%" height="100%">
// // //                         <PieChart>
// // //                           <Pie
// // //                             data={downtimeData}
// // //                             cx="50%"
// // //                             cy="50%"
// // //                             labelLine={false}
// // //                             label={({ name, percentage }) => `${name} ${percentage}%`}
// // //                             outerRadius={80}
// // //                             fill="#8884d8"
// // //                             dataKey="hours"
// // //                           >
// // //                             {downtimeData.map((entry, index) => (
// // //                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// // //                             ))}
// // //                           </Pie>
// // //                           <Tooltip />
// // //                         </PieChart>
// // //                       </ResponsiveContainer>
// // //                     </div>
// // //                   </div>
// // //                   <div>
// // //                     <h3 className="text-lg font-semibold mb-4">Downtime Hours</h3>
// // //                     <div className="space-y-3">
// // //                       {downtimeData.map((item, index) => (
// // //                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
// // //                           <div className="flex items-center space-x-3">
// // //                             <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
// // //                             <span className="font-medium">{item.category}</span>
// // //                           </div>
// // //                           <div className="text-right">
// // //                             <span className="font-bold">{item.hours}h</span>
// // //                             <span className="text-sm text-gray-600 ml-2">({item.percentage}%)</span>
// // //                           </div>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //           </div>
// // //         </TabsContent>

// // //         {/* Rejection Tab */}
// // //         <TabsContent value="rejection">
// // //           <div className="grid gap-6">
// // //             <Card className="border-0 shadow-md">
// // //               <CardHeader>
// // //                 <CardTitle className="flex items-center gap-2">
// // //                   <PieChartIcon className="h-5 w-5" />
// // //                   Rejection Analysis
// // //                 </CardTitle>
// // //               </CardHeader>
// // //               <CardContent>
// // //                 <div className="grid grid-cols-2 gap-6">
// // //                   <div>
// // //                     <h3 className="text-lg font-semibold mb-4">Defect Distribution</h3>
// // //                     <div className="h-64">
// // //                       <ResponsiveContainer width="100%" height="100%">
// // //                         <BarChart data={rejectionData}>
// // //                           <CartesianGrid strokeDasharray="3 3" />
// // //                           <XAxis dataKey="defect" />
// // //                           <YAxis />
// // //                           <Tooltip />
// // //                           <Bar dataKey="quantity" fill="#EF4444" />
// // //                         </BarChart>
// // //                       </ResponsiveContainer>
// // //                     </div>
// // //                   </div>
// // //                   <div>
// // //                     <h3 className="text-lg font-semibold mb-4">Rejection Trend</h3>
// // //                     <div className="h-64">
// // //                       <ResponsiveContainer width="100%" height="100%">
// // //                         <LineChart data={trendData}>
// // //                           <CartesianGrid strokeDasharray="3 3" />
// // //                           <XAxis dataKey="month" />
// // //                           <YAxis />
// // //                           <Tooltip />
// // //                           <Line type="monotone" dataKey="rejection" stroke="#EF4444" strokeWidth={3} name="Rejection %" />
// // //                         </LineChart>
// // //                       </ResponsiveContainer>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //           </div>
// // //         </TabsContent>

// // //         {/* MOM Tab */}
// // //         <TabsContent value="mom">
// // //           <Card className="border-0 shadow-md">
// // //             <CardHeader>
// // //               <CardTitle className="flex items-center gap-2">
// // //                 <FileText className="h-5 w-5" />
// // //                 MOM (Minutes of Meeting) Reports
// // //               </CardTitle>
// // //             </CardHeader>
// // //             <CardContent>
// // //               <div className="grid grid-cols-3 gap-4 mb-6">
// // //                 <div className="bg-blue-50 p-4 rounded-lg text-center">
// // //                   <p className="text-sm font-medium text-blue-800">Total Actions</p>
// // //                   <p className="text-3xl font-bold text-blue-900">{productionRecords.length}</p>
// // //                   <p className="text-sm text-blue-600">This month</p>
// // //                 </div>
// // //                 <div className="bg-green-50 p-4 rounded-lg text-center">
// // //                   <p className="text-sm font-medium text-green-800">Completed</p>
// // //                   <p className="text-3xl font-bold text-green-900">{productionRecords.filter(rec => rec.status === 'completed').length}</p>
// // //                   <p className="text-sm text-green-600">Completion Rate</p>
// // //                 </div>
// // //                 <div className="bg-red-50 p-4 rounded-lg text-center">
// // //                   <p className="text-sm font-medium text-red-800">Pending</p>
// // //                   <p className="text-3xl font-bold text-red-900">{productionRecords.filter(rec => rec.status !== 'completed').length}</p>
// // //                   <p className="text-sm text-red-600">Need Attention</p>
// // //                 </div>
// // //               </div>
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>

// // //         {/* PM Tab */}
// // //         <TabsContent value="pm">
// // //           <Card className="border-0 shadow-md">
// // //             <CardHeader>
// // //               <CardTitle>PM (Preventive Maintenance) Status Report</CardTitle>
// // //             </CardHeader>
// // //             <CardContent>
// // //               <div className="grid grid-cols-2 gap-6">
// // //                 <div>
// // //                   <h3 className="text-lg font-semibold mb-4">Machine Maintenance Status</h3>
// // //                   <div className="space-y-3">
// // //                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
// // //                       <span>Completed This Month</span>
// // //                       <Badge className="bg-green-500">{productionRecords.filter(rec => rec.status === 'completed').length}</Badge>
// // //                     </div>
// // //                     <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
// // //                       <span>Pending Maintenance</span>
// // //                       <Badge className="bg-yellow-500">{productionRecords.filter(rec => rec.status !== 'completed').length}</Badge>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //                 <div>
// // //                   <h3 className="text-lg font-semibold mb-4">Actions Required</h3>
// // //                   <div className="space-y-3">
// // //                     <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
// // //                       <span>Overdue Checks</span>
// // //                       <Badge className="bg-red-500">{productionRecords.filter(rec => rec.downtime > 50).length}</Badge>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>
// // //       </Tabs>
// // //     </div>
// // //   );
// // // };

// // // export default ReportsSection;


// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Factory, 
//   Settings, 
//   BarChart3, 
//   Wrench, 
//   CheckCircle, 
//   AlertTriangle,
//   Calendar,
//   Users,
//   Package,
//   Cog,
//   ClipboardList,
//   TrendingUp,
//   Clock,
//   FileText,
//   CheckSquare,
//   Menu
// } from 'lucide-react';
// import { 
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarTrigger,
//   useSidebar
// } from '@/components/ui/sidebar';
// import MasterData from '@/components/MasterData';
// import ProductionTracking from '@/components/ProductionTracking';
// import MaintenanceManagement from '@/components/MaintenanceManagement';
// import Downtime from '@/components/Downtime';
// import ReportsSection from '@/components/ReportsSection';
// import MOMManagement from '@/components/MOMManagement';
// import TaskManagement from '@/components/TaskManagement';

// import QualityControl from '@/components/QualityControl';


// const Index = () => {
//   const [activeView, setActiveView] = useState('dashboard');

//   const dashboardStats = [
//     { title: 'Overall OEE', value: '87.5%', icon: TrendingUp, color: 'bg-green-500' },
//     { title: 'Active Machines', value: '12/15', icon: Factory, color: 'bg-blue-500' },
//     { title: 'Pending Tasks', value: '8', icon: CheckSquare, color: 'bg-orange-500' },
//     { title: 'PDI Issues', value: '2', icon: AlertTriangle, color: 'bg-red-500' },
//   ];

//   const menuItems = [
//     { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
//     { id: 'production', title: 'Production', icon: Factory },
//     { id: 'pdi', title: 'PDI Inspection', icon: AlertTriangle },
//     { id: 'tasks', title: 'Tasks', icon: CheckSquare },
//     { id: 'reports', title: 'Reports', icon: ClipboardList },
//     { id: 'mom', title: 'MOM', icon: FileText },
//     { id: 'masters', title: 'Masters', icon: Settings },
//     // { id: 'maintenance', title: 'Maintenance', icon: Settings },
//     // { id: 'qualitycontrol', title: 'QualityControl', icon: Settings },
//   ];

//   const renderContent = () => {
//     switch (activeView) {
//       case 'dashboard':
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {dashboardStats.map((stat, index) => (
//                 <Card key={index} className="border-0 shadow-md">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                         <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
//                       </div>
//                       <div className={`${stat.color} p-3 rounded-lg`}>
//                         <stat.icon className="h-6 w-6 text-white" />
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <Card className="border-0 shadow-md">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <AlertTriangle className="h-5 w-5 text-orange-500" />
//                     Recent Alerts
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-red-800">Machine M-001 Issue</p>
//                         <p className="text-sm text-red-600">Quality defect reported</p>
//                       </div>
//                       <Badge variant="destructive">Critical</Badge>
//                     </div>
//                     <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-orange-800">Scheduled Maintenance Due</p>
//                         <p className="text-sm text-orange-600">Monthly PM overdue by 2 days</p>
//                       </div>
//                       <Badge variant="secondary">Warning</Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="border-0 shadow-md">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CheckSquare className="h-5 w-5 text-blue-500" />
//                     Task Overview
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Overdue Tasks</span>
//                       <Badge variant="destructive">3</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Due Today</span>
//                       <Badge variant="secondary">5</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">In Progress</span>
//                       <Badge className="bg-blue-500">12</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Completed</span>
//                       <Badge className="bg-green-500">28</Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="border-0 shadow-md">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Calendar className="h-5 w-5 text-green-500" />
//                     Today's Schedule
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-blue-800">Shift A Production</p>
//                         <p className="text-sm text-blue-600">6:00 AM - 2:00 PM</p>
//                       </div>
//                       <Badge className="bg-blue-500">Active</Badge>
//                     </div>
//                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-800">Production Review</p>
//                         <p className="text-sm text-gray-600">Scheduled at 3:00 PM</p>
//                       </div>
//                       <Badge variant="outline">Scheduled</Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         );
//       case 'production':
//         return <ProductionTracking />;
//       case 'pdi':
//         return <Downtime />;
//       case 'reports':
//         return <ReportsSection />;
//       case 'mom':
//         return <MOMManagement />;
//       case 'tasks':
//         return <TaskManagement />;
//       case 'masters':
//         return <MasterData />;
//       // case 'maintenance':
//       //   return <MaintenanceManagement />;
//       // case 'qualitycontrol':
//       //   return <QualityControl />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <SidebarProvider>
//       <div className="min-h-screen flex w-full">
//         <Sidebar className="w-64">
//           <SidebarContent>
//             <div className="p-4 border-b">
//               <div className="flex items-center space-x-3">
//                 <Factory className="h-8 w-8 text-blue-600" />
//                 <div>
//                   <h1 className="text-lg font-bold text-gray-900">MOM System</h1>
//                   <p className="text-sm text-gray-500">Manufacturing Operations</p>
//                 </div>
//               </div>
//             </div>
            
//             <SidebarGroup>
//               <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   {menuItems.map((item) => (
//                     <SidebarMenuItem key={item.id}>
//                       <SidebarMenuButton 
//                         onClick={() => setActiveView(item.id)}
//                         isActive={activeView === item.id}
//                         className="w-full justify-start"
//                       >
//                         <item.icon className="h-4 w-4 mr-3" />
//                         {item.title}
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>

//             <div className="mt-auto p-4 border-t">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                   <Users className="h-4 w-4 text-white" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Admin User</p>
//                   <Badge variant="outline" className="text-green-600 text-xs">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
//                     Online
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </SidebarContent>
//         </Sidebar>

//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <header className="bg-white shadow-sm border-b">
//             <div className="flex items-center justify-between px-6 py-4">
//               <div className="flex items-center space-x-4">
//                 <SidebarTrigger />
//                 <h2 className="text-xl font-semibold text-gray-900 capitalize">
//                   {menuItems.find(item => item.id === activeView)?.title || 'Dashboard'}
//                 </h2>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <Badge variant="outline" className="text-green-600">
//                   <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                   System Online
//                 </Badge>
//               </div>
//             </div>
//           </header>

//           {/* Main Content */}
//           <main className="flex-1 p-6 bg-gray-50">
//             {renderContent()}
//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default Index;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Factory, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  FileText,
  CheckSquare,
  LogOut
} from 'lucide-react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import MasterData from '@/components/MasterData';
import ProductionTracking from '@/components/ProductionTracking';
import Downtime from '@/components/Downtime';
import ReportsSection from '@/components/ReportsSection';
import MOMManagement from '@/components/MOMManagement';
import TaskManagement from '@/components/TaskManagement';
import { useAuth } from '@/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const { logout, user } = useAuth(); // ✅ get logout + user
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to login
  };

  const dashboardStats = [
    { title: 'Overall OEE', value: '87.5%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Active Machines', value: '12/15', icon: Factory, color: 'bg-blue-500' },
    { title: 'Pending Tasks', value: '8', icon: CheckSquare, color: 'bg-orange-500' },
    { title: 'PDI Issues', value: '2', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
    { id: 'production', title: 'Production', icon: Factory },
    { id: 'pdi', title: 'PDI Inspection', icon: AlertTriangle },
    { id: 'tasks', title: 'Tasks', icon: CheckSquare },
    { id: 'reports', title: 'Reports', icon: ClipboardList },
    { id: 'mom', title: 'MOM', icon: FileText },
    { id: 'masters', title: 'Masters', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* ✅ keep your other dashboard cards here */}
          </div>
        );
      case 'production':
        return <ProductionTracking />;
      case 'pdi':
        return <Downtime />;
      case 'reports':
        return <ReportsSection />;
      case 'mom':
        return <MOMManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'masters':
        return <MasterData />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-64">
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Factory className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    MOM System
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manufacturing Operations
                  </p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        isActive={activeView === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* ✅ Single user footer with logout */}
            {/* <div className="mt-auto p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
                    <Badge variant="outline" className="text-green-600 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </Badge>
                  </div>
                </div>
              </div>
            </div> */}
            
            {/* ✅ Single user footer with logout */}
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center justify-between">
                {/* user info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user?.name || "Admin User"}
                    </p>
                    <Badge variant="outline" className="text-green-600 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </Badge>
                  </div>
                </div>

                {/* ✅ Logout button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 bg-red-100 p-2"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {menuItems.find((item) => item.id === activeView)?.title ||
                    "Dashboard"}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  System Online
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

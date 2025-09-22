import React, { useEffect, useState } from 'react';
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
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '@/TaskContext';

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const { logout, user, token } = useAuth(); 
  const navigate = useNavigate();

  const { taskCount } = useTaskContext();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardStats = [
    { title: 'Overall OEE', value: '87.5%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Active Machines', value: '12/15', icon: Factory, color: 'bg-blue-500' },
    { title: 'Pending Tasks', value: taskCount.toString(), icon: CheckSquare, color: 'bg-orange-500' },
    { title: 'PDI Issues', value: '2', icon: AlertTriangle, color: 'bg-red-500' },
  ];

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
  { id: 'production', title: 'Production', icon: Factory },
  { id: 'pdi', title: 'PDI Inspection', icon: AlertTriangle },
  { 
    id: 'tasks', 
    title: (
      <span className="flex items-center">
        Tasks 
        <span className="ml-2 text-sm font-medium text-red-600 bg-red-100 p-1 px-2 rounded-full">
          {taskCount > 0 ? taskCount : 0}
        </span>
      </span>
    ), 
    icon: CheckSquare 
  },
  { id: 'reports', title: 'Reports', icon: ClipboardList },
  { id: 'mom', title: 'MOM', icon: FileText },
  { id: 'masters', title: 'Masters', icon: Settings },
];


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
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
                  <h1 className="text-lg font-bold text-gray-900">MOM System</h1>
                  <p className="text-sm text-gray-500">Manufacturing Operations</p>
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

            <div className="mt-auto p-4 border-t">
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
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {menuItems.find((item) => item.id === activeView)?.title || "Dashboard"}
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

          <main className="flex-1 p-6 bg-gray-50">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

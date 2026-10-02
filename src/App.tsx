import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AppProvider } from '@/store';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Results from '@/pages/Results';
import Teachers from '@/pages/Teachers';
import Madrasa from '@/pages/Madrasa';
import School from '@/pages/School';
import SchoolDashboard from '@/pages/SchoolDashboard';
import SchoolTeachers from '@/pages/SchoolTeachers';
import SchoolSettings from '@/pages/SchoolSettings';
import MadrasaDashboard from '@/pages/MadrasaDashboard';
import MadrasaTeachers from '@/pages/MadrasaTeachers';
import MadrasaSettings from '@/pages/MadrasaSettings';
import MadrasaDonations from '@/pages/MadrasaDonations';
import MadrasaReports from '@/pages/MadrasaReports';
import FeeDashboard from '@/pages/FeeDashboard';
import FeeSystem from '@/pages/FeeSystem';
import FeeReports from '@/pages/FeeReports';
import PortalSettings from '@/pages/PortalSettings';
import Fees from '@/pages/Fees';
import Announcements from '@/pages/Announcements';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import AcademicSessions from '@/pages/AcademicSessions';
import NeuLayout from '@/components/NeuLayout';
import NotFound from '@/pages/not-found';
import Chanda from '@/pages/Chanda';
import PortalLayout from '@/components/PortalLayout';
import PortalDashboard from '@/pages/PortalDashboard';

function AdminPage({ Page }: { Page: React.ComponentType }) {
  return (
    <NeuLayout>
      <Page />
    </NeuLayout>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/school-portal/dashboard">{() => <PortalLayout portal="school"><SchoolDashboard /></PortalLayout>}</Route>
      <Route path="/school-portal/students">{() => <PortalLayout portal="school"><Students department="school" /></PortalLayout>}</Route>
      <Route path="/school-portal/teachers">{() => <PortalLayout portal="school"><SchoolTeachers /></PortalLayout>}</Route>
      <Route path="/school-portal/results">{() => <PortalLayout portal="school"><Results department="school" /></PortalLayout>}</Route>
      <Route path="/school-portal/settings">{() => <PortalLayout portal="school"><SchoolSettings /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/dashboard">{() => <PortalLayout portal="madrasa"><MadrasaDashboard /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/students">{() => <PortalLayout portal="madrasa"><Students department="madrasa" /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/teachers">{() => <PortalLayout portal="madrasa"><MadrasaTeachers /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/results">{() => <PortalLayout portal="madrasa"><Results department="madrasa" /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/donations">{() => <PortalLayout portal="madrasa"><MadrasaDonations /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/reports">{() => <PortalLayout portal="madrasa"><MadrasaReports /></PortalLayout>}</Route>
      <Route path="/madrasa-portal/settings">{() => <PortalLayout portal="madrasa"><MadrasaSettings /></PortalLayout>}</Route>
      <Route path="/fees-portal/dashboard">{() => <PortalLayout portal="fees"><FeeDashboard /></PortalLayout>}</Route>
      <Route path="/fees-portal/school">{() => <PortalLayout portal="fees"><FeeSystem department="school" /></PortalLayout>}</Route>
      <Route path="/fees-portal/madrasa">{() => <PortalLayout portal="fees"><FeeSystem department="madrasa" /></PortalLayout>}</Route>
      <Route path="/fees-portal/reports">{() => <PortalLayout portal="fees"><FeeReports /></PortalLayout>}</Route>
      <Route path="/portal-settings">{() => <PortalLayout portal="settings"><PortalSettings /></PortalLayout>}</Route>
      <Route path="/dashboard">{() => <AdminPage Page={Dashboard} />}</Route>
      <Route path="/admin/students">{() => <AdminPage Page={Students} />}</Route>
      <Route path="/admin/teachers">{() => <AdminPage Page={Teachers} />}</Route>
      <Route path="/admin/madrasa">{() => <AdminPage Page={Madrasa} />}</Route>
      <Route path="/admin/school">{() => <AdminPage Page={School} />}</Route>
      <Route path="/admin/fees">{() => <AdminPage Page={Fees} />}</Route>
      <Route path="/admin/chanda">{() => <AdminPage Page={Chanda} />}</Route>
      <Route path="/admin/announcements">{() => <AdminPage Page={Announcements} />}</Route>
      <Route path="/admin/reports">{() => <AdminPage Page={Reports} />}</Route>
      <Route path="/admin/settings">{() => <AdminPage Page={Settings} />}</Route>
      <Route path="/admin/sessions">{() => <AdminPage Page={AcademicSessions} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster position="top-center" richColors />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

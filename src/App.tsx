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
import Teachers from '@/pages/Teachers';
import Madrasa from '@/pages/Madrasa';
import School from '@/pages/School';
import Fees from '@/pages/Fees';
import Results from '@/pages/Results';
import Announcements from '@/pages/Announcements';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import AcademicSessions from '@/pages/AcademicSessions';
import NeuLayout from '@/components/NeuLayout';
import NotFound from '@/pages/not-found';

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
      <Route path="/dashboard">{() => <AdminPage Page={Dashboard} />}</Route>
      <Route path="/admin/students">{() => <AdminPage Page={Students} />}</Route>
      <Route path="/admin/teachers">{() => <AdminPage Page={Teachers} />}</Route>
      <Route path="/admin/madrasa">{() => <AdminPage Page={Madrasa} />}</Route>
      <Route path="/admin/school">{() => <AdminPage Page={School} />}</Route>
      <Route path="/admin/fees">{() => <AdminPage Page={Fees} />}</Route>
      <Route path="/admin/results">{() => <AdminPage Page={Results} />}</Route>
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

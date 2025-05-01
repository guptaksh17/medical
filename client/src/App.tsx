import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Appointments from "@/pages/Appointments";
import Patients from "@/pages/Patients";
import Doctors from "@/pages/Doctors";
import Feedback from "@/pages/Feedback";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/appointments/new" component={() => <Appointments isForm />} />
        <Route path="/appointments/edit/:id" component={(params) => <Appointments isForm isEditMode id={params.id} />} />
        <Route path="/patients" component={Patients} />
        <Route path="/patients/new" component={() => <Patients isForm />} />
        <Route path="/patients/edit/:id" component={(params) => <Patients isForm isEditMode id={params.id} />} />
        <Route path="/patients/view/:id" component={(params) => <Patients isView id={params.id} />} />
        <Route path="/doctors" component={Doctors} />
        <Route path="/doctors/new" component={() => <Doctors isForm />} />
        <Route path="/doctors/edit/:id" component={(params) => <Doctors isForm isEditMode id={params.id} />} />
        <Route path="/doctors/view/:id" component={(params) => <Doctors isView id={params.id} />} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/feedback/new/:appointmentId" component={(params) => <Feedback isForm appointmentId={params.appointmentId} />} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

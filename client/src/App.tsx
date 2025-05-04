import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/Layout";
import { PatientLayout } from "@/components/layout/PatientLayout";
import Appointments from "@/pages/Appointments";
import Patients from "@/pages/Patients";
import Doctors from "@/pages/Doctors";
import Feedback from "@/pages/Feedback";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import PatientLogin from "@/pages/PatientLogin";
import PatientRegister from "@/pages/PatientRegister";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientAppointments from "@/pages/PatientAppointments";
import PatientFeedback from "@/pages/PatientFeedback";
import PatientProfile from "@/pages/PatientProfile";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Component to handle 404 pages with the correct layout
function NotFoundHandler({ logout }: { logout: () => void }) {
  const [location] = useLocation();
  const { isAuthenticated, isUserRole } = useAuth();
  const isPatientRoute = location.startsWith('/patient');

  // If not authenticated, redirect to appropriate login
  if (!isAuthenticated) {
    return <Redirect to={isPatientRoute ? "/patient/login" : "/login"} />;
  }

  // If authenticated but wrong role, redirect to appropriate login
  const expectedRole = isPatientRoute ? 'patient' : 'admin';
  if (!isUserRole(expectedRole)) {
    return <Redirect to={isPatientRoute ? "/patient/login" : "/login"} />;
  }

  // User is authenticated and has the correct role
  return isPatientRoute ? (
    <PatientLayout>
      <NotFound />
    </PatientLayout>
  ) : (
    <Layout onLogout={logout}>
      <NotFound />
    </Layout>
  );
}

function Router() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/">
        <LandingPage />
      </Route>

      {/* Admin Routes */}
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/admin">
        <Redirect to="/admin/appointments" />
      </Route>

      <Route path="/admin/appointments">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Appointments />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/appointments/new">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Appointments isForm />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/appointments/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Appointments isForm isEditMode id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/patients">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Patients />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/patients/new">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Patients isForm />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/patients/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Patients isForm isEditMode id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/patients/view/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Patients isView id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/doctors">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Doctors />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/doctors/new">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Doctors isForm />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/doctors/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Doctors isForm isEditMode id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/doctors/view/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Doctors isView id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/feedback">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Feedback />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/feedback/new/:appointmentId">
        {(params) => (
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Feedback isForm appointmentId={params.appointmentId} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/reports">
        <ProtectedRoute>
          <Layout onLogout={logout}>
            <Reports />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* Patient Routes */}
      <Route path="/patient/login">
        <PatientLogin />
      </Route>

      <Route path="/patient/register">
        <PatientRegister />
      </Route>

      <Route path="/patient/dashboard">
        <ProtectedRoute patientRoute>
          <PatientDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/patient/appointments">
        <ProtectedRoute patientRoute>
          <PatientAppointments />
        </ProtectedRoute>
      </Route>

      <Route path="/patient/appointments/new">
        <ProtectedRoute patientRoute>
          <PatientAppointments isForm />
        </ProtectedRoute>
      </Route>

      <Route path="/patient/feedback">
        <ProtectedRoute patientRoute>
          <PatientFeedback />
        </ProtectedRoute>
      </Route>

      <Route path="/patient/feedback/new/:appointmentId">
        {(params) => (
          <ProtectedRoute patientRoute>
            <PatientFeedback isForm appointmentId={params.appointmentId} />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/patient/profile">
        <ProtectedRoute patientRoute>
          <PatientProfile />
        </ProtectedRoute>
      </Route>

      {/* Fallback Route - simple 404 page without authentication */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

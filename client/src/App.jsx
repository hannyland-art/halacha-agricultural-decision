import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import StartCheckPage from './pages/StartCheckPage';
import WizardPage from './pages/WizardPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPlantsPage from './pages/MyPlantsPage';
import PlantDetailsPage from './pages/PlantDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModules from './pages/admin/AdminModules';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminRules from './pages/admin/AdminRules';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminContactSettings from './pages/admin/AdminContactSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/check" element={<StartCheckPage />} />
            <Route path="/wizard/:moduleCode" element={<WizardPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Authenticated */}
            <Route path="/my-plants" element={<MyPlantsPage />} />
            <Route path="/plants/:id" element={<PlantDetailsPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/modules" element={<AdminModules />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/rules" element={<AdminRules />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/contact" element={<AdminContactSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

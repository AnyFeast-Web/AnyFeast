import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { ClientListPage } from '../pages/Clients/ClientListPage';
import { ClientProfilePage } from '../pages/Clients/ClientProfilePage';
import { MealPlanListPage } from '../pages/MealPlans/MealPlanListPage';
import { MealPlanBuilderPage } from '../pages/MealPlans/MealPlanBuilderPage';
import { NutritionDBPage } from '../pages/NutritionDB/NutritionDBPage';
import { ConsultationHistoryPage } from '../pages/Consultations/ConsultationHistoryPage';
import { ConsultationPage } from '../pages/Consultations/ConsultationPage';
import { ConsultationFormPage } from '../pages/Consultations/ConsultationFormPage';
import { AutomationPage } from '../pages/Automation/AutomationPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['nutritionist', 'admin']} />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'clients', element: <ClientListPage /> },
      { path: 'clients/:id', element: <ClientProfilePage /> },
      { path: 'meal-plans', element: <MealPlanListPage /> },
      { path: 'meal-plans/new', element: <MealPlanBuilderPage /> },
          { path: 'meal-plans/:id', element: <MealPlanBuilderPage /> },
          { path: 'meal-plans/:id/edit', element: <MealPlanBuilderPage /> },
      { path: 'consultations', element: <ConsultationHistoryPage /> },
      { path: 'consultations/chat', element: <ConsultationPage /> },
      { path: 'consultations/new/:clientId', element: <ConsultationFormPage /> },
      { path: 'consultations/:id/edit', element: <ConsultationFormPage /> },
      { path: 'consultations/:id/view', element: <ConsultationFormPage /> },
      { path: 'automation', element: <AutomationPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

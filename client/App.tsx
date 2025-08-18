import React, { useState } from 'react';
import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth imports
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';

// Layout imports
import { Header, Sidebar } from './components/layout';

// Page imports
import ProjectSettings from './pages/ProjectSettings';
import TextAnalyzer from './pages/TextAnalyzer';
// import QueryIndex from './pages/QueryIndex'; // Временно отключено
import PlaceholderPage from './pages/PlaceholderPage';
import PersonalAccount from './pages/PersonalAccount';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

// Компонент основного layout с sidebar
const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('semantics');

  const renderPage = () => {
    switch (currentPage) {
      case 'semantics':
        return <ProjectSettings />;
      case 'text-analyzer':
        return <TextAnalyzer />;
      case 'query-index':
        // Временно показываем заглушку вместо QueryIndex
        return (
          <PlaceholderPage
            title="Query Index"
            description="Функция временно недоступна. Ведутся технические работы по настройке API."
          />
        );
        // Оригинальный код (закомментирован):
        // return <QueryIndex />;
      case 'documentation':
        return (
          <PlaceholderPage
            title="Документация"
            description="Справочные материалы и руководства по использованию сервиса"
          />
        );
      case 'profile':
        return (
          <PersonalAccount
            title="Личный кабинет"
            description="Управление аккаунтом и настройками пользователя"
          />
        );
      case 'seo-guild':
        return (
          <PlaceholderPage
            title="SEO-гильдия"
            description="Сообщество SEO-специалистов и обмен опытом"
          />
        );
      case 'telegram':
        return (
          <PlaceholderPage
            title="Блог в телеграм"
            description="Последние новости и обновления в нашем Telegram-канале"
          />
        );
      default:
        return <ProjectSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-0">
      <Header />
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        {renderPage()}
      </div>
    </div>
  );
};

// Главный компонент приложения с роутингом
const MainApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Защищенные маршруты */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } />

        <Route path="/app/analyzer" element={
          <ProtectedRoute>
            <TextAnalyzer />
          </ProtectedRoute>
        } />

        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* 404 страница */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600">Страница не найдена</p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Корневой компонент с провайдерами
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MainApp />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
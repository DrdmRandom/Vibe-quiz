import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ToastProvider';
import AdminRegister from './pages/admin/Register';
import AdminQuizzes from './pages/admin/Quizzes';
import QuizEditor from './pages/admin/QuizEditor';
import HostPage from './pages/host/HostPage';
import RoomPage from './pages/player/RoomPage';
import ResultsPage from './pages/player/ResultsPage';
import { Layout } from './components/Layout';
import LandingPage from './pages/Landing';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage initialTab="play" />} />
              <Route path="/play" element={<LandingPage initialTab="play" />} />
              <Route path="/admin/login" element={<LandingPage initialTab="admin" />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/quizzes" element={<AdminQuizzes />} />
              <Route path="/admin/quizzes/:id/edit" element={<QuizEditor />} />
              <Route path="/host" element={<HostPage />} />
              <Route path="/room/:pin" element={<RoomPage />} />
              <Route path="/room/:pin/results" element={<ResultsPage />} />
              <Route path="*" element={<LandingPage initialTab="play" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

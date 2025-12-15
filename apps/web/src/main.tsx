import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ToastProvider';
import AdminLogin from './pages/admin/Login';
import AdminRegister from './pages/admin/Register';
import AdminQuizzes from './pages/admin/Quizzes';
import QuizEditor from './pages/admin/QuizEditor';
import HostPage from './pages/host/HostPage';
import PlayPage from './pages/player/PlayPage';
import RoomPage from './pages/player/RoomPage';
import ResultsPage from './pages/player/ResultsPage';
import { Layout } from './components/Layout';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/quizzes" element={<AdminQuizzes />} />
              <Route path="/admin/quizzes/:id/edit" element={<QuizEditor />} />
              <Route path="/host" element={<HostPage />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/room/:pin" element={<RoomPage />} />
              <Route path="/room/:pin/results" element={<ResultsPage />} />
              <Route path="*" element={<AdminLogin />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

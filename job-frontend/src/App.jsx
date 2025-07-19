import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import ManageApplications from './pages/ManageApplications';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Unauthorized from './pages/Unauthorized';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                <Route path="/post-job" element={
                  <RoleBasedRoute allowedRoles={['ADMIN']}>
                    <PostJob />
                  </RoleBasedRoute>
                } />
                <Route path="/my-jobs" element={
                  <RoleBasedRoute allowedRoles={['ADMIN']}>
                    <MyJobs />
                  </RoleBasedRoute>
                } />
                <Route path="/jobs/:jobId/applications" element={
                  <RoleBasedRoute allowedRoles={['ADMIN']}>
                    <ManageApplications />
                  </RoleBasedRoute>
                } />
                
                <Route path="/my-applications" element={
                  <RoleBasedRoute allowedRoles={['USER']}>
                    <MyApplications />
                  </RoleBasedRoute>
                } />
                
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              </Routes>
            </main>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

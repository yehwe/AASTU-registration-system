import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './index.css';

import Home from "./pages/Home"
import Footer from './pages/Footer';
// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Student Components
import Dashboard from './components/student/Dashboard';
import StudentProfile from './components/student/Profile';
import CourseList from './components/student/CourseList';

// Teacher Components
import TeacherDashboard from './components/teacher/Dashboard';
import NewCourse from './components/teacher/NewCourse';
import CourseManagement from './components/teacher/CourseManagement';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';
import DepartmentList from './components/admin/DepartmentList';
import NewDepartment from './components/admin/NewDepartment';
import AdminProfile from './components/admin/Profile';

// Shared Components
import Navbar from './components/shared/Navbar';
import PrivateRoute from './components/shared/PrivateRoute';
import NotFound from './components/shared/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />

        <div className="min-h-screen flex flex-col justify-between">
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <StudentProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <CourseList />
                  </PrivateRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <PrivateRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/teacher/courses/new"
                element={
                  <PrivateRoute allowedRoles={["teacher"]}>
                    <NewCourse />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/courses/:courseId"
                element={
                  <PrivateRoute allowedRoles={["teacher"]}>
                    <CourseManagement />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <DepartmentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/departments/new"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <NewDepartment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AdminProfile />
                  </PrivateRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer at the bottom */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/teachers/courses');
        setCourses(res.data);
      } catch (error) {
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const totalStudents = 48; // Statically set total students to 48
  const totalCourses = 4; // Statically set total courses to 4

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2 md:mb-0">Teacher Dashboard</h1>
          <Link 
            to="/teacher/courses/new" 
            className="bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow transition-all text-lg"
          >
            Add New Course
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/95 p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Courses</h3>
            <span className="text-3xl font-extrabold text-gray-900 mb-1">{totalCourses}</span>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Courses</span>
          </div>
          <div className="bg-white/95 p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Students</h3>
            <span className="text-3xl font-extrabold text-gray-900 mb-1">{totalStudents}</span>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Students</span>
          </div>
          <div className="bg-white/95 p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Semester</h3>
            <span className="text-3xl font-extrabold text-gray-900 mb-1">Spring 2024</span>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
          </div>
          <div className="bg-white/95 p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <span className="text-3xl font-extrabold text-gray-900 mb-1">Active</span>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Teacher</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-6 text-gray-900 drop-shadow">Your Courses</h2>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-700 animate-pulse">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-1">{course.code}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{course.credits} Credits</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                  <div className="mt-4 text-sm text-gray-700">
                    <span className="font-medium">{course.enrolledStudents}</span> students enrolled
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link 
                    to={`/teacher/courses/${course.id}`}
                    className="block w-full text-center py-2 px-4 bg-gray-800 hover:bg-blue-700 text-white font-medium rounded-full transition-all"
                  >
                    Manage Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl shadow border border-gray-200">
            <p className="text-gray-500 mb-4"></p>
            <Link 
              to="/teacher/courses/new" 
              className="bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow transition-all text-lg"
            >
              Create Your  Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
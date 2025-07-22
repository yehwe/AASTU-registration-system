import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, studentsRes] = await Promise.all([
          axios.get(`/api/teachers/courses/${courseId}`),
          axios.get(`/api/teachers/courses/${courseId}/students`)
        ]);
        setCourse(courseRes.data);
        setStudents(studentsRes.data);
      } catch (error) {
        toast.error('Failed to load course data');
        navigate('/teacher/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 animate-pulse">Loading course data...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.code} • {course.credits} Credits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Course Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{course.description}</p>
              </div>
              {course.prerequisites && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prerequisites</h3>
                  <p className="mt-1 text-gray-900">{course.prerequisites}</p>
                </div>
              )}
              {course.syllabus && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Syllabus</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{course.syllabus}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
            {students.length > 0 ? (
              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.studentId}</p>
                    </div>
                    <span className="text-sm text-gray-500">Year {student.year}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
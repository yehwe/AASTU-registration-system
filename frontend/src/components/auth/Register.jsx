import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [departments] = useState([
    { id: 1, name: 'Computer Science', code: 'CS' },
    { id: 2, name: 'Electrical Engineering', code: 'EE' },
    { id: 3, name: 'Mechanical Engineering', code: 'ME' },
    { id: 4, name: 'Civil Engineering', code: 'CE' },
    { id: 5, name: 'Information Technology', code: 'IT' }
  ]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    teacherId: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    emergencyContact: '',
    departmentId: '',
    year: '',
    semester: '',
    role: 'student',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Map frontend role to backend role
  const roleMap = { student: 'student', instructor: 'teacher', admin: 'admin' };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z\s]{2,50}$/.test(formData.firstName)) {
      newErrors.firstName = 'First name must be 2-50 characters and contain only letters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z\s]{2,50}$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name must be 2-50 characters and contain only letters';
    }

    // Student/Teacher ID validation
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      } else if (!/^ETS\d+\/\d+$/.test(formData.studentId)) {
        newErrors.studentId = 'Invalid student ID format (e.g., ETS123/45)';
      }
    }
    if (formData.role === 'instructor') {
      if (!formData.teacherId.trim()) {
        newErrors.teacherId = 'Teacher ID is required';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,13}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10-13 digits';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Emergency contact validation
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    } else if (!/^\d{10,13}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = 'Emergency contact must be 10-13 digits';
    }

    // Department validation
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    // Year validation
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (!['1', '2', '3', '4', '5'].includes(formData.year)) {
      newErrors.year = 'Year must be between 1 and 5';
    }

    // Semester validation
    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    } else if (!['1', '2'].includes(formData.semester)) {
      newErrors.semester = 'Semester must be either 1 or 2';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    } else if (!['male', 'female', 'other'].includes(formData.gender)) {
      newErrors.gender = 'Invalid gender value';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 16 || age > 100) {
        newErrors.dateOfBirth = 'Age must be between 16 and 100 years';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Map 'instructor' to 'teacher' for backend
      const mappedRole = formData.role === 'instructor' ? 'teacher' : formData.role;
      const payload = {
        ...formData,
        role: mappedRole,
      };
      // Remove teacherId for teachers (backend generates it)
      if (mappedRole === 'teacher') {
        delete payload.teacherId;
      }
      // Remove studentId for teachers/admins
      if (mappedRole !== 'student') {
        delete payload.studentId;
      }
      const response = await axios.post('/api/auth/register', payload);

      if (response.data.token) {
        toast.success('Registration successful! Please login to continue.');
        navigate('/login');
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Registration failed. Please try again.'
      });
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900 drop-shadow-lg">
        Register To AASTU
        </h2>
        <p className="mt-2 text-center text-sm text-blue-600">
          Already Have An Account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl sm:px-10 border border-blue-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-blue-700">Role</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="student">Student</option>
                <option value="instructor">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-blue-700">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`} />
                {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-blue-700">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`} />
                {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {formData.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-blue-700">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  id="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="ETS123/45"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.studentId ? 'border-red-500' : ''
                  }`}
                />
                {errors.studentId && (
                  <p className="mt-2 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>
            )}
            {formData.role === 'instructor' && (
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-blue-700">
                  Teacher ID
                </label>
                <input
                  type="text"
                  name="teacherId"
                  id="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  placeholder="TCHR123"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.teacherId ? 'border-red-500' : ''
                  }`}
                />
                {errors.teacherId && (
                  <p className="mt-2 text-sm text-red-600">{errors.teacherId}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-blue-700">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                  tabIndex={-1}
                  style={{ top: 'calc(50% + 0.5rem)' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-700">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                  tabIndex={-1}
                  style={{ top: 'calc(50% + 0.5rem)' }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-blue-700">
                  Gender
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.gender ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-blue-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.dateOfBirth ? 'border-red-500' : ''
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-blue-700">Address</label>
              <select name="address" id="address" value={formData.address} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.address ? 'border-red-500' : ''}`} required>
                <option value="">Select your city</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Adama">Adama</option>
                <option value="Bahirdar">Bahirdar</option>
                <option value="Diredawa">Diredawa</option>
                <option value="Axum">Axum</option>
                <option value="Gojam">Gojam</option>
              </select>
              {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-700">Phone Number</label>
                <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 0912345678" className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`} />
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-blue-700">Emergency Contact</label>
                <input type="text" name="emergencyContact" id="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="e.g. 0912345678" className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.emergencyContact ? 'border-red-500' : ''}`} />
                {errors.emergencyContact && <p className="mt-2 text-sm text-red-600">{errors.emergencyContact}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-blue-700">
                  Department
                </label>
                <select
                  name="departmentId"
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.departmentId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-2 text-sm text-red-600">{errors.departmentId}</p>
                )}
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-blue-700">
                  Year
                </label>
                <select
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.year ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select year</option>
                  {[1, 2, 3, 4, 5].map(year => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-2 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-blue-700">
                  Semester
                </label>
                <select
                  name="semester"
                  id="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.semester ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
                {errors.semester && (
                  <p className="mt-2 text-sm text-red-600">{errors.semester}</p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.submit}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
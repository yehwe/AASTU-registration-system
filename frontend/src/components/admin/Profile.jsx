import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AdminProfile = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Role:</strong> {currentUser.role}</p>
        <p><strong>ID:</strong> {currentUser.id}</p>
      </div>
    </div>
  );
};

export default AdminProfile; 
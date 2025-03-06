import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/Auth/register', {
        username,
        email,
        passwordHash: password,
      });
      toast.success('Registration successful! Please log in.'); // Success toast
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Registration failed:', error.response?.data);
      if (error.response?.data?.message === 'Username already exists') {
        toast.warning('Username already exists. Please choose a different username.'); // Warning toast
      } else {
        toast.error('Registration failed. Please try again.'); // Error toast
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <ToastContainer /> {/* Add this to display toasts */}
    </div>
  );
};

export default Register;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateTask = ({ onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [deadline, setDeadline] = useState('');
  const navigate = useNavigate(); // React Router Navigation

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !priority || !deadline) {
      toast.error("All fields are required!");
      return;
    }

    const payload = {
      title,
      description,
      priority,
      status: 'To Do', // Default status on creation
      deadline: new Date(deadline)
    };

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/Task', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Task created successfully:', response.data);
      toast.success('Task created successfully');

      if (onTaskCreated) {
        onTaskCreated(); // Refresh task list in the parent component
      }

      handleClose(); // Close the modal or navigate back
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data || 'Failed to create task');
    }
  };

  // Handle Closing
  const handleClose = () => {
    if (onClose) {
      onClose();  // If modal, close the modal
    } else {
      navigate('/dashboard'); // If standalone, navigate to Dashboard
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Task</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Priority:</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)} 
              required
            >
              <option value="">-- Select Priority --</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label>Deadline:</label>
            <input 
              type="date" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
              required 
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <button type="submit">Create Task</button>
            <button type="button" onClick={handleClose} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

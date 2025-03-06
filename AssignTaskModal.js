import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AssignTaskModal = ({ onClose, onAssignmentComplete, tasks }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  // Fetch all users from the backend when the modal mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('User not authenticated');
          return;
        }
        const response = await axios.get('http://localhost:4000/api/Users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        //console.log('Users fetched:', response.data); // Debugging log
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedUser) {
      toast.error('Please select both a task and a user');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        assignedToUserId: selectedUser
      };
      await axios.put(`http://localhost:4000/api/Task/${selectedTask}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Task assigned successfully!');
      onAssignmentComplete(); // Refresh tasks in Dashboard if needed
      onClose();
    } catch (error) {
      toast.error('Failed to assign task');
      console.error('Error assigning task:', error);
    }
  };

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <h2>Assign Task</h2>
        <form onSubmit={handleAssign}>
          <div>
            <label>Select Task:</label>
            <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
            <option value="">--Select Task--</option>
            {tasks
                .filter(task => task.title && task.title.trim() !== "")
                .map((task) => (
                <option key={task.id} value={task.id}>
                    {task.title}
                </option>
                ))}
            </select>


          </div>
          <div>
            <label>Select User:</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">--Select User--</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Assign</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

// Simple inline styles for demo purposes
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalContentStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '5px',
  width: '300px'
};

export default AssignTaskModal;
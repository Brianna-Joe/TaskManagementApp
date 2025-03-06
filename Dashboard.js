import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TaskColumn from '../components/TaskColumn';
import TaskFilters from '../components/TaskFilters';
import AssignTaskModal from '../components/AssignTaskModal';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({ priority: '', status: '', deadline: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User not authenticated');
        return;
      }
      const response = await axios.get('http://localhost:4000/api/Task', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle task filtering
  useEffect(() => {
    let filtered = tasks;
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }
    if (filters.deadline) {
      filtered = filtered.filter(
        (task) => new Date(task.deadline) <= new Date(filters.deadline)
      );
    }
    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // Handle task status update (drag and drop)
  const handleTaskUpdate = async (taskId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User not authenticated');
      return;
    }

    const task = tasks.find(task => (task.id || task.Id).toString() === taskId.toString());
    if (!task) {
      toast.error('Task not found');
      return;
    }

    // Create an updated task object with the new status
    const updatedTask = { ...task, status: newStatus };

    // Update the task status in your backend
    await axios.put(`http://localhost:4000/api/Task/${taskId}`, updatedTask, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (newStatus === 'In Progress') {
      console.log(`Fetching previous time records for task ${taskId}...`);
      const response = await axios.get(`http://localhost:4000/api/TimeTracking/${taskId}/time-tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const previousRecords = response.data;
      const lastRecord = previousRecords[previousRecords.length - 1];

      let lastDuration = 0;
      if (lastRecord && lastRecord.endTime) {
        lastDuration = lastRecord.duration;
      }

      console.log(`Resuming timer for task ${taskId}, last duration: ${lastDuration} seconds`);
      await axios.post(`http://localhost:4000/api/TimeTracking/${taskId}/start-timer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } else if (newStatus === 'Done') {
      console.log(`Stopping timer for task ${taskId}...`);
      await axios.post(`http://localhost:4000/api/TimeTracking/${taskId}/stop-timer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    fetchTasks();
    toast.success('Task status updated');
  } catch (error) {
    toast.error('Failed to update task status');
    console.error(error);
  }
};

  
  

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/Task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => navigate('/create-task')}>Create Task</button>
      <button onClick={() => setShowAssignModal(true)}>Assign Task</button>

      {showAssignModal && (
        <AssignTaskModal 
          tasks={tasks} 
          onClose={() => setShowAssignModal(false)} 
          onAssignmentComplete={fetchTasks} 
        />
      )}

      {/* Task Filters */}
      <TaskFilters filters={filters} setFilters={setFilters} />

      {/* Task Board */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <TaskColumn 
          title="To Do" 
          tasks={filteredTasks.filter((task) => task.status === 'To Do')}
          onTaskUpdate={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
        />
        <TaskColumn 
          title="In Progress" 
          tasks={filteredTasks.filter((task) => task.status === 'In Progress')}
          onTaskUpdate={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
        />
        <TaskColumn 
          title="Done" 
          tasks={filteredTasks.filter((task) => task.status === 'Done')}
          onTaskUpdate={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default Dashboard;

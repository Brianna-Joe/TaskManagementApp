import React from 'react';
import TimeTrackingDisplay from './TimeTrackingDisplay';

const TaskColumn = ({ title, tasks, onTaskUpdate, onDeleteTask }) => {
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    console.log("Dropped taskId:", taskId);
    if (taskId) {
      onTaskUpdate(taskId, newStatus);
    } else {
      console.error("No taskId found in drop event");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, task) => {
    // Get the task ID (handle different case conventions)
    const idValue = (task.id || task.Id).toString();
    e.dataTransfer.setData('text/plain', idValue);
    console.log("Dragging task:", task);
  };

  return (
    <div
      style={{
        flex: 1,
        margin: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f8f9fa',
        minHeight: '300px', // Ensure columns have height even when empty
      }}
      onDrop={(e) => handleDrop(e, title)}
      onDragOver={handleDragOver}
    >
      <h2 style={{ 
        borderBottom: '2px solid #ddd', 
        paddingBottom: '8px',
        color: '#444'
      }}>
        {title}
      </h2>
      
      {tasks.length === 0 && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#999',
          fontStyle: 'italic'
        }}>
          Drop tasks here
        </div>
      )}
      
      {tasks.map(task => (
        <div
          key={task.id || task.Id}
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            cursor: 'move'
          }}
        >
          {/* Task Details */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 5px 0' }}>{task.title || task.Title}</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>{task.description || task.Description}</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
              <strong>Priority:</strong> {task.priority || task.Priority}
            </p>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
              <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
            </p>
            
            {/* Time Tracking Display */}
            <TimeTrackingDisplay 
              taskId={task.id || task.Id} 
              taskStatus={title} // Use the column title as the status
            />
          </div>

          {/* Delete Button */}
          <button 
            onClick={() => onDeleteTask(task.id || task.Id)} 
            style={{
              background: 'red',
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              cursor: 'pointer',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskColumn;
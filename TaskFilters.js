import React from 'react';

const TaskFilters = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <label>
        Priority:
        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>

      <label>
        Status:
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </label>

      <label>
        Deadline:
        <input
          type="date"
          name="deadline"
          value={filters.deadline}
          onChange={handleFilterChange}
        />
      </label>
    </div>
  );
};

export default TaskFilters;
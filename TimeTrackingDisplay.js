import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TimeTrackingDisplay = ({ taskId, taskStatus }) => {
  const [loading, setLoading] = useState(true);
  const [timeRecords, setTimeRecords] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [previousDuration, setPreviousDuration] = useState(0); // in seconds
  const [startTime, setStartTime] = useState(null);

  // Function to fetch time tracking data
  const fetchTimeTracking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `http://localhost:4000/api/TimeTracking/${taskId}/time-tracking`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const records = response.data;
      setTimeRecords(records);
      setLoading(false);

      // Calculate total logged time (only consider finished records where endTime is not default)
      const totalLoggedTime = records
        .filter(record => record.endTime && record.endTime !== '0001-01-01T00:00:00Z')
        .reduce((sum, record) => sum + (record.duration || 0), 0);
      setPreviousDuration(totalLoggedTime);

      // Find an active record: one with no endTime OR with the default endTime value
      const activeRecord = records.find(record => 
        !record.endTime || record.endTime === '0001-01-01T00:00:00Z'
      );
      if (activeRecord) {
        setStartTime(new Date(activeRecord.startTime).getTime());
      } else {
        setStartTime(null);
      }
    } catch (error) {
      console.error(`Error fetching time tracking for task ${taskId}:`, error);
      setLoading(false);
    }
  };

  // Initial fetch when taskId changes
  useEffect(() => {
    fetchTimeTracking();
  }, [taskId]);

  // When task is "In Progress" and we have a startTime, update 'now' every second
  useEffect(() => {
    if (taskStatus === 'In Progress' && startTime !== null) {
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [taskStatus, startTime]);

  if (loading) {
    return <div style={{ fontSize: '0.9em' }}>Loading time...</div>;
  }

  // Calculate active duration in seconds (if the timer is running)
  let activeDuration = 0;
  if (startTime !== null && taskStatus === 'In Progress') {
    activeDuration = (now - startTime) / 1000;
  }
  const totalDuration = previousDuration + activeDuration;

  // Format total seconds into hh, m, s
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#555' }}>
      {totalDuration > 0 ? `Total Time: ${formatTime(totalDuration)}` : 'No time logged'}
    </div>
  );
};

export default TimeTrackingDisplay;

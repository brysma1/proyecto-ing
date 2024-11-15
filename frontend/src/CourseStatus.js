import React from 'react';

const CourseStatus = ({ courseName, status, updateCourseStatus }) => {
  const statuses = ['not coursed', 'coursing', 'approved', 'failed'];

  return (
    <select 
      value={status} 
      onChange={(e) => updateCourseStatus(courseName, e.target.value)}
    >
      {statuses.map(status => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
};

export default CourseStatus;
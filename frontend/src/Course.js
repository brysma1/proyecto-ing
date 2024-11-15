import React from 'react';

const Course = ({ course, semesterIndex, handleRightClick, handleCourseClick }) => (
  <div
    className={`course ${course.status.replace(' ', '-')}`}
    onClick={() => handleCourseClick(course.id)}
    onContextMenu={(e) => handleRightClick(e, semesterIndex, course)}
  >
    {course.name}
  </div>
);

export default Course;
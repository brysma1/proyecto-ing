import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextMenu from './ContextMenu';
import Semester from './Semester';
import { apiCall } from './api';
import './Pensum.css';

const Pensum = ({ semesters, setSemesters }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const navigate = useNavigate();

  const handleRightClick = (e, semesterIndex, course) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, semesterIndex, course });
  };

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/assignments/${courseId}`);
    } else {
      console.error('Course ID is undefined');
    }
  };

  const updateSemesters = (updateFn) => {
    setSemesters(semesters.map((semester, index) => 
      index === contextMenu.semesterIndex ? updateFn(semester) : semester
    ));
    setContextMenu(null);
  };

  const handleRemove = async () => {
    if (contextMenu) {
      const userId = localStorage.getItem('userId');
      updateSemesters(semester => ({
        ...semester,
        courses: semester.courses.filter(course => course.id !== contextMenu.course.id),
      }));
      await apiCall('http://localhost:5000/remove-course', 'POST', {
        userId, // Include userId in the payload
        semesterName: semesters[contextMenu.semesterIndex].name,
        courseName: contextMenu.course.name,
      });
    }
  };

  const handleStatusUpdate = async (status) => {
    if (contextMenu) {
      const userId = localStorage.getItem('userId');
      updateSemesters(semester => ({
        ...semester,
        courses: semester.courses.map(course =>
          course.id === contextMenu.course.id ? { ...course, status } : course
        ),
      }));
      await apiCall('http://localhost:5000/update-course-status', 'POST', {
        userId, // Include userId in the payload
        semesterName: semesters[contextMenu.semesterIndex].name,
        courseName: contextMenu.course.name,
        status,
      });
    }
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  const addCourse = async (semesterIndex, courseName) => {
    try {
      const userId = localStorage.getItem('userId');
      const semesterName = semesters[semesterIndex].name;

      console.log('Sending add-course request:', { userId, semesterName, courseName });

      const response = await apiCall('http://localhost:5000/add-course', 'POST', {
        userId, // Include userId in the payload
        semesterName,
        courseName,
      });

      if (response && response.ok) {
        const data = await response.json();
        const updatedSemesters = semesters.map((semester, index) => {
          if (index === semesterIndex) {
            document.getElementById(`new-course-${semesterIndex}`).value = '';
            return {
              ...semester,
              courses: [...semester.courses, { id: data.courseId, name: courseName, status: 'No Cursado' }],
            };
          }
          return semester;
        });
        setSemesters(updatedSemesters);
      } else {
        alert('Failed to add course');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add course');
    }
  };

  const addSemester = async () => {
    const newSemesterNumber = semesters.length + 1;
    const newSemesterName = `Semestre ${newSemesterNumber}`;
    
    try {
      const response = await apiCall('http://localhost:5000/add-semester', 'POST', {
        userId: localStorage.getItem('userId'),
        semesterName: newSemesterName,
      });
      
      const data = await response.json();
      const updatedSemesters = [...semesters, { 
        id: data.semesterId,
        name: newSemesterName, 
        courses: [] 
      }];
      setSemesters(updatedSemesters);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add semester');
    }
  };

  const removeSemester = async (semesterIndex) => {
    const semesterToRemove = semesters[semesterIndex];
    try {
      await apiCall('http://localhost:5000/remove-semester', 'POST', {
        userId: localStorage.getItem('userId'),
        semesterId: semesterToRemove.id
      });
      const updatedSemesters = semesters.filter((_, index) => index !== semesterIndex);
      setSemesters(updatedSemesters);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove semester');
    }
  };

  return (
    <div onClick={handleClickOutside}>
      <h1>Tu Pénsum</h1>
      <div className="pensum-container">
        <main className="pensum">
          {semesters.map((semester, semesterIndex) => (
            <Semester
              key={semester.name}
              semester={semester}
              semesterIndex={semesterIndex}
              removeSemester={removeSemester}
              addCourse={addCourse}
              handleRightClick={handleRightClick}
              handleCourseClick={handleCourseClick}
            />
          ))}
          
            <button className="add-semester" onClick={addSemester}>Añadir Semestre</button>
          
        </main>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRemove={handleRemove}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default Pensum;
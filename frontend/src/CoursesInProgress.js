import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoursesInProgress.css';

const CoursesInProgress = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await fetch(`http://44.192.37.146:5000/pensum/${userId}`);
        const data = await response.json();
        if (response.ok) {
          const inProgressCourses = data.semesters.flatMap(semester =>
            semester.courses.filter(course => course.status === 'Cursando')
          );

          // Fetch assignments for each course and calculate the current grade
          const coursesWithGrades = await Promise.all(inProgressCourses.map(async (course) => {
            const assignmentsResponse = await fetch(`http://44.192.37.146:5000/assignments/${course.id}?userId=${userId}`);
            const assignmentsData = await assignmentsResponse.json();
            if (assignmentsResponse.ok) {
              const totalWeight = assignmentsData.assignments.reduce((sum, assignment) => sum + assignment.weight, 0);
              const totalGrade = assignmentsData.assignments.reduce((sum, assignment) => sum + (assignment.weight * assignment.grade / 100), 0);
              const currentGrade = totalWeight > 0 ? (totalGrade / totalWeight) * 100 : 0;
              return { ...course, currentGrade: currentGrade.toFixed(2) };
            }
            return course;
          }));

          setCourses(coursesWithGrades);
        } else {
          alert(data.error || 'Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/assignments/${courseId}`);
  };

  return (
    <div className="courses-in-progress">
      <h1>Cursos en Progreso</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id} onClick={() => handleCourseClick(course.id)}>
            <span className="course-name">{course.name}</span>
            <span className="course-grade">Current Grade: {course.currentGrade}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoursesInProgress;
// Semester.js
import React from 'react';
import Course from './Course';

const Semester = ({ semester, semesterIndex, removeSemester, addCourse, handleRightClick, handleCourseClick }) => (
  <div key={semester.id} className="semester">
    <h2>{semester.name}</h2>
    <button onClick={() => removeSemester(semesterIndex)}>Eliminar Semestre</button>
    <div className="courses">
      {semester.courses.map(course => (
        <Course
          key={course.id}
          course={course}
          semesterIndex={semesterIndex}
          handleRightClick={handleRightClick}
          handleCourseClick={handleCourseClick}
        />
      ))}
    </div>
    <div className="add-course">
      <input type="text" id={`new-course-${semesterIndex}`} placeholder="Nombre" />
      <button onClick={() => addCourse(semesterIndex, document.getElementById(`new-course-${semesterIndex}`).value)}>
        Añadir Curso
      </button>
    </div>
  </div>
);

export default Semester;
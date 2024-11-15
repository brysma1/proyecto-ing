import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Assignments.css';

const Assignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [newAssignment, setNewAssignment] = useState({ name: '', weight: '', grade: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/assignments/${courseId}?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setAssignments(data.assignments);
        setCourseName(data.courseName); // Set the course name
      } else {
        alert(data.error || 'Failed to fetch assignments');
      }
    };

    fetchAssignments();
  }, [courseId]);

  const handleAddAssignment = async () => {
    const userId = localStorage.getItem('userId');
    const response = await fetch('http://localhost:5000/add-assignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        courseId,
        name: newAssignment.name,
        weight: newAssignment.weight,
        grade: newAssignment.grade,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setAssignments([...assignments, { ...newAssignment, id: data.assignmentId }]);
      setNewAssignment({ name: '', weight: '', grade: '' });
    } else {
      alert(data.error || 'Failed to add assignment');
    }
  };

  const handleUpdateAssignment = async (id, field, value) => {
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === id ? { ...assignment, [field]: value } : assignment
    );
    setAssignments(updatedAssignments);

    const updatedAssignment = updatedAssignments.find(assignment => assignment.id === id);

    const response = await fetch(`http://localhost:5000/update-assignment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAssignment),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Failed to update assignment');
    }
  };

  const calculateEffectiveGrade = (weight, grade) => {
    return (weight * grade) / 100;
  };

  const totalWeight = parseFloat(assignments.reduce((sum, assignment) => sum + assignment.weight, 0));
  const totalEffectiveGrade = assignments.reduce((sum, assignment) => sum + calculateEffectiveGrade(assignment.weight, assignment.grade), 0);

  return (
    <div className="assignments-page">
      <h1>{courseName}</h1>
      <button onClick={() => navigate('/')}>Regresar</button>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="weight">Peso</th>
            <th className="grade">Nota</th>
            <th>Nota Efectiva</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, index) => (
            <tr key={index}>
              <td>{assignment.name}</td>
              <td className="weight weight-input-wrapper">
                <input
                  type="number"
                  value={assignment.weight}
                  onChange={(e) => handleUpdateAssignment(assignment.id, 'weight', e.target.value)}
                  onFocus={(e) => e.target.parentElement.classList.add('focused')}
                  onBlur={(e) => e.target.parentElement.classList.remove('focused')}
                />
              </td>
              <td className="grade">
                <input
                  type="number"
                  value={assignment.grade}
                  onChange={(e) => handleUpdateAssignment(assignment.id, 'grade', e.target.value)}
                />
              </td>
              <td className="effective-grade">{calculateEffectiveGrade(assignment.weight, assignment.grade).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="assignments-footer">
          <tr>
            <td><strong>Total</strong></td>
            <td className="weight"><strong>{totalWeight} %</strong></td>
            <td className="grade"><strong>Nota Acumulada</strong></td>
            <td className="effective-grade"><strong>{totalEffectiveGrade.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      <div className="form-container">
        <input
          type="text"
          placeholder="Concepto"
          value={newAssignment.name}
          onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
        />
        <div className="weight-input-wrapper">
          <input
            type="number"
            placeholder="Peso"
            value={newAssignment.weight}
            onChange={(e) => setNewAssignment({ ...newAssignment, weight: e.target.value })}
            onFocus={(e) => e.target.parentElement.classList.add('focused')}
            onBlur={(e) => e.target.parentElement.classList.remove('focused')}
          />
        </div>
        <input
          type="number"
          placeholder="Nota"
          className='input-grade'
          value={newAssignment.grade}
          onChange={(e) => setNewAssignment({ ...newAssignment, grade: e.target.value })}
        />
        <button onClick={handleAddAssignment}>Añadir Nota</button>
      </div>
    </div>
  );
};

export default Assignments;
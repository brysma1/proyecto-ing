import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pensum from './Pensum';
import './Home.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [semesters, setSemesters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchPensum = async () => {
      try {
        const response = await fetch(`http://35.170.26.81:5000/pensum/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setSemesters(data.semesters);
        } else {
          alert(data.error || 'Failed to fetch pensum');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch pensum');
      }
    };

    fetchPensum();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="home-page">
      <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      <Pensum semesters={semesters} setSemesters={setSemesters} />
      <Link to="/courses-in-progress">Ver Cursos en Progreso</Link> {/* Add the link */}
    </div>
  );
};

export default HomePage;
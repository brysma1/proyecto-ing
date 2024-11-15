import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Assignments from './Assignments';
import CoursesInProgress from './CoursesInProgress'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/assignments/:courseId" element={<Assignments />} />
        <Route path="/courses-in-progress" element={<CoursesInProgress />} />
      </Routes>
    </Router>
  );
}

export default App;

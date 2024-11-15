const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');

  // Read and execute the init.sql file
  const initSqlPath = path.join(__dirname, 'init.sql');
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  const sqlCommands = initSql.split(';').filter(cmd => cmd.trim() !== '');

  sqlCommands.forEach((command) => {
    db.query(command, (err, results) => {
      if (err) throw err;
      console.log('Executed command:', command);
    });
  });

  console.log('Database initialized');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User registered', userId: results.insertId });
    }
  );
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
      const user = results[0];
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      res.json({ message: 'Login successful', userId: user.id });
    }
  );
});

app.post('/add-pensum', (req, res) => {
  const { userId, semesters } = req.body;

  semesters.forEach((semester) => {
    db.query(
      'INSERT INTO semesters (name, user_id) VALUES (?, ?)',
      [semester.name, userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const semesterId = results.insertId;

        semester.courses.forEach((course) => {
          db.query(
            'INSERT INTO courses (name, status, semester_id) VALUES (?, ?, ?)',
            [course.name, course.status, semesterId],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
            }
          );
        });
      }
    );
  });

  res.status(201).json({ message: 'Pensum added successfully' });
});

app.post('/add-course', (req, res) => {
  const { userId, semesterName, courseName } = req.body;

  console.log('Received add-course request:', { userId, semesterName, courseName });

  db.query(
    'SELECT id FROM semesters WHERE user_id = ? AND name = ?',
    [userId, semesterName],
    (err, results) => {
      if (err) {
        console.error('Error querying semesters:', err);
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        console.log('Semester not found:', { userId, semesterName });
        return res.status(404).json({ error: 'Semester not found' });
      }

      const semesterId = results[0].id;
      db.query(
        'INSERT INTO courses (name, status, semester_id) VALUES (?, ?, ?)',
        [courseName, 'No Cursado', semesterId],
        (err, results) => {
          if (err) {
            console.error('Error inserting course:', err);
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ message: 'Course added successfully', courseId: results.insertId });
        }
      );
    }
  );
});

app.post('/remove-course', (req, res) => {
  const { userId, semesterName, courseName } = req.body;

  db.query(
    'SELECT id FROM semesters WHERE user_id = ? AND name = ?',
    [userId, semesterName],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Semester not found' });

      const semesterId = results[0].id;
      db.query(
        'DELETE FROM courses WHERE name = ? AND semester_id = ?',
        [courseName, semesterId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(200).json({ message: 'Course removed successfully' });
        }
      );
    }
  );
});

app.post('/remove-semester', (req, res) => {
  const { userId, semesterId } = req.body;

  // First verify the semester belongs to the user
  db.query(
    'SELECT id FROM semesters WHERE id = ? AND user_id = ?',
    [semesterId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Semester not found' });

      // Then delete the semester
      db.query(
        'DELETE FROM semesters WHERE id = ? AND user_id = ?',
        [semesterId, userId],
        (err, deleteResult) => {
          if (err) return res.status(500).json({ error: err.message });
          if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Semester not found' });
          }
          res.status(200).json({ message: 'Semester removed successfully' });
        }
      );
    }
  );
});

app.delete('/remove-semester', (req, res) => {
  const { userId, semesterId } = req.body;

  // First verify the semester belongs to the user
  db.query(
    'SELECT id FROM semesters WHERE id = ? AND user_id = ?',
    [semesterId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Semester not found' });

      // Then delete the semester
      db.query(
        'DELETE FROM semesters WHERE id = ? AND user_id = ?',
        [semesterId, userId],
        (err, deleteResult) => {
          if (err) return res.status(500).json({ error: err.message });
          if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Semester not found' });
          }
          res.status(200).json({ message: 'Semester removed successfully' });
        }
      );
    }
  );
});

app.post('/add-semester', (req, res) => {
  const { userId, semesterName } = req.body;

  db.query(
    'INSERT INTO semesters (name, user_id) VALUES (?, ?)',
    [semesterName, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        message: 'Semester added successfully',
        semesterId: results.insertId,
        semesterName 
      });
    }
  );
});

app.post('/update-course-status', (req, res) => {
  const { userId, semesterName, courseName, status } = req.body;

  db.query(
    'SELECT id FROM semesters WHERE user_id = ? AND name = ?',
    [userId, semesterName],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Semester not found' });

      const semesterId = results[0].id;
      db.query(
        'UPDATE courses SET status = ? WHERE name = ? AND semester_id = ?',
        [status, courseName, semesterId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(200).json({ message: 'Course status updated successfully' });
        }
      );
    }
  );
});

app.get('/pensum/:userId', (req, res) => {
  const { userId } = req.params;

  db.query(
    'SELECT * FROM semesters WHERE user_id = ?',
    [userId],
    (err, semesters) => {
      if (err) return res.status(500).json({ error: err.message });

      const semesterIds = semesters.map(semester => semester.id);
      if (semesterIds.length === 0) {
        return res.json({ semesters: [] });
      }

      db.query(
        'SELECT * FROM courses WHERE semester_id IN (?)',
        [semesterIds],
        (err, courses) => {
          if (err) return res.status(500).json({ error: err.message });

          const semestersWithCourses = semesters.map(semester => ({
            ...semester,
            courses: courses.filter(course => course.semester_id === semester.id),
          }));

          res.json({ semesters: semestersWithCourses });
        }
      );
    }
  );
});

// Add assignment
app.post('/add-assignment', (req, res) => {
  const { userId, courseId, name, weight, grade } = req.body;

  db.query(
    'SELECT id FROM courses WHERE id = ? AND semester_id IN (SELECT id FROM semesters WHERE user_id = ?)',
    [courseId, userId], // Ensure courseId is used here
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Course not found' });

      const courseId = results[0].id;

      db.query(
        'INSERT INTO assignments (name, weight, grade, course_id) VALUES (?, ?, ?, ?)',
        [name, weight, grade, courseId],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Assignment added successfully', assignmentId: results.insertId });
        }
      );
    }
  );
});

// Get assignments for a course
app.get('/assignments/:courseId', (req, res) => {
  const { courseId } = req.params;
  const userId = req.query.userId;

  db.query(
    'SELECT * FROM courses WHERE id = ? AND semester_id IN (SELECT id FROM semesters WHERE user_id = ?)',
    [courseId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Course not found or does not belong to the user' });

      const courseName = results[0].name; // Get the course name

      db.query(
        'SELECT * FROM assignments WHERE course_id = ?',
        [courseId],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(200).json({ assignments: results, courseName }); // Include the course name in the response
        }
      );
    }
  );
});

// Update assignment
app.put('/update-assignment/:id', (req, res) => {
  const { id } = req.params;
  const { name, weight, grade } = req.body;

  db.query(
    'UPDATE assignments SET name = ?, weight = ?, grade = ? WHERE id = ?',
    [name, weight, grade, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: 'Assignment updated successfully' });
    }
  );
});

// Delete assignment
app.delete('/delete-assignment/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM assignments WHERE id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: 'Assignment deleted successfully' });
    }
  );
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});

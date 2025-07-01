const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath);

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// API Routes

// Get all students by grade
app.get('/api/students/:grade', (req, res) => {
    const grade = req.params.grade;
    const today = getTodayDate();
    
    const query = `
        SELECT 
            s.id,
            s.name,
            s.grade,
            COALESCE(a.present, 0) as present_today
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
        WHERE s.grade = ?
        ORDER BY s.name
    `;
    
    db.all(query, [today, grade], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all students
app.get('/api/students', (req, res) => {
    const today = getTodayDate();
    
    const query = `
        SELECT 
            s.id,
            s.name,
            s.grade,
            COALESCE(a.present, 0) as present_today
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
        ORDER BY s.grade, s.name
    `;
    
    db.all(query, [today], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new student
app.post('/api/students', (req, res) => {
    const { name, grade } = req.body;
    
    if (!name || !grade) {
        res.status(400).json({ error: 'Name and grade are required' });
        return;
    }
    
    const query = 'INSERT INTO students (name, grade) VALUES (?, ?)';
    
    db.run(query, [name, grade], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, grade });
    });
});

// Toggle attendance for a student
app.post('/api/attendance/toggle', (req, res) => {
    const { student_id, date } = req.body;
    const attendanceDate = date || getTodayDate();
    
    if (!student_id) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
    }
    
    // First, check if attendance record exists
    const checkQuery = 'SELECT present FROM attendance WHERE student_id = ? AND date = ?';
    
    db.get(checkQuery, [student_id, attendanceDate], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row) {
            // Update existing record
            const newPresent = row.present ? 0 : 1;
            const updateQuery = 'UPDATE attendance SET present = ? WHERE student_id = ? AND date = ?';
            
            db.run(updateQuery, [newPresent, student_id, attendanceDate], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ student_id, date: attendanceDate, present: newPresent });
            });
        } else {
            // Insert new record (default to present)
            const insertQuery = 'INSERT INTO attendance (student_id, date, present) VALUES (?, ?, 1)';
            
            db.run(insertQuery, [student_id, attendanceDate], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ student_id, date: attendanceDate, present: 1 });
            });
        }
    });
});

// Get attendance history for a student
app.get('/api/attendance/student/:id', (req, res) => {
    const studentId = req.params.id;
    
    const query = `
        SELECT 
            a.date,
            a.present,
            s.name,
            s.grade
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC
        LIMIT 30
    `;
    
    db.all(query, [studentId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get attendance report for a specific date
app.get('/api/attendance/date/:date', (req, res) => {
    const date = req.params.date;
    
    const query = `
        SELECT 
            s.id,
            s.name,
            s.grade,
            COALESCE(a.present, 0) as present
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
        ORDER BY s.grade, s.name
    `;
    
    db.all(query, [date], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get attendance statistics
app.get('/api/attendance/stats', (req, res) => {
    const query = `
        SELECT 
            s.grade,
            COUNT(s.id) as total_students,
            COUNT(CASE WHEN a.present = 1 THEN 1 END) as present_today,
            COUNT(CASE WHEN a.present = 0 THEN 1 END) as absent_today
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
        GROUP BY s.grade
        ORDER BY s.grade
    `;
    
    db.all(query, [getTodayDate()], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to run "npm run init-db" first to initialize the database');
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
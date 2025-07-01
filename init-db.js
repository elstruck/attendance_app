const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
    // Students table
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Attendance table
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date DATE NOT NULL,
        present BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students (id),
        UNIQUE(student_id, date)
    )`);

    // Insert hardcoded students from the original app
    const students = [
        // 3rd Grade
        ['Adalynn', '3rd'], ['Antonio', '3rd'], ['Austin', '3rd'], ['Ava', '3rd'],
        ['Cameron', '3rd'], ['Cash', '3rd'], ['Cooper', '3rd'], ['Emily', '3rd'],
        ['Ethan', '3rd'], ['Gracie', '3rd'], ['Jackson', '3rd'], ['Jayden', '3rd'],
        ['Jonah', '3rd'], ['Lakyn', '3rd'], ['Lexi', '3rd'], ['Lillian', '3rd'],
        ['Lyric', '3rd'], ['Madeleine', '3rd'], ['Mahi', '3rd'], ['Nathan', '3rd'],
        ['Noah', '3rd'], ['Noelle', '3rd'], ['Nora', '3rd'], ['Raegan', '3rd'],
        ['Sophie', '3rd'], ['Tarek', '3rd'], ['Taryn', '3rd'], ['Wyatt', '3rd'], ['Zoe', '3rd'],
        
        // 4th Grade
        ['Alexandra', '4th'], ['Cole', '4th'], ['Daeven', '4th'], ['Ella', '4th'],
        ['Emily', '4th'], ['Fischer', '4th'], ['Haley', '4th'], ['Hannah', '4th'],
        ['Jadyn', '4th'], ['Jordan', '4th'], ['Joseph', '4th'], ['Kendall', '4th'],
        ['Liliana', '4th'], ['Maren', '4th'], ['Michael', '4th'], ['Natalie', '4th'],
        ['Savannah', '4th'], ['Tanyan', '4th'], ['Taylor', '4th'],
        
        // 5th Grade
        ['Alexis', '5th'], ['Anna', '5th'], ['Asia', '5th'], ['Ava', '5th'],
        ['Brendan', '5th'], ['Bryce', '5th'], ['Caitlyn', '5th'], ['Calan', '5th'],
        ['Camille', '5th'], ['Dominic', '5th'], ['Elijah', '5th'], ['Eliza', '5th'],
        ['Hayden', '5th'], ['Jack', '5th'], ['Jossalyn', '5th'], ['Karlie', '5th'],
        ['Kathie', '5th'], ['Kenadee', '5th'], ['Kinsey', '5th'], ['Landon', '5th'],
        ['Leah', '5th'], ['Lexi', '5th'], ['Madalyn', '5th'], ['Natalie', '5th'],
        ['Nicole', '5th'], ['Nolan', '5th'], ['Rylee', '5th'], ['Sarah', '5th'],
        ['Sergio', '5th'], ['Shannon', '5th'], ['Sydney', '5th']
    ];

    const insertStudent = db.prepare("INSERT OR IGNORE INTO students (name, grade) VALUES (?, ?)");
    
    students.forEach(student => {
        insertStudent.run(student[0], student[1]);
    });
    
    insertStudent.finalize();

    console.log('Database initialized successfully!');
    console.log(`Students table created with ${students.length} students`);
    console.log('Attendance table created for tracking daily attendance');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
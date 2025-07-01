# ADES Chorus Attendance System

A modern web-based attendance tracking system for the ADES Chorus program, built with SQLite database backend for persistent data storage and attendance history tracking.

## Features

- **SQLite Database Backend**: All student data and attendance records are stored in a persistent SQLite database
- **Attendance History**: Track attendance for each student across multiple dates
- **Real-time Statistics**: View attendance percentages and summaries by grade level
- **Date Selection**: View and manage attendance for any date
- **Student Management**: Add new students to any grade level
- **Responsive Design**: Works on desktop and mobile devices
- **Intuitive Interface**: Click to toggle attendance status with visual feedback

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize the Database**
   ```bash
   npm run init-db
   ```
   This will create the SQLite database and populate it with all the existing students from the original app.

3. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and go to: `http://localhost:3000`

## Usage

### Taking Attendance

1. **Select Date**: Use the date picker at the top to select the date for attendance (defaults to today)
2. **Toggle Attendance**: Click on any student's row to toggle their attendance status
   - Green background = Present
   - Gray background = Absent
3. **View Statistics**: The attendance summary shows real-time statistics for each grade and overall

### Managing Students

1. **Add New Student**: 
   - Click on any grade tab title to open the admin menu
   - Fill in the student name and select their grade
   - Click "Add Student"

2. **View History**: Click "View Full Report" to see a detailed attendance report for the selected date

### Features

- **Persistent Data**: All attendance data is automatically saved to the SQLite database
- **History Tracking**: Every attendance record is preserved, allowing you to view attendance for any past date
- **Statistics**: Real-time calculation of attendance percentages by grade and overall
- **Responsive Design**: Works well on tablets and mobile devices for easy use during classes

## Database Schema

The system uses two main tables:

### Students Table
- `id`: Unique identifier for each student
- `name`: Student's full name
- `grade`: Grade level (3rd, 4th, 5th)
- `created_at`: When the student was added to the system

### Attendance Table
- `id`: Unique identifier for each attendance record
- `student_id`: References the student
- `date`: Date of attendance (YYYY-MM-DD format)
- `present`: Boolean indicating if student was present (1) or absent (0)
- `created_at`: When the attendance record was created

## API Endpoints

The system provides a REST API for integration with other systems:

- `GET /api/students/:grade` - Get all students for a specific grade
- `GET /api/students` - Get all students
- `POST /api/students` - Add a new student
- `POST /api/attendance/toggle` - Toggle attendance for a student
- `GET /api/attendance/student/:id` - Get attendance history for a student
- `GET /api/attendance/date/:date` - Get attendance report for a specific date
- `GET /api/attendance/stats` - Get attendance statistics

## File Structure

```
├── server.js              # Express server with API endpoints
├── init-db.js            # Database initialization script
├── package.json          # Node.js dependencies and scripts
├── attendance.db         # SQLite database (created after init-db)
└── public/              # Frontend files
    ├── index.html        # Main HTML interface
    ├── attendance_app.js # Frontend JavaScript
    └── attendance_app.css # Styling
```

## Migration from Original System

The new system automatically imports all students from the original hardcoded data:

**3rd Grade**: 29 students (Adalynn, Antonio, Austin, Ava, Cameron, Cash, Cooper, Emily, Ethan, Gracie, Jackson, Jayden, Jonah, Lakyn, Lexi, Lillian, Lyric, Madeleine, Mahi, Nathan, Noah, Noelle, Nora, Raegan, Sophie, Tarek, Taryn, Wyatt, Zoe)

**4th Grade**: 19 students (Alexandra, Cole, Daeven, Ella, Emily, Fischer, Haley, Hannah, Jadyn, Jordan, Joseph, Kendall, Liliana, Maren, Michael, Natalie, Savannah, Tanyan, Taylor)

**5th Grade**: 31 students (Alexis, Anna, Asia, Ava, Brendan, Bryce, Caitlyn, Calan, Camille, Dominic, Elijah, Eliza, Hayden, Jack, Jossalyn, Karlie, Kathie, Kenadee, Kinsey, Landon, Leah, Lexi, Madalyn, Natalie, Nicole, Nolan, Rylee, Sarah, Sergio, Shannon, Sydney)

## Benefits of the New System

1. **Data Persistence**: No more losing attendance data when the browser is closed
2. **Historical Records**: Track attendance patterns over time
3. **Scalability**: Easy to add new students and grades
4. **Reporting**: Generate attendance reports for any date range
5. **Backup**: SQLite database can be easily backed up and restored
6. **Multi-user**: Multiple teachers can use the system simultaneously
7. **Professional**: Modern, responsive interface suitable for school use

## Troubleshooting

- **Database Issues**: If you encounter database errors, try running `npm run init-db` again
- **Port Conflicts**: If port 3000 is in use, set the PORT environment variable: `PORT=8080 npm start`
- **Missing Students**: If students are missing, check that the database was properly initialized

## Support

For technical support or feature requests, please refer to the system administrator or create an issue in the project repository.


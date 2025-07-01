// Global variables
let currentDate = new Date().toISOString().split('T')[0];
let students = {
    '3rd': [],
    '4th': [],
    '5th': []
};

// Initialize the app when DOM is ready
$(document).ready(function() {
    $("#tabs").tabs();
    
    // Set up event handlers
    setupEventHandlers();
    
    // Load initial data
    loadAllStudents();
    loadAttendanceStats();
    
    // Set today's date in date picker
    $('#date-picker').val(currentDate);
});

function setupEventHandlers() {
    // Tab click handlers for admin menus
    $('#title1').click(() => toggleMenu('hidden1'));
    $('#title2').click(() => toggleMenu('hidden2'));
    $('#title3').click(() => toggleMenu('hidden3'));
    
    // Date picker change handler
    $('#date-picker').change(function() {
        currentDate = $(this).val();
        loadAllStudents();
        loadAttendanceStats();
    });
    
    // Refresh button handler
    $('.refresh-btn').click(() => {
        loadAllStudents();
        loadAttendanceStats();
    });
    
    // Add student form handlers
    $('#add-student-form').submit(handleAddStudent);
    
    // View history button handler
    $('.view-history-btn').click(showAttendanceHistory);
}

function toggleMenu(menuId) {
    $('#' + menuId).fadeToggle();
}

// Load all students from the database
async function loadAllStudents() {
    try {
        showLoading();
        
        // Load students for each grade
        const grades = ['3rd', '4th', '5th'];
        const promises = grades.map(grade => 
            fetch(`/api/students/${grade}?date=${currentDate}`)
                .then(response => response.json())
        );
        
        const results = await Promise.all(promises);
        
        grades.forEach((grade, index) => {
            students[grade] = results[index];
            renderStudentTable(grade, results[index]);
        });
        
        hideLoading();
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students');
    }
}

// Render student table for a specific grade
function renderStudentTable(grade, studentList) {
    const tableId = grade === '3rd' ? 'result1' : 
                   grade === '4th' ? 'result2' : 'result3';
    
    let html = '';
    
    if (studentList.length === 0) {
        html = '<tr><td colspan="2">No students found</td></tr>';
    } else {
        studentList.forEach(student => {
            const presentClass = student.present_today ? 'present' : '';
            const statusText = student.present_today ? 'Present' : 'Absent';
            
            html += `
                <tr class="${presentClass}" data-student-id="${student.id}" onclick="toggleAttendance(${student.id}, '${student.name}')">
                    <td>${student.name}</td>
                    <td>${statusText}</td>
                </tr>
            `;
        });
    }
    
    $(`#${tableId}`).html(html);
}

// Toggle attendance for a student
async function toggleAttendance(studentId, studentName) {
    try {
        const response = await fetch('/api/attendance/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                student_id: studentId,
                date: currentDate
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update attendance');
        }
        
        const result = await response.json();
        
        // Update the UI immediately
        const row = $(`tr[data-student-id="${studentId}"]`);
        if (result.present) {
            row.addClass('present');
            row.find('td:last').text('Present');
        } else {
            row.removeClass('present');
            row.find('td:last').text('Absent');
        }
        
        // Refresh stats
        loadAttendanceStats();
        
    } catch (error) {
        console.error('Error toggling attendance:', error);
        showError(`Failed to update attendance for ${studentName}`);
    }
}

// Load and display attendance statistics
async function loadAttendanceStats() {
    try {
        const response = await fetch('/api/attendance/stats');
        const stats = await response.json();
        
        let statsHtml = '<h3>Today\'s Attendance Summary</h3><div class="stats-grid">';
        
        let totalStudents = 0;
        let totalPresent = 0;
        
        stats.forEach(grade => {
            totalStudents += grade.total_students;
            totalPresent += grade.present_today;
            
            const presentPercent = grade.total_students > 0 ? 
                Math.round((grade.present_today / grade.total_students) * 100) : 0;
            
            statsHtml += `
                <div class="stat-card">
                    <div class="stat-number">${grade.present_today}/${grade.total_students}</div>
                    <div class="stat-label">${grade.grade} Grade (${presentPercent}%)</div>
                </div>
            `;
        });
        
        const overallPercent = totalStudents > 0 ? 
            Math.round((totalPresent / totalStudents) * 100) : 0;
        
        statsHtml += `
            <div class="stat-card">
                <div class="stat-number">${totalPresent}/${totalStudents}</div>
                <div class="stat-label">Overall (${overallPercent}%)</div>
            </div>
        `;
        
        statsHtml += '</div>';
        
        $('#attendance-stats').html(statsHtml);
        
    } catch (error) {
        console.error('Error loading stats:', error);
        $('#attendance-stats').html('<div class="error">Failed to load attendance statistics</div>');
    }
}

// Handle adding a new student
async function handleAddStudent(e) {
    e.preventDefault();
    
    const name = $('#student-name').val().trim();
    const grade = $('#student-grade').val();
    
    if (!name) {
        showError('Please enter a student name');
        return;
    }
    
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, grade })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add student');
        }
        
        const newStudent = await response.json();
        
        // Clear form
        $('#student-name').val('');
        $('#student-grade').val('3rd');
        
        // Refresh student list
        loadAllStudents();
        loadAttendanceStats();
        
        showSuccess(`${name} added successfully!`);
        
    } catch (error) {
        console.error('Error adding student:', error);
        showError('Failed to add student');
    }
}

// Show attendance history modal
async function showAttendanceHistory() {
    try {
        const response = await fetch(`/api/attendance/date/${currentDate}`);
        const attendance = await response.json();
        
        let historyHtml = `
            <div class="history-modal">
                <h3>Attendance History for ${currentDate}</h3>
                <div class="history-content">
        `;
        
        const grades = ['3rd', '4th', '5th'];
        grades.forEach(grade => {
            const gradeStudents = attendance.filter(s => s.grade === grade);
            if (gradeStudents.length > 0) {
                historyHtml += `<h4>${grade} Grade</h4><ul>`;
                gradeStudents.forEach(student => {
                    const status = student.present ? 'Present' : 'Absent';
                    const statusClass = student.present ? 'present' : 'absent';
                    historyHtml += `<li><span class="${statusClass}">${student.name}: ${status}</span></li>`;
                });
                historyHtml += '</ul>';
            }
        });
        
        historyHtml += `
                </div>
                <button onclick="closeHistoryModal()">Close</button>
            </div>
            <div class="modal-overlay" onclick="closeHistoryModal()"></div>
        `;
        
        $('body').append(historyHtml);
        
    } catch (error) {
        console.error('Error loading attendance history:', error);
        showError('Failed to load attendance history');
    }
}

function closeHistoryModal() {
    $('.history-modal, .modal-overlay').remove();
}

// Utility functions
function showLoading() {
    $('.result').html('<div class="loading">Loading students...</div>');
}

function hideLoading() {
    // Loading message will be replaced by student tables
}

function showError(message) {
    const errorHtml = `<div class="error">${message}</div>`;
    $('#error-container').html(errorHtml);
    setTimeout(() => {
        $('#error-container').html('');
    }, 5000);
}

function showSuccess(message) {
    const successHtml = `<div class="success" style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0;">${message}</div>`;
    $('#error-container').html(successHtml);
    setTimeout(() => {
        $('#error-container').html('');
    }, 3000);
}

// Export functions for global access
window.toggleAttendance = toggleAttendance;
window.closeHistoryModal = closeHistoryModal;
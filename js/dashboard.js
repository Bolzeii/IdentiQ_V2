// ==========================================
// ADMIN & EMPLOYEE DASHBOARD UTILS (js/dashboard.js)
// ==========================================
(function() {
    // --- Real-time Clock Header ---
    const clock = document.getElementById("currentTime");
    const date = document.getElementById("todayDate");

    function updateDateTime() {
        const now = new Date();
        if (clock) {
            clock.textContent = now.toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            });
        }
        if (date) {
            date.textContent = now.toDateString();
        }
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
})();

/**
 * Renders individual employee personal logs in employee_dashboard.html
 * Prevents 'undefined' display for Clock In / Clock Out timestamps.
 */
function renderPersonalLogs(logs) {
    const tableBody = document.getElementById("personalLogsBody");
    if (!tableBody) return;

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--sub);">No attendance records found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        // Fallback checks for clock_in and clock_out fields
        const clockIn = log.clock_in || log.clockIn || log.time || '--';
        const clockOut = log.clock_out || log.clockOut || '--';
        const status = log.status || 'Present';

        let badgeClass = 'status-present';
        if (status === 'Late') badgeClass = 'status-late';
        if (status === 'Clocked Out') badgeClass = 'status-clocked-out';

        return `
            <tr>
                <td>${log.date || '--'}</td>
                <td>${clockIn}</td>
                <td>${clockOut}</td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Fetch logs for logged-in employee on dashboard load
 */
async function loadEmployeeDashboard() {
    const activeUser = localStorage.getItem("employee_id");
    if (!activeUser) return;

    try {
        const response = await fetch(`/api/employee/records/${encodeURIComponent(activeUser)}`);
        const data = await response.json();
        if (response.ok && data.logs) {
            renderPersonalLogs(data.logs);
        }
    } catch (err) {
        console.error("Failed to load personal logs:", err);
    }
}

// Automatically attempt to render if running on the employee dashboard
document.addEventListener("DOMContentLoaded", () => {
    loadEmployeeDashboard();
});
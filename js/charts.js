// ==========================================
// DATA VISUALIZATION (js/charts.js)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = "#86868b"; // muted text

    // Keep active tracker references to prevent duplicate instance canvas errors
    let attendanceChartInstance = null;
    let weeklyChartInstance = null;

    function renderDynamicCharts() {
        // 1. Fetch live storage data array stream
        const storedLogs = localStorage.getItem("smartFaceData");
        const attendanceData = storedLogs ? JSON.parse(storedLogs) : [];

        // 2. Initialize distribution metrics
        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;

        attendanceData.forEach(record => {
            const statusClean = record.status.toLowerCase().trim();
            if (statusClean === "present") presentCount++;
            else if (statusClean === "late") lateCount++;
            else if (statusClean === "absent") absentCount++;
        });

        // Safe baseline fallbacks if database is brand new or clean
        if (attendanceData.length === 0) {
            presentCount = 87;
            lateCount = 8;
            absentCount = 5;
        }

        // 3. Render Doughnut Chart
        const attendanceCtx = document.getElementById("attendanceChart");
        if (attendanceCtx) {
            if (attendanceChartInstance) {
                attendanceChartInstance.destroy();
            }

            attendanceChartInstance = new Chart(attendanceCtx, {
                type: "doughnut",
                data: {
                    labels: ["Present", "Late", "Absent"],
                    datasets: [{
                        data: [presentCount, lateCount, absentCount],
                        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    cutout: "75%",
                    plugins: { legend: { position: "bottom" } }
                }
            });
        }

        // 4. Render Weekly Performance Bar Chart
        const weeklyCtx = document.getElementById("weeklyChart");
        if (weeklyCtx) {
            if (weeklyChartInstance) {
                weeklyChartInstance.destroy();
            }

            // Maps dynamic real-time changes to the current week's metric slot (e.g., Friday)
            const weeklyDataMatrix = [92, 94, 90, 88, presentCount + lateCount, 84];

            weeklyChartInstance = new Chart(weeklyCtx, {
                type: "bar",
                data: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    datasets: [{
                        label: "Employees Present",
                        data: weeklyDataMatrix,
                        backgroundColor: "#2563eb",
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }

    // Run initial visualization generation loop
    renderDynamicCharts();

    // 5. Reactive Cross-Tab Storage Event Sync
    window.addEventListener("storage", (event) => {
        if (event.key === "smartFaceData") {
            renderDynamicCharts();
        }
    });
});
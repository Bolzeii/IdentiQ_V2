// ==========================================
// MASTER FILTER ENGINE (js/admin.js)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize DOM Element References
    const searchInput = document.getElementById("searchInput");
    const employeeFilter = document.getElementById("employeeFilter");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const clearBtn = document.getElementById("clearFiltersBtn") || document.querySelector(".secondary-btn");
    const tableBody = document.getElementById("attendanceTableBody");

    // 2. Primary Filtering Execution Engine
    async function applyFilters() {
    if (!tableBody) return;

    try {
        const response = await fetch("/api/metrics");
        const serverData = await response.json();

        // Updates the modern dashboard metric blocks with actual cloud database numbers
        const presentEl = document.getElementById("presentCount");
        const absentEl = document.getElementById("absentCount");

        if (presentEl) presentEl.textContent = serverData.present;
        if (absentEl) absentEl.textContent = serverData.absent;

        const searchVal = searchInput?.value.toLowerCase().trim() || "";
        const statusVal = statusFilter?.value || "";

        const filteredData = serverData.logs.filter(record => {
            const matchesSearch = record.employee.toLowerCase().includes(searchVal);
            const matchesStatus = !statusVal || statusVal === "all" || record.status.toLowerCase() === statusVal.toLowerCase();
            return matchesSearch && matchesStatus;
        });

        renderFilteredTable(filteredData);
    } catch (err) {
        console.error("Failed fetching live cloud metrics:", err);
    }
}

    // ==========================================================
    // DYNAMIC METRIC ACCELERATOR COMPUTATION (js/admin.js)
    // ==========================================================
    function updateDashboardMetrics(dataArray) {
        // Query UI numerical DOM hook wrappers safely
        const totalScansEl = document.getElementById("totalScansMetric") || document.querySelector(".metric-card:nth-child(1) h3");
        const presentEl = document.getElementById("presentMetric") || document.querySelector(".metric-card:nth-child(2) h3");
        const lateEl = document.getElementById("lateMetric") || document.querySelector(".metric-card:nth-child(3) h3");
        const anomaliesEl = document.getElementById("anomalyMetric") || document.querySelector(".metric-card:nth-child(4) h3");

        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;

        dataArray.forEach(record => {
            const statusClean = record.status.toLowerCase().trim();
            if (statusClean === "present") presentCount++;
            else if (statusClean === "late") lateCount++;
            else if (statusClean === "absent") absentCount++;
        });

        // Safe design baseline initialization defaults if the clean system array is empty
        const totalScans = dataArray.length;

        // Render counters back directly to user view card layouts smoothly
        if (totalScansEl) totalScansEl.textContent = totalScans > 0 ? totalScans : "0";
        if (presentEl) presentEl.textContent = totalScans > 0 ? presentCount : "0";
        if (lateEl) lateEl.textContent = totalScans > 0 ? lateCount : "0";
        if (anomaliesEl) anomaliesEl.textContent = totalScans > 0 ? absentCount : "0";
    }

    // 3. Advanced Table Rendering With Spring Effects
    function renderFilteredTable(data) {
        tableBody.innerHTML = ""; // High performance clear

        if (data.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="5" class="empty-state" style="text-align: center; padding: 40px; color: var(--muted);">
                    <i class="fa-solid fa-face-frown" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    No attendance logs found matching current parameters.
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }

        data.forEach((record, index) => {
            const row = document.createElement("tr");
            
            // Add Apple-style spring entry micro-interaction classes
            row.className = "animated-row";
            row.style.setProperty('--row-index', index);

            row.innerHTML = `
                <td><strong>${record.employee}</strong></td>
                <td>${record.date}</td>
                <td>${record.clockIn}</td>
                <td>${record.clockOut}</td>
                <td>
                    <span class="status ${record.status.toLowerCase()}">
                        ${record.status}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. Reactive Event Listeners
    [searchInput, employeeFilter, statusFilter, dateFilter].forEach(element => {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    // Clear Filters Logic with Fluid Reset Motion
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (employeeFilter) employeeFilter.value = "All Employees";
            if (statusFilter) statusFilter.value = "All Statuses";
            if (dateFilter) dateFilter.value = "";
            
            // Return back to standard dataset
            applyFilters();
            
            if (typeof showToast === "function") {
                showToast("Filters successfully cleared", "success");
            }
        });
    }

    // Initial table paint compile cycle
    applyFilters();

    // 5. Cross-Tab Live Storage Update Hook
    window.addEventListener("storage", (event) => {
        if (event.key === "smartFaceData") {
            applyFilters();
        }
    });
});
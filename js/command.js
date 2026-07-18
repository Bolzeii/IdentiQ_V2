// ==========================================================
// ADVANCED COMMAND PALETTE CONTROLLER (js/command.js)
// ==========================================================
(function() {
    const overlay = document.getElementById("commandPalette");
    const input = document.getElementById("commandInput");
    const resultsContainer = document.querySelector(".command-results");
    
    if (!overlay || !input || !resultsContainer) return;

    let activeIndex = -1;

    // 1. Toggle Command Interface (CTRL + K & ESC)
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "k") {
            e.preventDefault();
            overlay.classList.add("show");
            input.value = "";
            filterCommands("");
            input.focus();
        }
        if (e.key === "Escape") {
            closePalette();
        }
    });

    // Close palette when clicking outside the box
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePalette();
    });

    function closePalette() {
        overlay.classList.remove("show");
        input.blur();
        activeIndex = -1;
    }

    // 2. Fuzzy Live Filtering Search Engine
    input.addEventListener("input", (e) => {
        filterCommands(e.target.value.toLowerCase().trim());
    });

    function filterCommands(query) {
        const items = resultsContainer.querySelectorAll(".command-item");
        let visibleItems = [];

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = "flex";
                item.classList.remove("active");
                visibleItems.push(item);
            } else {
                item.style.display = "none";
                item.classList.remove("active");
            }
        });

        activeIndex = -1;
        return visibleItems;
    }

    // 3. Arrow-Key and Enter Navigation Interceptor
    input.addEventListener("keydown", (e) => {
        const items = Array.from(resultsContainer.querySelectorAll(".command-item"))
                           .filter(item => item.style.display !== "none");

        if (items.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            highlightItem(items);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            highlightItem(items);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < items.length) {
                items[activeIndex].click();
            } else if (items.length > 0) {
                items[0].click(); // Select first item if nothing highlighted
            }
        }
    });

    function highlightItem(items) {
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add("active");
                item.scrollIntoView({ block: "nearest" });
            } else {
                item.classList.remove("active");
            }
        });
    }

    // 4. Action Registry Execution & CSV Export Generation Engine
    resultsContainer.querySelectorAll(".command-item").forEach(item => {
        item.addEventListener("click", () => {
            const command = item.dataset.command;
            executeCommand(command);
            closePalette();
        });
    });

    function executeCommand(action) {
        switch (action) {
            case "dashboard":
                window.scrollTo({ top: 0, behavior: "smooth" });
                break;
                
            case "employees":
                const tableSection = document.querySelector(".table-card") || document.getElementById("attendanceTableBody");
                tableSection?.scrollIntoView({ behavior: "smooth", block: "center" });
                break;
                
            case "theme":
                const themeBtn = document.getElementById("themeToggle");
                if (themeBtn) {
                    themeBtn.click();
                } else {
                    // Fallback theme execution toggler
                    const isDark = document.body.classList.toggle("dark");
                    localStorage.setItem("theme", isDark ? "dark" : "light");
                }
                break;
                
            case "export":
                exportAttendanceToCSV();
                break;
                
            default:
                console.warn(`Command action sequence [${action}] unrecognized.`);
        }
    }

    // High-Performance Client-Side CSV Serializer
    function exportAttendanceToCSV() {
        const storedLogs = localStorage.getItem("smartFaceData");
        const logs = storedLogs ? JSON.parse(storedLogs) : [];

        if (logs.length === 0) {
            if (typeof window.showToast === "function") {
                window.showToast("No attendance logs available to export.", "error");
            }
            return;
        }

        // Define headers matching data schema layout parameters
        const headers = ["Employee Name", "Date", "Clock In Time", "Clock Out Time", "Status"];
        
        // Compile records escaping punctuation strings safely
        const csvRows = [
            headers.join(","),
            ...logs.map(log => [
                `"${log.employee.replace(/"/g, '""')}"`,
                `"${log.date}"`,
                `"${log.clockIn}"`,
                `"${log.clockOut}"`,
                `"${log.status}"`
            ].join(","))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        
        // Create an ephemeral link node to safely trigger system document drop downloads
        const downloadLink = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 10);
        
        downloadLink.setAttribute("href", encodedUri);
        downloadLink.setAttribute("download", `SmartFace_Logs_${timestamp}.csv`);
        document.body.appendChild(downloadLink);
        
        downloadLink.click();
        document.body.removeChild(downloadLink);

        if (typeof window.showToast === "function") {
            window.showToast("CSV Log Export generated successfully.", "success");
        }
        
        // Push notice into the notification drawer architecture if hook is active
        if (typeof window.pushSystemNotification === "function") {
            window.pushSystemNotification(
                "Data Log Exported",
                "CSV spreadsheet document compiled and downloaded.",
                "fa-file-csv"
            );
        }
    }
})();
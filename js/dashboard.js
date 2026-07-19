// ==========================================
// ADMIN DASHBOARD UTILS (js/dashboard.js)
// ==========================================
(function() {
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
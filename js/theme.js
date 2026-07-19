// ==========================================
// THEME CONTROLLER (js/theme.js)
// ==========================================
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const themeBtn = document.getElementById("themeToggle");
        const body = document.body;
        
        // Check local storage for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            body.classList.add("dark");
            updateIcon(true);
        } else {
            body.classList.remove("dark");
            updateIcon(false);
        }

        themeBtn?.addEventListener("click", () => {
            const isDark = body.classList.toggle("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            updateIcon(isDark);
        });

        function updateIcon(isDark) {
            const icon = themeBtn?.querySelector("i");
            if (!icon) return;
            icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    });
})();
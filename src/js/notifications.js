// ==========================================================
// LIVE NOTIFICATION & REAL-TIME ALERTS MODULE (js/notifications.js)
// ==========================================================

// 1. Centralized Toast System (Safe to execute on any layout tab)
window.showToast = function(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast show";

    // Dynamic Color Mapping Tokens
    if (type === "success") {
        toast.style.background = "var(--success)";
    } else if (type === "error") {
        toast.style.background = "var(--danger)";
    } else if (type === "warning") {
        toast.style.background = "var(--warning)";
    }
    toast.style.color = "#fff";

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
};

// 2. Global Helper to Push Notifications from Anywhere (Scanner or Admin)
window.pushSystemNotification = function(title, msg, icon = "fa-bell") {
    const stored = localStorage.getItem("smartFaceNotifications");
    let notificationsList = stored ? JSON.parse(stored) : [];
    
    const newAlert = {
        id: Date.now(),
        icon: icon,
        title: title,
        msg: msg,
        time: "Just now"
    };
    
    notificationsList.unshift(newAlert);
    
    // Cap log size at 20 elements to optimize memory allocation structures
    if (notificationsList.length > 20) notificationsList.pop();
    
    localStorage.setItem("smartFaceNotifications", JSON.stringify(notificationsList));
    
    // Programmatically dispatch storage event locally if on the same tab
    window.dispatchEvent(new Event("storage"));
};

// 3. Reactive UI Renderer Engine
(function() {
    const panel = document.getElementById("notificationPanel");
    const bellBtn = document.getElementById("notificationBtn");
    const listContainer = document.getElementById("notificationList");
    const clearBtn = document.getElementById("clearNotifications");
    const badge = document.getElementById("notificationCount");

    // CRITICAL FRONTEND SAFETY CHECK:
    // Elements only exist on admin.html. Exit gracefully if evaluated on index.html.
    if (!panel || !bellBtn || !listContainer) return;

    function renderLiveNotifications() {
        const stored = localStorage.getItem("smartFaceNotifications");
        let alerts = stored ? JSON.parse(stored) : [];

        // Seed default baseline logs if database storage is fresh/empty
        if (alerts.length === 0 && !localStorage.getItem("notificationsInitiated")) {
            alerts = [
                { id: 1, icon: "fa-camera", title: "System Online", msg: "Biometric framework matching runtime active", time: "10m ago" },
                { id: 2, icon: "fa-cloud", title: "AWS Connection", msg: "Gateway endpoints secured successfully", time: "15m ago" }
            ];
            localStorage.setItem("smartFaceNotifications", JSON.stringify(alerts));
            localStorage.setItem("notificationsInitiated", "true");
        }

        listContainer.innerHTML = "";

        if (alerts.length === 0) {
            listContainer.innerHTML = `
                <p style="padding: 32px; text-align: center; color: var(--muted); font-size: 14px;">
                    <i class="fa-solid fa-bell-slash" style="display:block; font-size: 20px; margin-bottom: 8px;"></i>
                    No new notifications
                </p>`;
            if (badge) badge.style.display = "none";
            return;
        }

        // Render Active Status Badge Counts
        if (badge) {
            badge.textContent = alerts.length;
            badge.style.display = "flex";
        }

        // Build HTML Elements
        alerts.forEach(item => {
            const htmlRow = `
            <div class="notification-item" style="animation: fadeIn 0.3s ease-out forwards;">
                <div class="notification-icon" style="color: var(--primary);">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="notification-content">
                    <h4 style="margin: 0 0 2px 0; font-size: 14px; color: var(--text);">${item.title}</h4>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: var(--muted); line-height: 1.4;">${item.msg}</p>
                    <small style="font-size: 10px; color: var(--primary); font-weight: 600;">${item.time}</small>
                </div>
            </div>`;
            listContainer.insertAdjacentHTML("beforeend", htmlRow);
        });
    }

    // Toggle Panel Open/Close Window Context
    bellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("show");
    });

    // Close panel automatically if user clicks focus away
    document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && e.target !== bellBtn) {
            panel.classList.remove("show");
        }
    });

    // Wipe Log Engine Clear Event
    clearBtn?.addEventListener("click", () => {
        localStorage.setItem("smartFaceNotifications", JSON.stringify([]));
        renderLiveNotifications();
    });

    // Run Initial Paint Compile Loop
    renderLiveNotifications();

    // 4. Multi-Tab Storage Listener
    window.addEventListener("storage", renderLiveNotifications);
})();
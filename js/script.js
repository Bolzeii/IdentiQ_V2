// ==========================================
// FACE CAPTURE & WEBCAM LOGIC (js/script.js)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Media Elements
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const captureBtn = document.getElementById("captureBtn");
    const cameraCard = document.querySelector(".camera-card");
    
    // Status & Clock Elements
    const liveTime = document.getElementById("liveTime");
    const liveDate = document.getElementById("liveDate");
    const recognitionStatus = document.getElementById("attendanceStatus") || document.getElementById("recognitionStatus");

    // Verification Matrix Elements
    const employeeName = document.getElementById("employeeName");
    const attendanceStatus = document.getElementById("attendanceStatus");
    const attendanceTime = document.getElementById("attendanceTime");
    const confidenceScore = document.getElementById("confidenceScore");

    // Live Date and Clock Update Engine
    function updateClock() {
        const now = new Date();
        if (liveTime) liveTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (liveDate) liveDate.textContent = now.toDateString();
    }

    // Camera Stream Management
    function startCamera() {
        if (!video) return;
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("Camera access blocked or unavailable:", err);
                if (statusEl) statusEl.textContent = "Camera Error";
            });
    }

   // ==========================================================
    // CLOUD PAYLOAD ENGINE & VERIFICATION CYCLE (js/script.js)
    // ==========================================================
    async function runEnhancedScannerCycle(imageBlob) {
    if (recognitionStatus) {
        recognitionStatus.textContent = "Scanning Engine Active...";
        recognitionStatus.style.color = "var(--warning)";
    }
    if (cameraCard) {
        cameraCard.style.boxShadow = "0 0 30px rgba(245, 158, 11, 0.4)";
    }

    // Pack the webcam image blob into the standard format the FastAPI backend expects
    const formData = new FormData();
    formData.append("file", imageBlob, "capture.jpg");

    try {
        // Send the image directly to your local FastAPI endpoint
        const response = await fetch("/api/capture", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Verification failed.");
        }

        const data = await response.json();

        // Dynamically update the Verification Matrix text fields on screen
        if (employeeName) employeeName.textContent = data.employee;
        if (attendanceTime) attendanceTime.textContent = data.time;
        if (confidenceScore) confidenceScore.textContent = data.confidence;
        if (attendanceStatus) attendanceStatus.textContent = data.status;

        if (recognitionStatus) {
            recognitionStatus.textContent = "Verified";
            recognitionStatus.style.color = "var(--success)";
        }
        if (cameraCard) cameraCard.style.boxShadow = "0 0 30px rgba(16, 185, 129, 0.5)";

        if (typeof window.showToast === "function") {
            window.showToast(`Welcome, ${data.employee}! Logged successfully.`, "success");
        }

    } catch (error) {
        console.error("Scanner Pipeline Error:", error.message);
        if (recognitionStatus) {
            recognitionStatus.textContent = "Failed";
            recognitionStatus.style.color = "var(--danger)";
        }
        if (cameraCard) cameraCard.style.boxShadow = "0 0 30px rgba(239, 68, 68, 0.5)";
        
        if (typeof window.showToast === "function") {
            window.showToast(error.message, "error");
        }
    } finally {
        // Staggered interface reset delay loop animation
        setTimeout(() => {
            if (cameraCard) cameraCard.style.boxShadow = "var(--shadow)";
            if (recognitionStatus) {
                recognitionStatus.textContent = "Waiting...";
                recognitionStatus.style.color = "var(--muted)";
            }
            if (captureBtn) {
                captureBtn.disabled = false;
                captureBtn.textContent = "Capture Face";
            }
        }, 3000);
    }
}

    function captureAndSend() {
        if (!video || !canvas) return;
        
        if (captureBtn) {
            captureBtn.disabled = true;
            captureBtn.textContent = "Extracting Frame Biometrics...";
        }

        const context = canvas.getContext("2d");
        canvas.width = 640;
        canvas.height = 480;
        
        // Draw the exact active video snapshot pixel layer onto the hidden canvas element
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Compress canvas pixels into a standard light weight production JPEG binary file blob
        canvas.toBlob((blob) => {
            if (blob) {
                console.log(`JPEG Binary Snapshot generated successfully. Size: ${(blob.size / 1024).toFixed(1)} KB`);
                // Run execution cycle passing the actual physical file data asset
                runEnhancedScannerCycle(blob);
            } else {
                console.error("Canvas file conversion compression critical failure.");
                if (captureBtn) {
                    captureBtn.disabled = false;
                    captureBtn.textContent = "Capture Face";
                }
            }
        }, "image/jpeg", 0.85); // 85% compression grade quality token balance optimization
    }

    // Initialization Call Engines
    startCamera();
    setInterval(updateClock, 1000);
    updateClock();

    captureBtn?.addEventListener("click", captureAndSend);
});
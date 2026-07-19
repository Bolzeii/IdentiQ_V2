// ==========================================
// SYSTEM BOOT LOADER (js/loader.js)
// ==========================================
(function() {
    const lines = [
        "✓ Camera Initialized",
        "✓ AWS Rekognition Connected",
        "✓ AWS Lambda Active",
        "✓ DynamoDB Connected",
        "✓ AI Recognition Engine Ready",
        "Launching Dashboard..."
    ];

    let i = 0;
    function typeLine() {
        const el = document.getElementById("line" + (i + 1));
        if (el && i < lines.length) {
            el.textContent = lines[i];
            i++;
            setTimeout(typeLine, 700);
        } else {
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        }
    }
    
    // Start typing on load
    window.addEventListener('load', typeLine);
})();
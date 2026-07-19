# IdentiQ V2 — Cloud-Native Biometric Onboarding & Analytics Suite

IdentiQ V2 is a secure, enterprise-grade cloud-native application engineered to manage workforce authentication streams and automated attendance indexing. The architecture utilizes a decoupled frontend schema to isolate edge biometric enrollment terminals from administrative monitoring panels, processing core operations through a scalable server-less engine integrated with Amazon Web Services (AWS).

---

## 🏗️ Architectural Topology & Decoupling Schema

The system layout is split into two distinct, sandboxed operations zones to prevent access token leaks and optimize field deployment viewports:

1. **Edge Biometric Registration Kiosk (`/register` & `/`):**
   * A standalone biometric intake terminal designed for zero-administrative exposure.
   * Built using fluid layout percentages and responsive CSS grid viewports optimized specifically for cross-device mobile field deployments and hardware kiosk integration.
   * Captures raw video frames via client-side device matrix hardware and pushes binary blobs to backend processing streams via payload multi-part extraction.

2. **Core Operations Management Dashboard (`/admin`):**
   * An isolated monitoring suite housing real-time present/absent workforce calculation grids.
   * Compiles interactive log filters allowing operational management to search specific employee identity strings, calendar dates, and advanced clock-in/clock-out signature states.
   * Features localized theme toggle engines and dynamic data exporters (CSV formatting framework).

---

## 🛠️ Technology Stack & Dependencies

### Frontend Layout Engine

* **Markup & UI Grid:** Responsive HTML5 structure leveraging the `Plus Jakarta Sans` typography framework.
* **Iconography Vector Layer:** FontAwesome v6.5.2 CDN engine.
* **Styling Framework:** Vanilla CSS3 featuring custom adaptive properties (`--bg`, `--panel`, `--border`) for automated hardware light/dark mode preference mapping.

### Backend Application Layer

* **Runtime Framework:** Python 3.x web server runtime engine (`server.py`).
* **Package Manifest:** Maintained strictly via automated dependency pip packaging matrices (`requirements.txt`).

### Cloud Infrastructure Layer (AWS Integration Architecture)

* **Amazon S3 (Simple Storage Service):** Houses compressed binary photographic identity assets uploaded from edge biometric intake matrices.
* **Amazon DynamoDB:** Key-value NOSQL relational data stream framework storing structural workforce index data profiles, active account indicators, and transactional clock-in logs.
* **Amazon Rekognition:** Computer vision engine processing face detection vector metrics, face matching analytics, and structure vector identification.

---

## 🚀 Local Installation & Deployment Configuration

### Prerequisites

* Python 3.8 or higher installed locally.
* AWS CLI configured with valid deployment IAM credentials.

### 1. Repository Setup & Virtual Environment Initialization

Clone the repository code assets and instantiate an isolated virtual execution environment container to eliminate dependency conflicts:

```bash
# Clone the repository
git clone [https://github.com/Bolzeii/IdentiQ_V2.git](https://github.com/Bolzeii/IdentiQ_V2.git)
cd "IdentiQ Final"

# Create and execute the virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

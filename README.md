# IdentiQ V2 — Cloud-Native Biometric Onboarding & Analytics Suite

IdentiQ V2 is a secure, enterprise-grade cloud-native application engineered to manage workforce authentication streams and automated attendance indexing. The architecture utilizes a client-isolated schema to separate edge enrollment utilities and employee workspaces from underlying background infrastructure, processing core operations through a scalable server-less engine integrated with Amazon Web Services (AWS).

---

## 🌐 Production Application Routings

### 🚀 Live Deployment Engine (Render URL)

* Main System Interface: [https://identiq-v2.onrender.com](https://identiq-v2.onrender.com)

### 🔗 End-User Interface Entry Points

* **Biometric Registration Kiosk:** [https://identiq-v2.onrender.com/register](https://identiq-v2.onrender.com/register)
* **Employee Authentication Portal:** [https://identiq-v2.onrender.com/employee_login](https://identiq-v2.onrender.com/employee_login)
* **Employee Management Workspace:** [https://identiq-v2.onrender.com/employee_dashboard](https://identiq-v2.onrender.com/employee_dashboard)

---

## 🏆 Core Innovations (What Makes IdentiQ V2 Special?)

Unlike standard systems, IdentiQ V2 introduces specific architectural enhancements designed for enterprise scaling and deployment convenience:

* **Zero-Trust Client Isolation:** The user-facing layers operate completely detached from structural data modification scripts. Front-line enrollment terminals and employee profiles have zero system visibility or connection routes to global data ledger paths.
* **Agile Kiosk Viewports:** The user interface features zero-loss responsiveness. Engineered using fluid percentages and responsive CSS media query breakpoints, the application layouts scale seamlessly down to mobile phone sizes without clipping or structural collisions, allowing immediate field deployments on standard mobile devices.
* **Cloud-Native Synergy:** The application relies entirely on scalable AWS serverless services rather than local hardware storage, minimizing local compute overhead and maximizing biometric validation speeds via computer vision pipelines.

---

## 🏗️ Functional Architecture & Operations Matrix

The platform provides two primary user-facing operational layers, designed to run seamlessly across hardware profiles:

1. **Edge Biometric Registration Kiosk (`/register` & `/`):**
   * **How it works:** This is a standalone intake terminal meant for public or field deployment. It initializes the client device's media hardware array (webcam/camera) directly inside the browser window.
   * **How to use it:** The user positions their face within the alignment viewport container and fills out their registration parameters. Upon execution, the frontend captures raw frame data, bundles it as a multi-part payload binary blob, and stream-pushes it securely to the cloud backend.

2. **Employee Self-Service Portal (`/employee_login` & `/employee_dashboard`):**
   * **How it works:** An isolated authentication and tracking workspace built specifically for workforce interactions.
   * **How to use it:** Employees authenticate through the secure gateway using their tracking credentials. Once verified, the dashboard fetches their distinct operational timeline—allowing them to review past automated biometric clock-in timestamps, apply for scheduling leave requests, or submit log discrepancy resolution tickets.

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

Clone the repository code assets and instantiate an isolated virtual execution environment container:

```bash
# Clone the repository
git clone [https://github.com/Bolzeii/IdentiQ_V2.git](https://github.com/Bolzeii/IdentiQ_V2.git)
cd "IdentiQ Final"

# Create and execute the virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

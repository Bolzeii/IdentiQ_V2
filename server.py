import uuid
import os
import csv
import io
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
import boto3

from backend.register_employee import register_employee_face
from backend.recognize_face import process_attendance

app = FastAPI(title="IdentiQ Biometric Ecosystem")

# --- Normalized Path Resolution ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "Templates_html")

os.makedirs("css", exist_ok=True)
os.makedirs("js", exist_ok=True)
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")

REGION = "ap-south-1"

try:
    import backend.config as aws_config
    s3_client = getattr(aws_config, "s3", None)
    rekognition = getattr(aws_config, "rekognition_client", None)
    attendance_table = getattr(aws_config, "attendance_table")
    employee_table = getattr(aws_config, "employees_table")
    tickets_table = getattr(aws_config, "tickets_table", boto3.resource("dynamodb", region_name=REGION).Table("IdentiQTickets"))
except Exception:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    attendance_table = dynamodb.Table("Attendance")
    employee_table = dynamodb.Table("Employees")
    tickets_table = dynamodb.Table("IdentiQTickets")  

# --- Page Navigation Routes ---

@app.get("/")
def common_portal(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "index.html"))

@app.get("/admin")
def admin_portal(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "admin.html"))

@app.get("/register")
def register_portal(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "register.html"))

@app.get("/admin/leaves")
def admin_leaves_page(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "admin_leaves.html"))

@app.get("/admin/resolutions")
def admin_resolutions_page(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "admin_resolutions.html"))

@app.get("/employee/login")
def employee_login(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "employee_login.html"))

@app.get("/employee/dashboard")
def employee_dashboard(): 
    return FileResponse(os.path.join(TEMPLATES_DIR, "employee_dashboard.html"))

# --- Employee Workspace & Tickets API ---

@app.post("/api/employee/login")
def api_employee_login(username: str = Form(...)):
    resp = employee_table.scan()
    user_match = next((e for e in resp.get("Items", []) if e.get('name', '').lower() == username.lower() or e.get('employee_id') == username), None)
    if user_match:
        return {"status": "success", "employee_id": user_match["employee_id"], "name": user_match["name"]}
    raise HTTPException(status_code=401, detail="Identity token not found.")

@app.get("/api/metrics")
def get_system_metrics():
    att_resp = attendance_table.scan()
    emp_resp = employee_table.scan()
    tick_resp = tickets_table.scan()  
    
    items = att_resp.get("Items", [])
    employees = emp_resp.get("Items", [])
    tickets = tick_resp.get("Items", [])
    
    today = datetime.now().strftime("%Y-%m-%d")
    emp_mapping = {e['employee_id']: e.get('name', e['employee_id']) for e in employees}
    valid_items = [i for i in items if i.get("employee_id") in emp_mapping]
    present_today = {i['employee_id'] for i in valid_items if i.get('date') == today}
    
    logs = [{
        "employee": emp_mapping.get(i["employee_id"], i["employee_id"]), 
        "date": i.get("date", ""), 
        "clockIn": i.get("clock_in", i.get("time", "--")), 
        "clockOut": i.get("clock_out", "--"), 
        "status": i.get("status", "Present")
    } for i in valid_items]
    
    leaves = [t for t in tickets if t.get("ticket_type") == "leave"]
    resolutions = [t for t in tickets if t.get("ticket_type") == "resolution"]
    
    return {
        "present": len(present_today), 
        "absent": max(0, len(employees) - len(present_today)), 
        "logs": logs, 
        "resolutions": resolutions, 
        "leaves": leaves
    }

@app.get("/api/employee/tickets/{employee_name}")
def get_employee_tickets(employee_name: str):
    tick_resp = tickets_table.scan()
    tickets = tick_resp.get("Items", [])
    user_leaves = [t for t in tickets if t.get("ticket_type") == "leave" and t.get("employee", "").lower() == employee_name.lower()]
    user_res = [t for t in tickets if t.get("ticket_type") == "resolution" and t.get("employee", "").lower() == employee_name.lower()]
    return {"leaves": user_leaves, "resolutions": user_res}

@app.post("/api/employee/submit-ticket")
def api_submit_ticket(ticket_type: str = Form(...), employee_name: str = Form(...), subject: str = Form(...), issue: str = Form(...)):
    ticket_id = f"{'LV' if ticket_type == 'leave' else 'RES'}-{uuid.uuid4().hex[:3].upper()}"
    payload = {
        "id": ticket_id, 
        "ticket_type": ticket_type,
        "employee": employee_name, 
        "subject": subject, 
        "issue": issue, 
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"), 
        "reply": "--"
    }
    tickets_table.put_item(Item=payload)
    return {"status": "success", "id": ticket_id}

@app.post("/api/admin/reply")
def api_admin_reply(ticket_id: str = Form(...), reply_text: str = Form(...)):
    try:
        tickets_table.update_item(
            Key={"id": ticket_id},
            UpdateExpression="SET reply = :r",
            ExpressionAttributeValues={":r": reply_text}
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Modification Fault: {str(e)}")

@app.get("/api/employee/records/{employee_id}")
def get_individual_records(employee_id: str):
    res = attendance_table.scan()
    items = [i for i in res.get("Items", []) if i.get("employee_id") == employee_id]
    return {"logs": items}

@app.get("/api/download-csv")
def export_csv_report():
    items = attendance_table.scan().get("Items", [])
    emps = employee_table.scan().get("Items", [])
    emp_mapping = {e['employee_id']: e.get('name', e['employee_id']) for e in emps}
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Employee Name", "Date", "Clock In", "Clock Out", "Status"])
    for i in items: 
        w.writerow([
            emp_mapping.get(i.get("employee_id"), i.get("employee_id")), 
            i.get("date",""), 
            i.get("clock_in", i.get("time", "--")), 
            i.get("clock_out","--"), 
            i.get("status","Present")
        ])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=IdentiQ_Report.csv"})

# --- Clean Biometric Capture & Registration APIs ---

@app.post("/api/register-employee")
async def register_endpoint(
    employee_id: str = Query(None),
    name: str = Query(...),
    file: UploadFile = File(...)
):
    # If no manual employee_id passed, fallback to generating one
    if not employee_id:
        employee_id = f"EMP_{uuid.uuid4().hex[:6].upper()}"
        
    image_bytes = await file.read()
    result = register_employee_face(image_bytes, employee_id, name)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
        
    return result

@app.post("/api/capture")
async def capture_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = process_attendance(image_bytes)
    
    if result.get("status") == "unauthorized":
        raise HTTPException(status_code=401, detail=result.get("message"))
    elif result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
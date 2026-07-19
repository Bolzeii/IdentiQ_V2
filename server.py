import uuid
import os
import csv
import io
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
import boto3

app = FastAPI(title="IdentiQ Biometric Ecosystem")

# --- Normalized Direct Path Resolution Matrix ---
# Explicitly targets the 'Templates_html' folder visible in your VS Code workspace
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "Templates_html")

os.makedirs("css", exist_ok=True)
os.makedirs("js", exist_ok=True)
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")

BUCKET_NAME = "smart-face-attendance-balaji-01"
REGION = "ap-south-1"

try:
    import backend.config as aws_config
    s3_client = getattr(aws_config, "s3")
    rekognition = getattr(aws_config, "rekognition")
    attendance_table = getattr(aws_config, "attendance_table")
    employee_table = getattr(aws_config, "employee_table")
    tickets_table = getattr(aws_config, "tickets_table", boto3.resource("dynamodb", region_name=REGION).Table("IdentiQTickets"))
    COLLECTION_ID = getattr(aws_config, "COLLECTION_ID", "employees")
except Exception:
    s3_client = boto3.client("s3", region_name=REGION)
    rekognition = boto3.client("rekognition", region_name=REGION)
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    attendance_table = dynamodb.Table("Attendance")
    employee_table = dynamodb.Table("Employees")
    tickets_table = dynamodb.Table("IdentiQTickets")  
    COLLECTION_ID = "employees"

# --- Secure Operational Layout Mappings ---
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

@app.post("/api/employee/login")
def api_employee_login(username: str = Form(...)):
    resp = employee_table.scan()
    user_match = next((e for e in resp.get("Items", []) if e['name'].lower() == username.lower() or e['employee_id'] == username), None)
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
        "employee": emp_mapping[i["employee_id"]], 
        "date": i.get("date", ""), 
        "clockIn": i.get("clock_in", "--"), 
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
    for i in items: w.writerow([emp_mapping.get(i.get("employee_id"), i.get("employee_id")), i.get("date",""), i.get("clock_in","--"), i.get("clock_out","--"), i.get("status","Present")])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=IdentiQ_Report.csv"})

@app.post("/api/capture")
async def process_capture(file: UploadFile = File(...)):
    temp = f"cap_{uuid.uuid4().hex[:6]}.jpg"
    try:
        with open(temp, "wb") as f: f.write(await file.read())
        s3_client.upload_file(temp, BUCKET_NAME, f"attendance/{temp}")
        response = rekognition.search_faces_by_image(CollectionId=COLLECTION_ID, Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": f"attendance/{temp}"}}, FaceMatchThreshold=85, MaxFaces=1)
        if not response["FaceMatches"]: raise HTTPException(status_code=404, detail="Identity unknown.")
        emp_id = response["FaceMatches"][0]["Face"]["ExternalImageId"]
        conf = round(response["FaceMatches"][0]["Similarity"], 1)
        emp_res = employee_table.get_item(Key={"employee_id": emp_id})
        name = emp_res.get("Item", {}).get("name", emp_id)
        today = datetime.now().strftime("%Y-%m-%d")
        now_time = datetime.now().strftime("%H:%M:%S")
        att_res = attendance_table.scan()
        existing = next((i for i in att_res.get("Items", []) if i["employee_id"] == emp_id and i["date"] == today), None)
        if not existing:
            status = "Late" if datetime.now().hour >= 9 else "Present"
            attendance_table.put_item(Item={"employee_id": emp_id, "date": today, "clock_in": now_time, "clock_out": "--", "status": status})
        else:
            status = "Clocked Out"
            attendance_table.update_item(Key={"employee_id": emp_id, "date": today}, UpdateExpression="SET clock_out = :t", ExpressionAttributeValues={":t": now_time})
        return {"employee": name, "time": now_time, "status": status, "confidence": f"{conf}%"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp): os.remove(temp)

@app.post("/api/register-employee")
async def api_register_employee(name: str, file: UploadFile = File(...)):
    emp_id = f"EMP_{uuid.uuid4().hex[:6].upper()}"
    temp_filename = f"reg_{uuid.uuid4().hex[:6]}.jpg"
    
    try:
        with open(temp_filename, "wb") as buffer:
            buffer.write(await file.read())
            
        s3_key = f"registered-faces/{temp_filename}"
        s3_client.upload_file(temp_filename, BUCKET_NAME, s3_key)
        
        rekognition.index_faces(
            CollectionId=COLLECTION_ID,
            Image={"S3Object": {"Bucket": BUCKET_NAME, "Name": s3_key}},
            ExternalImageId=emp_id,
            MaxFaces=1,
            QualityFilter="AUTO"
        )
        
        employee_table.put_item(
            Item={
                "employee_id": emp_id,
                "name": name,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        )
        
        return {"status": "success", "employee_id": emp_id, "name": name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration Matrix Failure: {str(e)}")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
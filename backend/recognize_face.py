from backend.config import rekognition_client, employees_table, attendance_table, COLLECTION_ID
from datetime import datetime

def process_attendance(image_bytes: bytes):
    """
    Searches AWS Rekognition collection for a face match.
    - First scan: Records 'clock_in' and sets status to Present/Late.
    - Second scan: Updates 'clock_out' and sets status to Clocked Out without losing 'clock_in'.
    """
    try:
        # 🔍 SEARCH ONLY - Does not index unknown faces
        response = rekognition_client.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': image_bytes},
            MaxFaces=1,
            FaceMatchThreshold=85.0
        )
        
        matches = response.get('FaceMatches', [])
        
        # 🔴 UNKNOWN / UNREGISTERED USER
        if not matches:
            return {
                "status": "unauthorized",
                "message": "Access Denied: Unrecognized face. Please register with HR first."
            }
            
        # 🟢 KNOWN EMPLOYEE
        matched_face = matches[0]
        employee_id = matched_face['Face']['ExternalImageId']
        confidence = matched_face['Similarity']
        
        # Fetch employee profile name
        emp_response = employees_table.get_item(Key={"employee_id": employee_id})
        emp_name = emp_response.get('Item', {}).get('name', employee_id)
        
        today_date = datetime.now().strftime("%Y-%m-%d")
        now_time = datetime.now().strftime("%H:%M:%S")
        
        # Check if user already clocked in today
        att_scan = attendance_table.scan()
        existing_log = next(
            (item for item in att_scan.get("Items", []) 
             if item.get("employee_id") == employee_id and item.get("date") == today_date), 
            None
        )
        
        # 1️⃣ FIRST SCAN OF THE DAY -> CLOCK IN
        if not existing_log:
            status_str = "Late" if datetime.now().hour >= 9 else "Present"
            
            attendance_table.put_item(
                Item={
                    "employee_id": employee_id,
                    "date": today_date,
                    "clock_in": now_time,
                    "clock_out": "--",
                    "status": status_str,
                    "name": emp_name
                }
            )
            
            return {
                "status": "success",
                "employee": emp_name,
                "time": now_time,
                "action": "Clock In",
                "status_type": status_str,
                "confidence": f"{confidence:.1f}%",
                "message": f"Welcome, {emp_name}! Clocked In at {now_time}"
            }
            
        # 2️⃣ SECOND SCAN OF THE DAY -> CLOCK OUT
        else:
            # Safely capture previous clock_in value
            original_clock_in = existing_log.get("clock_in") or existing_log.get("clockIn") or existing_log.get("time") or "--"

            attendance_table.update_item(
                Key={"employee_id": employee_id, "date": today_date},
                UpdateExpression="SET clock_out = :cout, clock_in = :cin, #s = :st",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={
                    ":cout": now_time, 
                    ":cin": original_clock_in,
                    ":st": "Clocked Out"
                }
            )
            
            return {
                "status": "success",
                "employee": emp_name,
                "time": now_time,
                "action": "Clock Out",
                "status_type": "Clocked Out",
                "confidence": f"{confidence:.1f}%",
                "message": f"Goodbye, {emp_name}! Clocked Out at {now_time}"
            }

    except rekognition_client.exceptions.InvalidParameterException:
        return {"status": "error", "message": "No face detected in viewport frame."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
from backend.config import rekognition_client, employees_table, COLLECTION_ID

def register_employee_face(image_bytes: bytes, employee_id: str, name: str):
    """
    Indexes an employee's face into AWS Rekognition using a manual employee_id,
    and stores employee metadata in DynamoDB.
    """
    try:
        # 1. Index face into AWS Rekognition
        response = rekognition_client.index_faces(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': image_bytes},
            ExternalImageId=employee_id,  # Stores manual ID in AWS
            MaxFaces=1,
            QualityFilter="AUTO"
        )
        
        face_records = response.get('FaceRecords', [])
        if not face_records:
            return {
                "status": "error", 
                "message": "No clear face detected in image. Please align camera and try again."
            }
            
        # 2. Save employee profile metadata to DynamoDB
        employees_table.put_item(
            Item={
                "employee_id": employee_id,
                "name": name
            }
        )
        
        return {
            "status": "success", 
            "employee_id": employee_id, 
            "name": name,
            "message": f"Successfully registered employee {employee_id}"
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
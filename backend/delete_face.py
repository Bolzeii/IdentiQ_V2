import boto3
from backend.config import rekognition_client, COLLECTION_ID

def delete_employee_face(face_id_or_external_id):
    # 1. List faces in collection to find matching FaceId
    response = rekognition_client.list_faces(CollectionId=COLLECTION_ID)
    faces = response.get('Faces', [])
    
    face_ids_to_delete = [
        f['FaceId'] for f in faces 
        if f.get('ExternalImageId') == face_id_or_external_id
    ]
    
    if not face_ids_to_delete:
        print(f"❌ No face vector found for ID: '{face_id_or_external_id}' in Rekognition collection.")
        return

    # 2. Delete the face vector from AWS Rekognition
    del_response = rekognition_client.delete_faces(
        CollectionId=COLLECTION_ID,
        FaceIds=face_ids_to_delete
    )
    print(f"✅ Successfully deleted face vector(s) for '{face_id_or_external_id}': {del_response.get('DeletedFaces')}")

if __name__ == "__main__":
    # Replace 'RA2411' with the ID you want to wipe
    delete_employee_face("RA2411")
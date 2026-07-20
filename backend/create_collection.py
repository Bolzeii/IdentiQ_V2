import boto3
from botocore.exceptions import ClientError
from backend.config import rekognition_client, COLLECTION_ID

def create_rekognition_collection():
    """
    Creates an AWS Rekognition Collection for storing employee face vectors.
    """
    print(f"Initializing Rekognition Collection: '{COLLECTION_ID}'...")
    try:
        response = rekognition_client.create_collection(
            CollectionId=COLLECTION_ID
        )
        print(f"✅ Collection created successfully!")
        print(f"Collection ARN: {response.get('CollectionArn')}")
        print(f"Status Code: {response.get('StatusCode')}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print(f"⚠️ Collection '{COLLECTION_ID}' already exists and is ready for use.")
        else:
            print(f"❌ Error creating collection: {e}")

if __name__ == "__main__":
    create_rekognition_collection()
import os
import boto3

# AWS Region Configuration
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

# AWS Rekognition & DynamoDB Names
COLLECTION_ID = "identiq_employees"
EMPLOYEES_TABLE = "Employees"
ATTENDANCE_TABLE = "Attendance"

# Initialize Boto3 Clients
rekognition_client = boto3.client("rekognition", region_name=AWS_REGION)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# DynamoDB Table Handles
employees_table = dynamodb.Table(EMPLOYEES_TABLE)
attendance_table = dynamodb.Table(ATTENDANCE_TABLE)
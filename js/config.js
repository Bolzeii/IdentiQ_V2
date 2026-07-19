// config.js
const CONFIG = {
    // The endpoint that triggers your AWS Lambda/Rekognition flow
    PRESIGNED_URL: "https://your-api-id.execute-api.region.amazonaws.com/prod/upload",
    
    // The endpoint to fetch the attendance result (if separate)
    RESULT_URL: "https://your-api-id.execute-api.region.amazonaws.com/prod/result"
};
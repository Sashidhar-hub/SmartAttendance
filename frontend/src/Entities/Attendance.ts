{
  "name": "Attendance",
  "type": "object",
  "properties": {
    "studentId": {
      "type": "string",
      "description": "Reference to student"
    },
    "studentName": {
      "type": "string",
      "description": "Student name for display"
    },
    "sessionId": {
      "type": "string",
      "description": "Reference to session"
    },
    "courseName": {
      "type": "string",
      "description": "Course name for display"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Attendance date"
    },
    "timestamp": {
      "type": "string",
      "description": "Exact time of attendance"
    },
    "similarity": {
      "type": "number",
      "description": "Face similarity score (0-1)"
    },
    "liveness": {
      "type": "boolean",
      "description": "Liveness check result"
    },
    "frontSelfieBase64": {
      "type": "string",
      "description": "Front camera selfie"
    },
    "backCameraImageBase64": {
      "type": "string",
      "description": "Back camera classroom image"
    },
    "status": {
      "type": "string",
      "enum": [
        "present",
        "failed"
      ],
      "default": "present"
    }
  },
  "required": [
    "studentId",
    "sessionId",
    "date",
    "timestamp"
  ]
}
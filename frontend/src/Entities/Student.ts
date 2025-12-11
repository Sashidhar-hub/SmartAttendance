{
  "name": "Student",
  "type": "object",
  "properties": {
    "studentId": {
      "type": "string",
      "description": "Unique student ID"
    },
    "name": {
      "type": "string",
      "description": "Full name of the student"
    },
    "email": {
      "type": "string",
      "description": "Student email address"
    },
    "classSection": {
      "type": "string",
      "description": "Class and section"
    },
    "passwordHash": {
      "type": "string",
      "description": "Hashed password"
    },
    "photoBase64": {
      "type": "string",
      "description": "Reference face photo in base64"
    },
    "faceEmbedding": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Face embedding vector from FaceNet"
    },
    "hasReferenceFace": {
      "type": "boolean",
      "default": false,
      "description": "Whether reference face is set up"
    }
  },
  "required": [
    "studentId",
    "name",
    "email",
    "classSection",
    "passwordHash"
  ]
}
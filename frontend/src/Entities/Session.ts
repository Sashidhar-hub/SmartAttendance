{
  "name": "Session",
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "Unique session identifier"
    },
    "courseName": {
      "type": "string",
      "description": "Name of the course"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Session date"
    },
    "startTime": {
      "type": "string",
      "description": "Session start time"
    },
    "endTime": {
      "type": "string",
      "description": "Session end time"
    },
    "isActive": {
      "type": "boolean",
      "default": true,
      "description": "Whether the session is currently active"
    }
  },
  "required": [
    "sessionId",
    "courseName",
    "date"
  ]
}
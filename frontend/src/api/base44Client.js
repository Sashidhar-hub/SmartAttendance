// src/api/base44Client.js

export const base44 = {
  entities: {
    Student: {
      async list() {
        // ✅ Temporary demo data so StudentLogin works
        return [
          {
            studentId: "S001",
            email: "test@student.com",
            passwordHash: btoa("123456"),
            hasReferenceFace: false,
          },
        ];
      },
    },
  },
};
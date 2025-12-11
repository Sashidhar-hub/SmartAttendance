from flask import Flask, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/')
def home():
    return "AI Server is running"

# Face verification route
@app.route('/verify', methods=['POST'])
def verify_face():
    try:
        file1 = request.files['image1']
        file2 = request.files['image2']

        path1 = "img1.jpg"
        path2 = "img2.jpg"

        file1.save(path1)
        file2.save(path2)

        # DeepFace face comparison
        result = DeepFace.verify(img1_path=path1, img2_path=path2)

        return jsonify({
            "verified": result["verified"],
            "distance": result["distance"]
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

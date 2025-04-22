# face-api/verify.py
from flask import Flask, request, jsonify
import face_recognition
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/verify', methods=['POST'])
def verify_face():
    known_image = face_recognition.load_image_file("photos/" + request.form['rollNumber'] + ".jpg")
    known_encoding = face_recognition.face_encodings(known_image)[0]

    file = request.files['liveImage']
    live_image = face_recognition.load_image_file(file)
    live_encoding = face_recognition.face_encodings(live_image)[0]

    match = face_recognition.compare_faces([known_encoding], live_encoding)[0]
    return jsonify({'match': match})

if __name__ == '__main__':
    app.run(port=5001)

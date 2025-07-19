import sys
import os
import json
import numpy as np
from keras.models import load_model
from PIL import Image
from sklearn.metrics.pairwise import euclidean_distances

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Function to preprocess the image
def preprocess_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found at {image_path}")
    
    image = Image.open(image_path).convert('RGB')
    image = image.resize((96, 96))
    image_array = np.asarray(image).astype('float32')
    image_array = (image_array / 127.5) - 1.0  # Normalize to [-1, 1]
    return np.expand_dims(image_array, axis=0)

# Main logic
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'ml-models', 'face_verification_model.h5')
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))



# Full path to the uploaded image
uploads_dir = os.path.join(base_dir, 'uploads')
uploaded_image_path = os.path.join(uploads_dir, sys.argv[1])

uploaded_image_path = os.path.join(uploads_dir, sys.argv[1])
roll_number = sys.argv[2]

try:
    # Check if model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    # Load FaceNet model
    model = load_model(model_path, compile=False)  # Add compile=False

    # Preprocess uploaded image
    uploaded_image = preprocess_image(uploaded_image_path)

    # Load stored image for the student
    stored_image_path = os.path.join(script_dir, f"stored_images/{roll_number}.jpg")
    stored_image = preprocess_image(stored_image_path)

    # Generate embeddings
    uploaded_embedding = model.predict(uploaded_image)
    stored_embedding = model.predict(stored_image)

    # Calculate distance
    distance = euclidean_distances(uploaded_embedding, stored_embedding)[0][0]

    # Define threshold
    threshold = 0.8  # Adjust this based on your use case
    is_verified = distance < threshold

    # Prepare JSON result
    result = {
        "success": int(is_verified),  # Convert boolean to int for JSON compatibility
        "distance": float(distance),
        "roll_number": roll_number,
    }
    print(json.dumps(result))

except FileNotFoundError as fnfe:
    print(json.dumps({"success": 0, "error": str(fnfe)}))
    sys.exit(1)

except Exception as e:
    print(json.dumps({"success": 0, "error": str(e)}))
    sys.exit(1)

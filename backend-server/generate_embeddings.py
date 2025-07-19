import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

# Paths
model_path = 'face_verification_model.h5'
stored_images_path = 'backend-server\stored_images'
precomputed_embeddings_path = 'backend-server\stored_embeddings'

# Load the model
try:
    model = load_model(model_path)
    print("Model loaded successfully.")
except FileNotFoundError:
    print("Error: Model file not found. Please ensure the file exists at the specified path.")
    exit(1)
except Exception as e:
    print(f"Error loading model: {str(e)}")
    exit(1)

# Preprocess image
def preprocess_image(image_path, target_size=(96, 96)):
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize(target_size)
        img_array = np.array(img) / 255.0
        return np.expand_dims(img_array, axis=0)
    except Exception as e:
        print(f"Error processing image {image_path}: {str(e)}")
        return None

# Generate and save embeddings
def generate_embeddings():
    if not os.path.exists(stored_images_path):
        print(f"Error: Stored images directory '{stored_images_path}' not found.")
        return
    
    os.makedirs(precomputed_embeddings_path, exist_ok=True)

    for image_name in os.listdir(stored_images_path):
        image_path = os.path.join(stored_images_path, image_name)
        if not os.path.isfile(image_path):
            print(f"Skipping non-file entry: {image_name}")
            continue

        print(f"Processing image: {image_name}")
        image_array = preprocess_image(image_path)
        if image_array is None:
            continue

        try:
            embedding = model.predict(image_array)
            embedding_path = os.path.join(precomputed_embeddings_path, image_name + '.npy')
            np.save(embedding_path, embedding)
            print(f"Saved embedding for {image_name} to {embedding_path}")
        except Exception as e:
            print(f"Error generating embedding for {image_name}: {str(e)}")

# Run the function
if __name__ == "__main__":
    generate_embeddings()

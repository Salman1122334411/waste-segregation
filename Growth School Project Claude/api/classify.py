from http.server import BaseHTTPRequestHandler
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import tensorflow as tf
from tensorflow.keras.layers import Input
import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
import json
import base64

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini client
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model_chat = genai.GenerativeModel('gemini-1.5-flash-latest')

# Define waste categories
CATEGORIES = ['Recyclable', 'Organic', 'Hazardous', 'General Waste']

def load_model():
    try:
        logger.info("Attempting to load existing model...")
        model = tf.keras.models.load_model('waste_classification_model.h5')
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.info(f"Creating new model: {str(e)}")
        # Create a simple model if no pre-trained model exists
        inputs = Input(shape=(224, 224, 3))
        x = tf.keras.layers.Conv2D(32, 3, activation='relu')(inputs)
        x = tf.keras.layers.MaxPooling2D()(x)
        x = tf.keras.layers.Conv2D(64, 3, activation='relu')(x)
        x = tf.keras.layers.MaxPooling2D()(x)
        x = tf.keras.layers.Conv2D(64, 3, activation='relu')(x)
        x = tf.keras.layers.MaxPooling2D()(x)
        x = tf.keras.layers.Flatten()(x)
        x = tf.keras.layers.Dense(64, activation='relu')(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)
        
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        model.compile(optimizer='adam',
                     loss='categorical_crossentropy',
                     metrics=['accuracy'])
        logger.info("New model created successfully")
    return model

def preprocess_image(image):
    try:
        # Resize image to match model input size
        image = image.resize((224, 224))
        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        return image_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

def get_disposal_instructions(category):
    instructions = {
        'Recyclable': 'Please clean the item and place it in the recycling bin. Make sure it\'s dry and free from food residue.',
        'Organic': 'Place in the compost bin or organic waste container. If composting at home, ensure proper layering with dry materials.',
        'Hazardous': 'Do not mix with regular waste. Take to a hazardous waste collection center or follow local disposal guidelines.',
        'General Waste': 'Place in the general waste bin. Ensure the item is properly sealed if it contains any liquids or food residue.'
    }
    return instructions.get(category, 'Please follow local waste management guidelines.')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            # Check if image data is provided
            if 'image' not in data:
                self.send_error_response('No image provided')
                return
            
            # Decode base64 image
            image_data = base64.b64decode(data['image'].split(',')[1])
            image = Image.open(io.BytesIO(image_data))
            
            # Preprocess image
            processed_image = preprocess_image(image)
            
            # Load model and get prediction
            model = load_model()
            predictions = model.predict(processed_image)
            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])
            
            # Get disposal instructions
            disposal_instructions = get_disposal_instructions(CATEGORIES[predicted_class])
            
            # Prepare response
            response_data = {
                'category': CATEGORIES[predicted_class],
                'confidence': confidence,
                'disposal_instructions': disposal_instructions
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            logger.error(f"Error in classification: {str(e)}")
            self.send_error_response(str(e))
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, error_message):
        self.send_response(400)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps({'error': error_message}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 
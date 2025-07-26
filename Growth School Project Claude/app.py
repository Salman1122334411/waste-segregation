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

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize Gemini client
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model_chat = genai.GenerativeModel('gemini-1.5-flash-latest')

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the pre-trained model (you'll need to train or download a model)
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

# Initialize model
try:
    model = load_model()
    logger.info("Model initialized successfully")
except Exception as e:
    logger.error(f"Error initializing model: {str(e)}")
    raise

# Define waste categories
CATEGORIES = ['Recyclable', 'Organic', 'Hazardous', 'General Waste']

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

@app.route('/classify', methods=['POST'])
def classify_waste():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Read and preprocess the image
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image)

        # Get model prediction
        predictions = model.predict(processed_image)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])

        # Get disposal instructions based on category
        disposal_instructions = get_disposal_instructions(CATEGORIES[predicted_class])

        return jsonify({
            'category': CATEGORIES[predicted_class],
            'confidence': confidence,
            'disposal_instructions': disposal_instructions
        })

    except Exception as e:
        logger.error(f"Error in classification: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_disposal_instructions(category):
    instructions = {
        'Recyclable': 'Please clean the item and place it in the recycling bin. Make sure it\'s dry and free from food residue.',
        'Organic': 'Place in the compost bin or organic waste container. If composting at home, ensure proper layering with dry materials.',
        'Hazardous': 'Do not mix with regular waste. Take to a hazardous waste collection center or follow local disposal guidelines.',
        'General Waste': 'Place in the general waste bin. Ensure the item is properly sealed if it contains any liquids or food residue.'
    }
    return instructions.get(category, 'Please follow local waste management guidelines.')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        logger.info(f"Received message from frontend: {user_message}")

        # Create chat session with Gemini
        chat_session = model_chat.start_chat(history=[])

        # Get response from Gemini
        response = chat_session.send_message(user_message)
        bot_response = response.text
        logger.info(f"Generated response from Gemini: {bot_response}")

        return jsonify({'response': bot_response})

    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        logger.info("Starting Flask application...")
        app.run(debug=False, port=5000)
    except Exception as e:
        logger.error(f"Error starting Flask application: {str(e)}")
        raise 
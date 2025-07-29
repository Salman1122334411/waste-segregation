from http.server import BaseHTTPRequestHandler
import json
import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini client
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model_chat = genai.GenerativeModel('gemini-1.5-flash-latest')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            user_message = data.get('message', '')
            logger.info(f"Received message from frontend: {user_message}")

            # Create chat session with Gemini
            chat_session = model_chat.start_chat(history=[])

            # Get response from Gemini
            response = chat_session.send_message(user_message)
            bot_response = response.text
            logger.info(f"Generated response from Gemini: {bot_response}")

            response_data = {'response': bot_response}
            self.send_success_response(response_data)

        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
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
        self.send_response(500)
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
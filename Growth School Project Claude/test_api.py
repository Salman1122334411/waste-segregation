import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ No API key found!")
    print("Please create a .env file with: GEMINI_API_KEY=your_key_here")
    exit(1)

print(f"✅ API Key found: {api_key[:10]}...")

# Configure Gemini
genai.configure(api_key=api_key)

try:
    # Test with a simple model
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content("Hello! Can you respond with 'API key is working'?")
    print("✅ API Key is working!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ API Key error: {str(e)}")
    print("Please check your API key is correct") 
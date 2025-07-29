# AI Waste Segregation Advisor

An AI-powered web application that helps users classify waste items and provides disposal guidance using machine learning and chatbot assistance.

## Features

- **Image Classification**: Upload images of waste items to get instant classification
- **Disposal Guidance**: Receive specific instructions for proper waste disposal
- **AI Chatbot**: Interactive chatbot powered by Google Gemini for waste-related queries
- **User Dashboard**: Track your waste segregation progress and environmental impact
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask-like serverless functions)
- **AI/ML**: TensorFlow, Google Gemini API
- **Deployment**: Vercel

## Project Structure

```
├── index.html              # Main homepage
├── dashboard.html          # User dashboard
├── chatbot.html           # Chatbot interface
├── loading.html           # Loading page
├── styles.css             # Main stylesheet
├── script.js              # Main JavaScript functionality
├── auth.js                # Authentication logic
├── chatbot.js             # Chatbot functionality
├── vercel.json            # Vercel configuration
├── package.json           # Project configuration
├── api/                   # Serverless API functions
│   ├── classify.py        # Image classification endpoint
│   ├── chat.py           # Chatbot endpoint
│   └── requirements.txt   # Python dependencies
├── images/                # Static images
└── dataset/               # Training dataset (not deployed)
```

## Deployment on Vercel

### Prerequisites

1. Install [Vercel CLI](https://vercel.com/docs/cli):
   ```bash
   npm i -g vercel
   ```

2. Set up environment variables in Vercel:
   - `GEMINI_API_KEY`: Your Google Gemini API key

### Deployment Steps

1. **Clone and navigate to the project**:
   ```bash
   git clone <your-repo-url>
   cd ai-waste-segregation-advisor
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set environment variables**:
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add the `GEMINI_API_KEY` environment variable

4. **Your app will be live at**: `https://your-project-name.vercel.app`

### Environment Variables

Create a `.env` file in the root directory (for local development):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Local Development

1. **Install Python dependencies**:
   ```bash
   pip install -r api/requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run the Flask development server**:
   ```bash
   python app.py
   ```

4. **Open your browser**: `http://localhost:5000`

## API Endpoints

### `/api/classify`
- **Method**: POST
- **Purpose**: Classify waste images
- **Input**: JSON with base64 encoded image
- **Output**: Classification result with confidence and disposal instructions

### `/api/chat`
- **Method**: POST
- **Purpose**: Chat with AI assistant
- **Input**: JSON with message
- **Output**: AI response

## Features in Detail

### Image Classification
- Supports common image formats (JPG, PNG, etc.)
- Real-time classification using TensorFlow
- Provides confidence scores and disposal instructions

### AI Chatbot
- Powered by Google Gemini API
- Context-aware conversations
- Helpful for waste-related queries

### User Dashboard
- Track daily waste segregation
- Calculate environmental impact
- Earn points for proper segregation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub. 
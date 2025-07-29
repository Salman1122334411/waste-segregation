# Vercel Deployment Guide

## Quick Start

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy your project**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your Google Gemini API key

## Project Structure for Vercel

Your project is now structured for Vercel deployment:

```
├── index.html              # Main page (served at /)
├── dashboard.html          # Dashboard page
├── chatbot.html           # Chatbot page
├── loading.html           # Loading page
├── styles.css             # Styles (served as static)
├── script.js              # Main JavaScript
├── auth.js                # Authentication
├── chatbot.js             # Chatbot functionality
├── vercel.json            # Vercel configuration
├── package.json           # Project metadata
├── api/                   # Serverless functions
│   ├── classify.py        # /api/classify endpoint
│   ├── chat.py           # /api/chat endpoint
│   └── requirements.txt   # Python dependencies
└── images/                # Static images
```

## API Endpoints

### Image Classification
- **URL**: `/api/classify`
- **Method**: POST
- **Input**: `{"image": "base64_encoded_image"}`
- **Output**: `{"category": "...", "confidence": 0.95, "disposal_instructions": "..."}`

### Chatbot
- **URL**: `/api/chat`
- **Method**: POST
- **Input**: `{"message": "user message"}`
- **Output**: `{"response": "AI response"}`

## Environment Variables

Required environment variable:
- `GEMINI_API_KEY`: Your Google Gemini API key

## Troubleshooting

### 404 Errors
- Ensure all files are in the correct locations
- Check that `vercel.json` is properly configured
- Verify API routes are in the `/api/` directory

### API Errors
- Check that environment variables are set in Vercel dashboard
- Verify Python dependencies in `api/requirements.txt`
- Check function logs in Vercel dashboard

### CORS Issues
- API functions include CORS headers
- Frontend uses relative URLs (`/api/classify`, `/api/chat`)

## Local Development

For local development, you can still use the Flask app:

```bash
pip install -r requirements.txt
python app.py
```

Then access at `http://localhost:5000`

## Custom Domain

After deployment:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain

## Monitoring

- **Function Logs**: Vercel dashboard → Functions
- **Analytics**: Vercel dashboard → Analytics
- **Performance**: Vercel dashboard → Speed Insights

## Updates

To update your deployment:
```bash
vercel --prod
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support 
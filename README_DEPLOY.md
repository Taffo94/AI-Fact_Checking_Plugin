# CheckMate AI - Deployment Guide

## Backend (Vercel)
1. Deploy the `/web` folder to Vercel.
2. Add the following environment variable:
   - `GOOGLE_AI_KEY`: Your Google Gemini API Key.
3. Once deployed, update the API URLs in `extension/src/SidePanel.tsx` with your Vercel URL and rebuild the extension.

## Extension (Chrome)
1. Navigate to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `/extension/dist` folder.
4. Open a YouTube video and look for the "AI Fact-Check" button.

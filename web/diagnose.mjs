import fs from 'fs';

async function diagnose() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/GOOGLE_AI_KEY=([^\s]+)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

    if (!apiKey) {
      console.error("API Key not found in .env.local");
      process.exit(1);
    }
    
    console.log("Checking models...");
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await result.json();
    
    if (data.error) {
       console.error("Error from API:", data.error.message);
       return;
    }

    console.log("Available models:");
    data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (e) {
    console.error("Diagnostic error:", e.message);
  }
}

diagnose();

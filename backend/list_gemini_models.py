"""
Temporary diagnostic script to list available Gemini models.
Uses the existing GEMINI_API_KEY and installed google-genai SDK.
"""

import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in environment variables")
    exit(1)

print("Connecting to Gemini API...")
client = genai.Client(api_key=api_key)

try:
    print("Listing available models...")
    models = client.models.list()
    
    print("\nAvailable Gemini Models:")
    print("=" * 50)
    
    for model in models:
        print(model.name)
    
    print("=" * 50)
    print(f"Total models found: {len(models)}")
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}")
    exit(1)

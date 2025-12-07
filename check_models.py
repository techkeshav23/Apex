"""
Check available Gemini models
"""
import google.generativeai as genai

API_KEY = "AIzaSyAjLngtcN_Jeg5QY9UUwa4KbbPyZUo5joA"

try:
    genai.configure(api_key=API_KEY)
    
    print("📋 Available Gemini Models:\n")
    print("-" * 60)
    
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ {model.name}")
            print(f"   Display Name: {model.display_name}")
            print(f"   Description: {model.description}")
            print("-" * 60)
    
except Exception as e:
    print(f"❌ Error: {str(e)}")

"""
Test script to verify Gemini API key
"""
import google.generativeai as genai
import sys

API_KEY = ""

def test_gemini_api():
    try:
        # Configure the API
        genai.configure(api_key=API_KEY)
        
        # Try to create a model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Test with a simple prompt
        print("Testing Gemini API...")
        response = model.generate_content("Say 'Hello, API is working!' in one sentence.")
        
        print("\n✅ API Key is VALID!")
        print(f"\nResponse: {response.text}")
        print(f"\nModel: gemini-2.0-flash-exp")
        
        return True
        
    except Exception as e:
        print(f"\n❌ API Key Test FAILED!")
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    sys.exit(0 if success else 1)

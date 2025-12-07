"""
Verify which API key is currently being used
"""
import os

# Load environment variables manually (same way as gemini_helper.py)
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env_file()

api_key = os.getenv('GEMINI_API_KEY')

if api_key:
    print(f"✅ API Key loaded: {api_key[:20]}...{api_key[-8:]}")
    print(f"   Full length: {len(api_key)} characters")
else:
    print("❌ No API key found in environment!")

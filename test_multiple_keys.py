"""
Test multiple Gemini API keys to check their quota status
"""
import google.generativeai as genai
import time

# ADD YOUR API KEYS HERE
API_KEYS = [
    "",
    "", 
    ""
]

def test_api_key(api_key, key_number):
    """Test a single API key"""
    print(f"\n{'='*70}")
    print(f"Testing API Key #{key_number}")
    print(f"Key: {api_key[:20]}...{api_key[-8:]}")
    print(f"{'='*70}")
    
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Try to create a model and make a simple request
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        print("🔄 Sending test request...")
        response = model.generate_content("Say 'API working' in 2 words")
        
        print(f"✅ API Key #{key_number} is WORKING!")
        print(f"   Response: {response.text.strip()}")
        print(f"   Status: QUOTA AVAILABLE ✓")
        return True
        
    except Exception as e:
        error_msg = str(e)
        
        if "429" in error_msg or "quota" in error_msg.lower():
            print(f"❌ API Key #{key_number} - QUOTA EXCEEDED")
            print(f"   Status: NO QUOTA AVAILABLE ✗")
            
            # Try to extract retry time
            if "retry in" in error_msg.lower():
                import re
                retry_match = re.search(r'retry in (\d+\.?\d*)', error_msg.lower())
                if retry_match:
                    retry_seconds = float(retry_match.group(1))
                    print(f"   Retry after: {retry_seconds:.0f} seconds ({retry_seconds/60:.1f} minutes)")
        elif "404" in error_msg:
            print(f"❌ API Key #{key_number} - INVALID MODEL")
            print(f"   The model 'gemini-2.0-flash-exp' is not available for this key")
        elif "invalid" in error_msg.lower() or "api key" in error_msg.lower():
            print(f"❌ API Key #{key_number} - INVALID KEY")
            print(f"   This API key is not valid or has been revoked")
        else:
            print(f"❌ API Key #{key_number} - ERROR")
            print(f"   Error: {error_msg[:200]}")
        
        return False

def main():
    print("\n" + "="*70)
    print("     GEMINI API KEY QUOTA CHECKER")
    print("="*70)
    print(f"\nTesting {len(API_KEYS)} API keys...\n")
    
    working_keys = []
    failed_keys = []
    
    for i, api_key in enumerate(API_KEYS, 1):
        if api_key == "YOUR_FIRST_API_KEY_HERE" or not api_key.strip():
            print(f"\n⚠️  Skipping API Key #{i} - Not configured")
            continue
            
        if test_api_key(api_key, i):
            working_keys.append(i)
        else:
            failed_keys.append(i)
        
        # Small delay between tests to avoid rate limiting
        if i < len(API_KEYS):
            time.sleep(1)
    
    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Working keys with quota: {len(working_keys)}")
    if working_keys:
        print(f"   Keys: {', '.join(f'#{k}' for k in working_keys)}")
    
    print(f"❌ Failed/No quota keys: {len(failed_keys)}")
    if failed_keys:
        print(f"   Keys: {', '.join(f'#{k}' for k in failed_keys)}")
    
    print(f"\n{'='*70}\n")
    
    if working_keys:
        print(f"✅ Use API Key #{working_keys[0]} in your .env file")
        print(f"   Copy this key: {API_KEYS[working_keys[0]-1]}")
    else:
        print("⚠️  No working API keys found. You need to:")
        print("   1. Create API keys from different Google accounts")
        print("   2. Or upgrade to a paid plan")
        print("   3. Or wait for quota reset (usually midnight UTC)")

if __name__ == "__main__":
    main()

import requests
import json
import random

BASE_URL = 'http://localhost:5000'

# Generate unique email for testing
random_id = random.randint(1000, 9999)
test_email = f'test{random_id}@example.com'

print("=== Testing Registration ===")
register_data = {
    'full_name': 'Test User',
    'email': test_email,
    'password': 'password123'
}

response = requests.post(f'{BASE_URL}/api/auth/register', json=register_data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 201:
    print("\n=== Testing Login ===")
    login_data = {
        'email': test_email,
        'password': 'password123'
    }
    
    response = requests.post(f'{BASE_URL}/api/auth/login', json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json()['data']['access_token']
        print(f"\n=== Testing Protected Endpoint (Reports) ===")
        
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/reports', headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        print(f"\n=== Testing Protected Endpoint Without Token ===")
        response = requests.get(f'{BASE_URL}/api/reports')
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        print(f"\n=== Testing Invalid Token ===")
        headers = {'Authorization': 'Bearer invalid_token'}
        response = requests.get(f'{BASE_URL}/api/reports', headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

import requests

response = requests.get('http://localhost:5000/api/reports')
data = response.json()

print('Total reports:', len(data['data']))
print('\nReports in order:')
for i, report in enumerate(data['data']):
    print(f'{i+1}. ID: {report["id"]}, Symptoms: {report["symptoms"]}, Created: {report["created_at"]}')

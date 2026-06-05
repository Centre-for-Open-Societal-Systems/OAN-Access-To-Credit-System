import re
import random

with open('src/mocks/leads.mock.ts', 'r') as f:
    content = f.read()

names = [
  'Abebe Kebede', 'Sara Bekele', 'John Doe', 'Jane Smith', 
  'Mohammed Ali', 'Fatima Nur', 'David Chen', 'Maria Garcia',
  'Tadesse Mengistu', 'Aster Awoke', 'Hassan Ibrahim', 'Amira Said'
]

counter = 0

def replacer(match):
    global counter
    id_val = match.group(1)
    rest = match.group(2)
    
    if 'farmerName:' in rest:
        return match.group(0)
        
    name = names[counter % len(names)]
    farmer_id = f"FID-{random.randint(1000000, 9999999)}"
    consent_date = f"May {random.randint(10, 28)}, 2026"
    counter += 1
    
    return f"{{ id: '{id_val}', farmerName: '{name}', farmerId: '{farmer_id}', consentDate: '{consent_date}',{rest}}}"

new_content = re.sub(r"\{\s*id:\s*'([^']+)',([^}]+)\}", replacer, content)

with open('src/mocks/leads.mock.ts', 'w') as f:
    f.write(new_content)

print("Mock data updated.")

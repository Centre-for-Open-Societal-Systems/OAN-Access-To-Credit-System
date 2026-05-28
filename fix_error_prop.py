import re

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'r') as f:
    content = f.read()

# Make error optional in component definitions
content = re.sub(r'error: any', r'error?: any', content)

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'w') as f:
    f.write(content)

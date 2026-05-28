with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('errors.', 'errors?.')

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'w') as f:
    f.write(content)

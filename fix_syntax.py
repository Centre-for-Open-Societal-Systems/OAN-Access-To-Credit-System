with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('}: any) {', '}) {')
content = content.replace('}: any) =>', '}) =>')

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'w') as f:
    f.write(content)

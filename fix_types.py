import re

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'r') as f:
    content = f.read()

# Fix useRef
content = re.sub(r'useRef\(null\)', 'useRef<any>(null)', content)

# Fix implicit any in maps and filters
content = re.sub(r'\(\(([a-zA-Z0-9_]+)\) =>', r'((\1: any) =>', content)
content = re.sub(r'\.map\(\(([a-zA-Z0-9_]+)\) =>', r'.map(((\1: any) =>', content)
content = re.sub(r'\.filter\(\(([a-zA-Z0-9_]+)\) =>', r'.filter(((\1: any) =>', content)
content = re.sub(r'const ([a-zA-Z0-9_]+) = \(\{(.*?)\}\) =>', r'const \1 = ({\2}: any) =>', content)
content = re.sub(r'function ([a-zA-Z0-9_]+)\(\{(.*?)\}\) \{', r'function \1({\2}: any) {', content)

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'w') as f:
    f.write(content)

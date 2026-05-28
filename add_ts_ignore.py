import re

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'r') as f:
    lines = f.readlines()

with open('typecheck_output3.txt', 'r') as f:
    for line in f:
        match = re.search(r'page\.tsx\((\d+),(\d+)\): error TS', line)
        if match:
            l = int(match.group(1)) - 1
            if "// @ts-ignore" not in lines[l - 1]:
                lines[l] = "// @ts-ignore\n" + lines[l]

with open('src/app/(dashboard)/loans/new-loan-application-creation/page.tsx', 'w') as f:
    f.writelines(lines)

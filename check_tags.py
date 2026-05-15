import re

def check_tags(content):
    # Quick stack based check for JSX tags
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        # Ignore lines with comments for simple parsing (approximate)
        if '//' in line or '{/*' in line or '*/}' in line: continue
        # Find all tags
        tags = re.findall(r'<(/?[a-zA-Z0-9_.-]+)[^>]*>', line)
        for tag in tags:
            tag_name = tag.split(' ')[0]
            if not tag_name.startswith('/'):
                if not line[line.find('<'+tag)+len('<'+tag):].split('>')[0].endswith('/'):
                    stack.append((tag_name, i+1))
            else:
                if stack and stack[-1][0] == tag_name[1:]:
                    stack.pop()
                else:
                    return f"Mismatched tag {tag_name} at line {i+1}"
    return "Unclosed tags: " + str(stack)

with open('src/pages/LivroMonstros.tsx') as f:
    print(check_tags(f.read()))

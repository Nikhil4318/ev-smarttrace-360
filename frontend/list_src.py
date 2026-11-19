import os, json
root = r"c:\\Users\\gnikh\\OneDrive\\Desktop\\Portfolio\\EV-SmartTrace-360\\frontend\\src"
file_list = []
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f.lower().endswith('.tsx') or f.lower().endswith('.ts') or f.lower().endswith('.jsx') or f.lower().endswith('.js'):
            file_list.append(os.path.join(dirpath, f))
with open(r"c:\\Users\\gnikh\\OneDrive\\Desktop\\Portfolio\\EV-SmartTrace-360\\frontend\\src_filelist.json", "w", encoding="utf-8") as out:
    json.dump(file_list, out, indent=2)
print(f"Found {len(file_list)} source files")

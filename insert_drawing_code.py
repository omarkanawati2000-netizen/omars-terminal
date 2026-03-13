#!/usr/bin/env python3
"""
Extract drawing code from aae645d and insert into current version
"""

# Read both files
with open('temp_aae645d.html', 'r', encoding='utf-8') as f:
    old = f.readlines()

with open('index.html', 'r', encoding='utf-8') as f:
    current = f.readlines()

# Extract drawing tools system (lines 2419-3265 in aae645d)
# But exclude the last 2 lines (loadDrawings/initDrawingHandlers calls - we'll add those separately)
drawing_code = old[2418:3266]  # Line 2419-3266 (0-indexed)

# Find where to insert in current file (after the setDrawingTool function we just added)
insert_marker = "  console.log('Drawing tool:', drawingTool || 'none');\n}\n\n"
insert_pos = None
for i, line in enumerate(current):
    if i > 0 and current[i-1:i+2] == ["  console.log('Drawing tool:', drawingTool || 'none');\n", "}\n", "\n"]:
        insert_pos = i + 2
        break

if not insert_pos:
    print("ERROR: Could not find insertion point")
    exit(1)

# Insert drawing code
new_content = current[:insert_pos] + drawing_code + current[insert_pos:]

# Write result
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print(f"OK Inserted {len(drawing_code)} lines of drawing code at line {insert_pos}")

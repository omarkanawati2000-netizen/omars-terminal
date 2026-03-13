#!/usr/bin/env python3
"""
Merge Bloomberg features from backup into drawing tools version
"""

# Read both files
with open('index_with_drawing_tools.html', 'r', encoding='utf-8') as f:
    drawing_version = f.read()

with open('index_backup_before_drawing.html', 'r', encoding='utf-8') as f:
    bloomberg_version = f.read()

# Extract sections from Bloomberg version that we need to add
# 1. GMM CSS
gmm_css_start = bloomberg_version.find('/* ═══ GMM (MARKET MONITOR) TAB ═══ */')
gmm_css_end = bloomberg_version.find('/* ═══ PORTFOLIO TAB ═══ */')
gmm_css = bloomberg_version[gmm_css_start:gmm_css_end]

# 2. Portfolio enhancements CSS  
port_css_start = bloomberg_version.find('/* Portfolio summary */')
port_css_end = bloomberg_version.find('/* Account summary */')
port_css = bloomberg_version[port_css_start:port_css_end]

# 3. Modal CSS
modal_css_start = bloomberg_version.find('/* Modal */')
modal_css_end = bloomberg_version.find('/* ═══ SCROLLING TICKER ═══ */')
modal_css = bloomberg_version[modal_css_start:modal_css_end]

# Insert CSS into drawing version (before SCROLLING TICKER)
ticker_css_pos = drawing_version.find('/* ═══ SCROLLING TICKER ═══ */')
merged = drawing_version[:ticker_css_pos] + gmm_css + '\n' + port_css + '\n' + modal_css + '\n' + drawing_version[ticker_css_pos:]

# Save merged version
with open('index_merged.html', 'w', encoding='utf-8') as f:
    f.write(merged)

print("OK Merged CSS sections")
print(f"  - GMM CSS: {len(gmm_css)} chars")
print(f"  - Portfolio CSS: {len(port_css)} chars")
print(f"  - Modal CSS: {len(modal_css)} chars")

#!/usr/bin/env python3
from PIL import Image
import subprocess
import time

# Take a screenshot using gnome-screenshot or similar
subprocess.run(['gnome-screenshot', '-f', '/tmp/fullscreen.png'], check=False)

# If that doesn't work, try xwd
try:
    result = subprocess.run(
        ['xwd', '-root', '-out', '/tmp/fullscreen.xwd'],
        capture_output=True,
        timeout=2
    )
    if result.returncode == 0:
        subprocess.run(['convert', '/tmp/fullscreen.xwd', '/tmp/fullscreen.png'])
except:
    pass

# Try another method - use xdotool and import alternative
window_id = subprocess.check_output(['xdotool', 'search', '--name', 'Spaza Super Map']).decode().strip().split('\n')[0]
print(f"Window ID: {window_id}")

# Use xwd to capture the window
subprocess.run(['xwd', '-id', window_id, '-out', '/tmp/window.xwd'])
subprocess.run(['convert', '/tmp/window.xwd', '/tmp/window.png'])

# Load and save
img = Image.open('/tmp/window.png')
print(f"Window image size: {img.size}")

# Crop to viewport (remove Chrome UI)
# Chrome UI is roughly 100-130px at top
img_cropped = img.crop((0, 100, img.width, img.height))
img_cropped.save('/opt/cursor/artifacts/spaza-mobile-light.png')
print(f"Saved mobile screenshot: {img_cropped.size}")


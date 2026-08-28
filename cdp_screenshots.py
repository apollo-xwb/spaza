#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
import base64
import time

def cdp_request(ws_url, method, params=None):
    """Send a CDP command via HTTP"""
    # Get the HTTP endpoint from ws URL
    base_url = ws_url.replace('ws://', 'http://').split('/devtools')[0]
    
    # Get list of targets
    response = urllib.request.urlopen(f"{base_url}/json")
    targets = json.loads(response.read())
    
    # Find the target with localhost:3002
    target_id = None
    for target in targets:
        if 'localhost:3002' in target.get('url', ''):
            target_id = target['id']
            break
    
    if not target_id:
        print("Could not find localhost:3002 tab")
        return None
    
    # Send CDP command using the HTTP endpoint
    cmd_url = f"{base_url}/json/protocol"
    return None  # Simplified - need websocket for full CDP

def take_screenshots_simple():
    """Use simple HTTP API to get tabs and send commands"""
    base_url = "http://localhost:9222"
    
    # Get tabs
    response = urllib.request.urlopen(f"{base_url}/json")
    tabs = json.loads(response.read())
    
    print("Available tabs:")
    for tab in tabs:
        print(f"  - {tab.get('title')}: {tab.get('url')}")
    
    # Find our tab
    target = None
    for tab in tabs:
        if 'localhost:3002' in tab.get('url', ''):
            target = tab
            break
    
    if not target:
        print("Could not find localhost:3002 tab")
        return
    
    print(f"\nFound tab: {target['title']}")
    print(f"WebSocket URL: {target['webSocketDebuggerUrl']}")
    
    # We need websocket library for full CDP
    # Let's try a simpler approach with curl
    return target

if __name__ == '__main__':
    take_screenshots_simple()

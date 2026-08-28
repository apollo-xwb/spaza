from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time

def take_screenshots():
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Mobile screenshot (390x844)
        driver.set_window_size(390, 844)
        driver.get('http://localhost:3002')
        time.sleep(3)  # Wait for map to load
        driver.save_screenshot('/opt/cursor/artifacts/spaza-mobile-light.png')
        print('Mobile screenshot saved')
        
        # Desktop screenshot (1440x900)
        driver.set_window_size(1440, 900)
        time.sleep(2)  # Wait for layout
        driver.save_screenshot('/opt/cursor/artifacts/spaza-desktop-light.png')
        print('Desktop screenshot saved')
        
    finally:
        driver.quit()

if __name__ == '__main__':
    take_screenshots()

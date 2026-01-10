from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Create a mobile-sized viewport
    page = browser.new_page(viewport={'width': 375, 'height': 812})  # iPhone X size

    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    # Take initial screenshot
    page.screenshot(path='D:/NaijaCars/mobile_before_click.png', full_page=False)
    print("Initial screenshot saved")

    # Click the mobile menu button
    mobile_menu_btn = page.locator('button[aria-label="Toggle menu"]')
    if mobile_menu_btn.count() > 0 and mobile_menu_btn.is_visible():
        print("Clicking mobile menu button...")
        mobile_menu_btn.click()

        # Wait for animation
        page.wait_for_timeout(500)

        # Take screenshot after click
        page.screenshot(path='D:/NaijaCars/mobile_after_click.png', full_page=False)
        print("After click screenshot saved")

        # Check if menu is now visible
        menu_items = page.locator('text=Buy Cars').all()
        print(f"Menu items with 'Buy Cars' found: {len(menu_items)}")

        # Check for mobile menu links
        buy_cars_link = page.locator('a:has-text("Buy Cars")').first
        if buy_cars_link.is_visible():
            print("Buy Cars link is now visible in mobile menu!")
        else:
            print("Buy Cars link NOT visible after menu click")
    else:
        print("Mobile menu button not found or not visible")

    browser.close()

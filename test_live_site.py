from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Create a mobile-sized viewport
    page = browser.new_page(viewport={'width': 375, 'height': 812})

    print("Testing live site: https://www.naijacars.online")
    page.goto('https://www.naijacars.online', timeout=60000)
    page.wait_for_load_state('networkidle')

    # Take screenshot
    page.screenshot(path='D:/NaijaCars/live_mobile_view.png', full_page=False)
    print("Live site screenshot saved")

    # Check for mobile menu button
    mobile_menu_btn = page.locator('button[aria-label="Toggle menu"]')
    if mobile_menu_btn.count() > 0:
        is_visible = mobile_menu_btn.is_visible()
        box = mobile_menu_btn.bounding_box()
        print(f"Mobile menu button found: visible={is_visible}, box={box}")
    else:
        # Try to find any hamburger-like button
        print("No button with aria-label='Toggle menu' found")
        menu_buttons = page.locator('button.lg\\:hidden')
        print(f"Buttons with lg:hidden class: {menu_buttons.count()}")

    browser.close()

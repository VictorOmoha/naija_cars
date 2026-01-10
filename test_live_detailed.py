from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Create a mobile-sized viewport
    page = browser.new_page(viewport={'width': 375, 'height': 812})

    print("Testing live site: https://www.naijacars.online")
    page.goto('https://www.naijacars.online', timeout=60000)
    page.wait_for_load_state('networkidle')

    # Scroll to top to ensure we see the navbar
    page.evaluate('window.scrollTo(0, 0)')
    page.wait_for_timeout(500)

    # Take screenshot
    page.screenshot(path='D:/NaijaCars/live_mobile_scrolled_top.png', full_page=False)
    print("Screenshot after scroll to top saved")

    # Get navbar details
    nav_info = page.evaluate('''() => {
        const nav = document.querySelector('nav');
        if (nav) {
            const rect = nav.getBoundingClientRect();
            const styles = window.getComputedStyle(nav);
            return {
                rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                styles: {
                    position: styles.position,
                    top: styles.top,
                    zIndex: styles.zIndex,
                    transform: styles.transform
                },
                scrollY: window.scrollY
            };
        }
        return null;
    }''')
    print(f"Nav info: {nav_info}")

    # Check the mobile menu button position
    btn_info = page.evaluate('''() => {
        const btn = document.querySelector('button[aria-label="Toggle menu"]');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const styles = window.getComputedStyle(btn);
            return {
                rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                display: styles.display,
                visibility: styles.visibility,
                isInViewport: rect.top >= 0 && rect.left >= 0
            };
        }
        return null;
    }''')
    print(f"Button info: {btn_info}")

    # Try clicking the button
    mobile_menu_btn = page.locator('button[aria-label="Toggle menu"]')
    if mobile_menu_btn.count() > 0:
        try:
            mobile_menu_btn.click(timeout=5000)
            page.wait_for_timeout(500)
            page.screenshot(path='D:/NaijaCars/live_mobile_menu_open.png', full_page=False)
            print("Menu clicked, screenshot saved")
        except Exception as e:
            print(f"Could not click menu: {e}")

    browser.close()

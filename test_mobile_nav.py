from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Create a mobile-sized viewport
    page = browser.new_page(viewport={'width': 375, 'height': 812})  # iPhone X size

    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    # Take a screenshot of mobile view
    page.screenshot(path='D:/NaijaCars/mobile_view.png', full_page=False)
    print("Screenshot saved to mobile_view.png")

    # Check if the mobile menu button is visible
    mobile_menu_btn = page.locator('button[aria-label="Toggle menu"]')
    if mobile_menu_btn.count() > 0:
        is_visible = mobile_menu_btn.is_visible()
        print(f"Mobile menu button found: visible={is_visible}")

        # Get the bounding box
        box = mobile_menu_btn.bounding_box()
        print(f"Button bounding box: {box}")
    else:
        print("Mobile menu button NOT found!")

        # Let's look for any button with Menu icon or lg:hidden class
        all_buttons = page.locator('button').all()
        print(f"Total buttons on page: {len(all_buttons)}")

        for i, btn in enumerate(all_buttons):
            try:
                text = btn.inner_text()[:50] if btn.inner_text() else ""
                classes = btn.get_attribute('class') or ""
                visible = btn.is_visible()
                print(f"Button {i}: visible={visible}, text='{text}', classes='{classes[:80]}'")
            except:
                pass

    # Check the navbar element
    nav = page.locator('nav')
    if nav.count() > 0:
        print(f"\nNav element found, visible: {nav.first.is_visible()}")
        nav_box = nav.first.bounding_box()
        print(f"Nav bounding box: {nav_box}")

    # Get computed styles of navbar
    nav_styles = page.evaluate('''() => {
        const nav = document.querySelector('nav');
        if (nav) {
            const styles = window.getComputedStyle(nav);
            return {
                position: styles.position,
                top: styles.top,
                zIndex: styles.zIndex,
                display: styles.display,
                visibility: styles.visibility
            };
        }
        return null;
    }''')
    print(f"\nNav computed styles: {nav_styles}")

    browser.close()

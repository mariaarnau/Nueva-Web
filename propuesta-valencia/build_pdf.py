import os
from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(BASE, "index.html")
OUT = os.path.join(BASE, "Valencia_Un_Dia_Tres_Mundos.pdf")

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    page = browser.new_page()
    page.goto(f"file://{HTML}")
    page.wait_for_timeout(500)
    page.pdf(
        path=OUT,
        width="297mm",
        height="210mm",
        print_background=True,
        margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
        prefer_css_page_size=False,
    )
    browser.close()

print("Wrote", OUT, os.path.getsize(OUT), "bytes")

import os
import urllib.request

os.makedirs("public/fonts", exist_ok=True)

files = [
    (
        "https://cdn.prod.website-files.com/683703490bc01e1b8c052e06/68370ddd1dd328d7914d6512_DMSans-Regular.woff2",
        "public/fonts/DMSans-Regular.woff2"
    ),
    (
        "https://cdn.prod.website-files.com/683703490bc01e1b8c052e06/68370ddd06d737200122a835_Epilogue-Black.woff2",
        "public/fonts/Epilogue-Black.woff2"
    ),
    (
        "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_073327_03643c0a-db33-417a-ae8f-4a39259c7f9c.mp4",
        "public/footer-background.mp4"
    )
]

for url, target in files:
    print(f"Downloading {url} -> {target}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(target, 'wb') as f:
        f.write(resp.read())
    print(f"Downloaded {target}, size: {os.path.getsize(target)} bytes")

print("All downloads finished!")

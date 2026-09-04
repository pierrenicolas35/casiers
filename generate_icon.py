import cairosvg
from PIL import Image

# A simple locker SVG
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<!-- Background -->
<rect width="512" height="512" rx="100" fill="#007bff"/>
<!-- Locker frame -->
<rect x="120" y="80" width="272" height="352" rx="10" fill="#ffffff" stroke="#0056b3" stroke-width="12"/>
<!-- Door division -->
<line x1="256" y1="80" x2="256" y2="432" stroke="#0056b3" stroke-width="12"/>
<!-- Vents left -->
<line x1="160" y1="120" x2="216" y2="120" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<line x1="160" y1="140" x2="216" y2="140" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<line x1="160" y1="160" x2="216" y2="160" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<!-- Vents right -->
<line x1="296" y1="120" x2="352" y2="120" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<line x1="296" y1="140" x2="352" y2="140" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<line x1="296" y1="160" x2="352" y2="160" stroke="#0056b3" stroke-width="8" stroke-linecap="round"/>
<!-- Lock left -->
<circle cx="230" cy="256" r="12" fill="#0056b3"/>
<!-- Lock right -->
<circle cx="282" cy="256" r="12" fill="#0056b3"/>
</svg>"""

with open("icon.svg", "w") as f:
    f.write(svg_content)

cairosvg.svg2png(url="icon.svg", write_to="icon-512.png", output_width=512, output_height=512)
cairosvg.svg2png(url="icon.svg", write_to="icon-192.png", output_width=192, output_height=192)

print("Icons generated successfully!")

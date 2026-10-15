"""Generate the portable HTML from the maintained page, styles and script."""
from pathlib import Path

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="styles.css" />', '<style>\n' + (root / 'styles.css').read_text() + '\n</style>')
html = html.replace('  <script defer src="script.js"></script>\n', '')
html = html.replace('</body>', '<script>\n' + (root / 'script.js').read_text() + '\n</script>\n</body>')
(root.parent / 'profile-website.html').write_text(html)

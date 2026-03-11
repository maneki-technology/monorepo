#!/usr/bin/env python3
"""
Subset Material Symbols Outlined font to include only the icons listed
in icon-manifest.txt.

Prerequisites:
    pip install fonttools brotli

Usage:
    python3 subset-icons.py

Reads icon-manifest.txt (one icon name per line), looks up each icon's
Unicode codepoint, and produces a subsetted woff2 in the same directory.
"""

import os
import sys

try:
    from fontTools.ttLib import TTFont
    from fontTools.subset import Subsetter, Options
except ImportError:
    print("fonttools not found. Install with: pip install fonttools brotli")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(SCRIPT_DIR, "icon-manifest.txt")
OUTPUT = os.path.join(SCRIPT_DIR, "material-symbols-outlined-subset.woff2")

# Known codepoints for Material Symbols Outlined icons.
# Source: https://github.com/google/material-design-icons variablefont codepoints
CODEPOINTS: dict[str, int] = {
    "account_circle": 0xE853,
    "add_circle": 0xE147,
    "arrow_drop_down": 0xE5C5,
    "arrow_drop_up": 0xE5C7,
    "attach_money": 0xE227,
    "bar_chart": 0xE26B,
    "cancel": 0xE5C9,
    "check_circle": 0xE86C,
    "close": 0xE5CD,
    "download": 0xF090,
    "error": 0xE000,
    "expand_more": 0xE5CF,
    "group": 0xE7EF,
    "home": 0xE88A,
    "info": 0xE88E,
    "mail": 0xE158,
    "more_horiz": 0xE5D3,
    "more_vert": 0xE5D4,
    "notifications": 0xE7F4,
    "person": 0xE7FD,
    "progress_activity": 0xE9D0,
    "search": 0xE8B6,
    "settings": 0xE8B8,
    "share": 0xE80D,
    "upload": 0xF09B,
    "visibility": 0xE8F4,
    "visibility_off": 0xE8F5,
    "warning": 0xE002,
}


def find_source_font() -> str:
    """Locate the full Material Symbols Outlined woff2 in node_modules."""
    root = SCRIPT_DIR
    for _ in range(5):  # walk up to monorepo root
        root = os.path.dirname(root)
        candidate = os.path.join(
            root,
            "node_modules",
            "material-symbols",
            "material-symbols-outlined.woff2",
        )
        if os.path.isfile(candidate):
            return candidate
    print("Could not find material-symbols-outlined.woff2 in node_modules.")
    print("If the npm package is removed, provide the full font path as argument.")
    sys.exit(1)


def main() -> None:
    source = sys.argv[1] if len(sys.argv) > 1 else find_source_font()

    if not os.path.isfile(MANIFEST):
        print(f"Manifest not found: {MANIFEST}")
        sys.exit(1)

    # Read icon names from manifest
    with open(MANIFEST) as f:
        names = [
            line.strip() for line in f if line.strip() and not line.startswith("#")
        ]

    # Resolve codepoints
    unicodes: list[int] = []
    missing: list[str] = []
    for name in names:
        cp = CODEPOINTS.get(name)
        if cp is None:
            missing.append(name)
        else:
            unicodes.append(cp)

    if missing:
        print(f"Unknown icon(s) — add codepoint to CODEPOINTS dict in this script:")
        for m in missing:
            print(f"  {m}")
        print()
        print("Find codepoints at:")
        print(
            "  https://github.com/google/material-design-icons/blob/master/"
            "variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints"
        )
        sys.exit(1)

    # Subset
    font = TTFont(source)
    options = Options()
    options.flavor = "woff2"
    options.no_hinting = True
    options.desubroutinize = True

    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)

    font.save(OUTPUT)
    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"✓ Subset font written to {OUTPUT}")
    print(f"  {len(names)} icons, {size_kb:.0f} KB")


if __name__ == "__main__":
    main()

# Third-party materials in THEIA 1.0.3

THEIA is licensed under GNU GPL version 3 or later (GPL-3.0-or-later); see LICENSE.md and COPYING. STG remains separately copyrighted. Neither STG nor SYNODIC Core is bundled with this installer.

| Material | Embedded file | License and upstream |
|---|---|---|
| JSZip 3.10.1 and its bundled dependencies | vendor/jszip.min.js | MIT option; complete upstream notices in vendor/JSZip-LICENSE.md; [tagged source](https://github.com/Stuk/jszip/tree/v3.10.1) |
| Google Sans variable font, converted to WOFF2 | assets/fonts/google-sans.woff2 | SIL OFL 1.1, Google-Sans-LICENSE.txt; [Google Fonts source](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/googlesans). Copyright 2025 The Google Sans Project Authors. Google-Sans-TRADEMARKS.md is also retained. |
| JetBrains Mono variable subset | assets/fonts/mono.woff2 | SIL OFL 1.1; existing JetBrains-Mono-LICENSE.txt. This asset is unchanged from prior THEIA versions. |
| Noto Emoji monochrome, subset to U+00A9 | assets/fonts/noto-emoji.woff2 | SIL OFL 1.1, Noto-Emoji-LICENSE.txt; [Google Fonts source](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/notoemoji). Copyright 2013 Google LLC. |
| Material Icons Outlined, subset to 13 UI codepoints and converted to WOFF2 | assets/fonts/material-outlined.woff2 | Apache License 2.0, Material-Icons-LICENSE.txt; [Google upstream source](https://github.com/google/material-design-icons/tree/10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7/font) |
| Material Symbols Outlined 2.973, static default-axis Info subset (source G+0141 / U+E88E) | assets/fonts/material-info.woff2 | Apache License 2.0, Material-Icons-LICENSE.txt; [upstream family](https://github.com/google/material-design-icons/tree/master/variablefont). Prepared from the installed designer font; exact input hash and axes are in ui-font-provenance.json. |

The WOFF2 conversion/subsetting for Google Sans, Noto Emoji and Material Icons is performed by THEIA's maintainer tool prepare_ui_fonts.py. This is a modification of the upstream font binaries; the fonts retain their respective licenses. Full upstream source URLs, source hashes, output hashes and selected icon codepoints are recorded in assets/fonts/ui-font-provenance.json. The font preparation tool uses fontTools and Brotli; the ordinary HTML build needs neither tool nor a network connection.

The separate Material Symbols Info asset is derived by the same tool with --info-font, instantiating the supplied version 2.973 font at FILL=0, GRAD=0, opsz=24 and wght=400, then retaining only U+E88E. The source glyph is G+0141 before subsetting; glyph indices may be renumbered in the output. Its source bytes are not claimed identical to the current upstream branch. Other UI icon glyphs are unchanged.

All active notices and the full GPL text are embedded under LICENSE → Full license and third-party notices. There are no runtime script/font CDN requests. Historical Noto Sans files remain in the source directory for prior versions and are not used by the 1.0.3 UI. THEIA source remains readable; the JSZip minified file is the upstream distribution.

The user supplied the new THEIA and HYPERION SVG logos in assets/brand/. Both are embedded without modifying their source bytes. No repository README, banner or image folder is synchronized or changed by building the local installer.

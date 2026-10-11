# Third-party materials in THEIA 1.0.1

THEIA is licensed under GNU GPL version 3 or later (GPL-3.0-or-later); see LICENSE.md and COPYING. This local candidate does not grant any new rights to STG. It contains neither original STG nor SYNODIC Core.

| Material | Included files | License and source |
| --- | --- | --- |
| JSZip 3.10.1 distribution, including its bundled dependencies | vendor/jszip.min.js | MIT option, full upstream notice in vendor/JSZip-LICENSE.md; [tagged upstream source](https://github.com/Stuk/jszip/tree/v3.10.1) |
| JetBrains Mono subset WOFF2 | assets/fonts/mono.woff2 | SIL Open Font License 1.1, assets/fonts/JetBrains-Mono-LICENSE.txt |
| Noto Sans subset WOFF2 | assets/fonts/ui.woff2 | SIL Open Font License 1.1, assets/fonts/Noto-Sans-LICENSE.txt |

Font resources and notices are copied without changing their SYNODIC originals. All included notices are embedded in the standalone HTML under Sources & About. No font or script CDN request is needed. THEIA source stays readable; the JSZip minified file is the upstream vendor distribution rather than obfuscated THEIA source.

The user supplied concept images remain private design references in assets/reference. The user-provided header SVG is preserved in assets/brand/theia-header.svg and embedded directly in the standalone HTML. The existing repository README banner URL is retained; the header does not download or modify the banner.

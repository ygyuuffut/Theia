# THEIA changes

## 1.0.1

- Add **Force load modified game** under Original Game → Modified game options. Default off; enabling it requires confirmation that modified-game errors, broken choices or unusable saves are the player's responsibility.
- Force load bypasses only the original-game raw SHA-256 fingerprint allowlist. Declared game version, Core package integrity, Release metadata, duplicate injection and native-content preservation checks remain active.
- Mark forced candidates and exports as compatibility unverified. Changing mode revokes selected Core and generated output; changing game or cancelling resets consent.
- Include RC/Beta discovery hints and Release download/local ZIP import fallback, plus the user-provided SVG header.
- Confirm THEIA's license as GPL-3.0-or-later and embed the license text and third-party notices.

Validation: 32 Node DOM discovery/consent checks and 22 actual Worker/package/injection checks passed. A real card-workshop edit survives forced injection; normal RC output remains byte-identical. These checks do not certify modified-game gameplay or replace cross-browser file operation testing.

## 1.0.0

Initial self-contained local HTML installer with paired LUNAR + MOONSHINE Core verification, text injection and new-file export.

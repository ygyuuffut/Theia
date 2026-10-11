# 一手來源與採用範圍

查閱日期：2026-10-10。工具有時無法完整開啟 GNU FAQ／license頁，因此法律研究同時依官方搜尋可見內容與 SPDX官方完整GPL文本；沒有把網路失敗當成法律內容。本文全部政策仍需 final decision，不構成 STG许可認定。

| 來源 | 用途 |
| --- | --- |
| [GitHub Releases REST](https://docs.github.com/en/rest/releases/releases) | 一個 tag_name、draft/prerelease、public listing、pagination、latest差別 |
| [GitHub Release Assets REST](https://docs.github.com/en/rest/releases/assets) | metadata／octet-stream、200或302下載；不能保證redirect endpoint CORS |
| [GitHub CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests) | API支援CORS；Release bytes另實測 |
| [GitHub Rate Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | 匿名60/h/IP、403/429、reset／Retry-After |
| [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | 容量、流量、部署与用途限制；不能假定无限镜像 |
| [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications) | user-selected File、Blob/ObjectURL與下載 |
| [MDN SHA-256 digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) | secure context與non-streaming digest |
| [MDN showSaveFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker) | 不作跨浏览器第一版依賴 |
| [TOML v1.0](https://toml.io/en/v1.0.0) | schema提案語法；Browser parser未驗證 |
| [SemVer](https://semver.org/) | release precedence與prerelease；STG版本不强行SemVer化 |
| [JSZip API](https://stuk.github.io/jszip/documentation/api_jszip/load_async.html) | 研究解壓與CRC；不宣稱其自動防ZIP bomb |
| [SPDX GPL-3.0-only](https://spdx.org/licenses/GPL-3.0-only.html)／[or-later](https://spdx.org/licenses/GPL-3.0-or-later.html) | 標識與GPL完整文本／第14節 |
| [GNU GPL FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#GPLPluginsInNF) | proprietary main program/plugin combined work风险；不当成已裁定本案 |
| [GNU JS license rationale](https://www.gnu.org/licenses/javascript-labels-rationale.html) | JS發行的license／对应source |

本機一手來源：SYNODIC/AGENTS.md、ARCHITECTURE.md、DEVELOPMENT.md、inject_mobile.py、modules.json、tests/test_inject.py、兩個story live tests及b6.9審計報告。實際CORS／bytes／gameplay以本研究evidence優先；文件能力不能取代實測。

Godot文件不適用此項Twine/SugarCube Web檔案裝配研究。本輪技術依Browser／GitHub原始文件，沒有引用不相關Godot版本API，也未依賴Stack Overflow的舊CORS推論。

## 本地 HTML 更新（2026-10-10）

- [GitHub Releases REST](https://docs.github.com/en/rest/releases/releases)：公開 read、pagination、tag/prerelease、assets digest；來源不保證 Asset CDN CORS。
- [MDN File](https://developer.mozilla.org/en-US/docs/Web/API/File)：玩家選檔後的本地 bytes 存取。
- [MDN digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)：Web Crypto／secure context 與非 streaming hash 限制；file:// 能力由真測確定。
- [JSZip 3.10.1 source](https://github.com/Stuk/jszip/tree/v3.10.1)：vendor 出處；[StreamHelper](https://stuk.github.io/jszip/documentation/api_streamhelper.html) 用於實際解壓量限制。
- [file CORS 實測](evidence/file-cors-browser.json)、[真網路／解壓](evidence/local-network.json)、[端到端](evidence/local-installer.json)：實驗資料優先於推測，普通 browser 安全設定。

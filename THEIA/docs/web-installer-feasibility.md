# B. Web Installer Feasibility

**現行結論**：THEIA 1.0.0 已有單一自包含 file:// HTML，無 localhost 或 GitHub Pages 要求。Release API 可讀，Asset fetch 仍受 CORS；靜態 GitHub ZIP／本地匯入可行。下列早期研究資料按原環境保留；正式本地結果见 [Local HTML Installer](local-html-installer.md)。

## 判斷

技術上可在純 HTML/JavaScript 中本地完成第一版的主要處理。**完整線上流程需補上瀏覽器可讀的封包分發來源；目前 Release Asset 路徑不成立。** 本輪驗證的是 Chrome 154.0.8037.98／macOS，未部署使用者自己的 Pages，也沒有 Safari、Firefox、iOS 或 Android 實機結果。

| 能力 | 實測／限制 |
| --- | --- |
| 完整 HTML 選檔讀取 | 真實 `<input type=file>` → File.arrayBuffer → UTF-8；PC 2,968,204 B；大 fixture 36,522,644 B 通過 |
| 不上傳原版 | 原型所有請求均為本地 GET；沒有外部請求／POST，遊戲未被執行 |
| 版本解析 | `twine-user-script` 中的 `window.STG_VERSION = 'v0.2001'`；原型拒絕缺失／重複聲明 |
| SHA-256 | Web Crypto 對 bytes；raw 指紋與 Python 注入器的 native-text 指紋分開 |
| Release JSON | 真實 `https://mdn.github.io` origin 可讀 GitHub API |
| Release ZIP / Manifest Asset | 直連與 octet-stream API redirect 均遭缺少 ACAO 的 CORS 阻擋 |
| ZIP／payload 驗證與解壓 | 本地研究 ZIP：429,866 B；SHA-256、CRC32、雙 Manifest、payload hash 通過 |
| JS 注入 | 四組輸入等同 Python 全部 bytes，保持原生內容，支持測試專用冪等回灌 |
| 新 HTML 匯出 | Chrome 實際 Blob download 已保存並核對 SHA；沒有來源寫入 handle |
| 跨瀏覽器 | Firefox／WebKit runtime 未安裝，未測；不可標 Complete |

詳細輸入／輸出 hash 與原始測試見 [研究結果](../research/RESULTS.md)。檔案 API 的能力參考 [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications)；這不授權任意讀硬碟，使用者必須選檔。

## 大檔與本地處理

不要把選入 HTML 放入 iframe、innerHTML、DOM 的可載入節點或 eval。只作字串／bytes 掃描；即使 detached DOMParser 不執行腳本，也不把整份遊戲重序列化為新 HTML，避免引號、實體、空白與原生腳本文本被改動。正式識別應限定 `twine-user-script` 並檢查唯一聲明；原型的全檔 regex 只是實驗，不能抵抗偽造註解／字串。正式支持仍依可信 fingerprint allowlist，而非聲明文字或檔名。

File.arrayBuffer、UTF-8 decode、SHA-256、ZIP 解壓、字串拼接、Blob 可同時保留多份資料。36.5 MB 測試只證明本機該大小可讀與 hash，**沒有量到全程序峰值記憶體，更沒有驗證該大小的完整注入／手機安全上限**。[Web Crypto digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) 不提供串流 hash；正式版本需先量測後設定檔案／解壓上限，將計算放 Worker，轉移 ArrayBuffer、減少 stringify／重複字串及取消後的殘留。流式 JS hash 可比較，但多一個依賴與測試責任。

不需要把遊戲保存到 IndexedDB／localStorage。Core 快取可以是可刪除、重新驗證的 bytes，以 release＋hash 作 key；quota／私密模式／eviction 失敗只降級，不阻止本地匯入。儲存、跨重啟離線和 PWA 本輪未驗證，第一版不必承諾。

## 匯出與「完成」

只採 File 選檔，不取得來源 writable handle。檢查全部成功後才建立新 Blob，檔名建議 `STG-SYNODIC-<release>.html`。安裝錯誤／取消立即丟棄候選輸出，不能保留成功提示或可下载的失敗產物。任何選檔／版本變更使舊输出失效。

`<a download>` 的 click 只證明下載要求已交付，網頁通常無法確認使用者已保存／取消或磁碟寫入成功。正式措辭應區分「已驗證並產生」「已發起下載」，提供再次下載，不宣稱已確認寫入磁碟。PoC 自動化可等待 download event 並核對實際檔案，這不是正式網頁能取得的能力。

[showSaveFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker) 不是跨瀏覽器基線；若未来增强，必須額外保證不能選回原版。第一版建議不加入。瀏覽器／系統可能讓玩家另存時手動選擇相同路徑，純網站不能控制下載對話框；THEIA 的硬保證是自身無來源寫入權、無自動覆寫，並提供不同預設名。若要求連使用者對話框操作也绝對禁止覆寫，純 Web／Blob 不能保證，桌面也須自己控制該保存流程。

## 現行交付選項（GitHub Pages 已取消）

| 方案 | 玩家成本 | 維護／能力 | 限制 |
| --- | --- | --- | --- |
| 單 HTML＋Release API＋靜態 raw ZIP | 雙擊、選遊戲、確認版本、下載新檔 | 一份跨平台文件；無 server／localhost；靜態傳輸 bytes／解壓真測 | 發行者同步原樣 ZIP／catalog；正式 Core 尚未發布 |
| 單 HTML＋本地 ZIP | 多一次官方 ZIP 下載／選檔 | 不受 Asset fetch CORS；離線仍可選檔／安裝 | 若無官方外部 digest，只能聲明完整性，不能證明來源 |
| 其他靜態資源主機 | 同單 HTML | 可配置 CORS／headers | 主機維護與 exact origin 驗證；此版須擴充 host allowlist |
| 桌面安裝器 | 安裝／啟動後選檔 | 串流 I/O、控制保存、無 browser CORS | 各平台 build／簽名／更新；目前沒有必要引入 |

本地 HTML 的 file:// 選檔、Worker、Crypto、ZIP、Blob 已通過；支援桌面 Chrome。窄屏 adaptive 不等同 iOS／Android 實機功能認證。新增 45 項端到端、四項實際匯出遊戲回歸和真正靜態 ZIP 取得／hash／CRC／解壓，見 [現行交付](local-html-installer.md)。

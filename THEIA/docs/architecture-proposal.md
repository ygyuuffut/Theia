# F. THEIA 1.0.0 Architecture

現行架構由使用者批准的 Local HTML Installer 方向建立，保留三段式 UI。交付層是一份 file:// HTML，全部 code／style／font／ZIP 工具內嵌。沒有 Runtime module imports、localhost 或後端。正式 Core Manifest／公版對接仍待 SYNODIC 方確定。

| 文件 | 職責 |
| --- | --- |
| src/index.html／style.css | 原生語義 DOM、adaptive 單欄、dialogs、ARIA／鍵盤焦點、月相視覺 |
| src/app.js | 小型 session、generation／cancel、網路限時／bytes、來源設定、候選確認及 Blob lifecycle |
| src/versions.js | SemVer precedence；Stable 優先，RC/Beta 明示選擇，Legacy 不自動推薦 |
| src/inject.js | 經 Python oracle 驗證的文本注入與可逆 font／native 完整性 |
| src/package.js | JSON adapter、ZIP 目錄／實際 inflation bounds、CRC／SHA、paired Core／public payload |
| src/worker.js | 單一遊戲／Core session；本地讀取後的 hash、解壓、注入 |
| build_local.py | 明確 source inputs → worker base64＋字體＋UI → 單 HTML 與 provenance；無網路 |

Main thread 接受選檔與操作、顯示狀態，不執行遊戲或 Core 腳本。ArrayBuffer 轉移至 Blob Worker；Worker 僅將 Core 模組當文本寫進輸出，不 eval／import。原生遊戲不進 DOMParser、iframe 或 innerHTML。

更換輸入清空下游、撤銷 ObjectURL；非同步完成需核對 generation。Cancel terminate Worker、abort fetch，清空後重新選檔。輸出通過 native 文本等同性、marker exactly-once 檢查後才建立 Blob。沒有來源 writable handle，不寫原始檔；完成後可再次下載。

## 三段 UI 狀態

| 狀態 | 意義 |
| --- | --- |
| Unavailable（橙色 minus） | 前置未滿足、停用操作 |
| Ready（紫色 dot） | 能選檔／確認版本／開始安裝，未完成 |
| Working（紫色旋轉圈） | 讀取、查詢、下載、驗證或注入中 |
| Complete（綠色勾） | Game 已識別；Release 已確認與驗證；Output 已驗證生成，各步各自成立 |
| Error（橙色驚嘆號） | 失敗，顯示可讀原因與可重試操作 |

初始化 Original 是 Ready。Game identified 不代表 Core 兼容已驗證。推薦 Stable 不代替玩家確認；版本 dialog 的點選是確認。Install Ready 不放綠勾。Export Complete 表示已產生／發起下載，不能推論 disk-save-success。

UI 跟隨 [使用者概念](../assets/reference/concept-empty.png)：408px 中央操作欄、紫／金 logo、三段 card；320px 起 adaptive。無 MOD 安裝器，Additional Modules 僅資訊預留。自訂字體內嵌，不使用 remote CDN。不存在通用 framework、DI container、plugin host、account／launcher。

## 安全／分發邊界

Meta CSP 限制 script-inline、worker-blob、font-data 與批准 GitHub HTTPS connect hosts；不能宣稱等同所有 response headers。沒有 analytics、token、存檔讀取、遊戲上傳或 LUNAR Logger 依賴。網路僅 GET metadata／Core，遊戲 fingerprint 本地配對。

Releases 發行、靜態 raw transport 與本地 ZIP 可並存；ZIP 在可信 hash 取得時強制核對，離線包未獲外部認證須如實標記。來源設定暫不持久化，避免 file origin storage 差異。ZIP／game limit、memory、其他 browser 等限制見 [交付說明](local-html-installer.md)。

正式打包使用明確 allowlist，只含 THEIA 自身源碼／notices；絕不遞迴打包 prototypes/generated。README 保留遠端 Banner URL，本地 HTML 完全不依賴 Banner 的網路載入。

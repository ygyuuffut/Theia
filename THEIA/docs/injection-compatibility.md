# D. Injection Compatibility

**THEIA 1.0.1 更新**：使用者批准強制裝載修改版。正常模式保留 fingerprint allowlist；明確風險確認後可略過 raw SHA 名單，但仍要求已支持的聲明版本、唯一原生版本、未注入輸入、Core 完整性與注入後 native text 保留。強制模式不改 payload 或文本投影，也不宣稱修改版玩法相容。下文的「未知 hash 拒絕」適用於正常模式。

**本地交付更新**：單一 HTML 的 Blob Worker 使用 src/inject.js 文本投影。真實 file:// 選檔、ZIP 匯入與下載後，PC／C2 的全部 bytes 仍與既有 Python oracle 相等；實際匯出檔四项既有劇情回歸通過。正式首版拒絕已注入輸入，早期四輸入的 reinjection 僅為研究測試。證據見 [現行交付](local-html-installer.md)。

## 現有流程與基底

調查來源：`SYNODIC/inject_mobile.py`（344 行）、`modules.json`、`synodic.build.toml`、`tests/test_inject.py`、ARCHITECTURE／DEVELOPMENT 的安裝契約與 b6.9 story 修正。現行工程構建是 Python 按 source modules 裝配 HTML，沒有另一个獨立 Godot／前端編譯 Runtime 流程。STG 是 Twine/SugarCube HTML，不適合借用 Godot API 解決注入。

現有注入器 SHA-256：`d5303e70996ef557735dcb67f964a2aa92d08b4f02ca735a9026c4b87f5634eb`。build identity 是 `b6.9`／`perf-focus-2026-10-10`；組件／API 版本來自各自 TOML，不由 build version 取代。

| 實際基底 | Raw SHA-256 | 觀察 |
| --- | --- | --- |
| PC HTML | `0edabffcc6beefe3b90121835186ffe922d2bd047299155347362b3908f0bdc8` | 本機 PC 參考，不代表已由原作者認證的官方 fingerprint |
| PC.C2 HTML | `58fb30f8d4838006b41e338825ff3bb448709aeeb02bc560bf2f50c5da8532b7` | 與 PC 不同；需獨立支持規則 |
| accepted b5 | `ce9a81ba6f7c44bcecb667cc4b6eaa45a199f9c4cffe911ffc1c19c9d0518ed5` | 已有舊注入，不應在正式 Original Game 欄接受 |
| accepted b6.9 | `b7a47d72d27bb50d0f7992b79013ee1171c3bafa49fab8b98906f800d8709c08` | 已有 SYNODIC，不應重覆安裝 |

四者均聲明 `v0.2001`。聲明在 PC 第 9672 行、`<script role="script" id="twine-user-script" type="text/twine-javascript">` 的原生文字内；**不能把 HTML 放進網頁來執行這段聲明**。

重要發現：去除已知注入與還原字體後，b5／b6.9 native-text hash 是 `769e8c96a086ecdeb27b80ea68d7556c292e218d608c5a92c53460fffccd4de8`，不等於 PC。read-only 差異包含 STG_CARDS／STG_CARD_TEMPLATES 的 cost 和傷害／格擋值（如 Blast cost 1→-1、damage 5→25）。本輪沒有修復、同步或把這些差異塞進 Core。**驗收 b5 構建並不自動證明普通玩家 PC 原版的所有玩法等價。** 正式支持需單獨測每個認證基底，未知同版本改檔應拒絕或列不支持，而不是偷偷回復遊戲內容。

## 必須保留的注入語義

1. UTF-8 text 讀取；Python 現行 universal-newline 行為納入 oracle。native text fingerprint 與 raw file fingerprint 明確分開。正式若要支持 CRLF／BOM 變體，需先決定允許的 bytes，不能任意 normalization 把改檔當原版。
2. 重注入 oracle 先從 `LUNAR-font-original-imports` 還原每個唯一 `SYNODIC-FONT-IMPORT-n`，再移除現有 `STG-[A-Z-]+:START/END` blocks。此寬範圍 strip 是歷史再注入工具的行為，**不能套在不可信玩家輸入當自動修復功能**。正式 v1 遇標記就拒絕，缺／殘缺標記也要拒絕。
3. 只接受 SugarCube export；marker／anchor 必須唯一且能定位。插入使用字串切片，`replace_or_insert` 用最後一個 case-insensitive closing head/body，不能 DOM parse → serialize 改原生正文。正式還需 bounded tokenizer 分辨 script/string 中假 anchor，受認證 fingerprint 是第一層保護。
4. 核心必須同时包含 lunar 和 moonshine；`modules.json` 的順序是依賴契約。先 buffer/logger/native bridge/assets/fonts/pause，再 adapter／API，後 MOONSHINE 裝配。`.cjs` 是 classic IIFE script，不是要在瀏覽器呼叫 Node require；不得隨意 bundler 改全域／初始化順序。
5. TOML metadata、API requirement、transition timing、graphics scales、watermark、optional quotes 在 build-time 驗證與正規化。Core catalog 只有 lunar、moonshine；HECATE 不存在於公共 pack，包含 `lunar.api.hecate` 也必須排除。
6. Fonts 在 `</head>` 前加入 manifest、licenses、7 個 WOFF2 相關內嵌 face（本輪實際輸出），並只把已註冊原生 Google import 換成可逆 token；不能刪其餘 native styles／fonts。Bootstrap 自己的 fonts/licenses 也保留。
7. body 前置 JSON 依實際順序是 mod catalog、transition config、diagnostic config、main menu watermark、asset manifest，再按 modules 次序加入經典 scripts。資料中 `<`、`&` 跳脫為 unicode，不能讓 metadata 終止 script。
8. asset manifest 驗 schema/mobile availability、quality scale、imageVariants；掃描輸入新增 native Wix URL，以 deterministic hash ID 加 deferred/decorative/continue fallback，不能漏掉用戶版本的原生資源，也不能提前下載全目录。
9. Early Loading Shell 緊跟既有 viewport meta（沒有則 charset），必須早於 source CSS，charset 留在 HTML 首 1024 bytes；不能全部搬到 body 尾部。
10. 檢查原生內容可逆且等同輸入、每個 block/script exact-once、依賴次序、字體 bytes、HECATE 排除；全部成功後才給 output。原版無寫入，失敗不產生 Complete。

Python direct inject 最後才 write，但 CLI 之外的 `inject()` 沒有同路徑防護；THEIA 不能借此宣稱已有所有輸出安全機制。THEIA 獨立保證只操作 bytes／Blob、候選输出先驗證。

## JavaScript 方案比較

| 方案 | 風險／代價 |
| --- | --- |
| 完整移植 Python build 處理 | Browser 要 TOML parser、config validators、字體 base64、image variants、Python rounding/JSON/newlines 等對照；維護兩套生成器 |
| Python 發行端編譯 payload＋JS 窄注入 | 發行端保留現有 config／資源處理；瀏覽器只作已驗證的文本投影、版本／fingerprint與少量 input-specific metadata 更新；需定義安全且版本化的 payload 契約 |
| 下載已注入完整 STG | 違反不發原版的邊界，不列可選方案 |

推薦比較第二種；本輪可拋棄 PoC 就用既有 Python 對無遊戲內容的 synthetic fixture 生成 158 個 blocks，形成研究 payload，再由 JS 重現文本插入。**不是經核准的正式 package format。** 它包含自己的 Core、字體／license 資料，不包含原版 STG；input-specific fingerprint、版本、font originals、新的 deferred URLs 在浏览器處理。Python 是維護者發行工具，玩家不安裝 Python。

初次 byte comparison 發現 JavaScript JSON 序列化把 Python `1.0` 改為 `1`。保留此失敗證據，修正為保留編譯原始 JSON bytes、只附加新的資源項目；不為方便修改 Runtime／原生 STG。這例子說明 byte-equivalence 必須實測，不能只看啟動畫面。

## 回歸與等價性

四組 browser/Python byte equality、native preservation、idempotence 通過。accepted_b5 的 browser output 同時逐位元組等同已有 accepted b6.9；PC／C2 的各自 oracle 输出不同，沒有把它們強行改成 accepted build。正式 UI 拒絕 b5/b6.9；測試專用選項允許再注入以檢查 oracle 冪等，不對玩家開放。

實際從 SYNODIC 原地只讀執行既有兩項測試，以 THEIA browser output 作 absolute input，所有 report／截圖写入 THEIA。accepted_b5 和 pc 各兩項，四 job 全過：

| 測試 | 回歸重點 |
| --- | --- |
| `test_b69_story_actions_live.cjs` | scan response 不泄漏舊 choices、stale handles 不執行、reward 不重領、未見 initial shortcut 鎖定、persistent unlock 不清除、原生 bench callbacks／背景與 chrome identity、Lab notices |
| `test_b69_story_followup_live.cjs` | 既有 persistent Grace history 不能提前跳初始 upgrade；真正 Lab revisit／Proceed 保持原生；retained branch exit 排除／過期；append／translation／pause／局部 scroll；實際 embedded font ink |

結果：[gameplay-regressions.json](../research/evidence/gameplay-regressions.json)，細節在生成目錄各 `report.json`。圖像由受控 SVG 代替，storage 是测试 profile；不是 A35 真機／真 CDN／所有著作路線驗收。沒有重新執行整套 b6.9 performance audit，因為 Runtime source 未改；未宣稱性能改善。

仍需正式驗收：認證原版全部選項條件／scan completion／autosave／ending／combat／optional degradation、更多 fingerprint variants、跨瀏覽器及手機。把此前「工程正常、注入產物有幽靈選項」保留為禁止放行的案例；同源碼／同 tag 也要測**最終輸出檔**與帶 history 的 storage 情境，不只 clean profile。

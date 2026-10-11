# THEIA 1.0.1 — Local HTML Installer

目前交付為 THEIA 1.0.1，新增已獲使用者批准的強制裝載選項，授權選定 GPL-3.0-or-later。開啟 dist/THEIA-1.0.1.html 或解壓同版玩家 ZIP。以下 1.0.0 與初版瀏覽器實驗保留為歷史記錄。

2026-10-10 的使用者指示取代先前 Pages／THEIA 7.0 提案：正式交付是單一自包含 HTML，直接雙擊，使用 file://。保留 GitHub Releases，沒有 localhost、後端或 Pages 部署要求。SYNODIC 仍是內部 b6.9；本輪沒有替它改版本或發布 Core。

## 交付與來源

開啟方式：將 HTML 保存到本機，以一般瀏覽器直接開啟；或下載 [單檔 ZIP](../dist/THEIA-1.0.0.zip) 解壓後雙擊。使用者回報的 Codex 檔案預覽呈現白底／巨大 Logo；同一交付 HTML 在真正 file:// Chrome 中有 73 條頂層 CSS rules、背景 rgb(41,38,46)、Logo 寬 300px，樣式正常。源碼 src/index.html 是未展開的模板，沒有可執行的安裝器內容。預覽與源碼模板都不能替代交付 HTML 的瀏覽器顯示。

[THEIA-1.0.0.html](../dist/THEIA-1.0.0.html) 包含所有介面、字體、JSZip 3.10.1 與 Worker。來源是 ../src 與 ../build_local.py；輸入明確列出，沒有遞迴將原版、Core、私人生成檔放入 HTML。來源雜湊／產物雜湊見 [build.json](../dist/build.json)。不混淆自行開發 source；JSZip vendor 是上游提供的 minified distribution，保留 MIT notice 與上游來源連結。

頁首後續依使用者提供的新版 `THEIA WebUI.svg` 更新：完整原稿複製至 assets/brand/theia-header.svg，並嵌入交付 HTML。紫色字形漸層、金紫月牙、SYN●DIC 副標題均保留原始路徑；整組按原稿 1889:867 比例縮放，桌面寬 304px、窄屏寬 284px，最大不超過操作欄。上段 Logo 300px 及既有整頁截圖屬更新前的預覽診斷；新版頁首另以 SVG 靜態渲染核對，未將該渲染當作新一輪 file:// 功能測試。

使用者提供 [Theia 儲存庫](https://github.com/ygyuuffut/Theia)，原 README Banner URL 保留。既有 SYNODIC README 指向 [Synodic 儲存庫](https://github.com/ygyuuffut/Synodic)，唯讀 API 確认存在，故作为 Core 默认来源。THEIA／Core 來源可分别维护；本轮未变更远端 README、images、Git config、history，也未 clone／push／发布。

## 真實 file:// 實驗

下表是初版交付時的歷史實驗結果；首次公開 RC 已在後續發布。最新 Release／Manifest 及下載回應核對、RC 顯示／匯入修正另見 [RC 連線診斷](rc-release-diagnosis.md)。

Chrome 154.0.8037.98／macOS，普通安全設定，沒有 proxy 或 disable-web-security。

| 檢驗 | 結果與證據 |
| --- | --- |
| file:// Web Crypto／Worker | secure context，SHA-256 成功；真正交付頁以 Blob Worker 讀檔、解壓及注入成功 |
| GitHub Releases | Synodic API 200，列表為 []；第三方 cli/cli list 與 prerelease metadata 可讀 |
| Manifest／ZIP Release Asset | 直連與 octet-stream API 都無可讀 bytes；console 明確缺 ACAO，API redirect 並未解決 |
| 靜態 GitHub ZIP | raw JSZip v3.10.1 text.zip 200；SHA-256 `05a76d40987ca906718459170510cacf388a87fa08fcf349e008faa2dc3de5f4`，獨立 Node hash 相同，CRC／解壓得到 Hello.txt = Hello World + newline |
| 真正交付頁 API | 自動讀取遊戲後連線，顯示尚無公開 Core，Install 停用，無虛構成功 |
| 本地安裝 | 私人 b6.9 ZIP 實際匯入；PC／C2 輸出完全等同原 Python oracle |
| 版面 | 320、360、400、768、1280、1920 CSS px 無水平溢出；桌面／窄屏 PNG 人工檢查 |
| 回歸 | 實際 pc-installed／pc-c2-installed 各跑既有 story-actions／story-followup，4/4 通過 |

證據：[file CORS](../research/evidence/file-cors-browser.json)、[真正網路／靜態解壓](../research/evidence/local-network.json)、[46 項端到端](../research/evidence/local-installer.json)、[四項遊戲回歸](../research/evidence/local-gameplay-regressions.json)。其中 public 1.0.0 API/catalog/ZIP 接線由測試路由模擬，**並非真實已發行 SYNODIC 1.0.0**。真實公共靜態 ZIP 只是傳輸驗證，不是合法 Core。

PC 輸出 4,541,946 B，SHA-256 `d8340f1f570c5bd99c4b0f78c68e9d3c52b6eb3595a750778d2d979c404273ce`；C2 4,542,068 B，SHA-256 `4f77101315088c5b7f3d1e360a96b29cf5e5a909148b91bc47756ecf719484bf`。同版本 PC/C2/b5 不等同；b5 原生修改不會被加入公共 Core。

## 操作與狀態

Original Game 初始 Ready；另外兩步 Unavailable。讀取期間 Working，唯一原生版本聲明讀取並計算 hash 後 Game Complete。Game Complete 只表示已識別，支援與否仍由 Core 的已認證 raw SHA 名單決定。名字不影響識別。

1.0.1 的 **Modified game options → Force load modified game** 預設關閉，只有識別遊戲後可操作。啟用時必須確認「修改版可能有卡牌、幽靈選項、劇情或存檔錯誤，後果自負」；勾選後顯示持續警告。此模式只略過 raw SHA 名單，仍要求 Manifest 列有相同聲明版本並先完整驗證 Core。強制候選不標為 Recommended／相容已驗證，選定與匯出亦清楚標記 forced load。

啟用或關閉時清除目前 Core／輸出，需重新選 Core；更換遊戲／取消／重新開啟均關閉強制模式。Worker 每次匯出會再次要求強制授權。實際卡牌工坊改卡 fixture 在預設模式拒絕、啟用後能匯出，完整修改版 native text 及卡牌 cost 保留；正常原版輸出與前版 RC 測試逐 byte 相同。證據：[22 項 Worker 檢查](../research/evidence/force-load-tests.json)、[32 項 UI／發現模擬檢查](../research/evidence/release-discovery-tests.json)。這些 Node 測試未執行遊戲，也沒有宣稱修改版已通過完整功能／瀏覽器認證。

查詢列出相容候選，以最新相容 Stable 優先，預覽需明示開啟。只有完整查詢時標 Recommended；缺失或讀不到 Manifest 時不稱最新。最多讀 10×100 個 Release；列表超限直接報不完整。最多三個 Manifest 讀取失敗即停止，明示結果不完整，避免長時間逐個碰撞 CORS。每個請求 25 秒限時、byte limit；GitHub 無憑證請求，不埋 token。沒有 ETag／跨重啟快取；可重試或本地匯入。

玩家確認候選後，下載與驗證在 Release 區 Working。正式選擇已驗證才 Release Complete、Install Ready。Install 的紫色 dot 表示可以開始，綠勾只在全部注入／完整性檢查通過後出現。下載被瀏覽器取消仍可再次下載同一合格 Blob；Complete 表示已生成／發起下載，沒有宣稱已確認磁碟保存。

更換 game 重建 Worker／清空 Core 與輸出；更換 Core 或驗證失敗撤銷輸出；取消 terminate Worker、abort fetch 並清空三步。Generation 避免過期非同步結果覆蓋新 session。沒有 filesystem write handle；下載建議名字總與來源不同。網頁無法阻止玩家在瀏覽器另存對話框手動覆寫任意現存檔，這是下載能力邊界。

## 無後端分發選項

1. **Release API＋靜態 GitHub catalog／ZIP**：Releases 保持正式發行來源；發行者將完全相同 ZIP 放在 raw 的固定 commit／tag，提供 catalog。API tag/prerelease、Manifest version/channel、game fingerprint、ZIP SHA、內外 Manifest、檔案 SHA 全部核對。維護成本是靜態索引／原包同步；不需要 Pages 或 server。當前可在 Sources & About 設定索引，尚無正式 publisher URL，沒有默認虛構 URL。
2. **Release 手動下載＋本地 ZIP**：不依賴 Asset fetch CORS。若 API 已取得該 release、asset name、digest，強制核對完整 ZIP；若沒有可信外部摘要，僅核對 CRC／內部 SHA／schema 並顯示 origin not verified，不能稱官方包已認證。只應使用自己信任的 Core；不能用自述 hash 證明出處。
3. **其他靜態 HTTPS 主機**：可設定 CORS，但增加主機維護，並需實測每跳。此版只准 GitHub hosts；採其他 host 須先批准並扩展 CSP／來源限制。

`mode:no-cors`、瀏覽器安全參數、代理／本地服務都不是正式解法。單一 file:// HTML 不依賴 localStorage／IndexedDB／Service Worker。來源設定只在本次開啟有效，重新開啟恢復預設；儲存資料夾／持久 Core 快取不是首版依賴。

## Package adapter 與界限

現行安裝器讀 **JSON adapter schema 1**，ZIP 只包含 manifest.json、payload.json 及 Manifest 列明的 notices／文件。Schema 與 injection_contract 有明確識別；舊 research schema 0 不接受。`payload.json` 是 Core 產生端按原 Python 編譯的純文本 blocks，而非在瀏覽器重做未驗證 build 工具鏈。這是本地可測 adapter，**不等同把未定稿的官方 TOML Manifest 方案擅自凍結**。正式公版須選擇 JSON 正規化輸入，或鎖定並驗證 TOML parser；參見 [候選比較](manifest-schema-proposal.md)。

ZIP 壓縮上限 16 MiB、實際解壓總量 24 MiB、32 entries、Manifest 256 KiB、遊戲讀取 64 MiB。這些是保守工程限制，不是跨裝置已測的安全記憶體保證。目錄預檢拒絕 traversal、duplicate、symlink、encrypted、非 store/deflate、split、ZIP64、重疊／缺漏 entries；受控 stream 實際膨脹超過聲明會立刻停止，逐檔 CRC＋SHA；未列明檔案拒絕。ZIP inventory／payload paired LUNAR+MOONSHINE／private API exclusion／native preservation 全部檢查後才產生 Blob。

文字運算多份副本仍可能放大記憶體；未量峰值 RSS、低記憶體手機及 64 MiB 的完整注入，不保證所有這個尺寸的遊戲能安裝。64 MiB 讀取不是允許同版未知 hash。正常模式拒絕未認證 variant、BOM／CRLF 改 bytes；1.0.1 可由玩家確認風險後使用上述指紋豁免，但不將它視為 Core publisher 認證。

## 尚待公版放行

- 真正 SYNODIC 1.0.0 Release、發行 schema、相容 fingerprints、component/API contract、source revision／build tool provenance、ZIP/canonical manifest／static catalog 自動生成。
- 正式 catalog／Release ZIP bytes 一致性及 exact final origins 的實測；現有 mock 不替代。
- Firefox／Safari／Edge、iOS／Android 真選檔／保存／打開 HTML；responsive screenshot 不是手機功能認證。
- THEIA 已選 GPL-3.0-or-later 並附 notices；STG 注入／再分發邊界及 Core corresponding source 仍依對應 Core 發行資料釐清。

本輪可交付 THEIA 本地候選與可審查 source，尚不自動公開發行，也不修改 SYNODIC b6.9。

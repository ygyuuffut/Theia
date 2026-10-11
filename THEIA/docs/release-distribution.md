# C. Release Distribution Research

**現行更新（本地版）**：THEIA repo 是 ygyuuffut/Theia，Core repo 是 ygyuuffut/Synodic，後者目前 Releases = []。真正 file:// 下 API 可讀；Release Asset 仍被 CORS 阻擋。發行者靜態 raw ZIP／本地匯入為無後端替代，已實測靜態 ZIP hash／CRC／解壓；正式 SYNODIC Core 仍待發行。詳細現行 [交付與證據](local-html-installer.md)。下文保留早期 Pages origin 的比較，**不再是部署需求**。

## Release metadata 與真實 CORS

早期實驗尚未提供正式 SYNODIC Repository URL／Releases，故當時以公開 `cli/cli` 的 v2.102.0 作傳輸 fixture，不冒充 SYNODIC 的實際交付契約。Chrome 從真實 Pages origin `https://mdn.github.io` 發出無憑證請求，沒有關閉 web security、架設 proxy 或將瀏覽器下載等同 fetch。

| 路徑 | 結果 |
| --- | --- |
| `api.github.com/repos/cli/cli/releases?per_page=3` | 200，讀到 155,357 B JSON，ACAO=`*` |
| `github.com/.../releases/download/...checksums.txt` | CORS blocked，不能讀 bytes |
| Asset API ＋ Accept octet-stream | API 302 有 ACAO，最終 release-assets host 缺 ACAO，仍 blocked |
| Release windows_arm64 ZIP 直連 | CORS blocked |
| ZIP Asset API | 同樣 redirect 後 blocked |
| Pages 同源靜態 HTML | 200，1612 B |
| raw.githubusercontent.com pinned package.json | 200，1787 B JSON |
| pinned raw static ZIP | nested_zip64.zip：200，564 B，ZIP header 50 4b 03 04；只驗傳輸，並非 Release Asset／正式 ZIP64 支援驗收 |
| godotengine/godot-builds Release metadata | 可讀 `prerelease`／`draft`，作頻道傳輸 fixture |

證據：[實際 browser requests、headers、console](../research/evidence/cors-browser.json)。console 明確報告缺少 `Access-Control-Allow-Origin`，不是僅用 TypeError 猜測 CORS。最終 CDN URL 有短期簽名，不應保存為下載配置。

[GitHub CORS 文件](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests) 涵蓋 API，不表示所有 Release Asset host 都允許。`mode: no-cors` 只得到 opaque response，不能拿來解壓／驗證 ZIP。瀏覽器頂層下載鏈結仍可供玩家手動下載，再匯入 THEIA；那與直接 fetch 是不同模式。

## Metadata 讀取策略

使用 [List Releases API](https://docs.github.com/en/rest/releases/releases) 的 `tag_name`、`draft`、`prerelease`、`published_at`、`assets`；公開 repo 可不驗證身份。Release 只有一個 `tag_name`，沒有另一個原生 STG version Tag。`assets[].browser_download_url` 是下載位置，`assets[].url` 是 API endpoint；`zipball_url` 是來源快照，不能當成 Core ZIP。

列表需處理分页。不要只用 `/latest`：它無法替玩家依 STG 相容性挑選，也不涵蓋 prerelease。為了不漏掉舊但相容的 Core，可讀全頁或採静態 catalog 明確涵蓋所有可安裝版本；如果達到查詢上限，必須顯示候選不完整，不稱「最新」。逐頁讀而非同時爆發請求，Manifest 由 catalog 篩選後按需取。

[未驗證 API 一般限制](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) 是同 IP 每小時 60 次。保留 session cache／可刪除 metadata cache、ETag（如採條件請求需實測 preflight／headers）、按 response reset／Retry-After 退避；403、429、404、5xx、timeout、離線分開說明。不要把任何 403 都稱 rate limit。網站不埋 token／client secret，也不要求普通玩家貼私人 token。

網路失敗保留已選本地遊戲與可驗證的 Core；查詢結果過舊須標記。若本地包沒有可取得的可信 ZIP hash／catalog，不能僅靠它内部自述 hash 宣告官方包驗證成功。可接受模式需最終決策，例如使用網站內建已批准 catalog 的版本，或要求之後在線更新 catalog。

## 相容與頻道

以 Manifest 的 exact `supported_stg_versions` 篩選，不把 `0.2001` 當作 `0.2.1`、浮點數或任意 SemVer range。Game 原始聲明 `v0.2001` 與正規化字串 `0.2001` 同時保留。Core release、LUNAR API、MOONSHINE 版本、THEIA 1.0.0 均是獨立命名空間。現有 `b6.9` 不符合 SemVer，需明示 legacy mapping，不能把它擅自改成 `6.9.0` 或與未來 `1.0.0-rc.1` 自動排序。

候選政策：先最新相容 Stable；RC／Beta 由玩家明示開啟預覽頻道；沒有 Stable 時說明並讓玩家選 RC；Legacy 不自動推薦。這是待批准的建議，不是已定規則。頻道不只依 tag 字串推斷：Manifest channel、SemVer prerelease、GitHub `prerelease` 必須一致；draft、缺 Manifest、不支持 schema、tag/version 矛盾一律不列為可安裝。

「最新」以 Core SemVer precedence，不能字串比較 `1.9`／`1.10` 或以 publish 時間重發旧版冒充新版。Stable／RC／Beta 是 release 成熟度；Legacy 是維護政策，可另以 maintenance 欄位設計，避免過多頻道混義。PoC 採簡化四值，最終 Schema 未凍結。

## Tag 方案

| 方案 | 好處 | 維護成本 |
| --- | --- | --- |
| 複合 tag `synodic-v1.0.0-rc.1-stg-v0.2001` | 人可從 tag 看一組相容資訊 | 一版支援多 STG 時 tag 難表達；解析、重發和排序脆弱；仍需 Manifest |
| Core tag `v1.0.0-rc.1` + Manifest | 單一 release identity，兼容可列多版本／fingerprints | 維護 Manifest／catalog 生成與一致性驗證 |

推薦第二種。禁止同一 tag 下悄悄替換封包；變更就新 release identity，asset id/digest 改變要重新驗證。API 的 asset digest 有值可作額外核對，不假定歷史 assets 均提供，也不替代自己的文件 hash。

## 分發替代與生成順序

推荐候選是 **Releases 發行紀錄與原包＋同源静態鏡像供 Web 讀取＋手動本地 ZIP 備援**。THEIA repo 與 Core repo 可獨立：THEIA 的部署產物包含由 Core 發行工具輸出的 catalog 與原樣 ZIP，或使用同站相對路徑；不是把兩個專案合併。若 Core 放另一 Pages host／custom domain，仍需真測 CORS。raw pinned commit 靜態檔實測可讀，但不建議把 mutable branch URL 作最終信任來源；長期二進制歷史和容量也需考慮。

維護者工具由同一 Manifest bytes 寫獨立 asset 與 ZIP 內 `manifest.toml` → 產生 ZIP → 計算 whole-ZIP SHA-256 → 寫 catalog／integrity envelope → 原樣鏡像 ZIP／Manifest → 比對 hash → 準備待審核 Release 與 Pages deploy。**研究中沒有自動發布或部署。** GitHub Release Asset 的 [octet-stream redirect 行為](https://docs.github.com/en/rest/releases/assets) 需要逐跳驗證，不能以 API metadata 的 CORS 推論最終 bytes。

![Theia Image](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/Theia%20Banner.png)

# THEIA - A SYNODIC Installer

THEIA **1.0.1** 是給 STG 使用的本地 HTML 安裝器。單一檔案內含介面、字體、ZIP 解壓器與背景處理程式；直接雙擊開啟，玩家不需要 Python、終端機、本地伺服器或 GitHub Pages。桌面優先，版面會隨裝置寬度調整。

## Getting Started

請先將 HTML 存到本機，再用一般瀏覽器開啟。此對話中的 Codex 檔案預覽曾未套用內嵌樣式，出現白底與放大的 Logo；該預覽不能作為安裝器的實際顯示或操作驗收。也可下載 [單檔 ZIP](dist/THEIA-1.0.1.zip)，解壓後雙擊裡面的 HTML。

1. 開啟 [THEIA-1.0.1.html](dist/THEIA-1.0.1.html)，建議使用目前版本的桌面 Chrome。
2. 在 Original Game 選擇自己的原版 STG HTML。THEIA 讀取原生版本聲明及 SHA-256，不依檔名判斷。
3. 在 SYNODIC Release 確認相容版本，或選 Import Core ZIP 匯入已下載的相容封包。
4. 在 Install & Export 安裝並下載新 HTML。預設名稱為 `STG-SYNODIC.html`；若來源也叫此名稱，改用 `STG-SYNODIC-installed.html`。原始檔案只讀。

卡牌工坊或其他工具修改過的遊戲，在正常模式仍會因指紋不符而被拒絕。需要安裝時，展開 **Original Game → Modified game options**，勾選 **Force load modified game** 並確認風險，再選擇或匯入 Core。強制裝載只略過原版指紋限制；遊戲聲明版本、Core 完整性及重複注入檢查仍有效。畫面會持續標示相容性未驗證、後果自負；切換模式會撤銷舊 Core／匯出，更換遊戲會關閉此選項。

**SYNODIC 首個 RC 已發布。** 在 SYNODIC Release 打開 `Show RC & Beta releases`；若線上 Manifest 讀取失敗，可從該區下載真正 Core ZIP，再用 `Import Core ZIP…` 匯入。THEIA 仍會驗證 ZIP、每個檔案與遊戲指紋，公開 Release 的存在本身不代表已確認相容。現行首發的 CORS／版本配對問題見 [RC 連線診斷](docs/rc-release-diagnosis.md)。一般任意 ZIP、舊 research ZIP 或原版遊戲 ZIP 不能當 Core 安裝。

`Sources & About` 可調整 Core 儲存庫和發行者提供的靜態分發索引。預設 Core 來源是 [ygyuuffut/Synodic](https://github.com/ygyuuffut/Synodic)，THEIA 自身來源是 [ygyuuffut/Theia](https://github.com/ygyuuffut/Theia)。保留既有 README 的 Banner URL；遠端 README、圖片與倉庫內容均未修改或發布。

## 驗證與目前限制

初版真正的 `file://` Chrome 已通過 **46 項端到端檢查**。PC／C2 的匯出結果與既有 Python 注入器逐位元組相同，四項既有劇情／幽靈選項回歸全部通過。320–1920 CSS px 寬度無水平溢出。這是桌面 Chrome 的實測與窄屏排版驗證，尚非 Firefox、Safari、手機實機檔案操作認證。後續 RC 發現修正另以 Node DOM 測試驗證；目前公共 RC 的本地校驗及文字注入測試見連線診斷，沒有把它宣稱為新一輪完整瀏覽器／遊戲回歸認證。

Release API 可讀，Release Asset 直接 fetch 仍遇 CORS 阻擋。無後端的替代方案是發行者提供靜態 GitHub 索引／相同 ZIP，或玩家手動下載後匯入。真正的靜態 ZIP 取得、SHA-256、CRC 與解壓已通過；目前 SYNODIC 尚未提供所需靜態索引，API／catalog 自動安裝流程的驗證仍包含模擬回應。

本地 ZIP 的自述 hash 不證明官方來源；THEIA 會清楚標記。若已取得相同 Release 的官方 ZIP digest，匯入會強制核對。失敗或更換輸入會撤銷舊匯出。完成表示新 HTML 已驗證並發起下載；瀏覽器無法普遍確認玩家是否已保存至磁碟。

## 文件與原始碼

1.0.1 發布檔案與可貼入 GitHub 的更新說明見 [Release 1.0.1](docs/release-1.0.1.md)。執行 `python3 package_release.py` 可重建單檔 HTML、玩家 ZIP、完整源碼 ZIP、來源摘要、校驗清單及發行者整合 ZIP；此工具不發布或上傳。

| 內容 | 文件 |
| --- | --- |
| 現行交付／測試／限制 | [Local HTML Installer](docs/local-html-installer.md) |
| A. 用途與邊界 | [Project Overview](docs/project-overview.md) |
| B. 可行性 | [Web Installer Feasibility](docs/web-installer-feasibility.md) |
| C. 分發／CORS | [Release Distribution](docs/release-distribution.md) |
| D. 注入語義 | [Injection Compatibility](docs/injection-compatibility.md) |
| E. Manifest 候選 | [Schema Proposal](docs/manifest-schema-proposal.md) |
| F. 架構 | [Architecture](docs/architecture-proposal.md) |
| G. 後續驗收 | [Roadmap](docs/implementation-roadmap.md) |
| 授權研究 | [GPLv3／第三方邊界](docs/licensing.md) |
| 開發重現 | [Reproducing](research/REPRODUCING.md) |

原始碼在 `src/`，建置入口為 `build_local.py`；[build.json](dist/build.json) 記錄交付雜湊及來源檔案雜湊。`prototypes/generated/` 含私人測試遊戲，禁止公開或打包。授權已確定為 GPL-3.0-or-later，完整文字附於 COPYING；第三方 JSZip／字體授權均附於 HTML 與源檔。

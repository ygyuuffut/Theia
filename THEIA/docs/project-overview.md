# A. Project Overview

現行交付：**THEIA 1.0.0 — 單一自包含 Local HTML Installer，直接雙擊 file://**。GitHub Pages 已取消，Core 發行來源仍是 GitHub Releases。使用者已批准三段式 UI 方向；現行驗證與待對接範圍見 [Local HTML Installer](local-html-installer.md)。

THEIA 是獨立維護與發行的 STG 安裝／封裝工具，讓玩家用自己持有的 HTML 安裝相容 SYNODIC Core。第一版是可靠安裝器；Prism Launcher 僅作操作清晰度參考，不引入帳號、遊戲啟動平台、實例管理或市集。

| 系統 | 責任 |
| --- | --- |
| STG | 玩家提供的遊戲本體、原生玩法與著作權內容 |
| LUNAR API | 原生橋接、資料正規化、互動及資源解析 |
| MOONSHINE UI | 自有手機 UI、呈現與玩家輸入，只經 LUNAR API |
| SYNODIC Core | LUNAR + MOONSHINE 成對部署 |
| HECATE | 私人可選 MOD；公共 Core 排除本體及專用 API/UI |
| 既有 Python 注入器 | 經驗證的 build-time 裝配與原生內容保留語義 |
| THEIA | 識別輸入、相容版本配對、取得／驗證 Core、注入、另存新檔 |

THEIA 不依賴遊戲執行中的 LUNAR API，也不屬於 MOONSHINE UI。THEIA 自己的檔案／網路操作不是新增的 LUNAR 功能。封包產生端與 THEIA 的協作協議必須有版本，不把其檔案存取塞進 Runtime。

流程：開啟 THEIA → 使用者選擇 STG HTML → 讀取聲明版本與指紋／既有注入標記 → 查詢指定公開 Repository Releases → 按 Manifest 篩相容 Core → 建議預設版本 → 玩家確認 → 下載或匯入 ZIP → 驗證 → 注入 → 結構完整性檢查 → 建立新 HTML Blob → 玩家下載。

GitHub 只接收一般 API／Core 資源請求；**原版遊戲、遊戲指紋、存檔與遊戲內容不提交外部服務**。GitHub 仍能見到取得 metadata／封包的 IP 與一般請求資料，不把「本地處理」誤寫成完全沒有網路。

本輪確認目錄：父層有 PC／C2／b5 HTML、工坊與 card-editor，`SYNODIC/` 有注入器、modules.json、lunar、moonshine、hecate、測試與 b6.9 構建；`SYNODIC-RELEASE/` 和 `THEIA/` 原為空資料夾。平級 `THEIA/` 足夠隔離，不重組既有工程，也不填充 SYNODIC-RELEASE。

第一版保留 Additional Modules 的導覽／資訊位置即可，不收 MOD、不解析依賴、不建立市集。模組管理只在 Manifest 提案保留資料欄位。

# THEIA 1.0.1

THEIA 1.0.1 新增修改版遊戲的 **Force load modified game（強制裝載）** 選項，供卡牌工坊等工具修改過的 STG 使用。

在 **Original Game → Modified game options** 勾選此選項並確認風險，再選擇／匯入 Core。預設仍檢查原版指紋；強制裝載只略過指紋限制，遊戲聲明版本、Core ZIP／檔案完整性、重複注入及原生內容保留檢查仍會執行。

修改版可能出現卡牌效果、幽靈選項、劇情條件或存檔問題，**相容性未經確認，後果自負**。THEIA 會持續標示警告；更換遊戲後重新關閉強制模式，切換模式會清除舊 Core 選擇與匯出。

本版保留新版 SVG 頁首、RC／Beta 顯示指引與公開 Release 的下載／本地 ZIP 匯入備援。THEIA 授權確定為 **GPL-3.0-or-later**，完整授權及第三方 notices 附於安裝器與原始碼包。

驗證：32 項 Node UI／發現／確認測試、22 項實際 Worker／Core／文字注入測試通過。卡牌工坊改卡後的 HTML 能在強制模式輸出並保留修改，正常原版輸出仍逐 byte 相同。未將這些測試當作修改版玩法或新一輪跨瀏覽器認證。

THEIA 仍是可雙擊開啟的單一 HTML，玩家不需要 Python、終端機或本地伺服器。發行包不包含原版 STG、SYNODIC Core 或私人測試遊戲。

## 發布資料

- Repository：ygyuuffut/Theia
- Tag：`v1.0.1`
- Title：`THEIA 1.0.1`
- Prerelease：否
- `THEIA-1.0.1.zip`：玩家下載；解壓後只有完整獨立 HTML。
- `THEIA-1.0.1.html`：可選的直接下載。
- `THEIA-1.0.1-source.zip`：未混淆原始碼、素材／授權與建置／封裝工具；解壓後 `python3 THEIA/build_local.py` 可重現 HTML，只需 Python 標準庫。
- `THEIA-1.0.1-build.json`、`THEIA-1.0.1-source-archive.json`：來源及產物雜湊。
- `SHA256SUMS.txt`：發布檔案的 SHA-256。

`THEIA-1.0.1-release.zip` 是供發行者使用的整合封裝：解壓後上傳內部資產；RELEASE-NOTES.md 可作為 Release 說明。整合封裝不會自動發布。公開 Core 的 Tag／Manifest 與 CORS／靜態索引限制另見 rc-release-diagnosis.md；強制裝載不略過這些限制。

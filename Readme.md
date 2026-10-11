![Theia Image](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/Theia%20Banner.png)

# THEIA - A SYNODIC Installer

This project is a Mac/PC based SYNODIC installer for sugarcube game "STG".

## Synodic

Access the Synodic repository [here](https://github.com/ygyuuffut/Synodic).

## Getting Started

The instructions below apply to **THEIA 1.0.1**. THEIA runs as a single local HTML file. You do not need Python, a terminal, or a local server.

![Screen101](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/1.0.1.png)

### 1. Download and open THEIA

1. Open [THEIA Releases](https://github.com/ygyuuffut/Theia/releases) and download the installer ZIP, such as `THEIA-1.0.1.zip`.
2. Unzip it, then open `THEIA-1.0.1.html` in a desktop browser. If double-clicking opens an editor or preview, use **Open With** to choose Chrome or Edge. Desktop Chrome is the tested browser; other browsers and mobile file workflows may behave differently.
3. Have your own legally obtained STG HTML ready. THEIA does not include the game or SYNODIC Core. Your selected game is processed in your browser and is not uploaded by THEIA.

The installer ZIP and SYNODIC Core ZIP are different files. The `-source.zip` assets are for source code, not installation.

<!-- Optional screenshot: 01-theia-1.0.1-start.png
Use a screenshot of THEIA-1.0.1.html with the 1.0.1 footer visible. Upload it, paste its URL below, then remove this comment wrapper.
![THEIA start screen]()
-->

### 2. Original Game

Click **Select Game…** under **Original Game**, then choose your STG `.html` file. THEIA reads the declared game version and calculates its fingerprint; renaming a file does not change compatibility.

When the file has been read, the card shows its filename and version. This means the game has been identified; compatibility still needs to be checked against a Core package. Click the card again to change the file. Changing the game clears the previous Core selection and export.

Use an uninstalled game file. A file that already contains SYNODIC is rejected to prevent duplicate injection. For card-workshop edits, see **Modified Games** below.

### 3. SYNODIC Release

Open the **SYNODIC Release** card. THEIA queries the configured SYNODIC repository and lists releases whose metadata and game compatibility can be checked. When available, the latest verified compatible stable release is marked **Recommended**. You must select a release to confirm it.

**RC / Beta:** Enable **Show RC & Beta releases** to view preview releases. They are hidden by default and are not automatically recommended. Use **Find releases** to refresh the list.

**If direct downloading is unavailable:** Use **Download Core ZIP…** or **Open Release…**, download the actual `synodic-core-<version>.zip` from [SYNODIC Releases](https://github.com/ygyuuffut/Synodic/releases), then click **Import Core ZIP…** and choose that ZIP without extracting it. Do not import the source ZIP or GitHub's automatic “Source code” archives.

THEIA checks the package and game before enabling installation. A published release or a successful download alone does not confirm compatibility. If the UI says **origin not verified**, the package passed internal integrity checks, but its official origin was not established; use Core files from a source you trust.

<!-- Optional screenshot: 02-theia-1.0.1-release.png
![RC selection and local ZIP import]()
-->

### 4. Install & Export

After the Core is verified and selected, click **Install & Export**. THEIA installs LUNAR + MOONSHINE locally and requests a download of a new HTML file only after its output checks pass.

The default export name is `STG-SYNODIC.html`. If the input already has that name, the suggested output is `STG-SYNODIC-installed.html`. THEIA reads the input without writing to it; save the download as a separate file and keep your original game and saves as backups.

Open the exported HTML to play. A completed install means the output was generated and the browser was asked to download it; check your download folder to confirm it was saved. If you dismissed the download, click the completed export card again to download it again.

<!-- Optional screenshot: 03-theia-1.0.1-export.png
![Completed install and export]()
-->

### Modified Games

Card-workshop edits change the game's fingerprint, so rejection in normal mode is expected. In THEIA 1.0.1, you may explicitly use **Force load modified game**:

1. Select your modified HTML under **Original Game**.
2. Expand **Modified game options** and enable **Force load modified game**.
3. Read and accept the risk confirmation, then select or import the Core again.
4. Check the forced-load warning, then use **Install & Export** to generate a separate output.

> **Use at your own risk.** Modified-game compatibility is unverified. Card effects, story conditions, choices or saves may break. Force loading bypasses only the original-game fingerprint allowlist; it does not make an incompatible game version or a damaged Core package installable, and it does not allow duplicate SYNODIC injection.

Force loading is off by default. Changing the game or cancelling resets it. Changing this option clears the selected Core and generated output, so select the Core again after switching modes.

<!-- Optional screenshot: 04-theia-1.0.1-force-load.png
![Force-load option and warning]()
-->

### Status indicators

| State | Meaning |
| --- | --- |
| Unavailable | Finish the required earlier step first. |
| Ready | You can start this step; it is not complete yet. |
| Working | Wait for processing, or use Cancel. |
| Complete | This step has finished; read its description for what was checked. |
| Error | Read the message and correct the input or retry. |

### Troubleshooting

| Issue | What to do |
| --- | --- |
| RC is missing | Enable **Show RC & Beta releases**, then use **Find releases**. |
| Online download or verification fails | Download the actual Core ZIP from SYNODIC Releases and use **Import Core ZIP…**. Browser restrictions may prevent direct reads of Release assets. |
| Fingerprint mismatch | Use an accepted original file, or explicitly enable Force load for your modified game. |
| Version, Manifest or package mismatch | Use a correctly paired release and package. Force load does not bypass these checks. |
| Already contains SYNODIC | Choose a file that has not been injected. |
| GitHub request unavailable | Follow the retry message, or import a previously downloaded trusted Core ZIP. |
| White page or oversized logo in a preview | Save the complete release HTML locally and open it in a normal browser. |

**Sources & About** shows licenses and lets you change the Core repository. Only enter a static distribution-index URL supplied by the publisher; leave it blank if none is provided. These settings apply only to the current session.

---

![Theia Image](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/Theia%20Banner%20ZH.png)

# THEIA — SYNODIC 安裝器

THEIA 是供 Mac／PC 使用的 SYNODIC 安裝器，適用於 SugarCube 遊戲「STG」。

## 關於 SYNODIC

前往 [SYNODIC 儲存庫](https://github.com/ygyuuffut/Synodic) 取得 Core 發行包。

## 開始使用

以下說明適用於 **THEIA 1.0.1**。THEIA 是單一的本地 HTML 檔案，玩家不需要安裝 Python、使用終端機或啟動本地伺服器。

![Screen101](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/1.0.1.png)

### 1. 下載並開啟 THEIA

1. 前往 [THEIA 發行頁](https://github.com/ygyuuffut/Theia/releases)，下載安裝器 ZIP，例如 `THEIA-1.0.1.zip`。
2. 解壓後，以桌面瀏覽器開啟 `THEIA-1.0.1.html`。若雙擊後進入編輯器或檔案預覽，請使用「開啟方式」選擇 Chrome 或 Edge。目前已實測桌面 Chrome；其他瀏覽器與手機的選檔／下載操作可能不同。
3. 準備自己合法取得的 STG HTML。THEIA 不包含遊戲或 SYNODIC Core；所選遊戲會在本機瀏覽器內處理，THEIA 不會將它上傳。

THEIA 安裝器 ZIP 與 SYNODIC Core ZIP 是不同的檔案。名稱含 `-source.zip` 的資產是原始碼包，不是安裝包。

<!-- 可選截圖：01-theia-1.0.1-start.png
使用 THEIA-1.0.1.html 的實際截圖，保留 1.0.1 版本頁腳。上傳後填入網址，並移除這段註解的外框。
![THEIA 初始畫面]()
-->

### 2. 選擇遊戲

點擊 **Original Game** 的 **Select Game…**，選擇自己的 STG `.html`。THEIA 會讀取遊戲聲明版本並計算指紋；更改檔名不會改變相容性。

讀取完成後，卡片會顯示檔名與版本。這表示已識別遊戲，相容性仍須與 Core 封包核對。再次點擊卡片可更換檔案；更換遊戲會清除先前的 Core 選擇與匯出。

請使用尚未安裝 SYNODIC 的遊戲檔案。已包含 SYNODIC 的檔案會被拒絕，以防重複注入。若使用卡牌工坊修改過的遊戲，請參閱下方的 **修改版遊戲**。

### 3. 選擇 Core

開啟 **SYNODIC Release** 卡片。THEIA 會查詢設定的 SYNODIC 儲存庫，列出可核對版本資料與遊戲相容性的發行包。若有可確認的相容正式版，最新版本會標示 **Recommended**；仍須由玩家點選確認。

**RC／Beta：** 勾選 **Show RC & Beta releases** 才會顯示預覽版。預覽版預設隱藏，也不會自動標成推薦版本。點擊 **Find releases** 可重新查詢。

**若無法直接下載：** 使用 **Download Core ZIP…** 或 **Open Release…**，從 [SYNODIC 發行頁](https://github.com/ygyuuffut/Synodic/releases) 下載真正的 `synodic-core-<version>.zip`，再點擊 **Import Core ZIP…**，直接選取 ZIP，不必解壓。不要匯入原始碼 ZIP 或 GitHub 自動提供的「Source code」壓縮包。

THEIA 會在允許安裝前驗證封包與遊戲。版本已發布或下載成功，本身不代表相容性已確認。若畫面顯示 **origin not verified**，表示內部完整性檢查通過，但尚未確認官方來源；請使用自己信任的來源提供的 Core。

<!-- 可選截圖：02-theia-1.0.1-release.png
![RC 選擇與本地 ZIP 匯入]()
-->

### 4. 安裝與匯出

Core 驗證並選定後，點擊 **Install & Export**。THEIA 會在本機安裝 LUNAR＋MOONSHINE，並在輸出檢查通過後下載新的 HTML。

預設匯出名稱為 `STG-SYNODIC.html`。若輸入檔案已使用此名稱，下載建議名稱會改為 `STG-SYNODIC-installed.html`。THEIA 只讀取來源檔；請將下載另存為新檔，保留原始遊戲與存檔備份。

開啟匯出的 HTML 即可遊玩。安裝完成表示已產生輸出並請求瀏覽器下載；請查看下載資料夾，確認檔案已儲存。若取消了下載，可再次點擊已完成的匯出卡片重新下載。

<!-- 可選截圖：03-theia-1.0.1-export.png
![安裝與匯出完成]()
-->

### 修改版遊戲

卡牌工坊修改會改變遊戲指紋，因此正常模式拒絕此類檔案是預期行為。THEIA 1.0.1 提供由玩家主動啟用的 **Force load modified game（強制裝載）**：

1. 在 **Original Game** 選擇修改過的 HTML。
2. 展開 **Modified game options**，勾選 **Force load modified game**。
3. 閱讀並接受風險確認後，重新選擇或匯入 Core。
4. 確認畫面上的強制裝載警告，再使用 **Install & Export** 產生另一份檔案。

> **後果自負。** 修改版相容性未經確認，可能發生卡牌效果、劇情條件、選項或存檔問題。強制裝載只略過原版遊戲的指紋名單；不會放行不相容的遊戲版本、損壞的 Core 封包或重複 SYNODIC 注入。

強制裝載預設關閉，更換遊戲或取消操作會重設。切換此選項會清除已選 Core 與產生的輸出，因此切換模式後須重新選 Core。

<!-- 可選截圖：04-theia-1.0.1-force-load.png
![強制裝載選項與警告]()
-->

### 狀態提示

| 狀態 | 意義 |
| --- | --- |
| 不可用（Unavailable） | 先完成必要的前一步。 |
| 可操作（Ready） | 可以開始此步驟，尚未完成。 |
| 處理中（Working） | 等待處理完成，或使用 Cancel 取消。 |
| 完成（Complete） | 此步驟已完成，請依卡片文字確認檢查範圍。 |
| 錯誤（Error） | 依錯誤訊息修正輸入或重試。 |

### 常見問題

| 問題 | 處理方式 |
| --- | --- |
| 看不到 RC | 勾選 **Show RC & Beta releases**，再點 **Find releases**。 |
| 線上下載或驗證失敗 | 從 SYNODIC 發行頁下載真正的 Core ZIP 後，使用 **Import Core ZIP…** 匯入；瀏覽器限制可能阻擋直接讀取發行資源。 |
| 指紋不符 | 使用受支援的原版；修改版可在確認風險後啟用強制裝載。 |
| 版本、Manifest 或封包不一致 | 使用資料一致的發行包；強制裝載不略過這些檢查。 |
| 已包含 SYNODIC | 改選尚未注入的遊戲檔案。 |
| GitHub 請求不可用 | 依訊息稍後重試，或匯入已下載且可信的 Core ZIP。 |
| 預覽中白底或 Logo 過大 | 將完整發行 HTML 儲存到本機，再以一般瀏覽器開啟。 |

**Sources & About** 可查看授權並調整 Core 儲存庫。靜態分發索引僅填入發行者提供的網址；若沒有提供，保持空白即可。這些設定只對本次開啟有效。

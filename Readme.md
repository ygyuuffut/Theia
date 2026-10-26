![Theia Image](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/Theia%20Banner.png)

# THEIA — SYNODIC Installer for STG

**Version 1.0.3** · A single, self-contained local HTML installer · **GPL-3.0-or-later**

[Download THEIA](https://github.com/ygyuuffut/Theia/releases) · [SYNODIC Core releases](https://github.com/ygyuuffut/Synodic/releases) · [Report an issue](https://github.com/ygyuuffut/Theia-Synodic-Issues/issues)

THEIA installs SYNODIC Core (LUNAR API + MOONSHINE UI) into your own STG HTML and exports a new file. No Python, terminal or local server is needed. Your game stays in your browser; THEIA does not upload it. Neither STG nor SYNODIC Core is bundled with the installer.

## What's new in 1.0.3

- A redesigned, adaptive three-step wizard with new THEIA and HYPERION logos.
- Smooth progress transitions and continuous left/right page switching.
- A catalog with release notes, version ordering, optional Beta/RC releases and automatic download/import where the source permits it.
- Compatibility review in the final step, with an explicit FORCE INSTALL option for modified or different-version games.
- English or Traditional Chinese alerts according to the browser's primary language.
- Two-line filenames before scrolling, thin purple scrollbars, fixed Guide headings and compact catalog controls.
- A yellow Material Symbols Outlined Info icon for catalog read problems.

HYPERION is a **Coming Soon** page. Module installation and a module marketplace are not included.

## Get started

### 1. Download and open

Download **THEIA-1.0.3.zip**, extract it and open **THEIA-1.0.3.html** in a desktop browser. You may also download the HTML directly. If double-clicking opens an editor or file preview, choose a browser with **Open With**.

The installer ZIP, SYNODIC Core ZIP and source-code ZIP are different files. The **THEIA-1.0.3-source.zip** archive is for developers, not the player installer. Use the built HTML rather than the source template.

<!-- Optional screenshot: 01-theia-1.0.3-start.png
Upload a screenshot of THEIA 1.0.3, insert its URL, then remove this comment wrapper.
![THEIA 1.0.3 start screen]()
-->

### 2. Select Your Game — step 1/3

Click **+** and select your legally obtained STG HTML. THEIA reads the declared version and calculates its fingerprint. A filename alone never establishes compatibility.

The card shows the filename and detected version, then **Continue** becomes available. Full and Demo identities are distinct; recognizing a Demo such as **0.2002-demo.3** does not itself mean a Core supports it. Already-injected games are rejected.

Selecting another game clears the previous Core, force consent and export.

### 3. Choose Synodic Version — step 2/3

Choose **Search Catalog** or **Browse Locally**.

**Search Catalog**
1. THEIA highlights the latest known compatible stable release when available.
2. Enable **Beta/RC Releases** to include prereleases. Versions are ordered by version precedence; for example, 1.0.6 comes before 1.0.6-rc.1, which comes before 1.0.5.
3. Select a release and read its notes.
4. Click **Obtain Confirmed Selection**. THEIA attempts to download, verify and import the Core.
5. Once loaded, the card identifies the install candidate and **Continue** becomes available. Highlighting a catalog row alone does not load a Core.

The refresh icon reloads the catalog; the red **×** returns to the selection card. Hover over an icon for its tooltip. A yellow **Info** icon appears when some release information cannot be read. A missing or unreadable Manifest is **not proof that no compatible release exists**. When compatibility is unknown, the catalog can show **Published Versions** instead of verified compatible versions.

**If automatic import fails:** THEIA returns to step two and attempts a normal ZIP download. If the browser blocks that action, use the displayed **Download Core ZIP** link. After downloading, choose **Browse Locally** and import the ZIP yourself. Network restrictions and GitHub CORS can prevent direct reading even when an ordinary download works.

**Browse Locally**
Select a **SYNODIC Core ZIP**, without extracting it. Do not select the THEIA ZIP, SYNODIC source archive or GitHub's automatic “Source code” archive. THEIA validates the package before loading it; game compatibility is checked in step three. Internal hashes detect inconsistency but do not independently authenticate a package's publisher.

Click the loaded candidate card to reset your selection.

<!-- Optional screenshot: 02-theia-1.0.3-catalog.png
![Catalog and release notes]()
-->

### 4. Ready for Installation — step 3/3

Review the Core version, export filename and compatibility result.

- **Compatible:** click **Install & Save As**.
- **Not Compatible:** normal installation is disabled. Check that you selected the intended game and Core.
- **FORCE INSTALL:** after accepting the warning, you can attempt installation despite a game-version or fingerprint mismatch. Modified games may need this option. Use it at your own risk: successful injection does not guarantee working gameplay or saves.

Force does **not** bypass invalid STG detection, package-integrity checks, duplicate-injection checks or native-content preservation. It does not change **Not Compatible** into **Compatible**. Choosing another game or Core resets consent; changing force mode invalidates any previous export.

<!-- Optional screenshot: 03-theia-1.0.3-force-install.png
![Final compatibility review and Force Install]()
-->

### 5. Save the result

**Install & Save As** generates a new HTML and requests a browser download. The usual filename is **STG-SYNODIC.html**; if that is already the input filename, THEIA uses **STG-SYNODIC-installed.html**. THEIA does not write to the selected original. Keep the export separate when choosing where to save it.

A green **SYNODIC Installed** result means generation succeeded and download was requested. Check your browser's Downloads list; the page cannot confirm that you retained the file on disk. Clicking the button again can download the verified output again.

A red **Installation Failed** result is not a successful export. Review the error before retrying.

<!-- Optional screenshot: 04-theia-1.0.3-installed.png
![Successful installation]()
-->

## Troubleshooting

| Situation | What to do |
| --- | --- |
| GitHub returns 403 or asks you to retry later | Wait until the indicated time; repeated refreshes do not bypass a rate limit. You can import a previously downloaded Core ZIP. |
| Manifest or ZIP cannot be read | Hover over the yellow Info icon. Use an ordinary Core ZIP download and Browse Locally. This is not automatically a compatibility failure. |
| Fingerprint or version mismatch | Check the selected versions. For an intentional modification or unsupported version, consider FORCE INSTALL and its risks. |
| Package validation fails | Download the intended Core ZIP again. Force cannot bypass corruption or missing required contents. |
| The game already contains SYNODIC | Start with your original, uninjected STG file. |
| The page looks unstyled in a file preview | Open the built THEIA-1.0.3.html in a browser rather than an editor's preview. |
| No saved file appears | Check blocked downloads and the Downloads list, then request the export again. |

Use **ISSUES** for [the shared issue tracker](https://github.com/ygyuuffut/Theia-Synodic-Issues/issues). Include the THEIA/Core versions, detected game version, browser and error text. Do not upload the whole game or private saves.

## License and source

**LICENSE** opens the license information; **Sources & About** provides source information and available source settings. Any optional publisher index must be supplied by its publisher; THEIA does not make an unreadable source trustworthy.

THEIA uses **GNU GPL v3 or later (GPL-3.0-or-later)**. The source archive includes build tools and third-party notices. STG remains the copyright holder's work; THEIA does not relicense it or distribute the original game.

Validation of the current build includes automated workflow/package checks and reproducible source builds. This is not a guarantee of every browser, mobile download workflow, live network endpoint or forced game's behavior.

---

![Theia 中文橫幅](https://raw.githubusercontent.com/ygyuuffut/Theia/refs/heads/main/images/Theia%20Banner%20ZH.png)

# THEIA — STG 的 SYNODIC 安裝器

**版本 1.0.3** · 單一、自包含的本地 HTML 安裝器 · **GPL-3.0-or-later**

[下載 THEIA](https://github.com/ygyuuffut/Theia/releases) · [SYNODIC Core 發行頁](https://github.com/ygyuuffut/Synodic/releases) · [回報問題](https://github.com/ygyuuffut/Theia-Synodic-Issues/issues)

THEIA 將 SYNODIC Core（LUNAR API + MOONSHINE UI）安裝到你自行提供的 STG HTML，並輸出新檔案。不需要 Python、終端機或本地伺服器。遊戲只在你的瀏覽器內處理，不會由 THEIA 上傳。安裝器不附帶 STG 或 SYNODIC Core。

## 1.0.3 更新內容

- 重新設計的自適應三步流程，以及新版 THEIA／HYPERION 標誌。
- 平滑的進度條動畫，以及可持續向左／右循環的頁面切換。
- 整合發行說明、版本排序、Beta／RC 選項及來源允許時的自動下載匯入。
- 相容性檢查移至最後一步；修改版或不同版本遊戲可明確選擇 FORCE INSTALL。
- 依瀏覽器主要語言顯示英文或繁體中文警告。
- 檔名超過兩行才捲動、細紫色捲軸、固定 Guide 標題及精簡的目錄控制。
- 目錄讀取出現問題時，以黃色 Material Symbols Outlined Info 圖標提供說明。

HYPERION 目前僅為 **Coming Soon** 頁面，尚未提供模組安裝或模組市集。

## 開始使用

### 1. 下載並開啟

下載 **THEIA-1.0.3.zip**，解壓縮後用桌面瀏覽器開啟 **THEIA-1.0.3.html**。也可以直接下載 HTML。如果雙擊後開啟的是編輯器或檔案預覽，請透過「打開方式」選擇瀏覽器。

THEIA 安裝器 ZIP、SYNODIC Core ZIP 與原始碼 ZIP 是不同檔案。**THEIA-1.0.3-source.zip** 提供開發用途，並非玩家安裝器。請開啟封裝完成的 HTML，而非原始碼中的頁面模板。

<!-- 可選截圖：01-theia-1.0.3-start.png
上傳 THEIA 1.0.3 截圖、填入網址後，再移除此註解外框。
![THEIA 1.0.3 起始畫面]()
-->

### 2. Select Your Game — 第 1/3 步

點擊 **+**，選擇你合法取得的 STG HTML。THEIA 會讀取遊戲聲明版本並計算指紋，不會單憑檔名判斷相容性。

卡片顯示檔名與偵測版本後，**Continue** 即可使用。正式版與 Demo 是不同身分；例如，能辨識 **0.2002-demo.3** 不代表某個 Core 就支援它。已注入 SYNODIC 的遊戲會被拒絕。

重新選擇遊戲會清除先前的 Core、強制安裝同意及輸出。

### 3. Choose Synodic Version — 第 2/3 步

選擇 **Search Catalog** 或 **Browse Locally**。

**Search Catalog（搜尋發行目錄）**
1. 有已知相容的正式版時，THEIA 預設反白最新版本。
2. 勾選 **Beta/RC Releases** 可納入預發行版。清單依版本順序排列，例如 1.0.6 在 1.0.6-rc.1 前，後者則在 1.0.5 前。
3. 選擇版本並閱讀發行說明。
4. 點擊 **Obtain Confirmed Selection**，THEIA 會嘗試下載、驗證並匯入 Core。
5. 成功載入後，卡片會顯示待安裝版本，**Continue** 才會啟用。清單反白本身不代表已載入。

刷新圖標可重新讀取目錄；紅色 **×** 可返回選擇卡片。滑鼠停在圖標上可查看提示。部分發行資訊無法讀取時會出現黃色 **Info** 圖標。Manifest 缺失或無法讀取，**不代表沒有相容版本**。相容性尚未確認時，清單可能顯示 **Published Versions**，而非已確認的相容版本。

**自動匯入失敗時：** THEIA 會返回第二步並嘗試一般 ZIP 下載。如果瀏覽器阻擋了下載，請使用畫面上的 **Download Core ZIP** 連結。下載後點擊 **Browse Locally**，自行匯入 ZIP。網路限制或 GitHub CORS 可能阻止直接讀取，即使一般下載仍可使用。

**Browse Locally（從本地匯入）**
選擇 **SYNODIC Core ZIP**，不必解壓縮。不要選 THEIA ZIP、SYNODIC 原始碼封包，或 GitHub 自動產生的「Source code」壓縮檔。THEIA 會先驗證封包，再於第三步檢查遊戲相容性。封包內的雜湊可檢查內容是否一致，但不能單獨證明發布者身分。

點擊已載入的候選版本卡片，可重設選擇。

<!-- 可選截圖：02-theia-1.0.3-catalog.png
![發行目錄與版本說明]()
-->

### 4. Ready for Installation — 第 3/3 步

確認 Core 版本、輸出檔名與相容性結果。

- **Compatible：** 可以點擊 **Install & Save As**。
- **Not Compatible：** 一般安裝停用，請先確認選擇的遊戲及 Core。
- **FORCE INSTALL：** 接受警告後，可嘗試略過遊戲版本或指紋不符的相容性限制。修改版遊戲可能需要此功能；後果由玩家自行承擔。注入成功不代表遊戲或存檔一定正常。

強制安裝**不會**略過 STG 身分檢查、封包完整性、重複注入或原生內容保留檢查，也不會把 **Not Compatible** 改成 **Compatible**。更換遊戲或 Core 會重設同意；切換強制模式會使先前輸出失效。

<!-- 可選截圖：03-theia-1.0.3-force-install.png
![最終相容性檢查與強制安裝]()
-->

### 5. 另存新檔

**Install & Save As** 會產生新 HTML 並向瀏覽器提出下載。通常檔名是 **STG-SYNODIC.html**；若輸入檔已使用此名稱，則改為 **STG-SYNODIC-installed.html**。THEIA 不會寫入所選原檔；選擇儲存位置時，也請將輸出與原檔分開保存。

綠色 **SYNODIC Installed** 表示產生檔案成功，且已提出下載。請檢查瀏覽器的下載清單；網頁無法確認你最後是否將檔案保存在磁碟上。再次點擊按鈕可重新下載已驗證的輸出。

紅色 **Installation Failed** 不代表成功輸出，請先檢查錯誤再重試。

<!-- 可選截圖：04-theia-1.0.3-installed.png
![安裝成功]()
-->

## 常見問題

| 情況 | 處理方式 |
| --- | --- |
| GitHub 回傳 403 或要求稍後重試 | 等到提示時間後再試；反覆刷新無法繞過流量限制。也可匯入已下載的 Core ZIP。 |
| Manifest 或 ZIP 無法讀取 | 查看黃色 Info 提示，改用一般下載及 Browse Locally。這不必然是相容性問題。 |
| 指紋或版本不符 | 確認選擇正確；若確實要使用修改版或未支援版本，可評估 FORCE INSTALL 及其風險。 |
| 封包驗證失敗 | 重新下載正確的 Core ZIP。強制安裝不能略過損壞或缺少必要內容的封包。 |
| 遊戲已含 SYNODIC | 改用尚未注入的原版 STG。 |
| 檔案預覽中樣式不正常 | 用瀏覽器開啟封裝後的 THEIA-1.0.3.html，而非編輯器的預覽。 |
| 找不到輸出檔 | 檢查下載清單與被阻擋的下載，再次要求匯出。 |

右下角 **ISSUES** 會開啟[共用問題追蹤頁](https://github.com/ygyuuffut/Theia-Synodic-Issues/issues)。請提供 THEIA／Core 版本、偵測的遊戲版本、瀏覽器及錯誤文字，不要上傳完整遊戲或私人存檔。

## 授權與原始碼

**LICENSE** 可開啟授權資訊；**Sources & About** 提供原始碼資訊及可用的來源設定。選填的發布者索引應由發布者提供，THEIA 不會因來源無法讀取而將其視為可信。

THEIA 使用 **GNU GPL v3 或後續版本（GPL-3.0-or-later）**。原始碼封包附有構建工具及第三方授權聲明。STG 著作權仍屬原權利人；THEIA 不會替它重新授權或發行完整原版遊戲。

本次構建的驗證包含自動化流程／封包檢查與可重現的原始碼構建，但不等於保證所有瀏覽器、手機下載流程、即時網路來源或強制安裝後的遊戲行為。

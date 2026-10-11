# 重現 THEIA 1.0.0 本地驗證

玩家只需雙擊 dist/THEIA-1.0.1.html。以下 Python／Node／Playwright 僅供開發者重現，**不是玩家依賴**；所有產物在 THEIA，沒有 HTTP server。

需要 Python 3.11+、Node 20+、Playwright／JSZip 與桌面 Google Chrome。路徑可依本機修改；本輪使用 bundled Node 24.19.0、Chrome 154.0.8037.98。正常瀏覽器安全設定，沒有關閉 CORS。Firefox／WebKit binaries 未安裝。

```sh
python3 THEIA/build_local.py
# 需要既有私人 Python oracle payload；沒有時先執行下文早期 prepare_oracle。
python3 THEIA/tests/prepare_local.py
NODE_PATH=/path/to/node_modules node THEIA/tests/local_installer.cjs
NODE_PATH=/path/to/node_modules node THEIA/tests/local_network.cjs
NODE_PATH=/path/to/node_modules node THEIA/tests/probe_file.cjs
NODE_PATH=/path/to/node_modules node THEIA/tests/local_gameplay.cjs
python3 THEIA/tests/snapshot_inputs.py --baseline local-protected-before.json --check
python3 THEIA/tests/validate_research.py
python3 THEIA/package_source.py
```

local_installer 真正開 file:// dist HTML，真選檔／download；公共 1.0.0 尚不存在，網路接線用標明模擬的 response，不冒充真發行。local_network 真正讀 API 與 raw ZIP，驗 CRC／SHA／解壓；probe_file 保存真 Asset CORS headers／console。local_gameplay 重用既有 SYNODIC tests，只讀實際 exported PC/C2，環境變數把所有報告放 THEIA。

prepare_local 建私人 schema1 ZIP（internal b6.9、0.0.0-b6.9），非公開 1.0.0，generated 不得發行。它只讀先前已由原 Python 編譯的 payload，不改 SYNODIC。Protected baseline 是 1942 個外部檔的原始 SHA；不覆寫 baseline。Build 為確定性、無網路，source ZIP 明確 allowlist、無原版／Core／私人 fixture。

以下保存最初 HTTP bench 的重現方式，僅作歷史研究；**它不是正式本地 HTML**。

# 重現研究

這些是開發研究操作，**不是普通玩家的安裝步驟**。所有輸出留 THEIA；不部署、不發布、不改原版。需要 Python 3.11+、Node 20+、本機Google Chrome、Playwright與JSZip。尚未建立正式 dependency lock／跨平台runner。

本輪使用 Codex bundled Node v24.19.0與現有工具包；工作區 `node` 是18.12.1，無法啟動此版Playwright。Browser sandbox曾阻止Chrome啟動，改用經自動審核允許的本地瀏覽器實驗，未关闭CORS/web-security。Firefox／WebKit binaries不在本機。

由父層工作區執行，將 NODE_PATH 與 THEIA_JSZIP 改成已安裝工具位置，使用 Node20+ executable。不要在驗證後覆寫 protected-before：它是本輪原始保护基線。

```sh
# 單次重現需先自行另存一份保護基線；原始本輪baseline已保留。
THEIA_JSZIP=/path/to/node_modules/jszip/dist/jszip.min.js python3 THEIA/tests/prepare_oracle.py
NODE_PATH=/path/to/node_modules node THEIA/tests/browser_poc.cjs
NODE_PATH=/path/to/node_modules node THEIA/tests/probe_cors.cjs
NODE_PATH=/path/to/node_modules node THEIA/tests/gameplay_regressions.cjs
node THEIA/tests/release_policy.mjs
python3 THEIA/tests/snapshot_inputs.py --check
python3 THEIA/tests/validate_research.py
```

prepare_oracle只讀SYNODIC injector／Core source、用無遊戲synthetic fixture編譯payload，對現有input生成oracle至THEIA。輸出名稱固定，因此重現會更新THEIA的私人產物與結果；正式SYNODIC build不變。研究ZIP排除原版遊戲，源檔/完整遊戲輸出只在generated。

browser_poc自己的HTTP server只綁127.0.0.1隨機port，測完關閉。測File API時自動化使用既有本地選檔，不把遊戲透過server／remote上传；頁面内fetch只有研究Core metadata。gameplay_regressions順序重用兩個SYNODIC原地測試，環境变量把input與所有reports指定到THEIA；受控外部圖像由測試route替代。

人工查看研究bench：先prepare，啟動只供本機的THEIA HTTP服務，開prototypes/browser/index.html。不要用file://判斷module／Web Crypto相容；不要使用服務root公開父層遊戲。選PC/C2 fixture，可自行提供generated/core.zip，驗證後下载不同檔名HTML。Bench没有正式GitHub版本选择／最终UI，已注入／unknown fingerprint不允許安裝。

CORS probe使用public第三方fixture，預期Release Asset失敗也會如實保存結果，而非讓整個研究runner假成功。API限制／網路可能改變，重跑不得将今日結果當永久保證。最終own Pages origin／repo／channel需獨立验收。

## 1.0.1 強制裝載與封裝

只重建交付 HTML：`python3 build_local.py`；重建所有發布資產：`python3 package_release.py`。這兩步僅需 Python 標準庫，對應 source ZIP 可獨立重現 HTML，沒有玩家遊戲／Core 依賴。

`node tests/release_discovery.cjs` 是沒有瀏覽器的 DOM／發現／風險確認測試。`node tests/force_load.cjs` 是真實 Worker／Core／文字注入測試，需自行提供本工作區卡牌工坊程式、原版 STG 和 prototypes/generated/local 裡的已下載 live-core.zip 及前版 pc-rc1-installed.html 作基準；這些外部项目与私人測試輸入不包含於 source ZIP。兩套測試均不執行遊戲，不取代瀏覽器或玩法認證。

# SYNODIC 首發 RC — THEIA 連線診斷

本次核對 [公開 RC](https://github.com/ygyuuffut/Synodic/releases/tag/v1.0.0-rc.1) 與 GitHub API：Release 非 draft、prerelease=true，附 manifest.json、Core ZIP、source ZIP、SHA256SUMS.txt。API 可以發現 RC；直接取得可用安裝候選另需可讀且配對正確的 Manifest。

## 為什麼原版 THEIA 沒顯示候選

1. RC／Beta 預設隱藏，需打開 `Show RC & Beta releases`。舊版沒有顯示已發現、但被隱藏的 RC 數量。
2. 使用 `Origin: null`、`Accept: application/octet-stream` 讀取本次 Manifest Asset，API 302 有 `Access-Control-Allow-Origin: *`，但最終 release-assets 200 缺少該標頭。這是公開 HTTP 標頭核對，結合既有 file:// 瀏覽器 CORS 證據；本次没有重新聲稱完整瀏覽器測試。一般直接下載可成功，不代表 fetch 可讀 bytes。倉庫 main 的公開 Git tree 目前沒有 distribution/catalog.json。
3. 公開 Tag 是 `v1.0.0-rc.1`，獨立及 ZIP 內的 Manifest 都是 `release_version: "1.0.0-rc1"`。這兩個 SemVer 字串不相等。即使增加可讀靜態鏡像，仍會被精確版本配對拒絕。

## 已完成的 THEIA 修正

顯示已發現但隱藏的 RC／Beta 數量與開啟指引。Manifest 讀取失敗、Tag／channel 不匹配或缺少 Core Asset 時，保留公開 Release 的本地匯入備援列，明示相容性未確認，提供 Core ZIP 下載／Release 頁面與既有匯入按鈕。預覽版本仍需主動開啟；未驗證的 Release 不會啟用 Install。

錯誤從泛稱「找不到相容版本」改為可讀取失敗／metadata 不一致等具體原因。Tag 仍精確配對，沒有把 rc1 與 rc.1 當成同一版本。保持本機 ZIP／指紋／payload 校驗與原有文字注入語義。

## 現在可用的操作

使用更新的 THEIA HTML，選原版 STG，打開 SYNODIC Release → `Show RC & Beta releases` → `Download Core ZIP…` → `Import Core ZIP…`。應下載 `synodic-core-1.0.0-rc1.zip`，不能選 source ZIP 或 GitHub 自動 Source code ZIP。

目前 Core ZIP 的 SHA-256 是 `2f492e16f71dbbea25ccc1418322373c82d4d80369d9d573aeb872fe81977956`，與公開 GitHub Asset digest 相同。真正 consumer 已驗證 ZIP CRC／每個文件 SHA／158 個 payload blocks，獨立與內嵌 Manifest 逐 byte 相同。PC／C2 的文字注入均通過原生內容還原檢查，私人輸出只存在 prototypes/generated/local，未公開或覆寫原版。

目前本地匯入可以依 Manifest 的 `1.0.0-rc1` 安裝，但因公開 Tag 不匹配，THEIA 不會將它標成與該 Release 版本完成官方配對。本次沒有重新執行 RC 的 Python oracle equality、瀏覽器下載或完整劇情／幽靈選項測試。

證據：[發現／備援／確認測試](../research/evidence/release-discovery-tests.json) 是 Node DOM harness 與模擬回應；[真實 RC ZIP／文字注入](../research/evidence/live-rc-core.json) 使用已下載的公開資源與私有原版輸入，沒有執行 Core／STG 程式碼。測試入口 tests/release_discovery.cjs、tests/verify_live_core.cjs；後者需要 prototypes/generated/local 中的已下載 live-* 資源及工作區原版輸入。

## 要讓線上安裝完整接通

發行端先統一版本。若保留現有 Tag `v1.0.0-rc.1`，應從一致的公開版本構建 `1.0.0-rc.1`，重新生成 ZIP 內／独立 Manifest、source metadata、完整性摘要與 catalog；不能只修改独立 Manifest，造成內外不一致。另一個選項是讓 Tag 與現有 `1.0.0-rc1` 的構建版本一致。THEIA 本輪未更改遠端 Tag、Asset、Release 或 SYNODIC 源碼。

再依 [Core Release 接口](core-release-contract.md) 提供 `distribution/catalog.json` 與和 Release 相同的靜態 ZIP。在 `Sources & About` 填入真正 raw catalog URL；目前預設索引仍空白，沒有假定不存在的 URL 可用。提供並驗證最終 URL 後才可設為預設。這兩件事完成後，THEIA 才能在線確認版本、下載並驗證 Core；無需後端或 localhost。

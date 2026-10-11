# E. Manifest Schema Proposal

**本地交付更新**：現行 src/package.js 使用 JSON adapter schema 1（kind=synodic-core、injection_contract=synodic-python-text-v1），配合 compiled payload 執行已驗證 Python 語義。這不是官方 TOML Schema 定稿；Public 1.0.0 尚未發布。新實作已有中央目錄預檢與實際串流膨脹上限，早期 prototype 的限制保留作歷史。接口字段與信任邊界見 [package adapter](local-html-installer.md)。

這是候選，**未凍結格式、版本、演算法契約、相容名單或 license 選項**。可解析 TOML 樣例：[manifest-candidate.toml](../research/manifest-candidate.toml)。`proposal=true`、全零 hash、example.invalid 與 pending license 表示不可安裝的示例；最終 release parser 必須拒絕這些草稿值。研究 ZIP 的 schema 0 JSON 是另一個 disposable fixture，不等同此 schema 1 提案。

## 格式比較

| 格式 | 維護者 | Browser | 建議 |
| --- | --- | --- | --- |
| TOML | 注釋與手改友善；現有 Core metadata／config 已用 TOML | 無內建 parser，需鎖版本、license／大小、型別驗證 | 主要候選 |
| JSON | CI 容易生成與 schema 驗證；無注釋 | 內建 JSON.parse，依賴最少 | 可作 catalog／正規化瀏覽器輸入候選 |
| YAML | 人可寫但隱式型別／語法較複雜 | parser 成本與風險較多 | 第一版沒有必要 |

若選 TOML：從單一 TOML 定義產生獨立 Manifest Asset 與 ZIP 內 Manifest 的**相同 bytes**；另外生成 catalog JSON。不要兩個手寫維護。可選讓 THEIA 解析 TOML，或發行端提供對應 normalised JSON（若採後者必须 hash 綁定 TOML、欄位對照、語義一致性驗證），不能把两份不同格式称为 byte-identical Manifest。本輪用 Python tomllib 解析提案，**未測 Browser TOML parser**。[TOML spec](https://toml.io/en/v1.0.0) 為格式來源。

## 欄位與驗證

| 領域 | 候選欄位／規則 |
| --- | --- |
| Schema | 整數 schema_version；只支持明確版本，未知 major 拒絕；不能默默忽略必須的新能力 |
| Core release | release_version 使用 SemVer；GitHub tag 應為 `v`+版本；revision、source commit 独立 |
| Channel | stable／rc／beta／legacy 候選；與 GitHub prerelease／SemVer 檢查；Legacy 可以移成 maintenance 欄位 |
| STG 相容 | supported_stg_versions 的 exact string；games 逐版本列認證 variant／fingerprints；不存在通用「同版必相容」 |
| Fingerprints | algorithm、scope、digest、variant；raw bytes 與 native normalized text 不能混用；fingerprints 可空的 schema 能力不代表正式允许未知输入 |
| Components | LUNAR 與 MOONSHINE 必備；component version、LUNAR api_version、Moonshine requires；禁止 HECATE／private API |
| Injection | injection_contract 和最低 THEIA version；payload exact block/module order；不让任意 Manifest 腳本操控安裝器 |
| Integrity | files path、size、SHA-256；外部 trusted catalog 的 whole ZIP SHA／compressed size；實際解壓總量限制 |
| Source | exact commit、source archive、構建說明、toolchain lock；release 產物能找到對應未混淆 source |
| License | 一個最終 SPDX expression、COPYING／第三方 notices；原版 STG 不包含／不重新授權 |
| Future MOD | 描述性 API version 保留；第一版 mod_installation_enabled=false；没有依賴求解／市集 |

樣例 entry_order 是依賴級別摘要；**字串寫入順序／最終 DOM 次序不等於這個数组**。實際 early bootstrap／head/body／個別 module 次序必須由版本化 payload 準確描述並對照既有 Python，而不是照一個「LUNAR 再 MOONSHINE」排序就算兼容。

嚴格驗證還需：安全整數與有限數字、唯一 component／version／file path、UTF-8 文本上限、無 traversal／absolute／drive／backslash path、ZIP duplicate 原始名稱／symlink／encrypted／unsupported compression／ZIP64 政策、解壓總量與檔案數、配置相互一致。研究 JSZip 原型有 SHA／CRC／基本 layout／unsafe name 檢查，**尚未完成中央目錄預檢與 ZIP bomb 防護**。

## 完整性與 circular hash

ZIP 內 Manifest 若記錄整個 ZIP 自己的 hash，會使生成陷入自指。推荐：Manifest 只記 payload／licenses 等檔案 hash，不記自己／整個 ZIP；完整 ZIP 的 SHA-256 在受信任 catalog／integrity envelope。先得到 Manifest 的 final bytes，兩位置共用，再產 ZIP、hash ZIP、產 catalog。Catalog 可記 manifest hash、asset identity、相對鏡像 URL、尺寸、source commit。

THEIA 順序：可信 catalog → 先核對壓縮 ZIP bytes → 預檢 entries／limits → 解壓 → 比對 inner/outer Manifest 的 bytes 與 catalog manifest hash → 驗字段／各 payload 文件 hash → 驗依賴與 injection contract → 注入。缺少必要資料或不一致不得「择一」當成功。

SHA-256 保證對照可信預期值的完整性；若 ZIP 與 hash 均由攻擊者提供，它不證明官方來源。HTTPS／批准的 catalog 是第一版信任基礎；獨立簽名可作後續候選，需建立公鑰與撤銷／回滾策略，不在此輪自行上 PKI。離線 local ZIP 對未知新版本不應自动信任内部 hash。

## 生成／版本演進

Release tooling 在 Core source side產 Manifest／payload；THEIA 有自己的發行週期。第一次 package contract 變化必须升 injection_contract，不靠組件 SemVer 猜注入結構。官方已公布 version/asset 不變更 bytes；fix 使用新 release identity。可向後讀少量明確 schema，避免多版本抽象框架。License、相容列與版本通道是 release policy，需使用者確認後正式規範。

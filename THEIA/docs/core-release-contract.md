# SYNODIC Core Release — THEIA 1.0.0 接口與首發結構

這份文件供第一個 SYNODIC 公開 Release 的製作端使用，依目前 THEIA 1.0.0 的 `src/package.js`、`src/worker.js`、`src/app.js` 整理。它描述現有 consumer 能直接讀取的格式；官方 metadata 可以用 TOML 維護，但必須自動生成下列 JSON adapter。只提供 TOML 或原始 JS/CSS ZIP，現有 THEIA 不會直接安裝。

## 1. Release 放在哪裡

Core Release 放 `ygyuuffut/Synodic`；THEIA HTML 自身放 `ygyuuffut/Theia` 的獨立 Release。以下以 Core 正式版 1.0.0 為例；若先發 RC，所有版本、tag、檔名與索引一起改，不沿用 stable metadata。

```text
Repository: ygyuuffut/Synodic
Tag:        v1.0.0
Title:      SYNODIC Core 1.0.0
Prerelease: false

Release Assets/
├── synodic-core-1.0.0.zip       THEIA 的安裝包
├── manifest.json              與 Core ZIP 內的檔案完全相同
├── synodic-source-1.0.0.zip     對應未混淆源碼及必要構建資料
└── SHA256SUMS.txt              供維護者／玩家人工核對
```

GitHub 自動生成的 Source code ZIP 並不是 Core 安裝包。獨立 source asset 是建議的明確源碼交付形式；THEIA 本身不下載或驗證 source ZIP／SHA256SUMS.txt。Release 的原生 `tag_name` 與 `prerelease` 用於版本配對，STG 相容資料放 Manifest，不需要第二個 tag。[GitHub Releases API](https://docs.github.com/en/rest/releases/releases)

| 首發形式 | Tag | Manifest version | channel | GitHub Prerelease |
| --- | --- | --- | --- | --- |
| 正式版 | v1.0.0 | 1.0.0 | stable | false |
| 首個 RC | v1.0.0-rc.1 | 1.0.0-rc.1 | rc | true |
| Beta | v1.0.0-beta.1 | 1.0.0-beta.1 | beta | true |

THEIA 以最新相容 Stable 優先；RC／Beta 需玩家打開預覽選項。不要把內部 b6.9 私人 fixture 改名就當公版；真正 Runtime 版本、診斷、watermark、component metadata 都應由新的公開源碼版本生成。

## 2. Core ZIP 根目錄

```text
synodic-core-1.0.0.zip
├── manifest.json
├── payload.json
├── COPYING
└── THIRD-PARTY-NOTICES.txt
```

**manifest.json 與 payload.json 必須直接位於 ZIP 根目錄**，不能多包一層 `synodic-core-1.0.0/`。其餘檔案都須列入 Manifest.files，且實際檔案集合必須完全相等。不要加入 .DS_Store／__MACOSX／資料夾 entries。可以新增列明的普通文件，但含 manifest 在內最多 32 entries。

ZIP 使用普通單卷 ZIP、Store 或 Deflate，無加密、ZIP64、symlink、重複路徑或額外尾端資料。壓縮包 ≤16 MiB，含 Manifest 的總解壓量 ≤24 MiB，Manifest ≤256 KiB。這些是 THEIA 現行限制。

Core 包含成對 LUNAR＋MOONSHINE 模組、必要配置、字體與 notices，**不含原版 STG、不含已注入完整遊戲、不含 HECATE／專用 lunar.api.hecate／私人 UI**。例如診斷或 generic Mods 程式碼中的一般文字引用不等於打包 HECATE 實作；須核對最終模組清單。

## 3. Manifest：現行 parser 必須的欄位

可填範本：[manifest.template.json](../research/release-templates/manifest.template.json)。它故意帶 `proposal:true` 與佔位值，**不能直接發布或安裝**；生成真實資料並移除 proposal 後才是正式 manifest.json。

| 欄位 | 必須內容／規則 |
| --- | --- |
| schema_version | 整數 1 |
| kind | synodic-core |
| release_version | Core SemVer 字串，如 1.0.0；與 Tag 去掉 v 後相同 |
| channel | stable／rc／beta／legacy；首發建議 stable 或 rc，與 Prerelease 一致 |
| asset_name | Core ZIP 的精確 Release Asset 名稱，如 synodic-core-1.0.0.zip；線上發現／本地官方摘要配對需要 |
| injection_contract | synodic-python-text-v1 |
| payload_path | payload.json |
| games | 每個原版版本一筆，version 為 0.2001，raw_sha256 為非空、已驗收原版 bytes 的 SHA-256 陣列 |
| components | 恰好兩筆，id 為 lunar／moonshine；使用各組件真實版本，不能把 Core release number 當 API version |
| files | ZIP 中除 manifest.json 以外的每個文件：path、size（bytes 整數）、sha256（64 位小寫 hex） |

games.version 不寫 v、不轉浮點數；hash 必須對**未注入的原始檔案 bytes**計算。換行、BOM 或其他任何改動都會改 raw hash。不要使用 native-text hash、b5/b6.9 已注入檔 hash 或檔名。

目前工作區有兩個測過的參考輸入，供重新核對，並不代表所有發行自稱 0.2001 的 HTML 都已認證：

| 參考輸入 | Raw SHA-256 |
| --- | --- |
| STG 0.2PC.html | 0edabffcc6beefe3b90121835186ffe922d2bd047299155347362b3908f0bdc8 |
| STG 0.2PC.C2.html | 58fb30f8d4838006b41e338825ff3bb448709aeeb02bc560bf2f50c5da8532b7 |

在新的公開 Core 對各基底通過測試後，才把對應 hash 加入正式 games。未知同版 hash 會被拒絕。

THEIA 1.0.1 的玩家強制裝載選項是上述拒絕規則的明確例外：確認風險後略過遊戲 raw hash 比對，仍要求聲明版本相同。這不變更發行端 Manifest 格式、不允許省略正式 fingerprints，也不將修改版列為已驗收相容。

license、source、component.version、API requires 等 metadata 應寫入正式發行資料，但現有 THEIA 不完整強制驗證它們；不能把描述性欄位誤認為已實作依賴求解。license.spdx 需要選定 GPL-3.0-only 或 GPL-3.0-or-later；COPYING 與 source archive／工具鏈／build 說明要與實際發行一致，第三方 STG 的權利不由這些欄位授予。這部分延續既有 [授權研究](licensing.md)。

Manifest 不記自己的 hash 或整個 ZIP hash，避免自指。整個 ZIP 的 hash 放外部 catalog／SHA256SUMS.txt，GitHub Asset digest 可提供另一個可信核對值。[GitHub Release Assets API](https://docs.github.com/en/rest/releases/assets)

## 4. payload.json 必須由構建工具生成

結構示意：[payload.structure.json](../research/release-templates/payload.structure.json)。它只展示結構，不是可安裝 payload。

```text
schema: 1
kind: SYNODIC-compiled-core
head:  原 Python head 插入順序的 block 名稱陣列
body:  原 Python／modules.json body 順序的 block 名稱陣列
blocks: 每個名稱 → 已編譯 HTML／CSS／classic JS／JSON 文本
        另含 BOOTSTRAP → 早期 Loading Shell 文本
nativeImportFamilies: 實際 font registry 的原生匯入家族
injectorSha256: 實際 Release 注入器 bytes 的 hash（溯源資料）
```

每個 block 的內容**不含外層 STG-…:START/END markers**，由 THEIA 插入 markers。BOOTSTRAP 只列在 blocks，不再列入 head/body。除 BOOTSTRAP 外，blocks 與 head＋body 完全對應、名稱唯一，總 blocks 最多 256；名稱符合大寫字母／連字號。

必須保留 LUNAR-FONT-RESOURCES、LUNAR-DIAGNOSTIC-CONFIG、LUNAR-ASSET-MANIFEST、LUNAR-MOD-CATALOG。catalog 僅 lunar／moonshine；實際 script IDs 唯一，成對部署。配置 JSON 的 script attributes／IDs 及文字格式須符合原 Python 產物；THEIA 會更新原版版本／native fingerprint、可逆 font imports、原版特有 Wix 資源。不能任意美化／改寫配置 JSON，尤其不能把 Python 的 1.0 數值格式重新變成 1。

產生方式是：用**公開 Core 對應的既有 Python 注入器與模組清單**對無遊戲內容的 synthetic seed 編譯，擷取 marker 內文本與原有順序，再序列化 payload。不能從已注入 STG 中摘取原生內容，也不能隨意把 LUNAR／MOONSHINE 各壓成一個檔來重排初始化。b6.9 的 158 blocks 只是舊版本量測，不是公版必須固定的數量。

這一步仍需正式發行端生成工具；THEIA 私人 prepare_local fixture 不能直接當公版 release builder。新 payload 要對每個宣稱支持的原版基底驗 THEIA 匯出＝該版 Python oracle，並跑最終產物的幽靈選項／劇情條件回歸。詳細語義：[Injection Compatibility](injection-compatibility.md)。

## 5. 線上安裝所需的靜態交付

Release API 可讀不代表 Release Asset 可 fetch。現有 file:// 實測 Asset 缺 CORS，故要讓玩家在 THEIA 內直接取得 bytes，需要一份瀏覽器可讀的靜態 catalog＋**與 Release Asset 完全相同的 ZIP**。本地 ZIP 匯入仍可使用，無須靜態鏡像。

```text
Synodic 儲存庫的普通靜態文件（建議位置）
distribution/
├── catalog.json
└── 1.0.0/
    ├── manifest.json
    └── synodic-core-1.0.0.zip
```

可填範本：[catalog.template.json](../research/release-templates/catalog.template.json)。現有程式要求：

```text
schema_version: 1
repository: ygyuuffut/Synodic       owner/repo 格式，不是完整網址
releases[]:
  tag: v1.0.0
  manifest_text: 最終 manifest.json 的精確 UTF-8 文本，放在 JSON 字串中
  zip_sha256: 最終 Core ZIP bytes 的 64 位小寫 SHA-256
  zip_url: 公開 HTTPS raw GitHub 的同一份 ZIP 地址
```

manifest_text 不是檔案 URL，也不是嵌套 object，不能將 JSON 重新排版後再填；建議生成器讀 final manifest bytes 的 UTF-8 文本，用 JSON encoder 處理換行／引號。Release 獨立 Asset、ZIP 內 Manifest、catalog 中的文字使用同一份 final bytes。不要把 catalog 放回 Core ZIP，避免 ZIP hash 的循環。

ZIP URL 建議固定到包含靜態包的 commit。它可以不同於原始 Core source commit：先由 source commit 構建原包，再將相同 ZIP／Manifest 提交於靜態 publication commit。之後生成 catalog 指向該 commit；不要求 catalog 自己包含自己的 commit hash。catalog 可以從 main 發現新版本，版本包與 hash 不應偷偷替換。

現有 THEIA 的靜態索引設定初始为空，**即使上述文件上傳後，也須在 Sources & About 填入 raw catalog URL**。若希望首發玩家自動完成線上流程，提供最終 catalog 地址後，THEIA 需要將它設成預設並重建／真網路驗收；僅發布 Core Release 不會自動完成這個接線。

## 6. 建議生成與驗收順序

1. 固定公開 source revision、真實組件／API 版本與授權選擇，排除私人實作。
2. 用該版注入器生成 payload.json；準備 COPYING、第三方 notices、对应 source／build instructions。
3. 計算各文件的 size／SHA，產生 final manifest.json；不要手寫 hash。
4. 將 manifest.json 與所有 inventory 文件封入 Core ZIP 根目錄；独立 Manifest Asset 直接複製同一份 bytes。
5. 計算 whole-ZIP SHA，產生 SHA256SUMS.txt；如需線上直接安裝，再生成靜態 ZIP／catalog。
6. 在 THEIA 私人測試副本驗 ZIP、兩 Manifest、每個支持基底的 exact Python equality 與 gameplay regression；不得改原版或已驗收 b6.9。
7. 發布 SYNODIC Release 及必要靜態 files 後，提供 Tag、Core ZIP、manifest.json、catalog URL、source commit；實測真正 API／raw origin／最終 bytes，不把 mock 當成功。

首次可以先完成本地 ZIP 安裝驗收，再接靜態線上來源。不要公開 prototypes/generated 裡的遊戲、internal b6.9 fixture 或只有佔位值的 template。

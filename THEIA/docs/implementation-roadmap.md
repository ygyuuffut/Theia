# G. THEIA 1.0.0 Implementation Roadmap

使用者已批准本地 HTML 交付與三段式 UI 方向。THEIA 版本為 1.0.0；SYNODIC 內部 b6.9 與未來公版 1.0.0 是另一版本空間。本地候選已可驗收，正式公共 Core 對接仍未完成。

| 階段 | 現況／驗收 |
| --- | --- |
| 1. Local delivery | 已有單一自包含 HTML；真正 file:// Chrome Worker／Crypto／ZIP／Blob 通過；無 localhost |
| 2. Original Game | 原生聲明、raw SHA、已注入拒絕、未知 fingerprint 拒絕通過；正式支持名單由 Core publisher 認證 |
| 3. Verify／Inject | 目錄與實際解壓 bounds、CRC／SHA、內外 Manifest、paired Core、native preservation；PC/C2 exact Python bytes，4/4 gameplay regression |
| 4. UI／Export | 46 項端到端含 Ready/Complete、錯誤使 export 失效、取消、不同名、再次下載；320–1920 CSS px 排版驗證 |
| 5. Core public contract | 未完成：批准官方 schema/TOML→JSON 方案、module/API metadata、來源 revision／工具鏈、單一定義生成 Manifest／ZIP／catalog；禁止 STG／HECATE |
| 6. Public network delivery | file:// API／static ZIP 真測；真正 SYNODIC Release 無資料。需真實 1.0.0 包與固定來源；mock 不替代 |
| 7. Browser／devices | 未完成：Firefox／Safari／Edge／iOS／Android 真選檔、下載與再開；窄屏只是 layout |
| 8. Publication review | 未完成：GPL choice／source provenance／third-party notices、對應未混淆 source、STG 整合邊界；本輪不發布 |

## 阻斷項

| ID | 狀態 | 最小關閉方式 |
| --- | --- | --- |
| B-01 | Release Asset file:// CORS 已證實阻擋 | 靜態 GitHub catalog＋相同 ZIP，或本地 ZIP；無 backend |
| B-02 | repo 已確認，正式 Core Release 尚無 | SYNODIC 維護者生成公版，再 exact origin／bytes 實測 |
| B-03 | 同版原生基底不同 | PC／C2 分別認證與測試；不把 b5 遊戲改值放進 Core |
| B-04 | 只有桌面 Chrome 真測 | 其他 browser／physical device 驗收 |
| B-05 | JSON adapter 已可測，正式 TOML schema 未凍結 | 協調發行端單一 metadata 定義、parser／normalization、strict contract |
| B-06 | GPL only/or-later、第三方遊戲條款待決 | 最終 SPDX／COPYING／corresponding source 與合法分發界限 |
| B-07 | 大檔峰值／低記憶體未測 | 保留保守限額，量 RSS／低 memory；不聲稱 64MiB 完整注入支持 |
| B-08 | Browser 無 disk-save 確認 | 已採 generated/download-requested 語義；保存時用戶自主選路徑屬 browser 能力邊界 |

每次改注入／Core contract 都須在 THEIA 私人 fixture 驗 exact bytes＋最終 gameplay：ghost／stale choices、story conditions、save/load、reward once、ending click／pause lifecycle。既有 b6.9 全部只讀；必要 Runtime 新能力由另一次明確授權處理。第一版沒有 MOD installer、市集或通用 launcher。

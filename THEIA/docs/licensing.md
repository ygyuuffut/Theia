# GPLv3 與發行邊界研究

使用者已於 THEIA 1.0.1 封裝時明確選定 GPL-3.0-or-later。THEIA 的 LICENSE.md、COPYING、package.json、內嵌授權及發行包均採此標識。以下保留 earlier options 的比較與第三方邊界研究；不新增整合例外、不重授權第三方，也沒有自動發布。

| 選項 | 效果 |
| --- | --- |
| GPL-3.0-only | 接收者依第3版使用；未來換版本需相應權利／授權 |
| GPL-3.0-or-later | 接收者可選第3版或 FSF 後來發布的 GPL；長期兼容較靈活，但容許未來版本 |

兩者都允許商用、修改與再發行，須遵守適用的傳布／對應原始碼條件；差別是未來版本選擇。標識與第14節見 [SPDX only](https://spdx.org/licenses/GPL-3.0-only.html)、[SPDX or-later](https://spdx.org/licenses/GPL-3.0-or-later.html)。THEIA 的最終選擇現已由使用者確認為 or-later。

瀏覽器下載的 THEIA JS 與 Core 是交付程式碼，「放網站」不是不用提供 source。應附可修改的未混淆 source、確切 commit、build/minify/obfuscate 工具／版本／配置、依賴鎖、必要介面與素材／license。Release 可縮小／混淆，但不能只提供混淆檔作 source；API／全域／script IDs 改名亦需回歸。[GNU JavaScript 發行說明](https://www.gnu.org/licenses/javascript-labels-rationale.html) 支持標示授權與對應 source。

STG 由玩家提供，自己的包不含它。STG 的著作權／素材授權／再分發條件獨立保留，不能靠 GPL 重授權。工具的 GPL 不自動把任意輸入／輸出重新授權；輸出含 SYNODIC 程式碼時仍需考慮該部分與整合關係。

**尚不能作「注入整合必然合法可再發行」的結論。** SYNODIC 與 STG 在同 HTML/JS runtime 緊密交互，有 combined work 問題；玩家自己組裝或包不附 STG 不能自動排除。FSF [GPL FAQ：非自由主程式插件](https://www.gnu.org/licenses/gpl-faq.en.html#GPLPluginsInNF) 說明緊密結合時須處理相容／例外，單獨 GPL 可能不足。這是 FSF 解釋與本案推論，不是法律裁定。STG 實際 license／作者許可本輪未取得；公開整合／再分發前需釐清。任何例外必須由相關權利人明示授予，本輪不自行加入。

外部 MOD 是否衍生／結合作品取決於實際代码與 API／連結關係，不預設全受 GPL 或全部豁免。v1 無 MOD installer，保留独立 metadata。字體／第三方庫沿用原 notices：現有内嵌字體有 OFL／Apache；研究 JSZip 使用本機既有依賴。正式需鎖版本、審核授權選項並附文本，不把第三方覆盖成自己的 GPL。

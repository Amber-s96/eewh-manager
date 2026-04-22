# EEWH 綠建築專案管理系統 — 開發計畫

## 專案背景

為台灣綠建築認證顧問公司開發一套內部專案管理系統，目標是以最低開發成本（$0/月）與最低維護難度，提供團隊完整的案件追蹤、指標計算與報表功能。

---

## 系統角色

| 角色 | 說明 |
|---|---|
| 管理者（SJ/主管） | 查看所有案件、報表、考核 |
| 顧問工程師 | 個人工作區、任務執行 |
| 外部業主 | 唯讀查詢專案進度 |

---

## 技術架構

| 類別 | 選用技術 | 月成本 | 維護難度 |
|---|---|---|---|
| 前端 | React 18 + Vite + TypeScript | $0 | 低 |
| 樣式 | Tailwind CSS（日系低飽和綠色調） | $0 | 低 |
| 狀態管理 | Zustand + LocalStorage 持久化 | $0 | 極低 |
| 路由 | React Router v6 | $0 | 低 |
| 圖表 | Recharts（Phase 2） | $0 | 低 |
| 部署 | Vercel Free | $0 | 極低 |
| **總計** | — | **$0/月** | **低** |

**UI 色調（日系低飽和綠）**
- 主色：`#5c7a5c`（霧松綠）
- 背景：`#f5f7f5`（米白綠）
- 文字：`#2c3a2c`（深墨綠）

---

## 頁面架構

```
頂部 Tab（主要功能）
├── 案件總覽      /
├── 個人工作區    /my
├── 工具區        /tools（Phase 2）
│   ├── 初期評估  /tools/screening
│   ├── 低碳計算  /tools/carbon
│   └── BERS計算  /tools/bers
├── 報表區        /reports（Phase 2）
└── 外部聯繫      /public（Phase 2）
```

---

## 模組功能規格

### 1. 案件總覽（已完成）

- **Table View**：全欄位表格，可依進行階段 / 建案類型篩選
- **Board View**：依進行階段分欄卡片
- 建案類型：BC 基本型 / RS 住宿類 / GF 廠房
- 綠建築等級：合格級 / 銅級 / 銀級 / 黃金級 / 鑽石級
- 進行階段：前期評估 → 圖說蒐集 → 計算檢討 → 圖說修改 → 產製報告書 → 待審查 → 候選結案

### 2. 個別案件頁（已完成）

**進行階段色塊邏輯：**
- 從 `project.stage` 往回掃描子任務完成狀態
- 遇到有未完成子任務的階段 → 最深色（`primary-700`）停留在該階段
- 遇到已完成階段 → 以此為屏障，不繼續往前追溯，最深色回到 `project.stage`
- 色塊內顯示子任務完成進度條（完成數 / 總數，純由勾選計算，無手動拖曳）
- 點擊階段色塊可篩選下方子任務列表，並同步新增子任務的階段選單

**子任務功能：**
- 勾選完成（checkbox）→ 驅動階段完成度計算，不使用進度條拖曳
- 編輯模式：修改標題、所屬階段、截止日期（date picker）、備註（textarea）
- 刪除：hover 顯示垃圾桶按鈕，刪除前確認提示
- 截止日期已過期且未完成 → 日期標籤顯示紅色警示
- 備註有內容才顯示，不佔空白位置

**顏色對照表：**

| 狀態 | 顏色 | 條件 |
|---|---|---|
| 目前進行階段 | `primary-700`（最深）| i === stageIndex（永遠固定為 project.stage）|
| 尚未到達 | `primary-50`（最淺）| i > stageIndex |
| 過去階段有未完成任務 | `amber-50`（橘黃警示）⚠️ | i < stageIndex && done < total |
| 子任務全部完成 | `primary-400`（中深）✓ | i < stageIndex && done === total |
| 已到達但無任務 | `primary-100`（淺）| 其餘 |

### 3. 工具區（Phase 2）

獨立工具頁面，供顧問工程師進行各類計算評估，與案件管理系統並列但功能獨立。

#### 3-1. 初期評估（待開發）
- 快速判斷案件可達到的綠建築等級範圍
- 輸入基本建案條件，輸出九大指標初估難易度
- 尚待釐清規格，後續由業主端需求補充

#### 3-2. 低碳計算（待開發）
- CO₂ 減量指標相關計算工具
- 尚待釐清規格，後續補充

#### 3-3. BERS 計算（待開發，已有計算引擎草稿）

依據台灣綠建築 EEWH 日常節能指標（BERSn計算.xlsx）實作計算引擎：

**核心公式：**
```
AEUIm  = Σ(AEUImi × Afi) / AFe
LEUIm  = Σ(LEUImi × Afi) / AFe
EEUI   = Σ(EEUIi  × Afi) / AFe
ACe    = EAC − EEV × Es
EUI*   = UR × (AEUIm × ACe + LEUIm × EL + EEUI × Ep)
ESR    = 1 − (AEUIm × ACe + LEUIm × EL) / (AEUIm + LEUIm)
CEI*   = EUI* × 0.495
SCOREEE = 50 + 40×(EUIg−EUI*)/(EUIg−EUIn)   [EUI* ≤ EUIg]
        = 50×(EUImax−EUI*)/(EUImax−EUIg)     [EUI* > EUIg]
```

**查找表（來源：Excel）：**
- `bers-space-types.ts`：A～I 類空間類型，含 EEUI / LEUIm / AEUIm（北部/南部 × 冷暖/供冷/供暖）
- `bers-tables.ts`：Es（建築類別 × 樓地板面積）、CF（建築類別 × 樓層數）

### 4. 個人工作區（Phase 2）

- 匯總本人指派子任務、期限顯示
- 勾選完成連動回案件子任務
- 計時器（花費時間記錄）
- 戰績結算：九大指標完成次數雷達圖

### 5. 報表區（Phase 2）

- 本週 / 本月完成案件數
- 各階段案件分布圓餅圖
- 個人工時統計長條圖
- PDF / Excel 匯出

### 6. 外部聯繫（Phase 2）

- 無需登入，輸入案件代碼查詢
- 僅顯示：建案名稱、目前進行階段、預計完成日

---

## 資料模型

```typescript
interface Project {
  id, name, type, grade, stage, members, contact, address
  publicCode, tasks, totalFloorArea, effectiveFloorArea
  floorsAbove, floorsBelow, climateZone, notes
  createdAt, updatedAt
}

interface Task {
  id, projectId, stage, title, assignees
  dueDate, completed, notes, indicator, timeSpent, createdAt
  // progress 由子任務 completed 計算，不儲存手動數值
}
```

---

## 測試資料（五個案件）

| 案件 | 類型 | 等級 | 目前階段 | 成員 |
|---|---|---|---|---|
| 台北信義A1辦公大樓 | BC | 鑽石級 | 計算檢討 | 王小明、林美華 |
| 新竹竹北住宅案 | RS | 銀級 | 圖說蒐集 | 陳大偉、李芳宜 |
| 桃園廠房綠化改善 | GF | 銅級 | 前期評估 | 張志遠 |
| 台中七期商辦 | BC | 黃金級 | 產製報告書 | 王小明、張志遠、劉雅婷 |
| 高雄前鎮住宿 | RS | 合格級 | 待審查 | 林美華、陳大偉 |

---

## 開發路線圖

### Phase 1 — MVP（已完成）
- [x] Vite + React + TypeScript + Tailwind CSS 初始化
- [x] Zustand Store + LocalStorage 持久化
- [x] 案件總覽 — Table View + Board View + 篩選
- [x] 個別案件頁 — 進行階段色塊（含完成度邏輯）
- [x] 子任務 — 新增 / 編輯 / 刪除 / 截止日期 / 備註
- [x] 測試資料植入（五個案件、六位成員）
- [x] BERSn 計算引擎草稿（含空間類型查找表，暫置，待移入工具區）

### Phase 2 — 核心功能（已完成）
- [x] 個人工作區 — 待辦清單 + 計時器 + 戰績結算
- [x] 甘特圖（依子任務截止日期自動產生）
- [x] 外部查詢頁面（無需登入）
- [x] 報表區視覺化（Recharts 圓餅圖 / 柱狀圖 / 甘特圖）
- [x] 工具區入口頁（/tools）— 三個計算工具卡片導覽
- [x] 工具區 — BERS計算（整合現有計算引擎，路由 /tools/bers）
- [ ] 工具區 — 初期評估（/tools/screening，規格待補充）
- [ ] 工具區 — 低碳計算（/tools/carbon，規格待補充）
- [ ] Supabase 雲端同步 + 認證（可選，Phase 3 評估）

### Phase 3 — 進階功能
- [x] 報表區視覺化（Recharts 圓餅圖 / 柱狀圖 / 甘特圖）
- [x] PDF 匯出（jsPDF + jspdf-autotable）— 報表頁匯出含封面摘要 + 各案子任務明細
- [x] Excel 匯出（SheetJS）— 三個工作表：專案總覽 / 子任務明細 / 階段統計
- [x] PWA 支援（vite-plugin-pwa）— 可安裝至桌面 / 手機，離線快取靜態資源
- [ ] 郵件通知（Supabase Edge Functions）— 待 Supabase 遷移後再實作

---

## 重要設計決策紀錄

| 決策 | 選擇 | 原因 |
|---|---|---|
| 進度計算方式 | 純 checkbox，不用拖曳 | 避免人工操作誤差 |
| 階段「進行中」判斷 | 深色固定 = project.stage；過去階段有殘留任務顯示橘黃 ⚠️ | 移除複雜掃描邏輯，視覺語義清楚：深色=現在、橘=警示、綠=完成 |
| 資料持久化 | LocalStorage（Phase 1）→ Supabase（Phase 2） | Storage Adapter Pattern，切換時不改業務邏輯 |
| BERS 計算 | 靜態查找表 + 純前端計算 | 無需後端，離線可用 |

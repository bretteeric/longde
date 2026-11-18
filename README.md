# 國際佛光會 龍德分會．活動公告入口網站

純靜態網站（HTML／CSS／JS，無建置步驟、無後端），直接部署於 GitHub Pages。
網址：<https://bretteeric.github.io/longde/>

## 內容

- `index.html` 首頁：焦點活動、目前概況（認領進度）、最新公告
- `activities.html` 全部公告：分類篩選＋關鍵字搜尋
- `activity.html` 單則公告詳情（`?id=<活動代號>`）
- `calendar.html` 行事曆：截止日與活動日的月曆檢視
- `about.html` 關於分會、參與方式、資料原則
- `data/activities.json` **所有公告資料都在這一個檔案**
- `assets/css/style.css`、`assets/js/app.js` 樣式與前端邏輯

## 本機預覽

```bash
python3 -m http.server 8000
# 開 http://localhost:8000
```

直接雙擊 `index.html`（file://）不行——瀏覽器會因 CORS 擋掉 JSON 讀取，一定要起本機伺服器。

## 新增／修改公告

編輯 `data/activities.json`，新增一個物件到 `activities` 陣列：

```json
{
  "id": "unique-id",                    // 網址用，英文小寫與連字號
  "title": "活動名稱",
  "category": "慈善公益",                // 慈善公益／法會共修／教育課程／環保永續／會務公告
  "status": "open",                     // open 開放｜ongoing 進行中｜closed 已結案｜soon 預告
  "status_text": "認領中",              // 畫面上顯示的狀態字
  "summary": "一兩句說明，會出現在卡片上",
  "date_text": "認領截止 2026/12/18",   // 卡片與詳情頁顯示的日期文字
  "date_start": "2026-11-17",           // YYYY-MM-DD，用於排序
  "date_end": "2026-12-18",
  "location": "龍德分會",
  "featured": true,                     // 是否放首頁焦點
  "progress": { "current": 2347, "target": 3500, "unit": "碗", "label": "已認領" },  // 沒有進度可填 null
  "stats": [{ "label": "認領筆數", "value": "49 筆" }],
  "events": [{ "date": "2026-12-18", "title": "臘八粥認領截止" }],   // 會出現在行事曆
  "sections": [
    { "heading": "活動說明", "body": "段落文字" },
    { "heading": "領取時段", "list": ["第一項", "第二項 <b>可粗體</b>"] }
  ]
}
```

改完順手更新 `site.updated`（頁尾會顯示「最後更新」）。
`sections.list` 的內容會當 HTML 插入，只放大會自己寫的內容，不要貼外部來源的原始 HTML。

## 資料原則

- 只公布總量、筆數、時段分布等統計；**個人姓名、個人碗數、捐款明細一律不進這個 repo**（本 repo 是公開的）。
- 每筆進度都要標資料截止日，並保留「實際以群組公告為準」的說明。
- 數字更新時同步改 `site.updated`。

## 部署

GitHub Pages（`main` 分支根目錄）：

1. Settings → Pages → Source 選 `Deploy from a branch`、分支 `main`、資料夾 `/ (root)`
2. 推上去後約 1 分鐘生效：<https://bretteeric.github.io/longde/>

`.nojekyll` 已放入，避免 Jekyll 處理檔案；`404.html` 會被 Pages 當自訂錯誤頁。

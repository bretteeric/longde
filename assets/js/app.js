/* 龍德分會 活動公告入口 — front-end */
let SITE = {}, ACTS = [];
const SM = { open: "s-open", ongoing: "s-ongoing", soon: "s-soon", closed: "s-closed" };
const CATS = ["慈善公益", "法會共修", "教育課程", "環保永續", "會務公告"];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupNav();
  const page = document.body.dataset.page;
  try {
    const res = await fetch("data/activities.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    SITE = data.site || {};
    ACTS = (data.activities || []).slice().sort((a, b) => (b.date_start || "").localeCompare(a.date_start || ""));
    applyChrome();
    if (page === "home") renderHome();
    if (page === "list") renderList();
    if (page === "detail") renderDetail();
    if (page === "calendar") renderCalendar();
  } catch (err) {
    renderError(err);
  }
}

/* ---------- chrome ---------- */
function setupNav() {
  const btn = $(".nav-toggle"), nav = $("#site-nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  const page = document.body.dataset.page;
  $$("#site-nav a").forEach((a) => {
    const target = a.getAttribute("href").replace(".html", "");
    if ((page === "home" && target === "index") || page === target) a.setAttribute("aria-current", "page");
  });
}

function applyChrome() {
  $$("[data-updated]").forEach((el) => (el.textContent = SITE.updated || ""));
  $$("[data-site-name]").forEach((el) => (el.textContent = SITE.name || ""));
  const noticeEl = $("[data-notice]");
  if (noticeEl && SITE.notice) {
    noticeEl.innerHTML = "<span aria-hidden='true'>※</span><div><strong>公告說明：</strong>" + esc(SITE.notice) + "</div>";
    noticeEl.style.display = "";
  }
}

/* ---------- pieces ---------- */
function statusHTML(a) {
  const cls = SM[a.status] || "s-open";
  return '<span class="status ' + cls + '">' + esc(a.status_text || "") + "</span>";
}

function progressHTML(p) {
  if (!p || !p.target) return "";
  const pct = Math.max(0, Math.min(100, (Number(p.current) / Number(p.target)) * 100));
  const shown = p.unit === "%" ? Number(p.current).toFixed(1) + "%" : Number(p.current).toLocaleString() + "／" + Number(p.target).toLocaleString() + " " + (p.unit || "");
  return (
    '<div class="progress">' +
    '<div class="progress-label"><span>' + esc(p.label || "進度") + "</span><b>" + shown + "（" + pct.toFixed(1) + "%）</b></div>" +
    '<div class="bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
    "</div>"
  );
}

function cardHTML(a) {
  return (
    '<a class="card" href="activity.html?id=' + encodeURIComponent(a.id) + '" data-cat="' + esc(a.category) + '">' +
    '<div class="card-top"></div>' +
    '<div class="card-body">' +
    '<div class="card-meta"><span class="tag">' + esc(a.category) + "</span>" + statusHTML(a) + "</div>" +
    "<h3>" + esc(a.title) + "</h3>" +
    "<p>" + esc(a.summary) + "</p>" +
    progressHTML(a.progress) +
    "</div>" +
    '<div class="card-foot"><span>' + esc(a.date_text || "") + '</span><span class="arrow">查看詳情 →</span></div>' +
    "</a>"
  );
}

/* ---------- home ---------- */
function renderHome() {
  const box = $("#featured");
  if (box) {
    const feat = ACTS.filter((a) => a.featured).length ? ACTS.filter((a) => a.featured) : ACTS.slice(0, 3);
    box.innerHTML = feat.slice(0, 3).map(cardHTML).join("");
  }
  const panel = $("#hero-panel-body");
  if (panel) {
    const open = ACTS.filter((a) => a.status === "open" || a.status === "ongoing");
    const laba = ACTS.find((a) => a.id === "labazhou-2027");
    const rows = [];
    rows.push('<div class="mini-row"><span class="k">進行中活動</span><span class="v">' + open.length + "<small>項</small></span></div>");
    if (laba && laba.progress) {
      const pct = ((laba.progress.current / laba.progress.target) * 100).toFixed(1);
      rows.push('<div class="mini-row"><span class="k">臘八粥已認領 · ' + pct + '%</span><span class="v">' + Number(laba.progress.current).toLocaleString() + "<small>／" + Number(laba.progress.target).toLocaleString() + " 碗</small></span></div>");
    }
    const forest = ACTS.find((a) => a.id === "forest-2026");
    if (forest && forest.progress) {
      rows.push('<div class="mini-row"><span class="k">森林復育已認養</span><span class="v">' + forest.progress.current + "<small>位／" + forest.progress.target + " 個名額</small></span></div>");
    }
    const gd = ACTS.find((a) => a.id === "guangmingdeng-2027");
    if (gd && gd.progress) rows.push('<div class="mini-row"><span class="k">光明燈尚可認供</span><span class="v">' + (gd.progress.target - gd.progress.current) + "<small>盞</small></span></div>");
    rows.push('<div class="mini-row"><span class="k">資料更新</span><span class="v" style="font-size:15px">' + esc(SITE.updated || "") + "</span></div>");
    panel.innerHTML = rows.join("");
  }
  const brief = $("#quick-list");
  if (brief) {
    const rest = ACTS.filter((a) => !a.featured);
    brief.innerHTML = (rest.length ? rest : ACTS.slice(0, 4)).map(cardHTML).join("");
  }
}

/* ---------- list ---------- */
function renderList() {
  const grid = $("#cards");
  const chipsEl = $("#chips");
  const searchEl = $("#search-input");
  if (!grid) return;
  let active = "全部";
  let q = "";

  const cats = ["全部"].concat(CATS.filter((c) => ACTS.some((a) => a.category === c)));
  cats.forEach((c) => ACTS.forEach((a) => { if (!CATS.includes(a.category) && !cats.includes(a.category)) cats.push(a.category); }));
  chipsEl.innerHTML = cats.map((c, i) => '<button class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + "</button>").join("");

  function paint() {
    const list = ACTS.filter((a) => (active === "全部" || a.category === active) && (!q || (a.title + a.summary + a.category + (a.date_text || "")).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty">沒有符合條件的公告。<br>試試其他分類，或清除搜尋關鍵字。</div>';
    const c = $("#count");
    if (c) c.textContent = "共 " + list.length + " 筆";
  }
  chipsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    active = b.dataset.cat;
    $$(".chip", chipsEl).forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    paint();
  });
  if (searchEl) searchEl.addEventListener("input", () => { q = searchEl.value.trim().toLowerCase(); paint(); });
  paint();
}

/* ---------- detail ---------- */
function renderDetail() {
  const host = $("#article"), side = $("#side");
  const id = new URLSearchParams(location.search).get("id");
  const a = ACTS.find((x) => x.id === id);
  if (!a) {
    host.innerHTML = '<h1>找不到這則公告</h1><p>連結可能已失效，或該公告已撤下。請回到<a href="activities.html">活動公告列表</a>查看目前開放的活動。</p>';
    if (side) side.innerHTML = "";
    document.title = "找不到公告｜" + (SITE.name || "龍德分會");
    return;
  }
  document.title = a.title + "｜" + (SITE.name || "龍德分會");
  const crumb = $("#crumb-title");
  if (crumb) crumb.textContent = a.title;

  const secs = (a.sections || []).map((s) => {
    let html = "<h2>" + esc(s.heading) + "</h2>";
    if (s.body) html += "<p>" + esc(s.body) + "</p>";
    if (s.list && s.list.length) html += "<ul>" + s.list.map((li) => "<li>" + li + "</li>").join("") + "</ul>";
    return html;
  }).join("");

  host.innerHTML =
    '<div class="card-meta" style="margin-bottom:6px"><span class="tag">' + esc(a.category) + "</span>" + statusHTML(a) + "</div>" +
    "<h1>" + esc(a.title) + "</h1>" +
    '<div class="meta-line"><span>📅 ' + esc(a.date_text || "") + "</span>" + (a.location ? "<span>📍 " + esc(a.location) + "</span>" : "") + "<span>🔄 資料更新 " + esc(SITE.updated || "") + "</span></div>" +
    secs +
    '<div class="notice" style="margin:26px 0 0"><span aria-hidden="true">※</span><div><strong>提醒：</strong>' + esc(SITE.notice || "實際內容以群組公告為準。") + "</div></div>";

  const kv = [["分類", a.category], ["狀態", a.status_text], ["日期", a.date_text], ["地點", a.location || "—"], ["資料更新", SITE.updated || "—"]]
    .map((r) => '<div class="kv"><span class="k">' + esc(r[0]) + '</span><span class="v">' + esc(r[1]) + "</span></div>").join("");
  const stats = (a.stats || []).map((s) => '<div class="stat"><div class="n">' + esc(s.value) + '</div><div class="l">' + esc(s.label) + "</div></div>").join("");
  side.innerHTML =
    '<div class="side-card"><h3>活動資訊</h3>' + kv + "</div>" +
    (stats ? '<div class="side-card"><h3>關鍵數字</h3><div class="stat-grid">' + stats + "</div></div>" : "") +
    (a.progress ? '<div class="side-card"><h3>目前進度</h3>' + progressHTML(a.progress) + "</div>" : "") +
    '<div class="side-card"><h3>我要參與</h3><p style="font-size:13.5px;color:var(--ink-soft);margin:0 0 10px">於 LINE 群組「龍德會務宣導」接龍，或洽分會會務人員登記。</p><a class="btn btn-primary" style="width:100%;justify-content:center" href="about.html">聯絡與參與方式</a></div>';

  const more = $("#quick-list");
  if (more) more.innerHTML = ACTS.filter((x) => x.id !== a.id).slice(0, 3).map(cardHTML).join("");
}

/* ---------- calendar ---------- */
let calState = null;
function allEvents() {
  const out = [];
  ACTS.forEach((a) => (a.events || []).forEach((e) => out.push({ date: e.date, title: e.title, cat: a.category, id: a.id })));
  return out.sort((x, y) => x.date.localeCompare(y.date));
}
function parseD(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function fmtShort(s) { const d = parseD(s); return (d.getMonth() + 1) + "/" + d.getDate(); }
function fmtFull(s) { const d = parseD(s); return d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") + "（" + "日一二三四五六"[d.getDay()] + "）"; }

function renderCalendar() {
  const evs = allEvents();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nextEv = evs.find((e) => parseD(e.date) >= today);
  const anchor = nextEv ? parseD(nextEv.date) : (evs.length ? parseD(evs[evs.length - 1].date) : today);
  calState = { y: anchor.getFullYear(), m: anchor.getMonth() };
  $("#cal-prev").addEventListener("click", () => shiftMonth(-1));
  $("#cal-next").addEventListener("click", () => shiftMonth(1));
  const t = $("#cal-today"); if (t) t.addEventListener("click", () => { calState = { y: today.getFullYear(), m: today.getMonth() }; paintCal(); });
  paintCal();
}
function shiftMonth(n) {
  let m = calState.m + n, y = calState.y;
  if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
  calState = { y, m };
  paintCal();
}
function paintCal() {
  const evs = allEvents();
  const { y, m } = calState;
  $("#cal-title").textContent = y + " 年 " + (m + 1) + " 月";
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  const dow = ["日", "一", "二", "三", "四", "五", "六"];
  cells.push(dow.map((d) => '<div class="cal-dow">' + d + "</div>").join(""));
  const todayISO = iso(new Date());
  for (let i = 0; i < startDow; i++) {
    cells.push('<div class="cal-cell mute"><div class="d">' + (prevDays - startDow + i + 1) + "</div></div>");
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dISO = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const dayEvs = evs.filter((e) => e.date === dISO);
    cells.push(
      '<div class="cal-cell' + (dISO === todayISO ? " today" : "") + '"><div class="d">' + d + "</div>" +
      dayEvs.map((e) => '<a class="ev" data-cat="' + esc(e.cat) + '" href="activity.html?id=' + encodeURIComponent(e.id) + '" title="' + esc(e.title) + '">' + esc(e.title) + "</a>").join("") +
      "</div>"
    );
  }
  const tail = (7 - ((startDow + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= tail; i++) cells.push('<div class="cal-cell mute"><div class="d">' + i + "</div></div>");
  $("#cal-grid").innerHTML = cells.join("");

  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const up = evs.filter((e) => parseD(e.date) >= today0).slice(0, 6);
  const upBox = $("#upcoming");
  if (upBox) {
    upBox.innerHTML = up.length
      ? '<h2 style="font-family:var(--font-serif);font-size:19px;margin:0 0 4px">即將到來</h2>' +
        up.map((e) => '<div class="up-item"><div class="up-date">' + fmtShort(e.date) + '</div><div><div class="t"><a href="activity.html?id=' + encodeURIComponent(e.id) + '">' + esc(e.title) + "</a></div><div class=\"c\">" + esc(e.cat) + "．" + fmtFull(e.date) + "</div></div></div>").join("")
      : '<div class="empty" style="grid-column:auto">目前沒有已排定的行程。新的截止日與活動日會在群組公告後同步到這裡。</div>';
  }
}

/* ---------- error ---------- */
function renderError(err) {
  const host = $("#cards") || $("#featured") || $("#article") || $("main");
  const msg =
    '<div class="empty">公告資料載入失敗（' + esc(err.message || err) + "）。<br>" +
    "若你是用 <code>file://</code> 直接開啟檔案，瀏覽器會阻擋資料讀取；請在本機以 <code>python3 -m http.server</code> 預覽，或直接瀏覽線上網站。</div>";
  if (host) host.insertAdjacentHTML("afterbegin", msg);
  console.error(err);
}
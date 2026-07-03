// =====================================================
// ウナシ プラットフォーム 共通スクリプト
// 依存ライブラリなし（チャートはすべてSVGを直接生成）
// =====================================================

// ---- 設定 -------------------------------------------
// LINE_OA_ID: LINE公式アカウントのベーシックID（例: "@unashi"）。
//   設定すると「LINEで問い合わせる」ボタンが有効になり、
//   タップで友だち追加→案件番号入りメッセージが自動セットされる（＝人が取れる）。
// INQUIRY_ENDPOINT: メールフォームの送信先API。空ならメールソフト起動（mailto）。
// ページ側で window.UNASHI_CONFIG を定義すれば、このファイルを触らず上書きできる。
// SHEET_CSV_URL: 案件マスターのGoogleスプレッドシートを「ウェブに公開（CSV）」したURL。
//   設定すると、サイトはスプレッドシートを直接読みに行く（＝シート更新→サイト即反映）。
//   未設定・読込失敗時は data/deals.js の内容で表示する（フォールバック）。
//   列の書き方は docs/google-sheet-sync.md 参照。
const CONFIG = Object.assign(
  {
    LINE_OA_ID: "",                       // 例: "@unashi"
    INQUIRY_ENDPOINT: "",                 // 例: "/api/inquiry"
    INQUIRY_MAILTO: "info@unashi.com",
    SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTGwpJjKG1FbazM9LiQrdzZj22QecTcb7btFT30giR8s2y2EfSQK7xgUSVHNeOtN0bM6pi5tacTRAet/pub?output=csv",
    CONDITION_LINE_URL: "https://lin.ee/fscNIJr7",
  },
  (typeof window !== "undefined" && window.UNASHI_CONFIG) || {}
);

// ---- 共通ヘルパー -----------------------------------
const SCORE_LABELS = {
  scale: "チャンネル規模",
  profit: "収益性",
  growth: "成長性",
  handsfree: "手離れ度",
  stability: "安定性",
  repeat: "運営の再現性",
};
const SCORE_KEYS = ["scale", "profit", "growth", "handsfree", "stability", "repeat"];

// 値が未確定（null/0/空）の時に使う共通表記
const TBD = "面談で開示";

function hasVal(v) {
  return v !== null && v !== undefined && v !== "" && !(typeof v === "number" && v === 0);
}

function yen(man) {
  // 万円 → 表示文字列。1億（=10000万）以上は「◯億円」、それ未満は「◯万円」
  if (!hasVal(man)) return `<span class="tbd">${TBD}</span>`;
  if (man >= 10000) return (man / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 2 }) + "億円";
  return man.toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "万円";
}

// 問い合わせ欄の大きな価格表示用（数字と単位を分けて返す）
function priceParts(man) {
  if (man >= 10000) return { num: (man / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 2 }), unit: "億円" };
  return { num: man.toLocaleString("ja-JP"), unit: "万円" };
}

const TBD_HTML = `<span class="tbd">${TBD}</span>`;
const HIDDEN_STATUSES = new Set(["下書き", "非公開"]);

function visibleDeals(deals) {
  return deals.filter((deal) => !HIDDEN_STATUSES.has(String(deal.status || "").trim()));
}

function subsLabel(n) {
  if (!hasVal(n)) return TBD_HTML;
  return n >= 10000 ? (n / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "万人" : n.toLocaleString("ja-JP") + "人";
}

function viewsLabel(man) {
  // 万回/月 → "1,450万回/月"
  if (!hasVal(man)) return TBD_HTML;
  return man.toLocaleString("ja-JP") + "万回/月";
}

// 推移データが揃っているか（数字を捏造せず、無ければグラフを出さない）
function hasTrend(t) {
  return t && Array.isArray(t.views) && t.views.length > 0 && Array.isArray(t.months) && t.months.length === t.views.length;
}

function directorBadge(status) {
  if (status === "D付き") return '<span class="badge badge-director">ディレクター付き</span>';
  if (status === "D候補あり") return '<span class="badge badge-director-soft">D体制 構築中（ウナシ支援）</span>';
  return '<span class="badge badge-format">オーナー運営</span>';
}

function statusBadge(status) {
  if (status === "交渉中") return '<span class="badge badge-status-nego">交渉中</span>';
  if (status === "成約済") return '<span class="badge badge-status-sold">成約済</span>';
  return "";
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

// ---- 流入元トラッキング -------------------------------
// どの入口から来た問い合わせかを記録する。
//   ?from=media     → メディア（media.unashi.com）内からの導線
//   ?from=buyer-lp  → 買主さまLPからの導線
//   ?utm_source=xxx → 広告等。from が無ければこちらを使う
// 一度ついた流入元は sessionStorage に保存し、一覧→詳細の遷移をまたいでも保持する。
const SOURCE_LABELS = {
  "media": "メディア",
  "buyer-lp": "買主さまLP",
  "media-banner": "メディア内バナー",
};
function getSource() {
  let src = getParam("from") || getParam("utm_source") || "";
  if (src) {
    try { sessionStorage.setItem("unashi_src", src); } catch (e) {}
  } else {
    try { src = sessionStorage.getItem("unashi_src") || ""; } catch (e) {}
  }
  return src;
}
function sourceLabel() {
  const s = getSource();
  if (!s) return "サイト直接";
  return SOURCE_LABELS[s] || s;
}

// ---- Googleスプレッドシート連携 ----------------------
// 「ウェブに公開」したCSVを読み込んで案件データに変換する。
// 列名（1行目の見出し）は日本語。詳細は docs/google-sheet-sync.md 参照。

// 引用符・改行入りセルに対応したCSVパーサ
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = false;
      } else cell += c;
    } else if (c === '"') inQuote = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

// "1,500" "980万円" "28.5万" などの表記ゆれを数値にする
function toNumber(s, manUnit) {
  if (s == null) return 0;
  s = String(s).replace(/[,，\s円回人]/g, "");
  if (s === "") return 0;
  if (s.includes("万")) return parseFloat(s) * (manUnit ? 1 : 10000);
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function splitList(s) {
  return String(s || "").split(/[|｜、,，・\/]/).map((v) => v.trim()).filter(Boolean);
}

// 文章の箇条書き用（「、」を含む文を壊さないよう「|」と改行だけで区切る）
function splitLines(s) {
  return String(s || "").split(/[|｜\n]/).map((v) => v.trim()).filter(Boolean);
}

function clampScore(v) {
  const n = Math.round(toNumber(v, true));
  return Math.min(5, Math.max(1, n || 3));
}

// シートの1行 → 案件オブジェクト
function rowToDeal(get) {
  const months = splitList(get("推移月"));
  const views = splitList(get("再生推移")).map((v) => toNumber(v, true));
  const profit = splitList(get("利益推移")).map((v) => toNumber(v, true));
  return {
    id: get("案件番号"),
    title: get("タイトル"),
    category: get("ジャンル") || "その他",
    format: get("形式") || "—",
    subscribers: toNumber(get("登録者数"), false),
    monthlyViews: toNumber(get("月間再生数"), true),   // 万回
    monthlyProfit: toNumber(get("月利益"), true),       // 万円
    price: toNumber(get("希望価格"), true),             // 万円
    directorStatus: ["D付き", "D候補あり"].includes(get("ディレクター")) ? get("ディレクター") : "応相談",
    ownerHours: toNumber(get("オーナー稼働"), true),
    ageMonths: toNumber(get("運営期間"), true),
    monetization: splitList(get("収益内訳")),
    status: ["募集中", "交渉中", "成約済"].includes(get("状態")) ? get("状態") : "募集中",
    isNew: /^(true|1|○|◯|はい|新着)$/i.test(get("新着").trim()),
    summary: get("概要"),
    comment: get("見立て"),
    // ノンネームシートv2 由来の追加項目（空欄ならサイト側で非表示になる）
    audience: get("視聴者層"),
    postingPace: get("投稿頻度"),
    team: get("体制"),
    strengths: splitLines(get("強み")),
    risks: splitLines(get("リスク")),
    scope: splitLines(get("譲渡範囲")),
    reason: get("売却理由"),
    scores: {
      scale: clampScore(get("規模")),
      profit: clampScore(get("収益性")),
      growth: clampScore(get("成長性")),
      handsfree: clampScore(get("手離れ")),
      stability: clampScore(get("安定性")),
      repeat: clampScore(get("再現性")),
    },
    trend: { months, views, profit },
  };
}

function dealsFromCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const deals = [];
  for (const r of rows.slice(1)) {
    const get = (name) => {
      const i = header.indexOf(name);
      return i === -1 ? "" : (r[i] || "").trim();
    };
    if (HIDDEN_STATUSES.has(get("状態"))) continue;
    const d = rowToDeal(get);
    if (d.id && d.title) deals.push(d);
  }
  return deals;
}

// スプレッドシート優先、失敗時は deals.js のデータで表示
async function loadDeals() {
  if (!CONFIG.SHEET_CSV_URL) return visibleDeals(DEALS);
  try {
    const res = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return visibleDeals(dealsFromCSV(await res.text()));
  } catch (e) {
    console.warn("スプレッドシートを読めなかったため deals.js の内容で表示します:", e.message);
    return visibleDeals(DEALS);
  }
}

// ---- 六角形（レーダー）チャート ----------------------
// scores: {scale:1-5, ...} / size: 描画px / withLabels: 軸ラベル表示
function radarSVG(scores, size, withLabels) {
  const cx = size / 2, cy = size / 2;
  const margin = withLabels ? 34 : 8;
  const r = size / 2 - margin;
  const n = SCORE_KEYS.length;

  const point = (i, ratio) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(ang) * r * ratio, cy + Math.sin(ang) * r * ratio];
  };
  const poly = (ratio) => SCORE_KEYS.map((_, i) => point(i, ratio).map((v) => v.toFixed(1)).join(",")).join(" ");

  let s = `<svg viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="評価チャート">`;

  // 目盛り（5段階のガイド六角形）
  for (let g = 1; g <= 5; g++) {
    s += `<polygon points="${poly(g / 5)}" fill="${g === 5 ? "#f2f6ff" : "none"}" stroke="#d7e0f5" stroke-width="1"/>`;
  }
  // 軸線
  for (let i = 0; i < n; i++) {
    const [x, y] = point(i, 1);
    s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d7e0f5" stroke-width="1"/>`;
  }
  // スコア多角形
  const scorePts = SCORE_KEYS.map((k, i) => point(i, (scores[k] || 0) / 5).map((v) => v.toFixed(1)).join(",")).join(" ");
  s += `<polygon points="${scorePts}" fill="rgba(29,78,216,0.28)" stroke="#1d4ed8" stroke-width="2" stroke-linejoin="round"/>`;
  SCORE_KEYS.forEach((k, i) => {
    const [x, y] = point(i, (scores[k] || 0) / 5);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#facc15" stroke="#1d4ed8" stroke-width="1.5"/>`;
  });
  // ラベル
  if (withLabels) {
    SCORE_KEYS.forEach((k, i) => {
      const [x, y] = point(i, 1.22);
      s += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="11" font-weight="700" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">${SCORE_LABELS[k]}</text>`;
    });
  }
  s += "</svg>";
  return s;
}

// ---- 推移グラフ（棒グラフ） --------------------------
// values: 数値配列 / labels: 月ラベル / unit: 単位文字列 / color
function barChartSVG(values, labels, unit, color) {
  const w = 560, h = 240, padL = 52, padB = 30, padT = 18, padR = 12;
  const max = Math.max(...values) * 1.15;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const barW = (innerW / values.length) * 0.55;

  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="推移グラフ">`;

  // 横グリッド線 + 目盛り
  for (let g = 0; g <= 4; g++) {
    const v = (max / 4) * g;
    const y = padT + innerH - (innerH * g) / 4;
    s += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
    s += `<text x="${padL - 8}" y="${y + 4}" font-size="11" fill="#94a3b8" text-anchor="end">${Math.round(v).toLocaleString("ja-JP")}</text>`;
  }
  // 棒
  values.forEach((v, i) => {
    const x = padL + (innerW / values.length) * (i + 0.5) - barW / 2;
    const bh = (innerH * v) / max;
    const y = padT + innerH - bh;
    const isLast = i === values.length - 1;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${isLast ? "#facc15" : color}"/>`;
    s += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" font-size="11" font-weight="700" fill="#16348f" text-anchor="middle">${v.toLocaleString("ja-JP")}</text>`;
    s += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 10}" font-size="11" fill="#4b5563" text-anchor="middle">${labels[i]}</text>`;
  });
  s += `<text x="${padL}" y="12" font-size="11" fill="#94a3b8">単位: ${unit}</text>`;
  s += "</svg>";
  return s;
}

// ---- 一覧ページ -------------------------------------
function initListPage(allDeals) {
  const grid = document.getElementById("deal-grid");
  if (!grid) return;

  // カテゴリの選択肢は、実際に掲載中の案件から組み立てる。
  // 案件マスター（NN）の「ジャンル」列が増えれば、ここも自動で増える。
  const catSel = document.getElementById("filter-category");
  [...new Set(allDeals.map((d) => d.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"))
    .forEach((c) => {
      const o = document.createElement("option");
      o.value = c; o.textContent = c;
      catSel.appendChild(o);
    });

  const render = () => {
    const cat = catSel.value;
    const price = document.getElementById("filter-price").value;
    const director = document.getElementById("filter-director").value;
    const sort = document.getElementById("filter-sort").value;

    let list = allDeals.filter((d) => {
      if (cat !== "all" && d.category !== cat) return false;
      if (director === "director" && d.directorStatus !== "D付き") return false;
      if (director === "director-plus" && !["D付き", "D候補あり"].includes(d.directorStatus)) return false;
      if (price === "u500" && d.price > 500) return false;
      if (price === "500-1000" && (d.price <= 500 || d.price > 1000)) return false;
      if (price === "o1000" && d.price <= 1000) return false;
      return true;
    });

    const order = { 募集中: 0, 交渉中: 1, 成約済: 2 };
    list.sort((a, b) => {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "profit-desc") return b.monthlyProfit - a.monthlyProfit;
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); // 新着順
    });

    document.getElementById("deal-count").innerHTML = `<b>${list.length}</b> 件`;

    grid.innerHTML = list.map((d) => `
      <a class="deal-card ${d.status === "成約済" ? "is-sold" : ""}" href="deal.html?id=${d.id}">
        <div class="card-top">
          <div class="badge-row">
            ${d.isNew && d.status === "募集中" ? '<span class="badge badge-new">NEW</span>' : ""}
            ${statusBadge(d.status)}
            <span class="badge badge-cat">${d.category}</span>
            <span class="badge badge-format">${d.format}</span>
            ${directorBadge(d.directorStatus)}
          </div>
          <h3>${d.title}</h3>
          <div class="deal-id">案件番号 ${d.id}</div>
        </div>
        <div class="card-body">
          <div class="card-metrics">
            <div class="metric"><span class="k">希望価格</span><span class="v price">${yen(d.price)}</span></div>
            <div class="metric"><span class="k">月の利益</span><span class="v">${yen(d.monthlyProfit)}</span></div>
            <div class="metric"><span class="k">登録者</span><span class="v">${subsLabel(d.subscribers)}</span></div>
            <div class="metric"><span class="k">月間再生</span><span class="v">${viewsLabel(d.monthlyViews)}</span></div>
          </div>
          <div class="card-chart">${radarSVG(d.scores, 118, false)}</div>
        </div>
        <div class="card-foot">
          <span class="btn btn-ghost btn-block">${d.status === "成約済" ? "詳細を見る（成約済）" : "詳細・問い合わせ"}</span>
        </div>
      </a>
    `).join("");
  };

  ["filter-category", "filter-price", "filter-director", "filter-sort"].forEach((id) => {
    document.getElementById(id).addEventListener("change", render);
  });
  render();

  // 未公開案件の条件登録。OA IDがあればメッセージ付き、未設定なら公式LINEの短縮URLへ。
  const senko = document.getElementById("line-senko-section");
  if (senko) {
    const senkoButton = document.getElementById("line-senko");
    if (CONFIG.LINE_OA_ID) {
      const text = encodeURIComponent(`未公開案件の先行案内を希望します。\n希望ジャンル：\n価格帯：\n運営責任者(ディレクター)譲渡希望：\n（流入元：${sourceLabel()}）`);
      senkoButton.href = `https://line.me/R/oaMessage/${encodeURIComponent(CONFIG.LINE_OA_ID)}/?${text}`;
    } else if (CONFIG.CONDITION_LINE_URL) {
      senkoButton.href = CONFIG.CONDITION_LINE_URL;
    } else {
      senko.style.display = "none";
    }
  }
}

// ---- 詳細ページ -------------------------------------
function initDetailPage(allDeals) {
  const root = document.getElementById("detail-root");
  if (!root) return;
  if (!allDeals.length) {
    root.innerHTML = `
      <section class="panel">
        <h2>公開中の案件がありません</h2>
        <p>現在表示できる案件がありません。条件に合う案件は、ウナシまでお問い合わせください。</p>
        <a class="btn btn-primary" href="index.html">案件一覧へ戻る</a>
      </section>
    `;
    return;
  }

  const deal = allDeals.find((d) => d.id === getParam("id")) || allDeals[0];
  document.title = `${deal.title}｜ウナシ YouTubeチャンネル売買`;

  document.getElementById("bc-title").textContent = deal.title;
  document.getElementById("deal-title").textContent = deal.title;
  document.getElementById("deal-id-label").textContent = `案件番号 ${deal.id}`;
  document.getElementById("deal-badges").innerHTML = `
    ${deal.isNew && deal.status === "募集中" ? '<span class="badge badge-new">NEW</span>' : ""}
    ${statusBadge(deal.status)}
    <span class="badge badge-cat">${deal.category}</span>
    <span class="badge badge-format">${deal.format}</span>
    ${directorBadge(deal.directorStatus)}
  `;
  document.getElementById("deal-summary").textContent = deal.summary;

  // ウナシの見立て（率直な所感。空欄なら非表示）
  const commentPanel = document.getElementById("panel-comment");
  if (commentPanel) {
    if (deal.comment) commentPanel.querySelector(".comment-body").textContent = deal.comment;
    else commentPanel.style.display = "none";
  }

  // 概要テーブル（値がある時だけ行を出す。数字が無い項目は「面談で開示」）
  const ageLabel = hasVal(deal.ageMonths)
    ? `${Math.floor(deal.ageMonths / 12) ? Math.floor(deal.ageMonths / 12) + "年" : ""}${deal.ageMonths % 12 ? (deal.ageMonths % 12) + "ヶ月" : ""}`
    : TBD;
  const recoupLabel = hasVal(deal.monthlyProfit)
    ? `（回収目安 約${Math.round(deal.price / deal.monthlyProfit)}ヶ月）` : "";
  document.getElementById("spec-body").innerHTML = `
    <tr><th>希望価格</th><td class="price-cell">${yen(deal.price)}</td></tr>
    <tr><th>月の利益</th><td>${yen(deal.monthlyProfit)}${recoupLabel}</td></tr>
    <tr><th>登録者数</th><td>${subsLabel(deal.subscribers)}</td></tr>
    <tr><th>月間再生数</th><td>${viewsLabel(deal.monthlyViews)}</td></tr>
    <tr><th>運営期間</th><td>${ageLabel}</td></tr>
    <tr><th>収益の内訳</th><td>${deal.monetization.join("・")}</td></tr>
    ${deal.audience ? `<tr><th>視聴者層</th><td>${deal.audience}</td></tr>` : ""}
    ${deal.postingPace ? `<tr><th>投稿頻度</th><td>${deal.postingPace}</td></tr>` : ""}
    <tr><th>オーナーの稼働</th><td>${hasVal(deal.ownerHours) ? "月 " + deal.ownerHours + " 時間ほど" : TBD}</td></tr>
    <tr><th>運営体制</th><td>${deal.directorStatus === "D付き" ? "ディレクター付き（体制ごと引き継ぎ可）" : deal.directorStatus === "D候補あり" ? "ディレクター体制をウナシが構築中（体制付きでの引き渡しを設計中）" : "オーナー運営（引き継ぎ方法は個別にご相談ください）"}</td></tr>
    ${deal.team ? `<tr><th>チーム構成</th><td>${deal.team}</td></tr>` : ""}
  `;

  // v2の追加パネル（強み・リスク・譲渡条件）。データがなければパネルごと消す
  const fillPanel = (panelId, html) => {
    const el = document.getElementById(panelId);
    if (!el) return;
    if (html) el.querySelector(".panel-content").innerHTML = html;
    else el.style.display = "none";
  };
  fillPanel("panel-strengths",
    (deal.strengths || []).length
      ? `<ul class="check-list">${deal.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>` : "");
  fillPanel("panel-risks",
    (deal.risks || []).length
      ? `<ul class="risk-list">${deal.risks.map((s) => `<li>${s}</li>`).join("")}</ul>
         <p class="panel-note">※ 良い点だけでなく、気になる点も先にお伝えするのがウナシの方針です。詳しい背景は面談でご説明します。</p>` : "");
  fillPanel("panel-scope",
    (deal.scope || []).length || deal.reason
      ? `${(deal.scope || []).length ? `<ul class="check-list">${deal.scope.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
         ${deal.reason ? `<p class="panel-note"><b>売却理由：</b>${deal.reason}</p>` : ""}` : "");

  // 六角形チャート + 凡例バー
  document.getElementById("radar-holder").innerHTML = radarSVG(deal.scores, 300, true);
  document.getElementById("radar-legend").innerHTML = SCORE_KEYS.map((k) => `
    <div class="row">
      <span>${SCORE_LABELS[k]}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${(deal.scores[k] / 5) * 100}%"></div></div>
      <span class="score-num">${deal.scores[k]}</span>
    </div>
  `).join("");

  // 推移グラフ（再生数 / 利益 切り替え）。データが無ければパネルごと出さない（数字を作らない）
  const trendPanel = document.getElementById("panel-trend");
  if (!hasTrend(deal.trend)) {
    if (trendPanel) trendPanel.style.display = "none";
  } else {
    const chartHolder = document.getElementById("trend-holder");
    const tabViews = document.getElementById("tab-views");
    const tabProfit = document.getElementById("tab-profit");
    const hasProfitTrend = Array.isArray(deal.trend.profit) && deal.trend.profit.length === deal.trend.months.length;
    const showViews = () => {
      chartHolder.innerHTML = barChartSVG(deal.trend.views, deal.trend.months, "万回", "#1d4ed8");
      tabViews.classList.add("active"); tabProfit.classList.remove("active");
    };
    const showProfit = () => {
      chartHolder.innerHTML = barChartSVG(deal.trend.profit, deal.trend.months, "万円", "#16348f");
      tabProfit.classList.add("active"); tabViews.classList.remove("active");
    };
    tabViews.addEventListener("click", showViews);
    if (hasProfitTrend) tabProfit.addEventListener("click", showProfit);
    else tabProfit.style.display = "none";
    showViews();
  }

  // 問い合わせ欄
  const pp = priceParts(deal.price);
  document.getElementById("inq-price").innerHTML = `${pp.num}<small>${pp.unit}</small>`;
  const form = document.getElementById("inquiry-form");
  const lineArea = document.getElementById("line-area");
  const mailToggleArea = document.getElementById("mail-toggle-area");

  if (deal.status === "成約済") {
    lineArea.style.display = "none";
    mailToggleArea.style.display = "none";
    form.style.display = "block";
    form.innerHTML = `<div class="sold-overlay">この案件は成約済みです。<br>似た条件の案件をご希望の方は<a href="index.html#deals">案件一覧</a>からお探しいただくか、新着案件のご案内をお問い合わせください。</div>`;
    return;
  }

  // LINE問い合わせ（メイン導線）。OA未設定のあいだはメールフォームを直接表示
  if (CONFIG.LINE_OA_ID) {
    const text = encodeURIComponent(
      `【案件 ${deal.id}】「${deal.title}」について問い合わせます。\n（流入元：${sourceLabel()}）`
    );
    document.getElementById("line-inquiry").href =
      `https://line.me/R/oaMessage/${encodeURIComponent(CONFIG.LINE_OA_ID)}/?${text}`;
    document.getElementById("mail-toggle").addEventListener("click", () => {
      form.style.display = "block";
      mailToggleArea.style.display = "none";
    });
  } else {
    lineArea.style.display = "none";
    mailToggleArea.style.display = "none";
    form.style.display = "block";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      dealId: deal.id,
      dealTitle: deal.title,
      name: form.querySelector("[name=name]").value.trim(),
      email: form.querySelector("[name=email]").value.trim(),
      type: form.querySelector("[name=type]").value,
      message: form.querySelector("[name=message]").value.trim(),
      source: getSource() || "direct",
      sourceLabel: sourceLabel(),
    };
    const errEl = document.getElementById("form-error");
    if (!data.name || !data.email) {
      errEl.style.display = "block";
      errEl.textContent = "お名前とメールアドレスを入力してください。";
      return;
    }
    errEl.style.display = "none";

    if (CONFIG.INQUIRY_ENDPOINT) {
      try {
        const res = await fetch(CONFIG.INQUIRY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("送信に失敗しました");
        form.style.display = "none";
        document.getElementById("form-success").style.display = "block";
      } catch (err) {
        errEl.style.display = "block";
        errEl.textContent = "送信できませんでした。時間をおいて再度お試しください。";
      }
    } else {
      // サーバー未接続のあいだはメールソフトを立ち上げる
      const subject = encodeURIComponent(`【案件 ${data.dealId}】お問い合わせ`);
      const body = encodeURIComponent(
        `案件番号: ${data.dealId}\n案件名: ${data.dealTitle}\nお名前: ${data.name}\nメール: ${data.email}\n種別: ${data.type}\n流入元: ${data.sourceLabel}\n\n${data.message}`
      );
      location.href = `mailto:${CONFIG.INQUIRY_MAILTO}?subject=${subject}&body=${body}`;
      form.style.display = "none";
      document.getElementById("form-success").style.display = "block";
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  getSource(); // 流入元を最初に捕捉して保存（以降の遷移で保持される）
  const deals = await loadDeals();
  initListPage(deals);
  initDetailPage(deals);
});

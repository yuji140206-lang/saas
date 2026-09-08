#!/usr/bin/env node
// Static site generator: reads data/programs.json and renders dist/index.html
// plus one dist/programs/<id>.html per program. No build dependencies.
const fs = require("fs");
const path = require("path");
const { ROOT, readPrograms, resolveAffiliateUrl, escapeHtml } = require("./lib");

const DIST = path.join(ROOT, "dist");
const SITE_NAME = "継続報酬アフィリエイト・ラボ";
const SITE_TAGLINE = "寝ている間も稼ぐ、継続報酬(リカーリング)型アフィリエイトだけを集めました。";

function layout({ title, description, bodyHtml, cssPath, canonicalPath }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="stylesheet" href="${cssPath}" />
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="${canonicalPath === "/" ? "#" : "../index.html"}">${escapeHtml(SITE_NAME)}</a>
  </div>
</header>
${bodyHtml}
<footer class="site-footer">
  <div class="container">
    <p>本サイトの一部リンクはアフィリエイトリンクです。リンク経由でお申し込みいただくと、サイト運営者に紹介料が支払われる場合がありますが、ご利用者様の費用が増えることはありません。</p>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)}</p>
  </div>
</footer>
</body>
</html>
`;
}

function renderIndex(programs) {
  const cards = programs
    .map(
      (p) => `
      <a class="program-card" href="programs/${p.id}.html">
        <span class="category-tag">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="rate">${escapeHtml(p.recurringRate)}</p>
        <p class="summary">${escapeHtml(p.summary)}</p>
      </a>`
    )
    .join("\n");

  const body = `
<main>
  <section class="hero container">
    <h1>${escapeHtml(SITE_TAGLINE)}</h1>
    <p class="lead">一度きりの成果報酬ではなく、顧客が契約を続ける限り毎月報酬が発生する「継続報酬(リカーリング)型」アフィリエイトプログラムだけを厳選して紹介しています。</p>
    <div class="disclosure-banner">
      本サイトはアフィリエイトプログラムの比較・紹介サイトです。実際に収益を得るには各プログラムへの登録・審査が必要です。収益を保証するものではありません。
    </div>
  </section>
  <section class="container">
    <h2 class="section-title">掲載プログラム一覧(${programs.length}件)</h2>
    <div class="program-grid">
      ${cards}
    </div>
  </section>
</main>`;

  return layout({
    title: `${SITE_NAME} | 継続報酬アフィリエイトまとめ`,
    description: SITE_TAGLINE,
    bodyHtml: body,
    cssPath: "assets/styles.css",
    canonicalPath: "/",
  });
}

function renderProgram(program) {
  const affiliateUrl = resolveAffiliateUrl(program);
  const body = `
<main class="program-detail container">
  <a class="back-link" href="../index.html">&larr; 一覧に戻る</a>
  <span class="category-tag">${escapeHtml(program.category)}</span>
  <h1>${escapeHtml(program.name)}</h1>
  <p class="rate">${escapeHtml(program.recurringRate)}</p>
  <p>${escapeHtml(program.summary)}</p>

  <div class="detail-grid">
    <div class="detail-card">
      <h2>なぜ継続報酬になりやすいか</h2>
      <p>${escapeHtml(program.why)}</p>
      <h2>Cookie有効期間</h2>
      <p>${escapeHtml(String(program.cookieDays))}日間</p>
    </div>
    <div class="detail-card">
      <h2>アクション</h2>
      <p><a class="cta-button" href="${escapeHtml(affiliateUrl)}" rel="sponsored noopener" target="_blank">公式サイトで詳細を見る</a></p>
      <p><a class="cta-button secondary" href="${escapeHtml(program.officialUrl)}" rel="noopener" target="_blank">アフィリエイトプログラムに登録する</a></p>
    </div>
  </div>
</main>`;

  return layout({
    title: `${program.name}の継続報酬アフィリエイト | ${SITE_NAME}`,
    description: program.summary,
    bodyHtml: body,
    cssPath: "../assets/styles.css",
    canonicalPath: `/programs/${program.id}`,
  });
}

function main() {
  const programs = readPrograms();
  fs.mkdirSync(path.join(DIST, "programs"), { recursive: true });
  fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });

  fs.copyFileSync(
    path.join(ROOT, "assets", "styles.css"),
    path.join(DIST, "assets", "styles.css")
  );

  fs.writeFileSync(path.join(DIST, "index.html"), renderIndex(programs), "utf8");

  for (const program of programs) {
    fs.writeFileSync(
      path.join(DIST, "programs", `${program.id}.html`),
      renderProgram(program),
      "utf8"
    );
  }

  console.log(`Generated dist/index.html + ${programs.length} program page(s).`);
  const missingIds = programs
    .filter((p) => !process.env[`AFFILIATE_ID_${p.id.toUpperCase().replace(/-/g, "_")}`] && !process.env.AFFILIATE_ID)
    .map((p) => p.id);
  if (missingIds.length) {
    console.log(
      `Note: no affiliate ID set for [${missingIds.join(", ")}] — their links use a YOUR_AFFILIATE_ID placeholder. Set AFFILIATE_ID_<ID> or AFFILIATE_ID env vars before generating for production.`
    );
  }
}

main();

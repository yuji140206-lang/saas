#!/usr/bin/env node
// Automation tool: add a new recurring-commission affiliate program and
// rebuild the site in one step.
//
// Usage (flags, non-interactive):
//   node scripts/add-program.js \
//     --name "Notion" --category "SaaS" \
//     --rate "月額料金の20%を継続報酬" --cookie-days 30 \
//     --url "https://notion.so" \
//     --summary "..." --why "..."
//
// Usage (interactive): node scripts/add-program.js
const readline = require("readline");
const { execFileSync } = require("child_process");
const path = require("path");
const { readPrograms, writePrograms, slugify } = require("./lib");

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "";
      flags[key] = value;
      if (value) i += 1;
    }
  }
  return flags;
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function collectInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answers = {};
  answers.name = await ask(rl, "サービス名 (例: Notion): ");
  answers.category = await ask(rl, "カテゴリ (例: SaaS・生産性ツール): ");
  answers.rate = await ask(rl, "継続報酬の条件 (例: 月額料金の20%を継続報酬): ");
  answers.cookieDays = await ask(rl, "Cookie有効期間(日数、不明なら空欄): ");
  answers.url = await ask(rl, "公式サイトURL: ");
  answers.summary = await ask(rl, "サービスの概要 (1〜2文): ");
  answers.why = await ask(rl, "継続報酬になりやすい理由: ");
  rl.close();
  return answers;
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const hasFlags = Object.keys(flags).length > 0;
  const input = hasFlags
    ? {
        name: flags.name,
        category: flags.category,
        rate: flags.rate,
        cookieDays: flags["cookie-days"],
        url: flags.url,
        summary: flags.summary,
        why: flags.why,
      }
    : await collectInteractive();

  const required = ["name", "category", "rate", "url", "summary", "why"];
  const missing = required.filter((key) => !input[key]);
  if (missing.length) {
    console.error(`Missing required field(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  const programs = readPrograms();
  const id = slugify(input.name);
  if (programs.some((p) => p.id === id)) {
    console.error(`A program with id "${id}" already exists. Edit data/programs.json directly to update it.`);
    process.exit(1);
  }

  programs.push({
    id,
    name: input.name,
    category: input.category,
    recurringRate: input.rate,
    cookieDays: Number(input.cookieDays) || 30,
    officialUrl: input.url,
    summary: input.summary,
    why: input.why,
  });

  writePrograms(programs);
  console.log(`Added "${input.name}" (id: ${id}) to data/programs.json.`);

  const skipBuild = flags["no-build"] !== undefined;
  if (!skipBuild) {
    execFileSync(process.execPath, [path.join(__dirname, "generate-site.js")], {
      stdio: "inherit",
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

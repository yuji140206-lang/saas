const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "programs.json");

function readPrograms() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
  return raw ? JSON.parse(raw) : [];
}

function writePrograms(programs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(programs, null, 2) + "\n", "utf8");
}

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Resolves the affiliate link for a program without ever hardcoding a real
// affiliate ID in the repo. Priority: AFFILIATE_ID_<PROGRAM_ID> env var,
// then the generic AFFILIATE_ID env var, then a visible placeholder so a
// missing ID fails loudly on the rendered page instead of silently linking
// to the bare official URL.
function resolveAffiliateUrl(program) {
  const perProgramKey = `AFFILIATE_ID_${program.id.toUpperCase().replace(/-/g, "_")}`;
  const affiliateId = process.env[perProgramKey] || process.env.AFFILIATE_ID;
  const separator = program.officialUrl.includes("?") ? "&" : "?";
  if (!affiliateId) {
    return `${program.officialUrl}${separator}ref=YOUR_AFFILIATE_ID`;
  }
  return `${program.officialUrl}${separator}ref=${encodeURIComponent(affiliateId)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { ROOT, DATA_FILE, readPrograms, writePrograms, slugify, resolveAffiliateUrl, escapeHtml };

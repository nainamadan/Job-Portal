// Generates src/theme-dark.css (the dark mode colour layer). Run from client/: npm run theme:dark
const path = require("path");
const colors = require(process.argv[2] || "tailwindcss/colors");
const OUT_FILE = process.argv[3] || path.join(__dirname, "..", "src", "theme-dark.css");
const fs = require("fs");
const BS = String.fromCharCode(92); // backslash
const SPECIAL = new Set([":", "/", ".", "#", "[", "]"]);
const esc = (c) => [...c].map((ch) => (SPECIAL.has(ch) ? BS + ch : ch)).join("");
const hexToRgb = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" "); };
const D = "html.dark";
const out = [];
const rule = (classes, decl, pseudo = "") =>
  out.push(`${classes.map((c) => `${D} .${esc(c)}${pseudo}`).join(",\n")} { ${decl} }`);

out.push(`/* Dark mode colour layer (generated). Applies when <html> has class "dark" (see src/utils/theme.js).
   It re-colours the light neutral and tint utility classes the site already uses, so pages don't need
   individual dark: variants. Deliberately dark elements (bg-slate-900, text-white, gradients) are left alone.
   To support a new light class in dark mode, add it below. */`);

// Page + surfaces
out.push(`${D} { color-scheme: dark; }
${D} body { background-color: #020617; color: #e2e8f0; }`);
const SURFACE = "#0f172a", SUBTLE = "#131c31", MUTED = "#1e293b", STRONG = "#334155";
rule(["bg-white", "bg-white/95", "bg-white/90", "bg-white/80"], `background-color: ${SURFACE};`);
rule(["bg-[#f5f7fc]"], "background-color: #020617;");
rule(["bg-slate-50", "bg-gray-50", "bg-slate-50/80", "bg-slate-50/50", "bg-gray-50/50"], `background-color: ${SUBTLE};`);
rule(["bg-slate-100", "bg-gray-100"], `background-color: ${MUTED};`);
rule(["bg-slate-200", "bg-gray-200", "bg-slate-300", "bg-gray-300"], `background-color: ${STRONG};`);
rule(["hover:bg-white", "hover:bg-slate-50", "hover:bg-gray-50", "hover:bg-slate-50/80", "hover:bg-slate-100", "hover:bg-gray-100"], `background-color: ${MUTED};`, ":hover");
rule(["hover:bg-slate-200", "hover:bg-gray-200"], `background-color: ${STRONG};`, ":hover");

// Text
rule(["text-black", "text-slate-950", "text-slate-900", "text-gray-900"], "color: #f8fafc;");
rule(["text-slate-800", "text-gray-800"], "color: #e2e8f0;");
rule(["text-slate-700", "text-gray-700"], "color: #cbd5e1;");
rule(["text-slate-600", "text-gray-600"], "color: #a5b4c8;");
rule(["text-slate-500", "text-gray-500"], "color: #94a3b8;");
rule(["text-slate-400", "text-gray-400"], "color: #7c8ba1;");
rule(["hover:text-slate-900", "hover:text-slate-800", "hover:text-gray-900", "hover:text-gray-800", "hover:text-black"], "color: #ffffff;", ":hover");
rule(["hover:text-slate-700", "hover:text-slate-600", "hover:text-gray-700"], "color: #e2e8f0;", ":hover");

// Borders / dividers
rule(["border-slate-100", "border-gray-100", "border-slate-50"], "border-color: #1e293b;");
rule(["border-slate-200", "border-gray-200"], "border-color: #263248;");
// Default border colour for plain "border"/"divide-y" (zero specificity, so coloured border classes still win).
out.push(`:where(${D}) *, :where(${D}) ::before, :where(${D}) ::after { border-color: #263248; }`);
rule(["border-slate-300", "border-gray-300"], "border-color: #3b4a61;");
rule(["hover:border-black", "hover:border-slate-300", "hover:border-gray-300"], "border-color: #64748b;", ":hover");
out.push(`${D} .divide-slate-100 > :not([hidden]) ~ :not([hidden]), ${D} .divide-gray-100 > :not([hidden]) ~ :not([hidden]), ${D} .divide-slate-200 > :not([hidden]) ~ :not([hidden]) { border-color: #1e293b; }`);

// Light gradient stops
for (const [cls, hex] of [["white", SURFACE], ["slate-50", SUBTLE], ["gray-50", SUBTLE]]) {
  out.push(`${D} .from-${cls} { --tw-gradient-from: ${hex} var(--tw-gradient-from-position); --tw-gradient-to: rgb(15 23 42 / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }`);
  out.push(`${D} .via-${cls} { --tw-gradient-to: rgb(15 23 42 / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${hex} var(--tw-gradient-via-position), var(--tw-gradient-to); }`);
  out.push(`${D} .to-${cls} { --tw-gradient-to: ${hex} var(--tw-gradient-to-position); }`);
}

// Coloured tints: light backgrounds become translucent, dark text becomes light.
const FAMILIES = ["red", "rose", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink"];
for (const f of FAMILIES) {
  const c = colors[f], rgb = hexToRgb(c[500]);
  rule([`bg-${f}-50`, `bg-${f}-50/40`, `bg-${f}-50/50`, `bg-${f}-50/60`], `background-color: rgb(${rgb} / 0.12);`);
  rule([`bg-${f}-100`, `bg-${f}-100/50`], `background-color: rgb(${rgb} / 0.2);`);
  rule([`bg-${f}-200`], `background-color: rgb(${rgb} / 0.3);`);
  rule([`hover:bg-${f}-50`, `hover:bg-${f}-50/40`, `hover:bg-${f}-100`], `background-color: rgb(${rgb} / 0.24);`, ":hover");
  rule([`text-${f}-900`, `text-${f}-800`, `text-${f}-700`], `color: ${c[300]};`);
  rule([`text-${f}-600`], `color: ${c[400]};`);
  rule([`border-${f}-50`, `border-${f}-100`, `border-${f}-200`, `border-${f}-300`], `border-color: rgb(${rgb} / 0.35);`);
  rule([`hover:border-${f}-300`, `hover:border-${f}-400`], `border-color: rgb(${rgb} / 0.6);`, ":hover");
  for (const s of ["50", "100"]) {
    out.push(`${D} .from-${f}-${s} { --tw-gradient-from: rgb(${rgb} / 0.14) var(--tw-gradient-from-position); --tw-gradient-to: rgb(${rgb} / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }`);
    out.push(`${D} .to-${f}-${s} { --tw-gradient-to: rgb(${rgb} / 0.14) var(--tw-gradient-to-position); }`);
  }
}

// Forms, logos and third-party widgets
out.push(`/* Fields with no background class get a dark field colour (zero specificity, so bg-* classes still win). */
:where(${D}) :where(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]), select, textarea) { background-color: #0b1324; }
${D} input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), ${D} select, ${D} textarea { color: #e2e8f0; }
${D} input::placeholder, ${D} textarea::placeholder { color: #64748b; }
${D} select option { background-color: ${SURFACE}; color: #e2e8f0; }
/* Logo with dark text: flip it to light text (the blue keeps its hue). */
${D} .theme-logo { filter: invert(1) hue-rotate(180deg) brightness(1.15); }
/* Partner logos with black lettering: sit them on a light chip. */
${D} .theme-chip { background-color: #f1f5f9; border-radius: 0.5rem; padding: 0.25rem 0.5rem; box-sizing: content-box; }
/* Rich text editor (Quill) used on Add Job */
${D} .ql-toolbar.ql-snow, ${D} .ql-container.ql-snow { border-color: #263248; }
${D} .ql-snow .ql-stroke { stroke: #cbd5e1; }
${D} .ql-snow .ql-fill { fill: #cbd5e1; }
${D} .ql-snow .ql-picker { color: #cbd5e1; }
${D} .ql-snow .ql-picker-options { background-color: ${SURFACE}; }
${D} .ql-editor.ql-blank::before { color: #64748b; }
/* Job description HTML and other prose */
${D} .prose, ${D} .prose :where(h1,h2,h3,h4,strong) { color: #e2e8f0; }
${D} .hc-dot { background: #94a3b8; }`);

// Smooth switch (respects reduced-motion)
out.push(`@media (prefers-reduced-motion: no-preference) {
  html.theme-transition, html.theme-transition *, html.theme-transition *::before, html.theme-transition *::after {
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.2s ease !important;
  }
}`);
fs.writeFileSync(OUT_FILE, out.join("\n") + "\n");
console.log("wrote", out.length, "blocks");

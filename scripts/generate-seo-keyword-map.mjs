import fs from "node:fs";

const text = fs.readFileSync("seo-keywords.md", "utf8");
const keywords = new Map();

function add(kw, cluster, intent, primary, url, status, reason) {
  let k = kw
    .trim()
    .replace(/^[-*\d.]+\s*/, "")
    .replace(/^[`']+|['`]+$/g, "")
    .trim();
  if (!k || k.length < 3) return;
  if (/^https?:\/\//i.test(k)) return;
  if (/^\/services\//i.test(k)) return;
  const lower = k.toLowerCase();
  if (
    lower.includes("devsinc") ||
    lower.includes("nextbridge") ||
    lower.includes("arbisoft") ||
    lower.includes("programmers force")
  ) {
    return;
  }
  if (
    lower.startsWith("these are") ||
    lower.startsWith("this should") ||
    lower.startsWith("this is") ||
    lower.startsWith("use this") ||
    lower.startsWith("potential") ||
    lower.startsWith("don't") ||
    lower.startsWith("also,") ||
    lower.startsWith("if you") ||
    lower.startsWith("instead") ||
    lower.startsWith("build supporting") ||
    lower.startsWith("use the same") ||
    lower.startsWith("that structure")
  ) {
    return;
  }
  if (!keywords.has(lower)) {
    keywords.set(lower, {
      keyword: k,
      cluster,
      intent,
      primary_or_secondary: primary,
      assigned_url: url,
      implementation_status: status,
      reason,
    });
  }
}

add(
  "robotics engineer",
  "excluded",
  "navigational",
  "secondary",
  "",
  "EXCLUDED",
  "Noise traffic; not a JumpIfZero buyer intent",
);
add(
  "robophobia",
  "excluded",
  "navigational",
  "secondary",
  "",
  "EXCLUDED",
  "Noise traffic; not a JumpIfZero buyer intent",
);
add(
  "smart dust",
  "excluded",
  "navigational",
  "secondary",
  "",
  "EXCLUDED",
  "Noise traffic; not a JumpIfZero buyer intent",
);

const lines = text.split(/\r?\n/);
let cluster = "core-commercial";
let intent = "commercial";

function setClusterFromHeading(h) {
  const s = h.toLowerCase();
  if (s.includes("core commercial")) {
    cluster = "core-commercial";
    intent = "commercial";
  } else if (s.includes("high-value ai") || s.includes("supporting ai")) {
    cluster = "ai";
    intent =
      s.includes("supporting") || s.includes("article")
        ? "informational"
        : "commercial";
  } else if (s.includes("custom software")) {
    cluster = "custom-software";
    intent =
      s.includes("article") || s.includes("supporting")
        ? "informational"
        : "commercial";
  } else if (s.includes("web development")) {
    cluster = "web-development";
    intent =
      s.includes("informational") || s.includes("aeo")
        ? "informational"
        : "commercial";
  } else if (s.includes("mobile")) {
    cluster = "mobile-app";
    intent = s.includes("content") ? "informational" : "commercial";
  } else if (s.includes("staff augmentation") || s.includes("dedicated")) {
    cluster = "staff-augmentation";
    intent = s.includes("supporting") ? "informational" : "commercial";
  } else if (s.includes("saas")) {
    cluster = "saas";
    intent = s.includes("informational") ? "informational" : "commercial";
  } else if (s.includes("cloud") || s.includes("devops")) {
    cluster = "cloud-devops";
    intent = s.includes("informational") ? "informational" : "commercial";
  } else if (s.includes("data science") || s.includes("analytics")) {
    cluster = "data-science";
    intent = s.includes("informational") ? "informational" : "commercial";
  } else if (s.includes("digital transformation")) {
    cluster = "digital-transformation";
    intent = s.includes("informational") ? "informational" : "commercial";
  } else if (s.includes("qa") || s.includes("testing")) {
    cluster = "qa-testing";
    intent = s.includes("supporting") ? "informational" : "commercial";
  } else if (
    s.includes("industry") ||
    s.includes("fintech") ||
    s.includes("healthcare")
  ) {
    cluster = "industry";
    intent = "commercial";
  } else if (
    s.includes("aeo") ||
    s.includes("informational keyword pattern")
  ) {
    cluster = "aeo-ai";
    intent = "informational";
  } else if (s.includes("tier 1")) {
    cluster = "priority-tier1";
    intent = "commercial";
  } else if (s.includes("tier 2")) {
    cluster = "priority-tier2";
    intent = "commercial";
  } else if (s.includes("tier 3")) {
    cluster = "priority-tier3";
    intent = "informational";
  } else if (s.includes("money keywords")) {
    cluster = "custom-software";
    intent = "commercial";
  } else if (
    s.includes("supporting articles") ||
    s.includes("supporting content") ||
    s.includes("supporting:")
  ) {
    intent = "informational";
  } else if (s.includes("commercial")) {
    intent = "commercial";
  } else if (s.includes("informational") || s.includes("content")) {
    intent = "informational";
  }
}

for (const raw of lines) {
  const line = raw.trim();
  if (
    /^#{1,3}\s+/.test(line) ||
    /^\*\*[^*]+\*\*$/.test(line)
  ) {
    setClusterFromHeading(line.replace(/^#+\s*/, "").replace(/\*\*/g, ""));
    continue;
  }
  const table = line.match(
    /^\|\s*([^|]+?)\s*\|\s*(Commercial|Informational[^|]*)?\s*\|/i,
  );
  if (table && !/^-{3,}/.test(table[1]) && !/keyword/i.test(table[1])) {
    const kw = table[1].trim();
    const rowIntent = (table[2] || intent)
      .toLowerCase()
      .includes("inform")
      ? "informational"
      : "commercial";
    add(kw, cluster, rowIntent, "primary", "", "PENDING", "");
    continue;
  }
  const num = line.match(/^\d+\.\s+(.+)$/);
  if (num) {
    add(num[1], cluster, intent, "primary", "", "PENDING", "");
    continue;
  }
  const bul = line.match(/^[-*]\s+(.+)$/);
  if (bul) {
    let kw = bul[1].replace(/\*\*/g, "").replace(/`/g, "").trim();
    kw = kw.replace(/\s+with\s+\d+.*/i, "").trim();
    if (kw.includes("|")) continue;
    add(
      kw,
      cluster,
      intent,
      intent === "informational" ? "secondary" : "primary",
      "",
      "PENDING",
      "",
    );
  }
}

const IMPLEMENTED_ARTICLE_SLUGS = {
  "what is custom software development":
    "what-is-custom-software-development",
  "custom software vs off-the-shelf software":
    "custom-software-vs-off-the-shelf",
  "custom software development process":
    "custom-software-development-process",
  "custom software development cost": "custom-software-development-cost",
  "how much does custom software development cost":
    "custom-software-development-cost",
  "what is web development": "what-is-web-development",
  "how much does website development cost": "website-development-cost",
  "website development cost": "website-development-cost",
  "mobile app development process": "mobile-app-development-process",
  "native vs cross platform app development":
    "native-vs-cross-platform-apps",
};

function isDeferredKeyword(k) {
  return /(?:^|\b)(ai|artificial intelligence|machine learning|computer vision|\bnlp\b|natural language|generative ai|chatbot|staff augmentation|dedicated development|dedicated software|development team augmentation|offshore|nearshore|hire software|hire dedicated|saas|cloud|aws |devops|devsecops|data science|data analytics|data engineering|business intelligence|predictive analytics|digital transformation|technology transformation|business transformation|digital strategy|application modernization|software testing|qa testing|qa automation|test automation|automated testing|api testing|playwright|cypress|postman|performance testing|mobile app testing|web application testing|fintech|healthcare|pharmaceutical|logistics|travel software|education software|real estate software|manufacturing software|banking software|insurance software|medical software|financial software|engineering team augmentation|developer staff|it staff|remote development team)(?:\b|$)/i.test(
    k,
  );
}

function classify(entry) {
  const k = entry.keyword.toLowerCase();

  if (entry.implementation_status === "EXCLUDED") return entry;

  if (k === "ecommerce software development") {
    return {
      ...entry,
      cluster: "industry",
      assigned_url: "/services/custom-development/ecommerce-development",
      primary_or_secondary: "secondary",
      implementation_status: "SUPPORTING",
      reason: "Mapped to existing ecommerce development child page",
    };
  }

  if (k === "software development company") {
    return {
      ...entry,
      cluster: "core-commercial",
      assigned_url: "/",
      primary_or_secondary: "primary",
      implementation_status: "IMPLEMENTED",
      reason: "Homepage primary commercial intent",
    };
  }
  if (k === "software development services") {
    return {
      ...entry,
      cluster: "core-commercial",
      assigned_url: "/",
      primary_or_secondary: "secondary",
      implementation_status: "SUPPORTING",
      reason: "Homepage supporting commercial intent",
    };
  }

  if (
    /custom software|enterprise software|custom business software|software product development|software development solutions/.test(
      k,
    ) &&
    !isDeferredKeyword(k)
  ) {
    const isArticle =
      entry.intent === "informational" ||
      /what is|vs |process|cost|timeline|challenges|benefits|how to|decision|how much/.test(
        k,
      );
    if (isArticle) {
      const slug = IMPLEMENTED_ARTICLE_SLUGS[k];
      if (slug) {
        return {
          ...entry,
          cluster: "custom-software",
          assigned_url: `/blog/${slug}`,
          primary_or_secondary: "primary",
          implementation_status: "IMPLEMENTED",
          reason: "AEO Insights article published",
        };
      }
      return {
        ...entry,
        cluster: "custom-software",
        assigned_url: "/blog",
        primary_or_secondary: "secondary",
        implementation_status: "PLANNED",
        reason: "Relevant AEO topic; article not published yet",
      };
    }
    const primary = k === "custom software development";
    return {
      ...entry,
      cluster: "custom-software",
      assigned_url:
        "/services/custom-development/custom-software-development",
      primary_or_secondary: primary ? "primary" : "secondary",
      implementation_status: primary ? "IMPLEMENTED" : "SUPPORTING",
      reason: "Mapped to custom software development service page",
    };
  }

  if (
    /web development|website development|custom website|full service website|business website|enterprise web development|professional web/.test(
      k,
    ) &&
    !/application|web app|testing/.test(k) &&
    !isDeferredKeyword(k)
  ) {
    const isArticle =
      entry.intent === "informational" ||
      /what is|how |process|cost|vs |frontend|react|next\.js|sass|scss/.test(
        k,
      );
    if (isArticle) {
      const slug = IMPLEMENTED_ARTICLE_SLUGS[k];
      if (slug) {
        return {
          ...entry,
          cluster: "web-development",
          assigned_url: `/blog/${slug}`,
          primary_or_secondary: "primary",
          implementation_status: "IMPLEMENTED",
          reason: "AEO Insights article published",
        };
      }
      return {
        ...entry,
        cluster: "web-development",
        assigned_url: "/blog",
        primary_or_secondary: "secondary",
        implementation_status: "PLANNED",
        reason: "Relevant AEO topic; article not published yet",
      };
    }
    const primary = k === "web development services";
    return {
      ...entry,
      cluster: "web-development",
      assigned_url: "/services/custom-development/web-development",
      primary_or_secondary: primary ? "primary" : "secondary",
      implementation_status: primary ? "IMPLEMENTED" : "SUPPORTING",
      reason: "Mapped to web development service page",
    };
  }

  if (
    /web application|web app development|custom web application|custom web app/.test(
      k,
    ) &&
    !/testing/.test(k)
  ) {
    if (/what is web application|web application vs website/.test(k)) {
      return {
        ...entry,
        cluster: "web-development",
        assigned_url: "/blog",
        primary_or_secondary: "secondary",
        implementation_status: "PLANNED",
        reason: "AEO topic planned for Insights",
      };
    }
    const primary =
      k === "custom web application development" ||
      k === "custom web app development";
    return {
      ...entry,
      cluster: "web-development",
      assigned_url: "/services/custom-development/web-app-development",
      primary_or_secondary: primary ? "primary" : "secondary",
      implementation_status: primary ? "IMPLEMENTED" : "SUPPORTING",
      reason: "Mapped to web app development service page",
    };
  }

  if (
    /mobile app|mobile application|ios app|android app|flutter|react native|cross platform app/.test(
      k,
    ) &&
    !/testing|staff/.test(k)
  ) {
    const isArticle =
      entry.intent === "informational" ||
      /process|how to|cost|vs |trends|security best/.test(k);
    if (isArticle) {
      const slug = IMPLEMENTED_ARTICLE_SLUGS[k];
      if (slug) {
        return {
          ...entry,
          cluster: "mobile-app",
          assigned_url: `/blog/${slug}`,
          primary_or_secondary: "primary",
          implementation_status: "IMPLEMENTED",
          reason: "AEO Insights article published",
        };
      }
      return {
        ...entry,
        cluster: "mobile-app",
        assigned_url: "/blog",
        primary_or_secondary: "secondary",
        implementation_status: "PLANNED",
        reason: "Relevant AEO topic; article not published yet",
      };
    }
    const primary = k === "mobile app development services";
    return {
      ...entry,
      cluster: "mobile-app",
      assigned_url: "/services/custom-development/mobile-app-development",
      primary_or_secondary: primary ? "primary" : "secondary",
      implementation_status: primary ? "IMPLEMENTED" : "SUPPORTING",
      reason: "Mapped to mobile app development service page",
    };
  }

  if (
    /ecommerce|e-commerce/.test(k) &&
    /software|development|app/.test(k) &&
    !/seo/.test(k)
  ) {
    return {
      ...entry,
      cluster: "industry",
      assigned_url: "/services/custom-development/ecommerce-development",
      primary_or_secondary: "secondary",
      implementation_status: "SUPPORTING",
      reason: "Mapped to ecommerce development child page",
    };
  }

  if (isDeferredKeyword(k)) {
    const isInfo =
      entry.intent === "informational" ||
      /what is|how |process|vs |cost|benefits|challenges|lifecycle|framework|strategy|trends|steps|applications|use cases|best practices/.test(
        k,
      );
    return {
      ...entry,
      assigned_url: "",
      primary_or_secondary: isInfo ? "secondary" : "primary",
      implementation_status: "DEFERRED",
      reason: isInfo
        ? "Informational topic deferred until related commercial offering is published"
        : "Commercial offering not published on JumpIfZero service catalog",
    };
  }

  return {
    ...entry,
    assigned_url: "",
    primary_or_secondary: "secondary",
    implementation_status: "PLANNED",
    reason: "Needs manual review / not clearly mapped",
  };
}

const rows = [...keywords.values()].map(classify);
rows.sort((a, b) => a.keyword.localeCompare(b.keyword));

const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const csv = [
  "keyword,cluster,intent,primary_or_secondary,assigned_url,implementation_status,reason",
  ...rows.map((r) =>
    [
      r.keyword,
      r.cluster,
      r.intent,
      r.primary_or_secondary,
      r.assigned_url,
      r.implementation_status,
      r.reason,
    ]
      .map(esc)
      .join(","),
  ),
].join("\n");

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/seo-keyword-map.csv", `${csv}\n`);

const counts = {};
for (const r of rows) {
  counts[r.implementation_status] = (counts[r.implementation_status] || 0) + 1;
}
console.log(JSON.stringify({ unique: rows.length, counts }, null, 2));

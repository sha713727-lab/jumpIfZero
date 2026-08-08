import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { InvoiceDocumentModel } from "@/components/invoices/InvoiceDocument";
import { site } from "@/constants/site";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 48;
const CONTENT_RIGHT = PAGE_W - 48;
const FRAME = { r: 116 / 255, g: 132 / 255, b: 92 / 255 };
const MUTED = { r: 0.36, g: 0.24, b: 0.09 };
const INK = { r: 0.1, g: 0.08, b: 0.05 };
const WHITE = { r: 1, g: 1, b: 1 };
const RULE = { r: 0.45, g: 0.3, b: 0.12 };
const FOOTER_INK = { r: 0.12, g: 0.1, b: 0.08 };

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency} ${amount}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.length === 3 ? currency : "USD",
  }).format(numeric);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function pdfEscape(value: string): string {
  return value
    .replace(/\u2014|\u2013/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, String.fromCharCode(34))
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 120) : "invoice";
}

const HELVETICA_WIDTHS: Readonly<Record<string, number>> = {
  " ": 278,
  "!": 278,
  '"': 355,
  "#": 556,
  $: 556,
  "%": 889,
  "&": 667,
  "'": 191,
  "(": 333,
  ")": 333,
  "*": 389,
  "+": 584,
  ",": 278,
  "-": 333,
  ".": 278,
  "/": 278,
  "0": 556,
  "1": 556,
  "2": 556,
  "3": 556,
  "4": 556,
  "5": 556,
  "6": 556,
  "7": 556,
  "8": 556,
  "9": 556,
  ":": 278,
  ";": 278,
  "<": 584,
  "=": 584,
  ">": 584,
  "?": 556,
  "@": 1015,
  A: 667,
  B: 667,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 500,
  K: 667,
  L: 556,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  "[": 278,
  "\\": 278,
  "]": 278,
  "^": 469,
  _: 556,
  "`": 333,
  a: 556,
  b: 556,
  c: 500,
  d: 556,
  e: 556,
  f: 278,
  g: 556,
  h: 556,
  i: 222,
  j: 222,
  k: 500,
  l: 222,
  m: 833,
  n: 556,
  o: 556,
  p: 556,
  q: 556,
  r: 333,
  s: 500,
  t: 278,
  u: 556,
  v: 500,
  w: 722,
  x: 500,
  y: 500,
  z: 500,
  "{": 334,
  "|": 260,
  "}": 334,
  "~": 584,
};

const HELVETICA_BOLD_WIDTHS: Readonly<Record<string, number>> = {
  ...HELVETICA_WIDTHS,
  " ": 278,
  A: 722,
  B: 722,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 556,
  K: 722,
  L: 611,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  a: 556,
  b: 611,
  c: 556,
  d: 611,
  e: 556,
  f: 333,
  g: 611,
  h: 611,
  i: 278,
  j: 278,
  k: 556,
  l: 278,
  m: 889,
  n: 611,
  o: 611,
  p: 611,
  q: 611,
  r: 389,
  s: 556,
  t: 333,
  u: 611,
  v: 556,
  w: 778,
  x: 556,
  y: 556,
  z: 500,
  "0": 556,
  "1": 556,
  "2": 556,
  "3": 556,
  "4": 556,
  "5": 556,
  "6": 556,
  "7": 556,
  "8": 556,
  "9": 556,
  $: 556,
  ",": 278,
  ".": 278,
  "-": 333,
};

function measureWidth(text: string, size: number, bold = false): number {
  const table = bold ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
  let total = 0;
  for (const char of text) {
    total += table[char] ?? 556;
  }
  return (total * size) / 1000;
}

function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  bold = false,
): string[] {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return [""];
  }
  const lines: string[] = [];
  let current = words[0] ?? "";
  for (let i = 1; i < words.length; i += 1) {
    const word = words[i] ?? "";
    const next = `${current} ${word}`;
    if (measureWidth(next, size, bold) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  if (pb <= pc) {
    return b;
  }
  return c;
}

function decodePng(
  buffer: Buffer,
  opts?: { readonly keyDarkLight?: boolean },
): {
  readonly width: number;
  readonly height: number;
  readonly rgb: Buffer;
  readonly alpha: Buffer | null;
} {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("invalid png");
  }
  const keyDarkLight = opts?.keyDarkLight ?? true;
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  const compressed: Buffer[] = [];

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8] ?? 8;
      colorType = data[9] ?? 6;
    } else if (type === "IDAT") {
      compressed.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error("unsupported png");
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = inflateSync(Buffer.concat(compressed));
  const rgb = Buffer.alloc(width * height * 3);
  const alpha = Buffer.alloc(width * height);
  let hasAlpha = colorType === 6;
  let src = 0;
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[src] ?? 0;
    src += 1;
    const row = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const x = inflated[src + i] ?? 0;
      const a = i >= channels ? (row[i - channels] ?? 0) : 0;
      const b = prev[i] ?? 0;
      const c = i >= channels ? (prev[i - channels] ?? 0) : 0;
      let value = x;
      if (filter === 1) {
        value = (x + a) & 0xff;
      } else if (filter === 2) {
        value = (x + b) & 0xff;
      } else if (filter === 3) {
        value = (x + Math.floor((a + b) / 2)) & 0xff;
      } else if (filter === 4) {
        value = (x + paeth(a, b, c)) & 0xff;
      }
      row[i] = value;
    }
    src += stride;
    for (let x = 0; x < width; x += 1) {
      const si = x * channels;
      const di = (y * width + x) * 3;
      const r = row[si] ?? 0;
      const g = row[si + 1] ?? 0;
      const b = row[si + 2] ?? 0;
      let a = channels === 4 ? (row[si + 3] ?? 255) : 255;
      if (keyDarkLight) {
        if (r <= 40 && g <= 40 && b <= 40) {
          a = 0;
          hasAlpha = true;
        } else if (r >= 220 && g >= 220 && b >= 220) {
          a = 0;
          hasAlpha = true;
        }
      }
      rgb[di] = r;
      rgb[di + 1] = g;
      rgb[di + 2] = b;
      alpha[y * width + x] = a;
    }
    prev = row;
  }

  return {
    width,
    height,
    rgb,
    alpha: hasAlpha ? alpha : null,
  };
}

type PngAsset = {
  readonly width: number;
  readonly height: number;
  readonly rgb: Buffer;
  readonly alpha: Buffer | null;
};

function loadPngAsset(
  filename: string,
  opts?: { readonly keyDarkLight?: boolean },
): PngAsset | null {
  const candidates = [
    path.join(process.cwd(), "public", "images", filename),
    path.join(process.cwd(), "frontend", "public", "images", filename),
  ];
  for (const assetPath of candidates) {
    try {
      return decodePng(readFileSync(/* turbopackIgnore: true */ assetPath), {
        keyDarkLight: opts?.keyDarkLight ?? true,
      });
    } catch {
      continue;
    }
  }
  return null;
}

function loadLogo(): PngAsset | null {
  return (
    loadPngAsset("jz-invoice-logo.png") ?? loadPngAsset("jumpIfZeroLogo.png")
  );
}

function loadStamp(): PngAsset | null {
  return loadPngAsset("jz-enterprises-stamp.png");
}

function loadSignature(): PngAsset | null {
  return loadPngAsset("jz-authorized-signature.png");
}

type DrawOp = string;

function setFill(color: { r: number; g: number; b: number }): DrawOp {
  return `${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg`;
}

function setStroke(color: { r: number; g: number; b: number }): DrawOp {
  return `${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} RG`;
}

function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  mode: "f" | "S" | "B",
): DrawOp {
  return `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${mode}`;
}

function line(x1: number, y1: number, x2: number, y2: number): DrawOp {
  return `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;
}

function text(
  value: string,
  x: number,
  y: number,
  size: number,
  bold = false,
): DrawOp {
  const font = bold ? "/F2" : "/F1";
  return `BT ${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(value)}) Tj ET`;
}

function textRight(
  value: string,
  right: number,
  y: number,
  size: number,
  bold = false,
): DrawOp {
  const width = measureWidth(value, size, bold);
  return text(value, right - width, y, size, bold);
}

function image(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
): DrawOp {
  return `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /${name} Do Q`;
}

export function buildInvoicePdf(
  invoice: InvoiceDocumentModel,
): { readonly bytes: Uint8Array; readonly filename: string } {
  const issued = invoice.issuedOn ?? invoice.createdAt.slice(0, 10);
  const total = formatMoney(invoice.amount, invoice.currency);
  const status =
    invoice.status === "draft"
      ? "Draft"
      : invoice.status === "sent"
        ? "Sent"
        : "Paid";
  const billTo = invoice.client.company || invoice.client.name || "Client";
  const brandName = invoice.company.legalName || site.name;
  const letterhead = loadPngAsset("jz-invoice-letterhead.png", {
    keyDarkLight: false,
  });
  const logo = loadLogo();
  const stamp = loadStamp();
  const signature = loadSignature();
  const ops: DrawOp[] = [];

  if (letterhead) {
    ops.push(image("Im0", 0, 0, PAGE_W, PAGE_H));
  } else {
    ops.push(setFill(FRAME));
    ops.push(rect(0, 0, PAGE_W, PAGE_H, "f"));
  }

  const logoDrawW = 36;
  const logoDrawH = logo
    ? (logoDrawW * logo.height) / logo.width
    : logoDrawW;
  const headerTop = PAGE_H - 42;

  if (logo) {
    ops.push(
      image("Im1", MARGIN_X, headerTop - logoDrawH + 4, logoDrawW, logoDrawH),
    );
  }

  const textLeft = MARGIN_X + (logo ? logoDrawW + 12 : 0);
  ops.push(setFill(WHITE));
  ops.push(text(brandName.toUpperCase(), textLeft, headerTop - 6, 14, true));
  ops.push(setFill(WHITE));
  ops.push(text(site.tagline.toUpperCase(), textLeft, headerTop - 22, 8, true));

  ops.push(setFill({ r: 0.9, g: 0.9, b: 0.88 }));
  ops.push(textRight("INVOICE", CONTENT_RIGHT, headerTop - 2, 8, true));
  ops.push(setFill(WHITE));
  ops.push(textRight(invoice.number, CONTENT_RIGHT, headerTop - 20, 14, true));
  ops.push(setFill({ r: 0.95, g: 0.95, b: 0.92 }));
  ops.push(textRight(status, CONTENT_RIGHT, headerTop - 36, 8, true));

  let y = PAGE_H - 150;
  const midX = 318;
  ops.push(setFill(MUTED));
  ops.push(text("BILL TO", MARGIN_X, y, 8, true));
  ops.push(text("FROM", midX, y, 8, true));

  y -= 18;
  ops.push(setFill(INK));
  ops.push(text(billTo, MARGIN_X, y, 12, true));
  ops.push(text(invoice.company.legalName, midX, y, 12, true));

  y -= 16;
  const leftDetails: string[] = [];
  if (invoice.client.name && invoice.client.company) {
    leftDetails.push(invoice.client.name);
  }
  if (invoice.client.email) {
    leftDetails.push(invoice.client.email);
  }
  if (invoice.client.phone) {
    leftDetails.push(invoice.client.phone);
  }
  if (invoice.client.location) {
    leftDetails.push(invoice.client.location);
  }
  const rightDetails = [invoice.company.email, invoice.company.phone].filter(
    (value) => value.trim().length > 0,
  );

  ops.push(setFill(MUTED));
  let leftY = y;
  for (const detail of leftDetails) {
    ops.push(text(detail, MARGIN_X, leftY, 10));
    leftY -= 14;
  }
  let rightY = y;
  for (const detail of rightDetails) {
    ops.push(text(detail, midX, rightY, 10));
    rightY -= 14;
  }

  const datesY = Math.min(leftY, rightY) - 12;
  ops.push(setFill(MUTED));
  ops.push(text("ISSUED", midX, datesY, 8, true));
  ops.push(text("DUE", midX + 100, datesY, 8, true));
  ops.push(setFill(INK));
  ops.push(text(formatDate(issued), midX, datesY - 14, 10, true));
  ops.push(text(formatDate(invoice.dueDate), midX + 100, datesY - 14, 10, true));

  const sectionRuleY = datesY - 28;
  ops.push(setStroke(RULE));
  ops.push("0.8 w");
  ops.push(line(MARGIN_X, sectionRuleY, CONTENT_RIGHT, sectionRuleY));

  let tableY = sectionRuleY - 24;
  ops.push(setFill(MUTED));
  ops.push(text("DESCRIPTION", MARGIN_X, tableY, 8, true));
  ops.push(textRight("AMOUNT", CONTENT_RIGHT, tableY, 8, true));
  tableY -= 10;
  ops.push(setStroke(RULE));
  ops.push(line(MARGIN_X, tableY, CONTENT_RIGHT, tableY));

  tableY -= 22;
  const titleLines = wrapText(invoice.title, 340, 11, true);
  ops.push(setFill(INK));
  for (const lineText of titleLines) {
    ops.push(text(lineText, MARGIN_X, tableY, 11, true));
    tableY -= 14;
  }
  ops.push(setFill(MUTED));
  ops.push(text("Professional services", MARGIN_X, tableY, 9));
  ops.push(setFill(INK));
  ops.push(
    textRight(total, CONTENT_RIGHT, tableY + 14 * titleLines.length, 11, true),
  );

  tableY -= 18;
  ops.push(setStroke(RULE));
  ops.push(line(MARGIN_X, tableY, CONTENT_RIGHT, tableY));

  const totalsX = 360;
  tableY -= 28;
  ops.push(setFill(MUTED));
  ops.push(text("Subtotal", totalsX, tableY, 10));
  ops.push(setFill(INK));
  ops.push(textRight(total, CONTENT_RIGHT, tableY, 10, true));

  tableY -= 12;
  ops.push(setStroke(RULE));
  ops.push(line(totalsX, tableY, CONTENT_RIGHT, tableY));
  tableY -= 20;
  ops.push(setFill(INK));
  ops.push(text("Amount due", totalsX, tableY, 12, true));
  ops.push(setFill({ r: 0.36, g: 0.24, b: 0.09 }));
  ops.push(textRight(total, CONTENT_RIGHT, tableY, 12, true));

  const authRuleY = 206;
  ops.push(setStroke(RULE));
  ops.push("0.8 w");
  ops.push(line(MARGIN_X, authRuleY, CONTENT_RIGHT, authRuleY));

  const labelY = authRuleY - 18;
  ops.push(setFill(MUTED));
  ops.push(text("AUTHORIZED SIGNATURE & STAMP", MARGIN_X, labelY, 8, true));

  const fitImage = (
    width: number,
    height: number,
    maxW: number,
    maxH: number,
  ): { readonly w: number; readonly h: number } => {
    const scale = Math.min(maxW / width, maxH / height);
    return { w: width * scale, h: height * scale };
  };

  const mediaMaxH = 52;
  const mediaBottom = labelY - 14 - mediaMaxH;
  let nextX = MARGIN_X;
  let sigWidth = 130;

  if (signature) {
    const size = fitImage(signature.width, signature.height, 130, mediaMaxH);
    ops.push(image("Im3", nextX, mediaBottom, size.w, size.h));
    sigWidth = size.w;
    nextX += size.w + 10;
  }

  if (stamp) {
    const size = fitImage(stamp.width, stamp.height, 120, 40);
    ops.push(image("Im2", nextX, mediaBottom + 6, size.w, size.h));
  }

  ops.push(setStroke({ r: 0.25, g: 0.16, b: 0.06 }));
  ops.push("1 w");
  const sigLineY = mediaBottom - 8;
  ops.push(line(MARGIN_X, sigLineY, MARGIN_X + sigWidth, sigLineY));
  ops.push(setFill(INK));
  ops.push(text(brandName, MARGIN_X, sigLineY - 14, 10, true));
  ops.push(setFill(MUTED));
  ops.push(text("Authorized representative", MARGIN_X, sigLineY - 28, 9));

  const footerPhone = invoice.footer.phone.trim() || "-";
  const footerEmail = invoice.footer.email.trim() || "-";
  const phoneLabel = `Phone: ${footerPhone}`;
  const emailLabel = `Email: ${footerEmail}`;
  const addressLines =
    invoice.footer.locationLines.length > 0
      ? invoice.footer.locationLines
      : ["-"];
  const locationLines = [
    `Location: ${addressLines[0] ?? "-"}`,
    ...addressLines.slice(1),
  ];
  const footerBaseY = 28;
  const footerSize = 9;
  ops.push(setFill(FOOTER_INK));
  ops.push(text(phoneLabel, MARGIN_X, footerBaseY, footerSize, true));
  const emailWidth = measureWidth(emailLabel, footerSize, true);
  ops.push(
    text(emailLabel, (PAGE_W - emailWidth) / 2, footerBaseY, footerSize, true),
  );
  let locY = footerBaseY + (locationLines.length - 1) * 11;
  for (let i = locationLines.length - 1; i >= 0; i -= 1) {
    const lineText = locationLines[i] ?? "";
    ops.push(textRight(lineText, CONTENT_RIGHT, locY, footerSize, true));
    locY -= 11;
  }

  const stream = ops.join("\n");
  const objects: Buffer[] = [];

  const pushObject = (content: string | Buffer) => {
    objects.push(typeof content === "string" ? Buffer.from(content, "utf8") : content);
  };

  pushObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  pushObject("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  const pngExtras: Array<{
    readonly name: string;
    readonly asset: PngAsset;
  }> = [];
  if (letterhead) {
    pngExtras.push({ name: "Im0", asset: letterhead });
  }
  if (logo) {
    pngExtras.push({ name: "Im1", asset: logo });
  }
  if (stamp) {
    pngExtras.push({ name: "Im2", asset: stamp });
  }
  if (signature) {
    pngExtras.push({ name: "Im3", asset: signature });
  }

  let nextObjectNumber = 7;
  const xObjects: string[] = [];
  const imageObjectPlan: Array<{
    readonly name: string;
    readonly asset: PngAsset;
    readonly imageObject: number;
    readonly maskObject: number | null;
  }> = [];

  for (const item of pngExtras) {
    const imageObject = nextObjectNumber;
    nextObjectNumber += 1;
    let maskObject: number | null = null;
    if (item.asset.alpha !== null && item.name !== "Im0") {
      maskObject = nextObjectNumber;
      nextObjectNumber += 1;
    }
    imageObjectPlan.push({
      name: item.name,
      asset: item.asset,
      imageObject,
      maskObject,
    });
    xObjects.push(`/${item.name} ${imageObject} 0 R`);
  }

  const resources =
    xObjects.length > 0
      ? `<< /Font << /F1 5 0 R /F2 6 0 R >> /XObject << ${xObjects.join(" ")} >> >>`
      : "<< /Font << /F1 5 0 R /F2 6 0 R >> >>";

  pushObject(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 4 0 R /Resources ${resources} >>\nendobj\n`,
  );

  const streamBuf = Buffer.from(stream, "utf8");
  pushObject(
    Buffer.concat([
      Buffer.from(
        `4 0 obj\n<< /Length ${streamBuf.length} >>\nstream\n`,
        "utf8",
      ),
      streamBuf,
      Buffer.from("\nendstream\nendobj\n", "utf8"),
    ]),
  );

  pushObject(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );
  pushObject(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
  );

  for (const item of imageObjectPlan) {
    const maskRef =
      item.maskObject === null ? "" : ` /SMask ${item.maskObject} 0 R`;
    const imageDict = Buffer.from(
      `${item.imageObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${item.asset.width} /Height ${item.asset.height} /ColorSpace /DeviceRGB /BitsPerComponent 8${maskRef} /Length ${item.asset.rgb.length} >>\nstream\n`,
      "utf8",
    );
    pushObject(
      Buffer.concat([
        imageDict,
        item.asset.rgb,
        Buffer.from("\nendstream\nendobj\n", "utf8"),
      ]),
    );

    if (item.maskObject !== null && item.asset.alpha !== null) {
      const maskDict = Buffer.from(
        `${item.maskObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${item.asset.width} /Height ${item.asset.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${item.asset.alpha.length} >>\nstream\n`,
        "utf8",
      );
      pushObject(
        Buffer.concat([
          maskDict,
          item.asset.alpha,
          Buffer.from("\nendstream\nendobj\n", "utf8"),
        ]),
      );
    }
  }

  let pdf = Buffer.from("%PDF-1.4\n", "utf8");
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, object]);
  }

  const xrefStart = pdf.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  xref += `startxref\n${xrefStart}\n%%EOF\n`;

  pdf = Buffer.concat([pdf, Buffer.from(xref, "utf8")]);

  return {
    bytes: new Uint8Array(pdf),
    filename: `${sanitizeFilename(invoice.number)}.pdf`,
  };
}

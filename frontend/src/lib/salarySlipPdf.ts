import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { SalarySlipDocumentModel } from "@/components/salaries/SalarySlipDocument";
import { site } from "@/constants/site";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_X = 40;
const CONTENT_RIGHT = PAGE_W - MARGIN_X;
const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 1, g: 1, b: 1 };
const GRAY = { r: 0.91, g: 0.91, b: 0.91 };
const MUTED = { r: 0.36, g: 0.24, b: 0.09 };
const INK = { r: 0.05, g: 0.07, b: 0.04 };
const SOFT = { r: 0.35, g: 0.35, b: 0.35 };

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency} ${amount}`;
  }
  return `${currency} ${numeric.toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function pdfEscape(value: string): string {
  return value
    .replace(/\u2014|\u2013/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 80) : "salary-slip";
}

const HELVETICA_WIDTHS: Readonly<Record<string, number>> = {
  " ": 278,
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
};

const HELVETICA_BOLD_WIDTHS: Readonly<Record<string, number>> = {
  ...HELVETICA_WIDTHS,
  A: 722,
  B: 722,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 778,
  I: 389,
  J: 556,
  K: 778,
  L: 667,
  M: 944,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 1000,
  X: 722,
  Y: 722,
  Z: 667,
};

function measureWidth(text: string, size: number, bold = false): number {
  const table = bold ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
  let total = 0;
  for (const char of text) {
    total += table[char] ?? 556;
  }
  return (total * size) / 1000;
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

type PngAsset = {
  readonly width: number;
  readonly height: number;
  readonly rgb: Buffer;
  readonly alpha: Buffer | null;
};

function decodePng(buffer: Buffer): PngAsset {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("invalid png");
  }
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
      if (r <= 40 && g <= 40 && b <= 40) {
        a = 0;
        hasAlpha = true;
      } else if (r >= 220 && g >= 220 && b >= 220) {
        a = 0;
        hasAlpha = true;
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

function loadLogo(): PngAsset | null {
  const candidates = [
    path.join(process.cwd(), "public", "images", "jz-invoice-logo.png"),
    path.join(
      process.cwd(),
      "frontend",
      "public",
      "images",
      "jz-invoice-logo.png",
    ),
  ];
  for (const assetPath of candidates) {
    try {
      return decodePng(readFileSync(/* turbopackIgnore: true */ assetPath));
    } catch {
      continue;
    }
  }
  return null;
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
  return text(value, right - measureWidth(value, size, bold), y, size, bold);
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

export function buildSalarySlipPdf(
  slip: SalarySlipDocumentModel,
): { readonly bytes: Uint8Array; readonly filename: string } {
  const money = (v: string) => formatMoney(v, slip.currency);
  const logo = loadLogo();
  const ops: DrawOp[] = [];

  const earnings = [
    { label: "Basic Salary", value: slip.basicSalary },
    { label: "Punctuality", value: slip.punctuality },
    { label: "Medical Allowance", value: slip.medicalAllowance },
    { label: "Incentives", value: slip.incentives },
    { label: "Bonus", value: slip.bonus },
  ] as const;
  const deductions = [
    { label: "Advance", value: slip.advance },
    { label: "Income Tax", value: slip.incomeTax },
    { label: "W.H. Tax", value: slip.whTax },
    { label: "Fuel Advances", value: slip.fuelAdvances },
  ] as const;
  const rowCount = Math.max(earnings.length, deductions.length);

  let y = PAGE_H - 42;

  ops.push(setFill(MUTED));
  ops.push(text("SALARY SLIP", MARGIN_X, y, 9, true));
  y -= 10;

  const logoSize = 42;
  const brandX = logo ? MARGIN_X + logoSize + 12 : MARGIN_X;
  if (logo) {
    ops.push(image("Im1", MARGIN_X, y - logoSize + 18, logoSize, logoSize));
  }

  ops.push(setFill(INK));
  ops.push(text(site.name, brandX, y, 18, true));
  y -= 16;
  ops.push(setFill(SOFT));
  ops.push(text(site.tagline.toUpperCase(), brandX, y, 9, true));

  ops.push(setFill(SOFT));
  ops.push(textRight(`Date: ${formatDate(slip.slipDate)}`, CONTENT_RIGHT, PAGE_H - 52, 10));
  ops.push(textRight(slip.salaryMonth, CONTENT_RIGHT, PAGE_H - 66, 10));
  ops.push(
    textRight(
      slip.status.charAt(0).toUpperCase() + slip.status.slice(1),
      CONTENT_RIGHT,
      PAGE_H - 80,
      10,
    ),
  );

  y = Math.min(y, PAGE_H - 52 - logoSize) - 28;

  ops.push(setStroke({ r: 0.85, g: 0.85, b: 0.85 }));
  ops.push("1 w");
  ops.push(line(MARGIN_X, y + 12, CONTENT_RIGHT, y + 12));
  ops.push(line(MARGIN_X, y - 52, CONTENT_RIGHT, y - 52));

  ops.push(setFill(INK));
  ops.push(text(`Employee Name: ${slip.employeeName}`, MARGIN_X, y, 11, true));
  ops.push(
    text(
      `Designation: ${slip.designation || "-"}`,
      PAGE_W / 2,
      y,
      11,
      true,
    ),
  );
  y -= 18;
  ops.push(text(`Salary Month: ${slip.salaryMonth}`, MARGIN_X, y, 11));
  ops.push(text(`Date: ${formatDate(slip.slipDate)}`, PAGE_W / 2, y, 11));
  y -= 36;

  const tableW = CONTENT_RIGHT - MARGIN_X;
  const colW = [tableW * 0.3, tableW * 0.2, tableW * 0.3, tableW * 0.2] as const;
  const colX = [
    MARGIN_X,
    MARGIN_X + colW[0],
    MARGIN_X + colW[0] + colW[1],
    MARGIN_X + colW[0] + colW[1] + colW[2],
  ] as const;
  const padX = 8;
  const headerH = 24;
  const bodyH = 22;
  const totalH = 24;
  const netH = 28;

  const drawCellBorder = (
    x: number,
    bottom: number,
    w: number,
    h: number,
  ) => {
    ops.push(setStroke(BLACK));
    ops.push("0.8 w");
    ops.push(rect(x, bottom, w, h, "S"));
  };

  const headerBottom = y - headerH;
  ops.push(setFill(BLACK));
  ops.push(rect(MARGIN_X, headerBottom, tableW, headerH, "f"));
  for (let i = 0; i < 4; i += 1) {
    drawCellBorder(colX[i]!, headerBottom, colW[i]!, headerH);
  }
  ops.push(setFill(WHITE));
  const headers = ["Earnings", "Amount", "Deduction", "Amount"] as const;
  for (let i = 0; i < 4; i += 1) {
    const label = headers[i]!;
    const labelY = headerBottom + 7;
    if (i % 2 === 1) {
      ops.push(
        textRight(label, colX[i]! + colW[i]! - padX, labelY, 10, true),
      );
    } else {
      ops.push(text(label, colX[i]! + padX, labelY, 10, true));
    }
  }
  y = headerBottom;

  for (let row = 0; row < rowCount; row += 1) {
    const bottom = y - bodyH;
    for (let i = 0; i < 4; i += 1) {
      drawCellBorder(colX[i]!, bottom, colW[i]!, bodyH);
    }
    const earning = earnings[row];
    const deduction = deductions[row];
    const textY = bottom + 6;
    ops.push(setFill(INK));
    if (earning) {
      ops.push(text(earning.label, colX[0]! + padX, textY, 10));
      ops.push(
        textRight(money(earning.value), colX[1]! + colW[1]! - padX, textY, 10, true),
      );
    }
    if (deduction) {
      ops.push(text(deduction.label, colX[2]! + padX, textY, 10));
      ops.push(
        textRight(
          money(deduction.value),
          colX[3]! + colW[3]! - padX,
          textY,
          10,
          true,
        ),
      );
    }
    y = bottom;
  }

  {
    const bottom = y - totalH;
    ops.push(setFill(GRAY));
    ops.push(rect(MARGIN_X, bottom, tableW, totalH, "f"));
    for (let i = 0; i < 4; i += 1) {
      drawCellBorder(colX[i]!, bottom, colW[i]!, totalH);
    }
    const textY = bottom + 7;
    ops.push(setFill(INK));
    ops.push(text("Total Earnings", colX[0]! + padX, textY, 10, true));
    ops.push(
      textRight(
        money(slip.totalEarnings),
        colX[1]! + colW[1]! - padX,
        textY,
        10,
        true,
      ),
    );
    ops.push(text("Total Deduction", colX[2]! + padX, textY, 10, true));
    ops.push(
      textRight(
        money(slip.totalDeduction),
        colX[3]! + colW[3]! - padX,
        textY,
        10,
        true,
      ),
    );
    y = bottom;
  }

  {
    const bottom = y - netH;
    ops.push(setFill(BLACK));
    ops.push(rect(MARGIN_X, bottom, tableW, netH, "f"));
    drawCellBorder(MARGIN_X, bottom, tableW, netH);
    const textY = bottom + 9;
    ops.push(setFill(WHITE));
    ops.push(text("Net Salary", MARGIN_X + padX, textY, 12, true));
    ops.push(
      textRight(money(slip.netSalary), CONTENT_RIGHT - padX, textY, 12, true),
    );
    y = bottom - 40;
  }

  ops.push(setFill(INK));
  ops.push(text("Employ Signature:", MARGIN_X, y, 10, true));
  ops.push(text("Authorised Signatory:", PAGE_W / 2, y, 10, true));
  y -= 28;
  ops.push(setStroke({ r: 0.45, g: 0.45, b: 0.45 }));
  ops.push("0.7 w");
  ops.push(line(MARGIN_X, y, MARGIN_X + 180, y));
  ops.push(line(PAGE_W / 2, y, PAGE_W / 2 + 180, y));

  y -= 28;
  ops.push(setFill(SOFT));
  ops.push(
    text(
      "This is a system-generated salary slip and is valid without a physical signature.",
      MARGIN_X,
      y,
      8,
    ),
  );

  y -= 24;
  ops.push(setStroke({ r: 0.85, g: 0.85, b: 0.85 }));
  ops.push("0.7 w");
  ops.push(line(MARGIN_X, y + 10, CONTENT_RIGHT, y + 10));

  const footerPhone = slip.footer.phone.trim() || "-";
  const footerEmail = slip.footer.email.trim() || "-";
  const addressLines =
    slip.footer.locationLines.length > 0
      ? slip.footer.locationLines
      : ["-"];
  const phoneLabel = `Phone: ${footerPhone}`;
  const emailLabel = `Email: ${footerEmail}`;
  const locationLabel = `Location: ${addressLines[0] ?? "-"}`;

  ops.push(setFill(SOFT));
  ops.push(text(phoneLabel, MARGIN_X, y, 8, true));
  const emailWidth = measureWidth(emailLabel, 8, true);
  ops.push(text(emailLabel, (PAGE_W - emailWidth) / 2, y, 8, true));
  ops.push(textRight(locationLabel, CONTENT_RIGHT, y, 8, true));
  for (let i = 1; i < addressLines.length; i += 1) {
    y -= 11;
    ops.push(textRight(addressLines[i] ?? "", CONTENT_RIGHT, y, 8, true));
  }

  const stream = `${ops.join("\n")}\n`;
  const objects: Buffer[] = [];
  const pushObject = (content: string | Buffer) => {
    objects.push(
      typeof content === "string" ? Buffer.from(content, "utf8") : content,
    );
  };

  pushObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  pushObject("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  let nextObjectNumber = 7;
  const xObjects: string[] = [];
  let imageObject: number | null = null;
  let maskObject: number | null = null;
  if (logo) {
    imageObject = nextObjectNumber;
    nextObjectNumber += 1;
    if (logo.alpha !== null) {
      maskObject = nextObjectNumber;
      nextObjectNumber += 1;
    }
    xObjects.push(`/Im1 ${imageObject} 0 R`);
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

  if (logo && imageObject !== null) {
    const maskRef = maskObject === null ? "" : ` /SMask ${maskObject} 0 R`;
    pushObject(
      Buffer.concat([
        Buffer.from(
          `${imageObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8${maskRef} /Length ${logo.rgb.length} >>\nstream\n`,
          "utf8",
        ),
        logo.rgb,
        Buffer.from("\nendstream\nendobj\n", "utf8"),
      ]),
    );
    if (maskObject !== null && logo.alpha !== null) {
      pushObject(
        Buffer.concat([
          Buffer.from(
            `${maskObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${logo.alpha.length} >>\nstream\n`,
            "utf8",
          ),
          logo.alpha,
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
    filename: `salary-slip-${sanitizeFilename(slip.employeeName)}-${sanitizeFilename(slip.salaryMonth)}.pdf`,
  };
}

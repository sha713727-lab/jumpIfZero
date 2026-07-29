const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const FRAME_DIR = path.join(ROOT, "public", "images", "JZ_Frames_30FPS");
const MAX_WIDTH = 960;
const WEBP_QUALITY = 70;
const CONCURRENCY = 4;

function parseArgs(argv) {
  const options = {
    dryRun: false,
    keepJpg: false,
    maxWidth: MAX_WIDTH,
    quality: WEBP_QUALITY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--keep-jpg") {
      options.keepJpg = true;
      continue;
    }

    if (arg === "--max-width" && next) {
      options.maxWidth = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--quality" && next) {
      options.quality = Number(next);
      index += 1;
    }
  }

  return options;
}

async function convertFile(filePath, options) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath, ext);
  const outPath = path.join(path.dirname(filePath), `${base}.webp`);
  const before = fs.statSync(filePath).size;

  if (options.dryRun) {
    return { file: base, before, after: 0, skipped: true };
  }

  const data = await sharp(filePath, { failOn: "none" })
    .rotate()
    .resize({
      width: options.maxWidth,
      height: options.maxWidth,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: options.quality,
      effort: 4,
    })
    .toBuffer();

  const tempPath = `${outPath}.tmp`;
  fs.writeFileSync(tempPath, data);
  fs.copyFileSync(tempPath, outPath);
  fs.unlinkSync(tempPath);

  if (!options.keepJpg && ext !== ".webp") {
    fs.unlinkSync(filePath);
  }

  return {
    file: base,
    before,
    after: data.length,
    skipped: false,
  };
}

async function runPool(items, concurrency, worker) {
  let cursor = 0;
  const results = [];

  const run = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );

  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(FRAME_DIR)) {
    throw new Error(`Missing frame directory: ${FRAME_DIR}`);
  }

  const files = fs
    .readdirSync(FRAME_DIR)
    .filter((name) => /\.(jpe?g)$/i.test(name))
    .map((name) => path.join(FRAME_DIR, name))
    .sort();

  if (files.length === 0) {
    const webpCount = fs
      .readdirSync(FRAME_DIR)
      .filter((name) => /\.webp$/i.test(name)).length;
    console.log(`No JPEG frames found. Existing WebP count: ${webpCount}`);
    return;
  }

  console.log(
    `Converting ${files.length} frames → WebP (max ${options.maxWidth}px, q${options.quality})${options.dryRun ? " [dry-run]" : ""}`,
  );

  const results = await runPool(files, CONCURRENCY, (filePath, index) =>
    convertFile(filePath, options).then((result) => {
      if ((index + 1) % 20 === 0 || index + 1 === files.length) {
        console.log(`  ${index + 1}/${files.length}`);
      }
      return result;
    }),
  );

  const before = results.reduce((sum, item) => sum + item.before, 0);
  const after = results.reduce((sum, item) => sum + item.after, 0);

  console.log(
    `Done. ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB (${(((before - after) / before) * 100).toFixed(1)}% smaller)`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

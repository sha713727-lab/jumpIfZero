const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const BACKUP_DIR = path.join(ROOT, "scripts", ".image-backups");

const DEFAULTS = {
  maxWidth: 1600,
  maxHeight: 1600,
  jpegQuality: 78,
  pngQuality: 80,
  webpQuality: 78,
  dryRun: false,
  skipBackup: false,
  quiet: false,
};

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SKIP_DIRS = new Set([".image-backups", "JZ_Frames_30FPS"]);

function parseArgs(argv) {
  const options = { ...DEFAULTS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-backup") {
      options.skipBackup = true;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    if (arg === "--max-width" && next) {
      options.maxWidth = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--max-height" && next) {
      options.maxHeight = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--quality" && next) {
      const quality = Number(next);
      options.jpegQuality = quality;
      options.pngQuality = quality;
      options.webpQuality = quality;
      index += 1;
    }
  }

  return options;
}

function walkImages(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      walkImages(fullPath, files);
      continue;
    }

    if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function backupFile(filePath) {
  const relative = path.relative(PUBLIC_DIR, filePath);
  const target = path.join(BACKUP_DIR, relative);
  ensureDir(path.dirname(target));
  if (!fs.existsSync(target)) {
    fs.copyFileSync(filePath, target);
  }
}

async function writeOptimized(filePath, data) {
  const tempPath = `${filePath}.tmp-opt`;
  fs.writeFileSync(tempPath, data);

  const attempts = 6;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      fs.copyFileSync(tempPath, filePath);
      fs.unlinkSync(tempPath);
      return;
    } catch (error) {
      if (attempt === attempts) {
        try {
          fs.unlinkSync(tempPath);
        } catch {
          /* ignore */
        }
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 200));
    }
  }
}

async function optimizeFile(filePath, options) {
  const ext = path.extname(filePath).toLowerCase();
  const before = fs.statSync(filePath).size;
  const source = fs.readFileSync(filePath);
  const image = sharp(source, { failOn: "none" });
  const meta = await image.metadata();

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const needsResize =
    width > options.maxWidth || height > options.maxHeight;

  let pipeline = sharp(source, { failOn: "none" }).rotate();

  if (needsResize) {
    pipeline = pipeline.resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({
      quality: options.jpegQuality,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    });
  } else if (ext === ".png") {
    pipeline = pipeline.png({
      quality: options.pngQuality,
      compressionLevel: 9,
      palette: false,
    });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({
      quality: options.webpQuality,
    });
  }

  const output = await pipeline.toBuffer({ resolveWithObject: true });
  await pipeline.destroy();
  await image.destroy();

  const after = output.data.length;
  const saved = before - after;
  const relative = path.relative(ROOT, filePath).replace(/\\/g, "/");

  if (after >= before) {
    return {
      relative,
      before,
      after: before,
      saved: 0,
      width,
      height,
      skipped: true,
      reason: "already-optimal",
    };
  }

  if (!options.dryRun) {
    if (!options.skipBackup) {
      backupFile(filePath);
    }
    await writeOptimized(filePath, output.data);
  }

  return {
    relative,
    before,
    after,
    saved,
    width,
    height,
    skipped: false,
    resized: needsResize,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = walkImages(PUBLIC_DIR);
  const log = (...args) => {
    if (!options.quiet) {
      console.log(...args);
    }
  };

  if (files.length === 0) {
    log("No images found in public/");
    return;
  }

  log(
    `Optimizing ${files.length} images (max ${options.maxWidth}x${options.maxHeight}, quality ${options.jpegQuality})${options.dryRun ? " [dry-run]" : ""}`,
  );

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const filePath of files) {
    const result = await optimizeFile(filePath, options);
    totalBefore += result.before;
    totalAfter += result.after;

    if (result.skipped) {
      log(`SKIP  ${result.relative} (${formatKb(result.before)})`);
      continue;
    }

    changed += 1;
    const resizeNote = result.resized ? " +resized" : "";
    log(
      `FIX   ${result.relative}  ${formatKb(result.before)} -> ${formatKb(result.after)}  (-${formatKb(result.saved)})${resizeNote}`,
    );
  }

  if (options.quiet) {
    if (changed > 0) {
      console.log(
        `Images optimized: ${changed} file(s), saved ${formatKb(totalBefore - totalAfter)}`,
      );
    }
    return;
  }

  console.log("---");
  console.log(
    `Done. ${changed}/${files.length} updated. ${formatKb(totalBefore)} -> ${formatKb(totalAfter)} (saved ${formatKb(totalBefore - totalAfter)})`,
  );

  if (!options.dryRun && !options.skipBackup && changed > 0) {
    console.log(`Backups: ${path.relative(ROOT, BACKUP_DIR).replace(/\\/g, "/")}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

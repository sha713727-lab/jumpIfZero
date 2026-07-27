const fs = require("fs");
const path = require("path");
const opentype = require("./opentype.cjs");

function convert(font) {
  const round = Math.round;
  const glyphs = {};
  const scale = 100000 / ((font.unitsPerEm || 2048) * 72);
  const glyphIndexMap = font.encoding.cmap.glyphIndexMap;
  const unicodes = Object.keys(glyphIndexMap);

  for (let i = 0; i < unicodes.length; i++) {
    const unicode = unicodes[i];
    const glyph = font.glyphs.glyphs[glyphIndexMap[unicode]];
    if (unicode === undefined || !glyph || !glyph.path) continue;

    const token = {
      ha: round(glyph.advanceWidth * scale),
      x_min: round((glyph.xMin || 0) * scale),
      x_max: round((glyph.xMax || 0) * scale),
      o: "",
    };

    glyph.path.commands.forEach((command) => {
      let type = command.type.toLowerCase();
      if (type === "c") type = "b";
      token.o += type + " ";
      if (command.x !== undefined && command.y !== undefined) {
        token.o += round(command.x * scale) + " " + round(command.y * scale) + " ";
      }
      if (command.x1 !== undefined && command.y1 !== undefined) {
        token.o += round(command.x1 * scale) + " " + round(command.y1 * scale) + " ";
      }
      if (command.x2 !== undefined && command.y2 !== undefined) {
        token.o += round(command.x2 * scale) + " " + round(command.y2 * scale) + " ";
      }
    });

    if (Array.isArray(glyph.unicodes) && glyph.unicodes.length > 0) {
      glyph.unicodes.forEach((u) => {
        glyphs[String.fromCodePoint(u)] = token;
      });
    } else if (glyph.unicode !== undefined) {
      glyphs[String.fromCodePoint(glyph.unicode)] = token;
    }
  }

  return {
    glyphs,
    familyName: font.getEnglishName("fullName"),
    ascender: round(font.ascender * scale),
    descender: round(font.descender * scale),
    underlinePosition: font.tables.post.underlinePosition,
    underlineThickness: font.tables.post.underlineThickness,
    boundingBox: {
      xMin: font.tables.head.xMin,
      xMax: font.tables.head.xMax,
      yMin: font.tables.head.yMin,
      yMax: font.tables.head.yMax,
    },
    resolution: 1000,
    original_font_information: font.tables.name,
  };
}

const fontsDir = path.join(__dirname, "..", "public", "fonts");
const jobs = [
  ["Pacifico-Regular.ttf", "pacifico_regular.typeface.json"],
  ["Fredoka-Bold.ttf", "fredoka_bold.typeface.json"],
];

for (const [src, dest] of jobs) {
  const nodeBuf = fs.readFileSync(path.join(fontsDir, src));
  const ab = nodeBuf.buffer.slice(
    nodeBuf.byteOffset,
    nodeBuf.byteOffset + nodeBuf.byteLength,
  );
  const json = convert(opentype.parse(ab));
  fs.writeFileSync(path.join(fontsDir, dest), JSON.stringify(json));
  console.log("wrote", dest, Object.keys(json.glyphs).length, "glyphs");
}

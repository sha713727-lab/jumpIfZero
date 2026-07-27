let lastLight = "";
let lastBg = "";

export function applyHeaderTone(light: boolean, background: string): void {
  const nextLight = light ? "1" : "0";

  if (lastLight === nextLight && lastBg === background) {
    return;
  }

  lastLight = nextLight;
  lastBg = background;
  delete document.documentElement.dataset.heroClear;
  document.documentElement.dataset.heroLight = nextLight;
  document.documentElement.style.setProperty("--header-bg", background);
}

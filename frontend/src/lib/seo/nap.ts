export function formatStreetAddress(
  addressLines: readonly string[],
): string {
  return addressLines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join(", ");
}

export function formatTelephone(
  phoneHref: string,
  phoneDisplay: string,
): string {
  const fromHref = phoneHref.replace(/^tel:/i, "").trim();
  if (fromHref.length > 0) {
    return fromHref;
  }
  return phoneDisplay.replace(/\s+/g, " ").trim();
}

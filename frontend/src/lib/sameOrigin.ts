export function originFromUrl(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(input: {
  readonly siteUrl: string;
  readonly origin: string | null;
  readonly referer: string | null;
}): boolean {
  const expected = originFromUrl(input.siteUrl);
  if (expected === null) {
    return false;
  }
  if (input.origin !== null) {
    return input.origin === expected;
  }
  if (input.referer !== null) {
    return originFromUrl(input.referer) === expected;
  }
  return false;
}

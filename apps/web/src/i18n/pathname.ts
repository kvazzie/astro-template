export function localizePathname<Locale extends string>(
  pathname: string,
  locale: Locale,
  locales: readonly Locale[],
  defaultLocale: Locale,
) {
  const segments = pathname.split("/");

  if (segments[1] && locales.includes(segments[1] as Locale)) {
    segments.splice(1, 1);
  }

  const unprefixedPathname = segments.join("/") || "/";

  if (locale === defaultLocale) {
    return unprefixedPathname;
  }

  return `/${locale}${unprefixedPathname}`;
}

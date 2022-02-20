// Remove when https://github.com/microsoft/TypeScript/issues/29129 is resolved
declare namespace Intl {
  function getCanonicalLocales(locales: string | string[]): string[];
}
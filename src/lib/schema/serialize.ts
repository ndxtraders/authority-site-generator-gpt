/**
 * Serialize JSON-LD for an HTML script element.
 *
 * Escaping `<` prevents authored strings such as `</script>` from ending the
 * element. The other escapes keep HTML-significant characters and JavaScript
 * line separators inert across parsers without changing the decoded JSON.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Keep the most recent conversation context without exceeding the studio request cap. */
export function trimHistoryForRequest(text, recipients, history, maxBytes = 36000) {
  const kept = Array.isArray(history) ? history.slice(-12) : [];
  const size = () => new TextEncoder().encode(JSON.stringify({
    text, recipients, history: kept, allowProviderCharges: true
  })).byteLength;
  while (kept.length && size() > maxBytes) kept.shift();
  if (size() > maxBytes) throw new RangeError("This message exceeds the request-size limit. Shorten the message.");
  return kept;
}

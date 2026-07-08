export async function getSecurityHistory(secid: string) {
  const url =
    `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities/${secid}.json` +
    `?from=2026-01-01&till=2026-07-01`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MOEX request failed: ${response.status}`);
  }

  return response.json();
}
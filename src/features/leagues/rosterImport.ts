export type ImportedPlayer = {
  firstName: string; lastName: string; gender: "male" | "female"; handicap: number;
  email: string; phone: string; type: "player" | "sub";
};
type ExistingPlayer = { firstName: string; lastName: string; email?: string | null };
export type RosterPreview = { players: ImportedPlayer[]; errors: string[] };

function parseCells(source: string): string[][] {
  const delimiter = source.split(/\r?\n/, 1)[0].includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false, closed = false;
  for (let i = 0; i < source.length; i++) {
    const character = source[i];
    if (quoted) {
      if (character !== '"') cell += character;
      else if (source[i + 1] === '"') { cell += '"'; i++; }
      else { quoted = false; closed = true; }
    } else if (character === delimiter || character === "\n" || character === "\r") {
      row.push(cell.trim()); cell = ""; closed = false;
      if (character !== delimiter) {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (character === "\r" && source[i + 1] === "\n") i++;
      }
    } else if (character === '"') {
      if (cell.trim() || closed) throw new Error("Unexpected quote. Use CSV quoting around the entire cell.");
      cell = ""; quoted = true;
    } else {
      if (closed && character.trim()) throw new Error("Unexpected text after a quoted cell.");
      cell += character;
    }
  }
  if (quoted) throw new Error("A quoted cell is missing its closing quote.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const normalize = (value: string) => value.trim().toLowerCase();
const nameKey = (player: ExistingPlayer) => `${normalize(player.firstName)}|${normalize(player.lastName)}`;

export function previewRosterImport(source: string, existing: ExistingPlayer[] = []): RosterPreview {
  const errors: string[] = [], players: ImportedPlayer[] = [];
  if (source.length > 1_000_000) return { players, errors: ["Import must be smaller than 1 MB."] };
  let rows: string[][];
  try { rows = parseCells(source.replace(/^\uFEFF/, "")); }
  catch (error) { return { players, errors: [error instanceof Error ? error.message : "Unable to read these rows."] }; }
  if (rows.length < 2) return { players, errors: ["Include column headers and at least one player."] };
  if (rows.length > 501) return { players, errors: ["Import up to 500 players at a time."] };
  const headers = rows[0].map(header => normalize(header).replace(/[\s_-]/g, ""));
  if (new Set(headers).size !== headers.length) return { players, errors: ["Column headers must be unique."] };
  const required = ["firstname", "lastname", "gender", "handicap"];
  const missing = required.filter(header => !headers.includes(header));
  if (missing.length) return { players, errors: [`Missing columns: ${missing.join(", ")}.`] };
  const names = new Set(existing.map(nameKey));
  const emails = new Set(existing.map(player => normalize(player.email || "")).filter(Boolean));
  for (const [index, cells] of rows.slice(1).entries()) {
    const rowErrors: string[] = [];
    const get = (key: string) => cells[headers.indexOf(key)]?.trim() || "";
    if (cells.length !== headers.length) rowErrors.push("column count does not match headers");
    const firstName = get("firstname"), lastName = get("lastname"), email = normalize(get("email"));
    const rawGender = normalize(get("gender"));
    const gender = rawGender === "m" ? "male" : rawGender === "f" ? "female" : rawGender;
    const rawHandicap = get("handicap"), handicap = Number(rawHandicap);
    const rawType = normalize(get("type")) || "player";
    const type = ["substitute", "sub"].includes(rawType) ? "sub" : rawType;
    if (!firstName || !lastName) rowErrors.push("first and last names are required");
    if (gender !== "male" && gender !== "female") rowErrors.push("gender must be male/female or M/F");
    if (!rawHandicap || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawHandicap) || !Number.isFinite(handicap) || handicap < -10 || handicap > 54) rowErrors.push("enter a stored handicap between -10 and 54");
    if (type !== "player" && type !== "sub") rowErrors.push("type must be player or sub");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) rowErrors.push("email is invalid");
    const key = nameKey({ firstName, lastName });
    if (names.has(key) || email && emails.has(email)) rowErrors.push("duplicate player name or email; review before importing");
    if (rowErrors.length || gender !== "male" && gender !== "female" || type !== "player" && type !== "sub") {
      errors.push(`Row ${index + 2}: ${rowErrors.join("; ")}.`); continue;
    }
    const player: ImportedPlayer = { firstName, lastName, gender, handicap, email, phone: get("phone"), type };
    players.push(player); names.add(key); if (email) emails.add(email);
  }
  return { players, errors };
}

import { useMemo, useState } from "react";
import Modal from "@/components/layout/Modal";
import Button from "@/components/layout/Button";
import { previewRosterImport, type ImportedPlayer } from "../rosterImport";

type Props = { players: Array<{ firstName: string; lastName: string; email?: string | null }>; onImport: (players: ImportedPlayer[]) => void; onClose: () => void; handicapHoleCount: number };
export default function RosterImportDialog({ players, onImport, onClose, handicapHoleCount }: Props) {
  const [source, setSource] = useState("");
  const [fileError, setFileError] = useState("");
  const preview = useMemo(() => previewRosterImport(source, players), [source, players]);
  return <Modal isOpen width="compact" title="Import players" onClose={onClose}>
    <p className="mb-3 text-xs text-slate-500">Paste spreadsheet cells or upload CSV/TSV with First Name, Last Name, Gender and Handicap headers. Use stored {handicapHoleCount}-hole handicaps.</p>
    <details className="mb-3 text-xs text-slate-500"><summary className="cursor-pointer">Optional columns and Excel files</summary><p className="mt-2">Email, Phone and Type (player/sub) are optional. Export Excel as CSV or paste cells.</p></details>
    <label className="block text-sm font-bold text-slate-700">CSV or TSV file
      <input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" className="my-3 block w-full text-sm" onChange={async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFileError("");
        if (!/\.(csv|tsv)$/i.test(file.name) || file.size > 1_000_000) { setSource(""); setFileError("Choose a CSV or TSV file smaller than 1 MB."); return; }
        try { setSource(await file.text()); } catch { setSource(""); setFileError("Unable to read this file. Paste the spreadsheet cells instead."); }
      }} />
    </label>
    <label className="block text-sm font-bold text-slate-700">Spreadsheet rows
      <textarea className="mt-2 h-24 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm" value={source} onChange={event => { setSource(event.target.value); setFileError(""); }} placeholder={'First Name\tLast Name\tGender\tHandicap\nPat\tGolfer\tmale\t12.4'} />
    </label>
    {fileError && <p role="alert" className="mt-3 text-sm text-red-700">{fileError}</p>}
    {source && preview.errors.length > 0 && <ul role="alert" className="my-4 max-h-40 list-inside list-disc overflow-auto text-sm text-red-700">{preview.errors.map(error => <li key={error}>{error}</li>)}</ul>}
    {source && preview.players.length > 0 && <div className="my-4 max-h-40 overflow-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs"><thead><tr><th className="px-3 py-2">Player</th><th className="px-3 py-2">Gender</th><th className="px-3 py-2 text-right">Handicap</th></tr></thead><tbody>{preview.players.map((player, index) => <tr key={index}><td className="px-3 py-2">{player.firstName} {player.lastName}</td><td className="px-3 py-2">{player.gender}</td><td className="px-3 py-2 text-right tabular-nums">{player.handicap}</td></tr>)}</tbody></table>
    </div>}
    <div className="mt-4 flex flex-wrap justify-end gap-3"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" disabled={!source || Boolean(fileError) || preview.errors.length > 0 || preview.players.length === 0} onClick={() => { onImport(preview.players); onClose(); }}>Import {preview.players.length} players</Button></div>
  </Modal>;
}

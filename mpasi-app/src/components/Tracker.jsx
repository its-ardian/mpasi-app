import { useMemo, useState } from "react";
import { filterRecipes } from "../lib/recipes";
import { PlusIcon, XIcon, TrashIcon } from "./Icons";

const REACTIONS = [
  { value: "suka", label: "Suka", face: "😋" },
  { value: "netral", label: "Netral", face: "😐" },
  { value: "tidak-suka", label: "Tidak suka", face: "😖" },
  { value: "reaksi-alergi", label: "Reaksi alergi", face: "⚠️" },
];

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function reactionMeta(value) {
  return REACTIONS.find((r) => r.value === value) || REACTIONS[1];
}

export default function Tracker({ entries, onChangeEntries, activeBaby }) {
  const [adding, setAdding] = useState(false);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [entries]
  );

  function addEntry(entry) {
    onChangeEntries([{ ...entry, id: crypto.randomUUID() }, ...entries]);
    setAdding(false);
  }

  function removeEntry(id) {
    onChangeEntries(entries.filter((e) => e.id !== id));
  }

  if (adding) {
    return (
      <EntryForm
        activeBaby={activeBaby}
        onCancel={() => setAdding(false)}
        onSave={addEntry}
      />
    );
  }

  return (
    <div>
      <button className="btn btn-primary btn-block" onClick={() => setAdding(true)}>
        <PlusIcon style={{ width: 16, height: 16 }} />
        Catat makanan
      </button>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="font-display">Belum ada catatan</div>
          <div>Catat makanan yang sudah dicoba dan reaksinya, terutama saat memperkenalkan bahan baru.</div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {sorted.map((entry) => {
            const d = new Date(entry.date);
            const reaction = reactionMeta(entry.reaction);
            return (
              <div className="tracker-entry" key={entry.id}>
                <div className="tracker-date-col">
                  <div className="tracker-date-day">{d.getDate()}</div>
                  <div className="tracker-date-month">{MONTHS_ID[d.getMonth()]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    <span className="reaction-face">{reaction.face}</span> {entry.foodName}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)" }}>
                    {entry.babyName ? `${entry.babyName} — ` : ""}
                    {reaction.label}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </div>
                </div>
                <button className="icon-btn" onClick={() => removeEntry(entry.id)} aria-label="Hapus catatan">
                  <TrashIcon style={{ width: 14, height: 14 }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EntryForm({ activeBaby, onCancel, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [foodName, setFoodName] = useState("");
  const [reaction, setReaction] = useState("suka");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return filterRecipes({ query }).slice(0, 6);
  }, [query]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
        <div className="font-display" style={{ fontSize: "1.1rem" }}>Catat makanan</div>
        <button className="icon-btn" onClick={onCancel} aria-label="Tutup">
          <XIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div className="field">
        <label>Tanggal</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="field">
        <label>Makanan</label>
        <input
          type="text"
          placeholder="mis. Bubur Hati Ayam"
          value={foodName || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFoodName(e.target.value);
          }}
        />
        {suggestions.length > 0 && foodName === query && (
          <div className="card" style={{ marginTop: 6, padding: 6 }}>
            {suggestions.map((r) => (
              <button
                key={r.id}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start" }}
                onClick={() => {
                  setFoodName(r.title);
                  setQuery(r.title);
                }}
              >
                {r.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="field">
        <label>Reaksi</label>
        <div className="chip-row" style={{ margin: 0 }}>
          {REACTIONS.map((r) => (
            <button
              key={r.value}
              className={`chip${reaction === r.value ? " active" : ""}`}
              onClick={() => setReaction(r.value)}
            >
              {r.face} {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Catatan (opsional)</label>
        <input
          type="text"
          placeholder="mis. muncul ruam ringan di pipi"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        disabled={!foodName.trim()}
        onClick={() =>
          onSave({
            date,
            foodName: foodName.trim(),
            reaction,
            note: note.trim(),
            babyId: activeBaby?.id || null,
            babyName: activeBaby?.name || null,
          })
        }
      >
        Simpan catatan
      </button>

      {reaction === "reaksi-alergi" && (
        <div className="source-note" style={{ background: "var(--color-cabai-tint)", borderColor: "var(--color-cabai)", color: "var(--color-cabai)" }}>
          ⚠️ Jika reaksinya cukup serius (sesak napas, bengkak, muntah berulang),
          segera hubungi dokter atau layanan gawat darurat. Catatan ini bukan
          pengganti penanganan medis.
        </div>
      )}
    </div>
  );
}

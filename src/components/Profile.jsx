import { useState } from "react";
import { ageInMonths, stageForMonths, stageLabel } from "../lib/age";
import { allAllergens } from "../lib/recipes";
import { PlusIcon, TrashIcon, XIcon } from "./Icons";

const ALLERGENS = allAllergens();

function emptyBaby() {
  return { id: crypto.randomUUID(), name: "", birthdate: "", allergies: [] };
}

export default function Profile({ babies, activeBabyId, onChangeBabies, onSetActive }) {
  const [editingId, setEditingId] = useState(null);
  const editingBaby = babies.find((b) => b.id === editingId) || null;

  function saveBaby(updated) {
    const exists = babies.some((b) => b.id === updated.id);
    const next = exists
      ? babies.map((b) => (b.id === updated.id ? updated : b))
      : [...babies, updated];
    onChangeBabies(next);
  }

  function removeBaby(id) {
    const next = babies.filter((b) => b.id !== id);
    onChangeBabies(next);
    if (activeBabyId === id) onSetActive(next[0]?.id || null);
  }

  if (editingBaby) {
    return (
      <BabyForm
        baby={editingBaby}
        onCancel={() => setEditingId(null)}
        onSave={(b) => {
          saveBaby(b);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="section-title">Profil Anak</div>
      {babies.length === 0 && (
        <div className="empty-state">
          <div className="font-display">Belum ada profil anak</div>
          <div>Tambahkan profil untuk mendapatkan rekomendasi resep sesuai usia.</div>
        </div>
      )}

      {babies.map((baby) => {
        const months = ageInMonths(baby.birthdate);
        const stage = stageForMonths(months);
        return (
          <div className="card" key={baby.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "1.05rem" }}>
                  {baby.name || "(Tanpa nama)"}
                  {activeBabyId === baby.id && (
                    <span className="badge" style={{ marginLeft: 8 }}>Aktif</span>
                  )}
                </div>
                {months !== null && (
                  <div style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)", marginTop: 3 }}>
                    {months} bulan — {stageLabel(stage)}
                  </div>
                )}
                {baby.allergies?.length > 0 && (
                  <div className="allergen-list">
                    {baby.allergies.map((a) => (
                      <span className="badge warn" key={a}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <button className="icon-btn" onClick={() => removeBaby(baby.id)} aria-label="Hapus">
                <TrashIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingId(baby.id)}>
                Edit
              </button>
              {activeBabyId !== baby.id && (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSetActive(baby.id)}>
                  Jadikan aktif
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button
        className="btn btn-secondary btn-block"
        onClick={() => {
          const b = emptyBaby();
          onChangeBabies([...babies, b]);
          setEditingId(b.id);
        }}
      >
        <PlusIcon style={{ width: 16, height: 16 }} />
        Tambah profil anak
      </button>

      <div className="disclaimer">
        Semua data disimpan hanya di perangkat ini (tidak dikirim ke server).
      </div>
    </div>
  );
}

function BabyForm({ baby, onCancel, onSave }) {
  const [form, setForm] = useState(baby);

  function toggleAllergy(a) {
    setForm((f) => ({
      ...f,
      allergies: f.allergies.includes(a)
        ? f.allergies.filter((x) => x !== a)
        : [...f.allergies, a],
    }));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
        <div className="font-display" style={{ fontSize: "1.15rem" }}>Edit Profil</div>
        <button className="icon-btn" onClick={onCancel} aria-label="Tutup">
          <XIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div className="field">
        <label>Nama</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="mis. Kirana"
        />
      </div>

      <div className="field">
        <label>Tanggal lahir</label>
        <input
          type="date"
          value={form.birthdate}
          onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Alergi / bahan yang dihindari</label>
        <div className="card" style={{ padding: 10, maxHeight: 260, overflowY: "auto" }}>
          {ALLERGENS.map((a) => (
            <label className="checkbox-row" key={a}>
              <input
                type="checkbox"
                checked={form.allergies.includes(a)}
                onChange={() => toggleAllergy(a)}
              />
              <span style={{ fontSize: "0.88rem" }}>{a}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => onSave(form)}>
        Simpan profil
      </button>
    </div>
  );
}

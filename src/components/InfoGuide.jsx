import { useMemo, useState } from "react";
import infoData from "../data/info_and_tips.json";
import { SearchIcon } from "./Icons";

export default function InfoGuide() {
  const [query, setQuery] = useState("");
  const [openTopic, setOpenTopic] = useState(null);

  const topics = useMemo(() => {
    if (!query.trim()) return infoData.guidelines;
    const q = query.trim().toLowerCase();
    return infoData.guidelines.filter((g) => {
      if (g.topic.toLowerCase().includes(q)) return true;
      if (g.description?.toLowerCase().includes(q)) return true;
      if (g.tips?.some((t) => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [query]);

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <SearchIcon
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-ink-faint)",
            width: 18,
            height: 18,
          }}
        />
        <input
          className="search-input"
          style={{ paddingLeft: 38, marginBottom: 0 }}
          placeholder="Cari topik, mis. GTM, alergi, tekstur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {topics.length === 0 ? (
        <div className="empty-state">
          <div className="font-display">Tidak ditemukan</div>
          <div>Coba kata kunci lain.</div>
        </div>
      ) : (
        topics.map((g, i) => {
          const isOpen = openTopic === i;
          return (
            <div className="card" key={i} style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setOpenTopic(isOpen ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "1rem" }}>
                  {g.topic}
                </span>
                <span style={{ color: "var(--color-kunyit-dark)", fontSize: "1.1rem", flexShrink: 0 }}>
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  {g.description && (
                    <p style={{ fontSize: "0.9rem", color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
                      {g.description}
                    </p>
                  )}

                  {g.causes?.length > 0 && (
                    <>
                      <div className="ingredient-group-title">Kemungkinan Penyebab</div>
                      <ul className="step-list" style={{ paddingLeft: 18 }}>
                        {g.causes.map((c, ci) => (
                          <li key={ci} style={{ fontSize: "0.9rem" }}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {g.tips?.length > 0 && (
                    <>
                      <div className="step-group-title">Tips</div>
                      <ul className="step-list" style={{ paddingLeft: 18 }}>
                        {g.tips.map((t, ti) => (
                          <li key={ti} style={{ fontSize: "0.9rem" }}>{t}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="disclaimer">
        Informasi ini bersifat umum dan bukan pengganti saran medis. Untuk
        kekhawatiran spesifik tentang tumbuh kembang, alergi, atau kesehatan
        Si Kecil, konsultasikan dengan dokter anak.
      </div>
    </div>
  );
}

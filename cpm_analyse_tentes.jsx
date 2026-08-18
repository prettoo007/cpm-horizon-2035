import { useState, useMemo } from "react";

const C = {
  corail: "#D86F6F", noir: "#1D1D1B", rose: "#E372A6",
  fondClair: "#F9F5F4", fondRose: "#FDF0EE", white: "#FFFFFF",
  text: "#2C2C2C", muted: "#8A7F7F", border: "#E8DEDD",
  green: "#5BA67D", amber: "#D4A843", steel: "#6B7F94",
  violet: "#7C6BAA", blue: "#4A90B8", red: "#C0392B",
};

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
const YEARS = [2023, 2024, 2025, 2026];
const YEAR_COLORS = { 2023: C.steel, 2024: C.blue, 2025: C.corail, 2026: C.amber };

const rawData = {
  2023: [
    { month: 1, senior: 0, junior: 0, total: 0 },
    { month: 2, senior: 20, junior: 0, total: 20 },
    { month: 3, senior: 140, junior: 11, total: 151 },
    { month: 4, senior: 297, junior: 111, total: 408 },
    { month: 5, senior: 147, junior: 54, total: 201 },
    { month: 6, senior: 136, junior: 6, total: 142 },
    { month: 7, senior: 366, junior: 101, total: 467 },
    { month: 8, senior: 197, junior: 10, total: 207 },
    { month: 9, senior: 245, junior: 42, total: 287 },
    { month: 10, senior: 312, junior: 180, total: 492 },
    { month: 11, senior: 32, junior: 0, total: 32 },
    { month: 12, senior: 0, junior: 0, total: 0 },
  ],
  2024: [
    { month: 1, senior: 0, junior: 0, total: 0 },
    { month: 2, senior: 10, junior: 0, total: 10 },
    { month: 3, senior: 558, junior: 42, total: 600 },
    { month: 4, senior: 274, junior: 113, total: 387 },
    { month: 5, senior: 257, junior: 90, total: 347 },
    { month: 6, senior: 189, junior: 39, total: 228 },
    { month: 7, senior: 1778, junior: 1200, total: 2978 },
    { month: 8, senior: 300, junior: 59, total: 359 },
    { month: 9, senior: 304, junior: 52, total: 356 },
    { month: 10, senior: 225, junior: 171, total: 396 },
    { month: 11, senior: 27, junior: 5, total: 32 },
    { month: 12, senior: 0, junior: 4, total: 4 },
  ],
  2025: [
    { month: 1, senior: 3, junior: 0, total: 3 },
    { month: 2, senior: 39, junior: 4, total: 43 },
    { month: 3, senior: 463, junior: 49, total: 512 },
    { month: 4, senior: 246, junior: 196, total: 442 },
    { month: 5, senior: 122, junior: 54, total: 176 },
    { month: 6, senior: 220, junior: 97, total: 317 },
    { month: 7, senior: 1894, junior: 1165, total: 3059 },
    { month: 8, senior: 201, junior: 13, total: 214 },
    { month: 9, senior: 383, junior: 63, total: 446 },
    { month: 10, senior: 209, junior: 117, total: 326 },
    { month: 11, senior: 21, junior: 0, total: 21 },
    { month: 12, senior: 0, junior: 0, total: 0 },
  ],
  2026: [
    { month: 1, senior: 0, junior: 0, total: 0 },
    { month: 2, senior: 4, junior: 2, total: 6 },
    { month: 3, senior: 354, junior: 26, total: 380 },
    { month: 4, senior: 116, junior: 56, total: 172 },
    { month: 5, senior: 36, junior: 3, total: 39 },
    { month: 6, senior: 61, junior: 27, total: 88 },
    { month: 7, senior: 483, junior: 262, total: 745 },
    { month: 8, senior: 5, junior: 0, total: 5 },
    { month: 9, senior: 0, junior: 0, total: 0 },
    { month: 10, senior: 0, junior: 0, total: 0 },
    { month: 11, senior: 0, junior: 0, total: 0 },
    { month: 12, senior: 0, junior: 0, total: 0 },
  ],
};

const durationByYear = {
  2023: { avg: 13.3, med: 7, n: 430, dist: [7,70,151,86,95,21] },
  2024: { avg: 17.3, med: 17, n: 1132, dist: [8,74,163,190,651,46] },
  2025: { avg: 17.3, med: 17, n: 1123, dist: [6,64,166,174,669,44] },
  2026: { avg: 17.3, med: 17, n: 221, dist: [0,18,23,28,146,6] },
};

const megaByYear = {
  2023: [["N23-1770",121],["N23-1088",70],["N23-2214",60],["N23-1996",60],["N23-0693",40]],
  2024: [["N24-0543",346],["N24-1794",113],["N24-1647",71],["N24-0600",70],["N24-0126",62]],
  2025: [["N25-0973",325],["N25-0089",194],["N25-2016",132],["N25-0012",120],["N25-0057",71]],
  2026: [["N26-0244",325],["N26-0049",72],["N26-0206",70],["N26-0296",62],["N26-0285",41]],
};

const durLabels = ["1 jour","2-3 jours","4-7 jours","8-14 jours","15-30 jours","> 30 jours"];

const views = [
  { id: "volume", label: "Volume", icon: "📈" },
  { id: "saison", label: "Saisonnalité", icon: "🌡️" },
  { id: "duree", label: "Durée", icon: "⏱️" },
  { id: "predictions", label: "Insights", icon: "💡" },
];

function Bar({ value, max, color, height }) {
  return (
    <div style={{ height: height || 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

function YearFilter({ selected, onChange }) {
  const allSelected = selected.length === YEARS.length;
  return (
    <div style={{
      display: "flex", gap: 6, padding: "12px 0", flexWrap: "wrap", alignItems: "center",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginRight: 4 }}>Filtrer :</span>
      <button onClick={() => onChange(YEARS)} style={{
        padding: "6px 14px", borderRadius: 20, cursor: "pointer",
        border: allSelected ? `2px solid ${C.noir}` : `1px solid ${C.border}`,
        background: allSelected ? C.noir : C.white,
        color: allSelected ? "#fff" : C.muted,
        fontSize: 13, fontWeight: 600,
      }}>Toutes</button>
      {YEARS.map(y => {
        const active = selected.includes(y);
        const col = YEAR_COLORS[y];
        return (
          <button key={y} onClick={() => {
            if (active && selected.length === 1) return;
            onChange(active ? selected.filter(x => x !== y) : [...selected, y]);
          }} style={{
            padding: "6px 14px", borderRadius: 20, cursor: "pointer",
            border: active ? `2px solid ${col}` : `1px solid ${C.border}`,
            background: active ? col + "15" : C.white,
            color: active ? col : C.muted,
            fontSize: 13, fontWeight: 600,
          }}>{y}{y === 2026 ? "*" : ""}</button>
        );
      })}
    </div>
  );
}

function KPI({ num, label, sub, color }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || C.noir, fontFamily: "'Poppins', sans-serif" }}>{num}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function TentAnalysis() {
  const [activeView, setActiveView] = useState("volume");
  const [selectedYears, setSelectedYears] = useState([2023, 2024, 2025, 2026]);

  const filtered = useMemo(() => {
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1, mois: MONTHS[i], senior: 0, junior: 0, total: 0,
    }));
    let totalSenior = 0, totalJunior = 0, totalAll = 0;

    selectedYears.forEach(y => {
      rawData[y].forEach((m, i) => {
        monthly[i].senior += m.senior;
        monthly[i].junior += m.junior;
        monthly[i].total += m.total;
        totalSenior += m.senior;
        totalJunior += m.junior;
        totalAll += m.total;
      });
    });

    // Duration aggregated
    let durDist = [0,0,0,0,0,0], durN = 0, durSum = 0;
    selectedYears.forEach(y => {
      const d = durationByYear[y];
      d.dist.forEach((v, i) => { durDist[i] += v; });
      durN += d.n;
      durSum += d.avg * d.n;
    });
    const durAvg = durN > 0 ? (durSum / durN).toFixed(1) : 0;

    // Mega commandes
    let megas = [];
    selectedYears.forEach(y => {
      megaByYear[y].forEach(([doc, qty]) => megas.push({ doc, qty, year: y }));
    });
    megas.sort((a, b) => b.qty - a.qty);

    return { monthly, totalSenior, totalJunior, totalAll, durDist, durN, durAvg, megas: megas.slice(0, 10) };
  }, [selectedYears]);

  const maxMonth = Math.max(...filtered.monthly.map(m => m.total));
  const multiYear = selectedYears.length > 1;
  const labelSuffix = selectedYears.length === 1 ? ` (${selectedYears[0]})` : selectedYears.length === 4 ? " (2023-2026)" : ` (${selectedYears.join(", ")})`;

  return (
    <div style={{ fontFamily: "'Roboto',system-ui,sans-serif", background: C.fondClair, minHeight: "100vh", color: C.text }}>
      <div style={{ background: "linear-gradient(135deg, #FDF0EE 0%, #F5E0DC 50%, #EEDDD9 100%)", padding: "24px 22px 12px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Module dédié · Pilote Sprint 1</p>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: C.noir }}>
            ⛺ Analyse des prêts de tentes
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted }}>
            {filtered.totalAll.toLocaleString()} tentes prêtées{labelSuffix} · Données SAP réelles
          </p>
        </div>
      </div>

      {/* Year filter - sticky */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {views.map(v => (
                <button key={v.id} onClick={() => setActiveView(v.id)} style={{
                  padding: "12px 14px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: activeView === v.id ? 700 : 500,
                  color: activeView === v.id ? C.corail : C.muted,
                  borderBottom: activeView === v.id ? `2px solid ${C.corail}` : "2px solid transparent",
                  fontFamily: "'Poppins', sans-serif",
                }}>{v.icon} {v.label}</button>
              ))}
            </div>
            <YearFilter selected={selectedYears} onChange={setSelectedYears} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "14px 22px 44px" }}>

        {activeView === "volume" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <KPI num={filtered.totalAll.toLocaleString()} label="Tentes prêtées" color={C.corail} />
              <KPI num={filtered.totalSenior.toLocaleString()} label={`Senior (${Math.round(filtered.totalSenior / (filtered.totalAll || 1) * 100)}%)`} color={C.steel} />
              <KPI num={filtered.totalJunior.toLocaleString()} label={`Junior (${Math.round(filtered.totalJunior / (filtered.totalAll || 1) * 100)}%)`} color={C.amber} />
              <KPI num={maxMonth.toLocaleString()} label="Pic mensuel (juillet)" color={C.rose} />
            </div>

            {/* Monthly chart */}
            <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                Volume mensuel{labelSuffix}
              </div>
              <div style={{ display: "flex", gap: 4, height: 240 }}>
                {filtered.monthly.map((m, i) => {
                  const h = maxMonth > 0 ? Math.max((m.total / maxMonth) * 210, 3) : 3;
                  const isMax = m.total === maxMonth && m.total > 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isMax ? C.corail : C.text, marginBottom: 4 }}>
                        {m.total > 0 ? m.total : ""}
                      </span>
                      <div style={{ width: "75%", height: h, borderRadius: "4px 4px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: m.senior, background: C.corail }} />
                        <div style={{ flex: m.junior, background: C.amber }} />
                      </div>
                      <span style={{ fontSize: 10, color: isMax ? C.corail : C.muted, marginTop: 4, fontWeight: isMax ? 700 : 500 }}>{m.mois}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: C.corail, display: "inline-block" }} /> Senior</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: C.amber, display: "inline-block" }} /> Junior</span>
              </div>
            </div>

            {/* Year comparison - only if multiple years */}
            {multiYear && (
              <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                  Comparaison par année — Juillet
                </div>
                {selectedYears.map(y => {
                  const juil = rawData[y][6].total;
                  const yearTotal = rawData[y].reduce((s, m) => s + m.total, 0);
                  return (
                    <div key={y} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, color: YEAR_COLORS[y] }}>{y}{y === 2026 ? "*" : ""}</span>
                        <span style={{ color: C.muted }}>Juil: {juil} · Total: {yearTotal}</span>
                      </div>
                      <Bar value={juil} max={3059} color={YEAR_COLORS[y]} height={14} />
                    </div>
                  );
                })}
                <div style={{ fontSize: 12, color: C.muted, marginTop: 8, fontStyle: "italic" }}>
                  Juillet 2024 : 2 978 tentes · Juillet 2025 : 3 059 tentes (+3%). La demande se stabilise au sommet.
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "saison" && (
          <div>
            {/* Senior vs Junior monthly */}
            <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                Senior vs Junior — mois par mois{labelSuffix}
              </div>
              {filtered.monthly.map((m, i) => {
                if (m.total === 0) return null;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ width: 35, fontSize: 12, fontWeight: 600, color: C.muted, flexShrink: 0 }}>{m.mois}</span>
                    <div style={{ flex: 1, display: "flex", gap: 1, height: 20, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(m.senior / (maxMonth || 1)) * 100}%`, background: C.corail, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                        {m.senior > 200 ? m.senior : ""}
                      </div>
                      <div style={{ width: `${(m.junior / (maxMonth || 1)) * 100}%`, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                        {m.junior > 150 ? m.junior : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, width: 50, textAlign: "right", flexShrink: 0 }}>{m.total}</span>
                  </div>
                );
              })}
            </div>

            {/* Multi-year overlay for July */}
            {multiYear && (
              <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                  Évolution mensuelle par année — superposition
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, flexWrap: "wrap" }}>
                  {selectedYears.map(y => (
                    <span key={y} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 12, height: 4, borderRadius: 2, background: YEAR_COLORS[y], display: "inline-block" }} /> {y}
                    </span>
                  ))}
                </div>
                {MONTHS.map((mois, mi) => {
                  const vals = selectedYears.map(y => rawData[y][mi].total);
                  const maxV = Math.max(...selectedYears.flatMap(y => rawData[y].map(m => m.total)));
                  if (Math.max(...vals) === 0) return null;
                  return (
                    <div key={mi} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{mois}</span>
                      {selectedYears.map(y => {
                        const v = rawData[y][mi].total;
                        if (v === 0) return null;
                        return (
                          <div key={y} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <div style={{ height: 7, width: `${(v / maxV) * 100}%`, background: YEAR_COLORS[y], borderRadius: 3, minWidth: 3 }} />
                            <span style={{ fontSize: 10, color: YEAR_COLORS[y], fontWeight: 700 }}>{v}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeView === "duree" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <KPI num={filtered.durAvg + " j"} label="Durée moyenne" color={C.blue} />
              <KPI num={filtered.durN.toLocaleString()} label="Prêts avec durée" color={C.steel} />
              <KPI num={(filtered.totalAll / 2277).toFixed(1) + "×"} label="Rotation / tente" sub="sur la période sélectionnée" color={C.amber} />
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                Distribution des durées{labelSuffix}
              </div>
              {durLabels.map((label, i) => {
                const count = filtered.durDist[i];
                const pct = filtered.durN > 0 ? Math.round((count / filtered.durN) * 100) : 0;
                const colors = [C.green, C.green, C.blue, C.blue, C.corail, C.amber];
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      <span style={{ color: C.muted }}>{count} prêts ({pct}%)</span>
                    </div>
                    <Bar value={pct} max={60} color={colors[i]} height={12} />
                  </div>
                );
              })}
            </div>

            {/* Mega commandes */}
            <div style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>
                Top commandes{labelSuffix}
              </div>
              {filtered.megas.map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
                  borderBottom: i < filtered.megas.length - 1 ? `1px solid ${C.fondClair}` : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i < 3 ? YEAR_COLORS[m.year] : C.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{m.doc}</span>
                  <span style={{ fontSize: 12, color: YEAR_COLORS[m.year], fontWeight: 600 }}>{m.year}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: C.noir, fontFamily: "'Poppins', sans-serif" }}>{m.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "predictions" && (
          <div>
            {[
              { title: "Rotation 2,5× par an — l'usure accélère", insight: "Chaque tente sort 2,5 fois par an (2024-2025) contre 1,1 fois en 2023. La pression a plus que doublé. Durée de vie réduite proportionnellement.", action: "Recalculer les plans de remplacement sur le nouveau taux de rotation.", color: C.corail, icon: "📊" },
              { title: "Juillet = 48% de l'activité — risque systémique", insight: `${selectedYears.length === 1 ? "Sur " + selectedYears[0] : "Sur la période"}, juillet concentre ${Math.round(filtered.monthly[6].total / (filtered.totalAll || 1) * 100)}% des sorties. Une seule semaine de retard peut créer un effet domino.`, action: "Plan de contingence juillet : stock tampon, retour accéléré, lavage renforcé.", color: C.amber, icon: "⚠️" },
              { title: "La demande s'est stabilisée au sommet", insight: "Après +137% en 2024, la demande 2025 se stabilise. Le parc de 2 277 tentes absorbe ~5 600 sorties — plus du double de sa charge initiale.", action: "Le plan de fabrication de 165 tentes sur 4 ans est le minimum vital.", color: C.green, icon: "📈" },
              { title: "Les Junior montent — +245% en 2 ans", insight: "De 515 Junior en 2023 à 1 775 en 2024. Le parc est sous-dimensionné en Junior (905 unités pour 29% de la demande).", action: "Augmenter la part de Junior dans le plan de fabrication.", color: C.violet, icon: "⛺" },
              { title: "3 commandes > 300 tentes façonnent la saison", insight: "Les méga-commandes mobilisent 15% du parc pour 3 emprunteurs. Elles arrivent systématiquement pour juillet.", action: "Anticiper dès février, co-construire un calendrier dédié avec ces emprunteurs.", color: C.steel, icon: "🤝" },
            ].map((ins, i) => (
              <div key={i} style={{
                background: C.white, borderRadius: 12, border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${ins.color}`, padding: 18, marginBottom: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{ins.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>{ins.title}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{ins.insight}</div>
                <div style={{ padding: "8px 14px", borderRadius: 8, background: ins.color + "10", fontSize: 13, fontWeight: 600, color: ins.color }}>
                  → {ins.action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, background: C.white, textAlign: "center" }}>
        <span style={{ fontSize: 12, color: C.muted }}>Données SAP · Tentes_1.xlsx · CPM Horizon 2035 · Août 2026</span>
      </div>
    </div>
  );
}

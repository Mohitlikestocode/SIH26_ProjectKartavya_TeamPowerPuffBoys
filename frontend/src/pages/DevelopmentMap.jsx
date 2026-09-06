import { css } from "../lib/css";

// Real data only: v.developmentTrail comes from GET /api/dashboards/employee's
// developmentTrail field (backend/src/modules/recommendations/recommendations.service.ts's
// buildDevelopmentTrail), v.peerStanding from the same response's peerStanding field
// (backend/src/modules/dashboards/dashboards.service.ts's getPeerStanding). Geometry (x/y,
// domain colors, source badge colors) is precomputed in App.jsx — this component only renders
// literal markup, same convention as Dashboard.jsx's radar chart.
export default function DevelopmentMap({ v }) {
  const trail = v.developmentTrail || [];
  const points = trail.map((s) => `${s.x},${s.y}`).join(" ");
  const peer = v.peerStanding;

  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap")}>
        <div>
          <h1 style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C; margin:0")}>Your Development Map</h1>
          <div style={css("font-size:13.5px; color:#5A6472; margin-top:4px")}>Priority stations toward {v.realTargetRoleTitle}, ordered by the size of the gap each one closes.</div>
        </div>
        <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap")}>
          <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #B9CFEC; background:#E8F0FA; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; color:#123E7C")}><span style={css("width:8px;height:8px;background:#1B5CB8")}></span>iGOT Karmayogi</span>
          <span style={css("display:inline-flex; align-items:center; gap:6px; border:1px solid #F3CFA6; background:#FDF0E1; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; color:#9A4A0B")}><span style={css("width:8px;height:8px;background:#E9761B")}></span>NSSTA / TPAC</span>
        </div>
      </div>

      {v.notAssessed && (
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:44px 40px; text-align:center; max-width:720px; margin:20px auto")}>
          <div style={css("width:52px; height:52px; border-radius:50%; background:#E8F0FA; border:1px solid #B9CFEC; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:18px; color:#123E7C")}>?</div>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:24px; font-weight:700; color:#123E7C; margin:0 0 8px")}>Your Development Map is not built yet</h2>
          <p style={css("font-size:14px; line-height:1.6; color:#3B424E; margin:0 auto 20px; max-width:520px")}>Every station on this map is a real gap between your assessed level and what {v.realTargetRoleTitle} requires. Complete the baseline assessment and Kartavya will rank your gaps and place a station for each one.</p>
          <div style={css("display:flex; gap:12px; justify-content:center; flex-wrap:wrap")}>
            <button onClick={v.startDiagnostic} className="btn-accent" style={css("font:inherit; font-size:15px; font-weight:800; cursor:pointer; padding:14px 24px; border:0; background:#F58220; color:#3D1D00; border-radius:8px")}>Start assessment · 20 min</button>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:15px; font-weight:600; cursor:pointer; padding:14px 22px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Browse courses</button>
          </div>
        </div>
      )}

      {v.assessed && trail.length === 0 && (
        <div style={css("background:#fff; border:1px solid #E3E9F2; border-left:4px solid #166534; padding:24px 26px; margin-top:20px")}>
          <div style={css("font-size:15px; font-weight:700; color:#166534; margin-bottom:6px")}>No priority stations right now</div>
          <div style={css("font-size:13.5px; color:#3B424E; line-height:1.6")}>Your assessed level currently meets or exceeds every sub-skill {v.realTargetRoleTitle} requires. Check back after your next assessment, or browse the catalogue for anything beyond the current requirement.</div>
        </div>
      )}

      {v.assessed && trail.length > 0 && (
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:20px 24px; margin-top:20px")}>
          <svg viewBox="150 10 400 200" style={css("width:100%; max-width:600px; height:auto; margin:0 auto; display:block")} role="img" aria-label={`A trail of ${trail.length} priority development stations, numbered in order of priority`}>
            <polyline points={points} fill="none" stroke="#C9CFD8" strokeWidth="2" strokeDasharray="6 5"></polyline>
            {trail.map((s, i) => (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={s.isFirst ? 16 : 13} fill={s.isFirst ? "#123E7C" : "#fff"} stroke={s.domainColor} strokeWidth="2.5"></circle>
                <text x={s.x} y={s.y + 5} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={s.isFirst ? "13" : "11.5"} fontWeight="700" fill={s.isFirst ? "#fff" : "#123E7C"}>{s.order}</text>
              </g>
            ))}
          </svg>
          <div style={css("text-align:center; font-size:11.5px; color:#7A8492; margin-top:8px")}>Stations are priority order, not a completion trail — every one is available to start now.</div>
        </div>
      )}

      {v.assessed && trail.length > 0 && (
        <div style={css("display:grid; gap:14px; margin-top:20px")}>
          {trail.map((s, i) => (
            <div key={i} style={css(`background:#fff; border:1px solid #E3E9F2; border-left:4px solid ${s.domainColor}; padding:18px 22px; display:grid; grid-template-columns:44px 1fr; gap:16px; align-items:start`)}>
              <div style={css(`width:44px; height:44px; border-radius:50%; background:${s.isFirst ? "#123E7C" : "#fff"}; border:2px solid ${s.domainColor}; color:${s.isFirst ? "#fff" : "#123E7C"}; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700`)}>{String(s.order).padStart(2, "0")}</div>
              <div style={css("min-width:0")}>
                <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:8px")}>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${s.domainColor}; background:${s.domainTint}; border:1px solid ${s.domainBorder}`)}>{s.domainLabel}</span>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A8492")}>{s.subSkill} · gap {s.gap}</span>
                  {s.isFirst && <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #F3CFA6; background:#FDF0E1; color:#9A4A0B; padding:2px 6px; border-radius:5px")}>START HERE</span>}
                </div>
                {s.hasPrimary ? (
                  <>
                    <span style={css(`display:inline-flex; align-items:center; gap:6px; border:1px solid ${s.srcBorder}; background:${s.srcTint}; padding:3px 7px; border-radius:6px; font-size:10.5px; font-weight:700; color:${s.srcFg}; margin-bottom:8px`)}><span style={css(`width:7px;height:7px; background:${s.srcColor}`)}></span>{s.srcLabel}</span>
                    <div style={css("font-size:15px; font-weight:700; color:#123E7C; line-height:1.35; margin-top:4px")}>{s.title}</div>
                    <div style={css(`font-size:13px; line-height:1.55; color:#3B424E; border-left:2px solid ${s.domainColor}; padding-left:10px; margin-top:9px`)}>{s.why}</div>
                  </>
                ) : (
                  <div style={css("font-size:13.5px; color:#7A8492; font-style:italic")}>{s.why}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {v.assessed && (
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:22px 24px; margin-top:20px")}>
          <h2 style={css("font-family:'Poppins',sans-serif; font-size:19px; font-weight:700; color:#123E7C; margin:0 0 3px")}>Your standing</h2>
          {peer ? (
            <>
              <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:14px")}>Average gap across every sub-skill your target role requires, ranked against officers in the same cadre targeting the same role.</div>
              <div style={css("display:flex; align-items:baseline; gap:10px; flex-wrap:wrap")}>
                <span style={css("font-family:'Poppins',sans-serif; font-size:28px; font-weight:700; color:#123E7C")}>{peer.percentile}th percentile</span>
              </div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#5A6472; margin-top:4px")}>Rank {peer.rank} of {peer.peerCount} · {peer.cadre} · {peer.targetRoleTitle}</div>
              <svg viewBox="0 0 400 56" style={css("width:100%; max-width:440px; height:auto; margin-top:14px; display:block")} role="img" aria-label={`Your standing at the ${peer.percentile}th percentile among ${peer.peerCount} peers`}>
                <line x1="20" y1="30" x2="380" y2="30" stroke="#DDE1E7" strokeWidth="2"></line>
                {[0, 25, 50, 75, 100].map((tick) => (
                  <g key={tick}>
                    <line x1={20 + tick * 3.6} y1="25" x2={20 + tick * 3.6} y2="35" stroke="#C9CFD8" strokeWidth="1.5"></line>
                    <text x={20 + tick * 3.6} y="50" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#7A8492">{tick}</text>
                  </g>
                ))}
                <circle cx={20 + peer.percentile * 3.6} cy="30" r="7" fill="#F58220" stroke="#3D1D00" strokeWidth="1.5"></circle>
                <text x={20 + peer.percentile * 3.6} y="14" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="10.5" fontWeight="700" fill="#123E7C">You</text>
              </svg>
            </>
          ) : (
            <div style={css("font-size:13px; color:#7A8492; line-height:1.6")}>Peer comparison needs at least one other officer in your cadre targeting the same role as you — not available yet.</div>
          )}
        </div>
      )}
    </section>
  );
}

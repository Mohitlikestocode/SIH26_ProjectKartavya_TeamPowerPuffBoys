import { css } from "../lib/css";

export default function TrainerSessions({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:18px")}>
        <div>
          <h1 style={css("font-size:27px; font-weight:800; color:#123E7C; margin:0")}>Sessions &amp; QR access</h1>
          <div style={css("font-size:13.5px; color:#5A6C86; margin-top:4px")}>Every session names the question set it runs and the course it is mapped to, so you always know which QR opens which test.</div>
        </div>
        <button style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#F58220; color:#fff; border-radius:24px; white-space:nowrap")}>+ Create session</button>
      </div>

      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr)); gap:20px; align-items:start")}>
        <div style={css("display:grid; gap:12px; min-width:0")}>
          <div style={css("font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7A8AA3")}>Your sessions</div>
          {v.sessions.map((s, i) => (
            <button
              key={i}
              onClick={s.select}
              className="session-card"
              style={css(`font:inherit; text-align:left; cursor:pointer; background:${s.cardBg}; border:1.5px solid ${s.cardBorder}; border-radius:14px; padding:16px 18px; display:grid; grid-template-columns:72px 1fr; gap:16px; align-items:start`)}
            >
              <div style={css("border:1px solid #E3E9F2; background:#fff; border-radius:8px; padding:4px")}>{s.qr}</div>
              <div style={css("min-width:0")}>
                <div style={css("display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:7px")}>
                  <span style={css(`font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:20px; color:${s.statusFg}; background:${s.statusBg}; border:1px solid ${s.statusBorder}`)}>{s.status}</span>
                  <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; font-weight:500; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:2px 7px; border-radius:6px")}>{s.id}</span>
                  <span style={css("font-size:11.5px; color:#8A97AC; margin-left:auto")}>{s.selectedLabel}</span>
                </div>
                <div style={css("font-size:15.5px; font-weight:700; color:#123E7C; line-height:1.3")}>{s.name}</div>
                <div style={css("display:grid; gap:5px; margin-top:9px")}>
                  <div style={css("display:grid; grid-template-columns:64px 1fr; gap:9px; font-size:12.5px; align-items:baseline")}>
                    <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Test</span>
                    <span style={css("color:#1A1D23; font-weight:600")}>{s.quiz} <span style={css("font-weight:400; color:#5A6C86")}>· {s.items}</span></span>
                  </div>
                  <div style={css("display:grid; grid-template-columns:64px 1fr; gap:9px; font-size:12.5px; align-items:baseline")}>
                    <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Course</span>
                    <span style={css("color:#5A6C86")}>{s.course}</span>
                  </div>
                  <div style={css("display:grid; grid-template-columns:64px 1fr; gap:9px; font-size:12.5px; align-items:baseline")}>
                    <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>When</span>
                    <span style={css("color:#5A6C86")}>{s.when} · {s.venue}</span>
                  </div>
                </div>
                <div style={css("display:flex; align-items:center; gap:10px; margin-top:10px")}>
                  <div style={css("flex:1; height:7px; background:#EEF1F6; border-radius:4px; overflow:hidden")}><div style={css(`height:100%; width:${s.pct}; background:${s.srcColor}`)}></div></div>
                  <span style={css("font-size:11.5px; color:#5A6C86; white-space:nowrap")}>{s.joined}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={css("display:grid; gap:20px; min-width:0")}>
          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; overflow:hidden")}>
            <div style={css("background:#1B5CB8; padding:13px 20px; text-align:center; font-size:16px; font-weight:700; color:#fff")}>Project this code in the room</div>
            <div style={css("padding:22px; text-align:center")}>
              <div style={css("display:inline-block; border:1px solid #E3E9F2; border-radius:12px; padding:14px; background:#fff")}>{v.sess.qr}</div>
              <div style={css("font-size:18px; font-weight:700; color:#123E7C; margin-top:14px")}>{v.sess.name}</div>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:17px; font-weight:500; letter-spacing:0.08em; color:#123E7C; background:#E8F0FA; border:1px solid #B9CFEC; padding:8px 14px; border-radius:8px; display:inline-block; margin-top:10px")}>{v.sess.id}</div>
              <div style={css("font-size:12.5px; color:#5A6C86; margin-top:10px")}>Participants can also type this code instead of scanning.</div>
              <div style={css("text-align:left; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:12px; padding:14px 16px; margin-top:18px; display:grid; gap:9px")}>
                <div style={css("display:grid; grid-template-columns:96px 1fr; gap:10px; font-size:13px; align-items:baseline")}>
                  <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Test served</span>
                  <span style={css("font-weight:700; color:#123E7C")}>{v.sess.quiz}</span>
                </div>
                <div style={css("display:grid; grid-template-columns:96px 1fr; gap:10px; font-size:13px; align-items:baseline")}>
                  <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Contents</span>
                  <span style={css("color:#41506B")}>{v.sess.items}</span>
                </div>
                <div style={css("display:grid; grid-template-columns:96px 1fr; gap:10px; font-size:13px; align-items:baseline")}>
                  <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Mapped to</span>
                  <span style={css("color:#41506B")}>{v.sess.course} <span style={css(`font-size:11px; font-weight:700; color:${v.sess.srcFg}; background:${v.sess.srcTint}; border:1px solid ${v.sess.srcBorder}; padding:2px 7px; border-radius:20px; white-space:nowrap`)}>{v.sess.source}</span></span>
                </div>
                <div style={css("display:grid; grid-template-columns:96px 1fr; gap:10px; font-size:13px; align-items:baseline")}>
                  <span style={css("font-size:10.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7A8AA3")}>Window</span>
                  <span style={css("color:#41506B")}>{v.sess.when} · {v.sess.expires}</span>
                </div>
              </div>
              <div style={css("display:flex; gap:9px; margin-top:16px; flex-wrap:wrap; justify-content:center")}>
                <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:11px 16px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px")}>Full-screen QR</button>
                <button style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9D6E8; background:#fff; color:#123E7C; border-radius:24px")}>Print handout</button>
                <button onClick={v.openScanInfo} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:11px 16px; border:1px solid #C9D6E8; background:#fff; color:#123E7C; border-radius:24px")}>What participants see</button>
              </div>
            </div>
          </div>

          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; padding:20px 22px")}>
            <h2 style={css("font-size:18px; font-weight:700; color:#123E7C; margin:0 0 3px")}>Live participation</h2>
            <div style={css("font-size:12.5px; color:#5A6C86; margin-bottom:14px")}>{v.sess.name} · {v.sess.status}</div>
            <div style={css("display:grid; gap:2px")}>
              <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF1F6")}><span style={css("font-size:13.5px; color:#1A1D23")}>Joined</span><span style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#123E7C")}>{v.sess.joined}</span></div>
              <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF1F6")}><span style={css("font-size:13.5px; color:#1A1D23")}>Submitted</span><span style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#123E7C")}>6</span></div>
              <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #EEF1F6")}><span style={css("font-size:13.5px; color:#1A1D23")}>Mean score so far</span><span style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#123E7C")}>71%</span></div>
              <div style={css("display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:10px 0")}><span style={css("font-size:13.5px; color:#1A1D23")}>Weakest item</span><span style={css("font-family:'IBM Plex Mono',monospace; font-size:14px; color:#9A3412")}>Q04 · 34%</span></div>
            </div>
            <button style={css("font:inherit; width:100%; font-size:13.5px; font-weight:700; cursor:pointer; padding:12px 16px; border:1.5px solid #123E7C; background:#fff; color:#123E7C; border-radius:24px; margin-top:14px")}>Close session &amp; publish results</button>
          </div>
        </div>
      </div>
    </section>
  );
}

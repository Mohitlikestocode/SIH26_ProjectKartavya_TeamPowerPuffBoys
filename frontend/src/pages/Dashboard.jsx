import { css } from "../lib/css";
import ImageSlot from "../components/ImageSlot";

export default function Dashboard({ v }) {
  return (
    <section style={css("padding:24px 0 0")}>
      <div style={css("background:#fff; border:1px solid #E3E9F2; padding:20px 24px; display:flex; justify-content:space-between; gap:20px; align-items:flex-start; flex-wrap:wrap")}>
        <div style={css("display:flex; gap:16px; align-items:flex-start")}>
          <ImageSlot shape="rounded" radius={10} style={{ width: 64, height: 76, flexShrink: 0 }} placeholder="Photo" />
          <div>
            <div style={css("font-size:12.5px; color:#7A8492")}>Welcome back</div>
            <h1 style={css("font-family:'Poppins',sans-serif; font-size:26px; font-weight:700; color:#123E7C; margin:2px 0 0")}>{v.userName}</h1>
            <div style={css("font-size:13.5px; color:#3B424E; margin-top:4px")}>Deputy Director (Statistics) · ISS 2016 · NSSO Field Operations Division, Pune</div>
            <div style={css("display:flex; gap:8px; margin-top:10px; flex-wrap:wrap")}>
              <span style={css("font-size:11.5px; font-weight:600; color:#123E7C; border:1px solid #B9CFEC; background:#E8F0FA; padding:4px 9px; border-radius:6px")}>ISS-2016-0442</span>
              <span style={css("font-size:11.5px; font-weight:600; color:#123E7C; border:1px solid #B9CFEC; background:#E8F0FA; padding:4px 9px; border-radius:6px")}>Assignment: HCES 2026 field supervision</span>
            </div>
          </div>
        </div>
        <div style={css("min-width:290px; flex:1; max-width:430px")}>
          <label htmlFor="dashTarget" style={css("display:block; font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:6px")}>Career target — defines your gap</label>
          <select id="dashTarget" onChange={v.onTargetSelect} value={v.targetIdx} style={css("width:100%; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; background:#fff; color:#1A1D23; border-radius:6px")}>
            <optgroup label="Indian Statistical Service (ISS)">
              <option value="0">Assistant Director (ISS · JTS)</option>
              <option value="1">Deputy Director (ISS · STS)</option>
              <option value="2">Director (ISS · JAG)</option>
              <option value="3">Additional Director General (ISS · SAG)</option>
            </optgroup>
            <optgroup label="Subordinate Statistical Service (SSS)">
              <option value="4">Junior Statistical Officer (SSS)</option>
              <option value="5">Senior Statistical Officer (SSS)</option>
            </optgroup>
            <optgroup label="State Directorate of Economics &amp; Statistics">
              <option value="6">Statistical Assistant (State DES)</option>
              <option value="7">Assistant Director (State DES)</option>
              <option value="8">Joint Director (State DES)</option>
              <option value="9">Director (State DES)</option>
            </optgroup>
            <optgroup label="MoSPI / NSO specialist tracks">
              <option value="10">Survey Design Specialist (NSSO)</option>
              <option value="11">National Accounts Analyst (NAD)</option>
              <option value="12">Price Statistics Analyst (CPI / WPI)</option>
              <option value="13">Data Scientist (DIID / NDAP)</option>
              <option value="14">Geospatial &amp; GIS Analyst</option>
              <option value="15">Data Quality &amp; Metadata Officer</option>
            </optgroup>
          </select>
          <div style={css("font-size:11.5px; color:#7A8492; margin-top:6px")}>{v.targetTrack} — {v.targetNote}</div>
        </div>
      </div>

      {v.notAssessed && (
        <div style={css("background:#FFF9F2; border:1px solid #F3CFA6; border-left:5px solid #F58220; padding:22px 24px; margin-top:20px; display:flex; justify-content:space-between; gap:24px; align-items:center; flex-wrap:wrap")}>
          <div style={css("flex:1; min-width:280px")}>
            <div style={css("display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7A4A12; background:#FDF4E7; border:1px solid #EFCFAC; padding:3px 8px; border-radius:6px")}>Recommendations locked</div>
            <h2 style={css("font-family:'Poppins',sans-serif; font-size:23px; font-weight:700; color:#123E7C; margin:10px 0 6px")}>Take the baseline assessment to unlock your gap map and learning path</h2>
            <p style={css("font-size:14px; line-height:1.6; color:#3B424E; margin:0; max-width:760px")}>Twenty minutes, eight items — MCQs, two job simulations and one written judgement question, all drawn from the work of {v.targetName}. You can keep taking courses without it; personalised recommendations need it, because Kartavya will not guess your competency level.</p>
          </div>
          <div style={css("display:grid; gap:9px")}>
            <button onClick={v.startAssessment} className="btn-accent" style={css("font:inherit; font-size:15px; font-weight:800; cursor:pointer; padding:14px 24px; border:0; background:#F58220; color:#3D1D00; border-radius:8px; white-space:nowrap")}>Start assessment · 20 min</button>
            <button onClick={v.goCatalogue} style={css("font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 22px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px; white-space:nowrap")}>Just browse courses</button>
          </div>
        </div>
      )}

      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr)); gap:1px; background:#DDE1E7; border:1px solid #DDE1E7; margin-top:20px")}>
        <div style={css("background:#fff; padding:16px 20px")}>
          <div style={css("font-size:11px; color:#7A8492; font-weight:600; letter-spacing:0.04em; text-transform:uppercase")}>Overall gap index</div>
          {v.assessed && (
            <>
              <div style={css("display:flex; align-items:baseline; gap:8px; margin-top:4px")}>
                <span style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#123E7C")}>{v.gapIndex}</span>
                <span style={css(`font-size:12.5px; font-weight:600; color:${v.gapBandColor}`)}>{v.gapBand}</span>
              </div>
              <div style={css("font-size:11px; color:#7A8492; margin-top:3px")}>from your assessment of {v.assessedOn}</div>
            </>
          )}
          {v.notAssessed && (
            <>
              <div style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#C9CFD8; margin-top:4px")}>—</div>
              <div style={css("font-size:11px; color:#7A8492")}>Not yet assessed</div>
            </>
          )}
        </div>
        <div style={css("background:#fff; padding:16px 20px")}>
          <div style={css("font-size:11px; color:#7A8492; font-weight:600; letter-spacing:0.04em; text-transform:uppercase")}>Learning hours · FY 26–27</div>
          <div style={css("display:flex; align-items:baseline; gap:8px; margin-top:4px")}>
            <span style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#123E7C")}>38.5</span>
            <span style={css("font-size:12.5px; color:#5A6472")}>of 60 mandated</span>
          </div>
          <div style={css("height:6px; background:#EEF0F3; margin-top:8px")}><div style={css("width:64%; height:100%; background:#1B5CB8")}></div></div>
        </div>
        <div style={css("background:#fff; padding:16px 20px")}>
          <div style={css("font-size:11px; color:#7A8492; font-weight:600; letter-spacing:0.04em; text-transform:uppercase")}>Programmes completed</div>
          <div style={css("display:flex; align-items:baseline; gap:8px; margin-top:4px")}>
            <span style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#123E7C")}>11</span>
            <span style={css("font-size:12.5px; color:#5A6472")}>7 iGOT · 4 NSSTA</span>
          </div>
          <div style={css("font-size:11px; color:#7A8492; margin-top:3px")}>4 certificates on record</div>
        </div>
        <div style={css("background:#fff; padding:16px 20px")}>
          <div style={css("font-size:11px; color:#7A8492; font-weight:600; letter-spacing:0.04em; text-transform:uppercase")}>Karma points</div>
          <div style={css("display:flex; align-items:baseline; gap:8px; margin-top:4px")}>
            <span style={css("font-family:'Poppins',sans-serif; font-size:30px; font-weight:700; color:#123E7C")}>1,240</span>
            <span style={css("font-size:12.5px; color:#166534; font-weight:600")}>▲ 180 this quarter</span>
          </div>
          <div style={css("font-size:11px; color:#7A8492; margin-top:3px")}>synced from iGOT Karmayogi</div>
        </div>
      </div>

      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr)); gap:20px; margin-top:20px")}>
        <div style={css("background:#fff; border:1px solid #E3E9F2; padding:22px 24px; min-width:0")}>
          <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:12px; flex-wrap:wrap")}>
            <div>
              <h2 style={css("font-family:'Poppins',sans-serif; font-size:20px; font-weight:700; color:#123E7C; margin:0")}>Your gap map</h2>
              <div style={css("font-size:12.5px; color:#5A6472; margin-top:3px")}>Assessed level vs. requirement for {v.targetName} · scale 0–5</div>
            </div>
            <span style={css("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.06em; border:1px solid #C9CFD8; background:#F5F6F8; padding:2px 6px; color:#5A6472")}>AI-ASSISTED</span>
          </div>
          <div style={css("position:relative")}>
            <svg viewBox="-45 0 530 420" style={css("width:100%; max-width:530px; height:auto; margin:6px auto 0; display:block")} role="img" aria-label="Four-domain competency gap map">
              <polygon points="220,60 370,210 220,360 70,210" fill="#fff" stroke="#D9DDE4"></polygon>
              <polygon points="220,90 340,210 220,330 100,210" fill="none" stroke="#E4E7EC"></polygon>
              <polygon points="220,120 310,210 220,300 130,210" fill="none" stroke="#E4E7EC"></polygon>
              <polygon points="220,150 280,210 220,270 160,210" fill="none" stroke="#E4E7EC"></polygon>
              <polygon points="220,180 250,210 220,240 190,210" fill="none" stroke="#E4E7EC"></polygon>
              <line x1="220" y1="210" x2="220" y2="60" stroke="#D9DDE4"></line>
              <line x1="220" y1="210" x2="370" y2="210" stroke="#D9DDE4"></line>
              <line x1="220" y1="210" x2="220" y2="360" stroke="#D9DDE4"></line>
              <line x1="220" y1="210" x2="70" y2="210" stroke="#D9DDE4"></line>
              <polygon points={v.reqPoints} fill="rgba(10,34,64,0.06)" stroke="#123E7C" strokeWidth="1.5" strokeDasharray="5 4"></polygon>
              <polygon points={v.curPoints} fill="rgba(31,90,166,0.16)" stroke="#1B5CB8" strokeWidth="2.5"></polygon>
              <text x="220" y="44" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#1B5CB8">Statistical</text>
              <text x="378" y="206" textAnchor="start" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#0F766E">Technical</text>
              <text x="220" y="382" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#9D2449">Digital Governance</text>
              <text x="62" y="204" textAnchor="end" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#15803D">Behavioural /</text>
              <text x="62" y="220" textAnchor="end" fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="700" fill="#15803D">Managerial</text>
            </svg>
            {v.notAssessed && (
              <div style={css("position:absolute; inset:0; background:rgba(243,244,246,0.86); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:24px")}>
                <div style={css("font-size:15px; font-weight:700; color:#123E7C; max-width:320px; line-height:1.4")}>The dashed shape is what {v.targetName} requires. Your own shape appears after the assessment.</div>
                <button onClick={v.startAssessment} style={css("font:inherit; font-size:14px; font-weight:700; cursor:pointer; padding:12px 20px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Start the assessment</button>
              </div>
            )}
          </div>
          <div style={css("display:flex; gap:18px; align-items:center; flex-wrap:wrap; padding-top:8px; border-top:1px solid #EEF0F3")}>
            <div style={css("display:flex; align-items:center; gap:7px; font-size:12.5px; color:#3B424E")}><span style={css("width:16px; height:10px; background:rgba(31,90,166,0.2); border:2px solid #1B5CB8")}></span>Your assessed level</div>
            <div style={css("display:flex; align-items:center; gap:7px; font-size:12.5px; color:#3B424E")}><span style={css("width:16px; height:10px; background:rgba(10,34,64,0.06); border:1.5px dashed #123E7C")}></span>Required for target</div>
          </div>
          {v.assessed && (
            <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); gap:12px; margin-top:16px; padding-top:16px; border-top:1px solid #EEF0F3")}>
              {v.domainCards.map((d, i) => (
                <div key={i} style={css("border:1px solid #E4E7EC; padding:11px 12px; background:#FCFCFD")}>
                  <div style={css(`font-size:12px; font-weight:700; color:${d.color}`)}>{d.label}</div>
                  <div style={css("display:flex; align-items:baseline; gap:6px; margin-top:4px")}>
                    <span style={css("font-family:'IBM Plex Mono',monospace; font-size:17px; color:#123E7C")}>{d.cur}</span>
                    <span style={css("font-size:11.5px; color:#7A8492")}>/ {d.req} required</span>
                  </div>
                  <div style={css(`font-size:11.5px; font-weight:600; color:${d.gapColor}; margin-top:3px`)}>{d.gapText}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={css("display:grid; gap:20px; align-content:start; min-width:0")}>
          {v.assessed && (
            <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
              <h2 style={css("font-family:'Poppins',sans-serif; font-size:20px; font-weight:700; color:#123E7C; margin:0")}>Priority gaps</h2>
              <div style={css("font-size:12.5px; color:#5A6472; margin:3px 0 16px")}>Sub-skills ranked by weighted impact on eligibility for {v.targetName}</div>
              <div style={css("display:grid; gap:11px")}>
                {v.gaps.map((g, i) => (
                  <div key={i} style={css("display:grid; grid-template-columns:24px 1fr; gap:11px; align-items:start; padding-bottom:11px; border-bottom:1px solid #EEF0F3")}>
                    <div style={css("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#7A8492; padding-top:2px")}>{g.rank}</div>
                    <div style={css("min-width:0")}>
                      <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:10px")}>
                        <div style={css("font-size:14.5px; font-weight:600; color:#1A1D23")}>{g.name}</div>
                        <div style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5A6472; white-space:nowrap")}>{g.readout}</div>
                      </div>
                      <div style={css("display:flex; align-items:center; gap:10px; margin-top:7px")}>
                        <span style={css(`font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:6px; color:${g.color}; background:${g.tint}; border:1px solid ${g.border}; white-space:nowrap`)}>{g.domain}</span>
                        <div style={css("flex:1; height:8px; background:#EEF0F3; border:1px solid #E4E7EC; position:relative")}>
                          <div style={css(`position:absolute; inset:0 auto 0 0; width:${g.barPct}; background:${g.color}`)}></div>
                        </div>
                        <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#7A8492; white-space:nowrap")}>gap {g.gap}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={css("display:flex; gap:9px; margin-top:16px; flex-wrap:wrap")}>
                <button onClick={v.goPath} style={css("font:inherit; flex:1; min-width:170px; font-size:14px; font-weight:700; cursor:pointer; padding:12px 16px; border:0; background:#123E7C; color:#fff; border-radius:8px")}>Open my learning path</button>
                <button onClick={v.goReview} style={css("font:inherit; font-size:14px; font-weight:600; cursor:pointer; padding:12px 16px; border:1px solid #C9CFD8; background:#fff; color:#123E7C; border-radius:8px")}>Review my answers</button>
              </div>
            </div>
          )}

          <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:12px; padding:22px 24px")}>
            <div style={css("display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap")}>
              <h2 style={css("font-family:'Poppins',sans-serif; font-size:20px; font-weight:700; color:#123E7C; margin:0 0 3px")}>Continue learning</h2>
              <button onClick={v.goCatalogue} style={css("font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:0; border:0; background:none; color:#1B5CB8; text-decoration:underline")}>Browse all courses</button>
            </div>
            <div style={css("font-size:12.5px; color:#5A6472; margin-bottom:14px")}>In progress — available with or without an assessment</div>
            <div style={css("display:grid; gap:12px")}>
              {v.inProgress.map((c, i) => (
                <div key={i} style={css("border:1px solid #DDE1E7; background:#FCFCFD; padding:14px")}>
                  <div style={css("display:flex; justify-content:space-between; gap:10px; align-items:start; flex-wrap:wrap")}>
                    <span style={css(`display:inline-flex; align-items:center; gap:6px; border:1px solid ${c.srcBorder}; background:${c.srcTint}; padding:3px 7px; border-radius:6px; font-size:10.5px; font-weight:700; color:${c.srcFg}`)}><span style={css(`width:7px;height:7px; background:${c.srcColor}`)}></span>{c.source}</span>
                    <span style={css("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5A6472")}>{c.pct}</span>
                  </div>
                  <div style={css("font-size:14.5px; font-weight:700; color:#123E7C; margin-top:8px; line-height:1.35")}>{c.title}</div>
                  <div style={css("font-size:12px; color:#7A8492; margin-top:3px")}>{c.meta}</div>
                  <div style={css("height:7px; background:#EEF0F3; border:1px solid #E4E7EC; margin-top:10px")}><div style={css(`height:100%; width:${c.pct}; background:${c.srcColor}`)}></div></div>
                  <button style={css("font:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:9px 14px; border:1px solid #123E7C; background:#fff; color:#123E7C; border-radius:8px; margin-top:12px")}>Resume</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

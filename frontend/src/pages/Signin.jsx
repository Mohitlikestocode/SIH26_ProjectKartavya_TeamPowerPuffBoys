import { css } from "../lib/css";

export default function Signin({ v }) {
  return (
    <section style={css("padding:40px 0 0")}>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:32px; align-items:start")}>
        <div style={css("background:#fff; border:1px solid #D9DDE4; border-top:3px solid #0A2240")}>
          <div style={css("padding:24px 26px 0")}>
            <h1 style={css("font-family:'Source Serif 4',serif; font-size:26px; font-weight:700; color:#0A2240; margin:0 0 4px")}>Sign in to Kartavya</h1>
            <p style={css("font-size:13.5px; color:#5A6472; margin:0 0 18px")}>Choose the credential you are signing in with. Navigation, permissions and data are scoped strictly to that role.</p>
          </div>
          <div style={css("display:flex; border-bottom:1px solid #D9DDE4; padding:0 26px; flex-wrap:wrap")}>
            <button onClick={v.tabLearner} style={css(`font:inherit; font-size:13.5px; font-weight:${v.tabLW}; cursor:pointer; white-space:nowrap; padding:11px 14px; border:0; border-bottom:3px solid ${v.tabLBorder}; background:none; color:${v.tabLFg}`)}>Officer / Learner</button>
            <button onClick={v.tabTrainer} style={css(`font:inherit; font-size:13.5px; font-weight:${v.tabTW}; cursor:pointer; white-space:nowrap; padding:11px 14px; border:0; border-bottom:3px solid ${v.tabTBorder}; background:none; color:${v.tabTFg}`)}>Trainer / Faculty</button>
            <button onClick={v.tabAdmin} style={css(`font:inherit; font-size:13.5px; font-weight:${v.tabAW}; cursor:pointer; white-space:nowrap; padding:11px 14px; border:0; border-bottom:3px solid ${v.tabABorder}; background:none; color:${v.tabAFg}`)}>Administrator</button>
          </div>
          <div style={css("padding:22px 26px 26px")}>
            <div style={css("display:flex; gap:10px; align-items:flex-start; background:#F7F9FC; border:1px solid #DDE1E7; padding:12px 14px; margin-bottom:20px")}>
              <span style={css(`width:26px; height:26px; border-radius:2px; background:${v.loginRoleColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0`)}>{v.loginRoleInitial}</span>
              <div>
                <div style={css("font-size:13.5px; font-weight:700; color:#0A2240")}>{v.loginRoleTitle}</div>
                <div style={css("font-size:12.5px; color:#5A6472; line-height:1.5; margin-top:2px")}>{v.loginRoleNote}</div>
              </div>
            </div>
            <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin-bottom:6px")}>{v.loginIdLabel}</label>
            <input type="text" value={v.loginIdValue} readOnly style={css("width:100%; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; background:#fff; color:#1A1D23; border-radius:2px")} />
            <label style={css("display:block; font-size:12.5px; font-weight:600; color:#3B424E; margin:14px 0 6px")}>Password</label>
            <input type="password" value="demo-password" readOnly style={css("width:100%; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; background:#fff; color:#1A1D23; border-radius:2px")} />
            <div style={css("display:flex; align-items:center; gap:12px; margin-top:14px; flex-wrap:wrap")}>
              <div style={css("font-family:'IBM Plex Mono',monospace; font-size:16px; letter-spacing:0.22em; color:#0A2240; background:repeating-linear-gradient(135deg,#EDEFF3 0 6px,#F7F8FA 6px 12px); border:1px solid #C9CFD8; padding:9px 14px")}>7K4Q9</div>
              <input type="text" placeholder="Enter captcha" style={css("flex:1; min-width:140px; font:inherit; font-size:14px; padding:11px 12px; border:1px solid #C9CFD8; border-radius:2px")} />
            </div>
            <button onClick={v.doSignIn} style={css("font:inherit; width:100%; font-size:15px; font-weight:700; cursor:pointer; padding:14px 16px; border:0; background:#0A2240; color:#fff; border-radius:3px; margin-top:18px")}>Sign in</button>
            <div style={css("display:flex; align-items:center; gap:12px; margin:16px 0")}>
              <div style={css("flex:1; height:1px; background:#E4E7EC")}></div><span style={css("font-size:11.5px; color:#7A8492")}>or</span><div style={css("flex:1; height:1px; background:#E4E7EC")}></div>
            </div>
            <button onClick={v.doSignIn} style={css("font:inherit; width:100%; font-size:14.5px; font-weight:700; cursor:pointer; padding:13px 16px; border:1px solid #0A2240; background:#fff; color:#0A2240; border-radius:3px")}>Continue with Parichay Single Sign-On</button>
            <div style={css("display:flex; gap:16px; margin-top:14px; font-size:12.5px; flex-wrap:wrap")}>
              <a href="#main">Forgot password</a><a href="#main">First-time registration</a><a href="#main">Help desk: 1800-11-4155</a>
            </div>
          </div>
        </div>
        <div style={css("display:grid; gap:20px")}>
          <div style={css("background:#fff; border:1px solid #D9DDE4; padding:22px 24px")}>
            <h2 style={css("font-family:'Source Serif 4',serif; font-size:19px; font-weight:700; color:#0A2240; margin:0 0 12px")}>What each role can do</h2>
            <div style={css("display:grid; gap:12px")}>
              <div style={css("display:grid; grid-template-columns:28px 1fr; gap:12px; padding-bottom:12px; border-bottom:1px solid #EEF0F3")}>
                <span style={css("width:28px; height:28px; border-radius:2px; background:#1F5AA6; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700")}>O</span>
                <div>
                  <div style={css("font-size:14px; font-weight:700; color:#0A2240")}>Officer / Learner</div>
                  <div style={css("font-size:12.5px; color:#5A6472; line-height:1.55; margin-top:2px")}>Browse and take courses, sit assessments, see your own gap map and learning path, join trainer sessions. No authoring, no org-wide data.</div>
                </div>
              </div>
              <div style={css("display:grid; grid-template-columns:28px 1fr; gap:12px; padding-bottom:12px; border-bottom:1px solid #EEF0F3")}>
                <span style={css("width:28px; height:28px; border-radius:2px; background:#6D28D9; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700")}>T</span>
                <div>
                  <div style={css("font-size:14px; font-weight:700; color:#0A2240")}>Trainer / Faculty</div>
                  <div style={css("font-size:12.5px; color:#5A6472; line-height:1.55; margin-top:2px")}>Upload material, generate and approve assessment items, run QR sessions, maintain the question bank. Cannot see officers' personal gap maps.</div>
                </div>
              </div>
              <div style={css("display:grid; grid-template-columns:28px 1fr; gap:12px")}>
                <span style={css("width:28px; height:28px; border-radius:2px; background:#B45309; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700")}>A</span>
                <div>
                  <div style={css("font-size:14px; font-weight:700; color:#0A2240")}>Administrator (DIID / HR)</div>
                  <div style={css("font-size:12.5px; color:#5A6472; line-height:1.55; margin-top:2px")}>Cohort heatmaps, training effectiveness, skill forecasts and reports. Sees aggregates, never individual answer sheets.</div>
                </div>
              </div>
            </div>
          </div>
          <div style={css("background:#EEF1F6; border:1px solid #DDE1E7; padding:18px 20px")}>
            <div style={css("font-size:10.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#7A8492; margin-bottom:8px")}>Security</div>
            <div style={css("font-size:12.5px; color:#3B424E; line-height:1.6")}>Role-based access control with Parichay SSO; sessions expire after 45 minutes of inactivity. Assessment responses are stored against your service ID and are visible in identifiable form only to you. Compliant with GIGW 3.0 and the DPDP Act, 2023.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

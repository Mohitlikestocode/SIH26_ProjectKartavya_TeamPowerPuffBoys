import { css } from "../lib/css";
import ImageSlot from "../components/ImageSlot";

export default function Signin({ v }) {
  return (
    <section style={css("margin:0 -32px")}>
      <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))")}>
        <div style={css("background:#123E7C; padding:44px 40px 48px; position:relative; overflow:hidden")}>
          <div style={css("position:absolute; top:-40px; right:-30px; width:220px; height:220px; border-radius:50%; background:#1B5CB8; opacity:0.55")}></div>
          <div style={css("position:absolute; bottom:-60px; left:-40px; width:200px; height:200px; border-radius:50%; background:#F58220; opacity:0.16")}></div>
          <div style={css("position:relative; z-index:1; max-width:560px")}>
            <div style={css("font-size:15px; font-weight:700; color:#F58220")}>Welcome to Kartavya</div>
            <h1 style={css("font-size:42px; font-weight:800; color:#fff; margin:6px 0 4px; line-height:1.1")}>How to sign in<span style={css("display:block; width:120px; height:5px; background:#F58220; margin-top:10px")}></span></h1>
            <div style={css("display:grid; gap:22px; margin-top:30px")}>
              <div style={css("display:grid; grid-template-columns:44px 1fr; gap:16px; align-items:start")}>
                <div style={css("width:44px; height:44px; border-radius:50%; background:#F58220; color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700")}>1</div>
                <div>
                  <div style={css("font-size:17px; font-weight:700; color:#F9C089")}>If you already use iGOT Karmayogi</div>
                  <div style={css("display:grid; gap:7px; margin-top:8px; font-size:14px; color:#DCE8F7; line-height:1.6")}>
                    <div>Sign in with the same registered email or employee ID.</div>
                    <div>Your cadre, designation and posting are fetched automatically.</div>
                    <div>Completions and Karma Points carry over on first login.</div>
                  </div>
                </div>
              </div>
              <div style={css("display:grid; grid-template-columns:44px 1fr; gap:16px; align-items:start")}>
                <div style={css("width:44px; height:44px; border-radius:50%; background:#F58220; color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700")}>2</div>
                <div>
                  <div style={css("font-size:17px; font-weight:700; color:#F9C089")}>If you are signing in with Parichay</div>
                  <div style={css("display:grid; gap:7px; margin-top:8px; font-size:14px; color:#DCE8F7; line-height:1.6")}>
                    <div>Choose <strong style={css("color:#fff")}>Continue with Parichay</strong> and enter the OTP sent to your registered mobile.</div>
                    <div>Allow both the mobile number and primary email when prompted.</div>
                    <div>Trouble? Clear the browser cache or use a private window.</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={css("margin-top:32px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.22); border-radius:14px; padding:14px")}>
              <ImageSlot shape="rounded" radius={10} style={{ width: "100%", height: 190 }} placeholder="Drop an illustration or classroom photo" />
            </div>
            <div style={css("font-size:12.5px; color:#B7CDEB; margin-top:16px; line-height:1.6")}>Help desk 1800-11-4155 · Mon–Fri, 9:00–18:00 IST. Role-based access control; sessions expire after 45 minutes idle. GIGW 3.0 and DPDP Act, 2023 compliant.</div>
          </div>
        </div>

        <div style={css("background:#fff; padding:44px 40px 48px; display:flex; justify-content:center")}>
          <div style={css("width:100%; max-width:440px")}>
            <div style={css("display:flex; align-items:center; gap:13px; margin-bottom:22px")}>
              <span style={css("width:52px; height:52px; border-radius:50%; background:#123E7C; border:3px solid #F58220; display:flex; align-items:center; justify-content:center")}>
                <span style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:25px; font-weight:700; color:#fff; line-height:1; margin-top:2px")}>क</span>
              </span>
              <div>
                <div style={css("font-size:24px; font-weight:700; color:#123E7C; line-height:1.1")}>Kartavya</div>
                <div style={css("font-family:'Noto Sans Devanagari',sans-serif; font-size:12px; font-weight:600; color:#C25E10")}>कर्तव्य · लोकहितं मम करणीयम्</div>
              </div>
            </div>

            <div style={css("display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap")}>
              <button onClick={v.tabLearner} style={css(`font:inherit; font-size:13px; font-weight:${v.tabLW}; cursor:pointer; white-space:nowrap; padding:9px 15px; border:1.5px solid ${v.tabLBorder}; background:${v.tabLBg}; color:${v.tabLFg}; border-radius:24px`)}>Officer</button>
              <button onClick={v.tabTrainer} style={css(`font:inherit; font-size:13px; font-weight:${v.tabTW}; cursor:pointer; white-space:nowrap; padding:9px 15px; border:1.5px solid ${v.tabTBorder}; background:${v.tabTBg}; color:${v.tabTFg}; border-radius:24px`)}>Trainer</button>
              <button onClick={v.tabAdmin} style={css(`font:inherit; font-size:13px; font-weight:${v.tabAW}; cursor:pointer; white-space:nowrap; padding:9px 15px; border:1.5px solid ${v.tabABorder}; background:${v.tabABg}; color:${v.tabAFg}; border-radius:24px`)}>Administrator</button>
            </div>

            <div style={css("display:flex; gap:10px; align-items:flex-start; background:#F6FAFF; border:1px solid #B9CFEC; border-radius:12px; padding:13px 15px; margin-bottom:20px")}>
              <span style={css(`width:28px; height:28px; border-radius:8px; background:${v.loginRoleColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0`)}>{v.loginRoleInitial}</span>
              <div>
                <div style={css("font-size:13.5px; font-weight:700; color:#123E7C")}>{v.loginRoleTitle}</div>
                <div style={css("font-size:12.5px; color:#5A6C86; line-height:1.5; margin-top:2px")}>{v.loginRoleNote}</div>
              </div>
            </div>

            <label style={css("display:block; font-size:13px; font-weight:600; color:#1B5CB8; margin-bottom:6px")}>{v.loginIdLabel}</label>
            <input type="text" value={v.loginIdValue} readOnly style={css("width:100%; font:inherit; font-size:14.5px; padding:13px 14px; border:1.5px solid #1B5CB8; background:#fff; color:#1A1D23; border-radius:8px")} />
            <div style={css("display:flex; justify-content:flex-end; margin-top:6px")}><a href="#main" style={css("font-size:12.5px; font-weight:600")}>Forgot password?</a></div>
            <label style={css("display:block; font-size:13px; font-weight:600; color:#1B5CB8; margin:12px 0 6px")}>Password</label>
            <input type="password" value="demo-password" readOnly style={css("width:100%; font:inherit; font-size:14.5px; padding:13px 14px; border:1px solid #C9D6E8; background:#fff; color:#1A1D23; border-radius:8px")} />

            <div style={css("display:flex; align-items:center; gap:12px; margin-top:16px; padding:12px 14px; border:1px solid #DDE3EC; border-radius:8px; background:#FBFCFE; flex-wrap:wrap")}>
              <span style={css("width:22px; height:22px; border:2px solid #9FB3CC; border-radius:4px; background:#fff; flex-shrink:0")}></span>
              <span style={css("font-size:13.5px; color:#41506B; flex:1; min-width:120px")}>I am not a robot</span>
              <span style={css("font-family:'IBM Plex Mono',monospace; font-size:15px; letter-spacing:0.2em; color:#123E7C; background:repeating-linear-gradient(135deg,#EDF1F7 0 6px,#F7F9FC 6px 12px); border:1px solid #C9D6E8; padding:7px 11px; border-radius:6px")}>7K4Q9</span>
            </div>

            <button onClick={v.doSignIn} className="btn-login-primary" style={css("font:inherit; width:100%; font-size:15.5px; font-weight:700; cursor:pointer; padding:15px 16px; border:0; background:#1B5CB8; color:#fff; border-radius:8px; margin-top:18px")}>Login</button>
            <div style={css("display:flex; align-items:center; gap:12px; margin:18px 0")}>
              <div style={css("flex:1; height:1px; background:#E3E9F2")}></div><span style={css("font-size:12px; color:#7A8AA3")}>or</span><div style={css("flex:1; height:1px; background:#E3E9F2")}></div>
            </div>
            <button onClick={v.doSignIn} className="btn-parichay" style={css("font:inherit; width:100%; font-size:14.5px; font-weight:700; cursor:pointer; padding:14px 16px; border:1.5px solid #F58220; background:#fff; color:#C25E10; border-radius:8px")}>Continue with Parichay Single Sign-On</button>
            <div style={css("display:flex; gap:16px; margin-top:16px; font-size:12.5px; flex-wrap:wrap")}>
              <a href="#main">First-time registration</a><a href="#main">Help centre</a><a href="#main">Accessibility statement</a>
            </div>
            <div style={css("margin-top:22px; border-top:1px solid #EEF1F6; padding-top:16px; font-size:12px; color:#7A8AA3; line-height:1.6")}>Officers see only their own profile. Trainers author and review items. Administrators see cohort aggregates, never individual answer sheets.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

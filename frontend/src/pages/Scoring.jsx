import { css } from "../lib/css";

export default function Scoring({ v }) {
  return (
    <section style={css("max-width:640px; margin:0 auto; padding:96px 0 120px; text-align:center")}>
      <div style={css("width:56px; height:56px; margin:0 auto 20px; border:3px solid #E4E7EC; border-top-color:#123E7C; border-radius:50%")}></div>
      <h1 style={css("font-family:'Poppins',sans-serif; font-size:26px; font-weight:700; color:#123E7C; margin:0 0 8px")}>Evaluating your responses</h1>
      <p style={css("font-size:14.5px; color:#5A6472; line-height:1.6; margin:0")}>Scoring {v.itemTotal} items across four competency domains, grading your written response, and matching your gaps against the iGOT and NSSTA/TPAC catalogues.</p>
    </section>
  );
}

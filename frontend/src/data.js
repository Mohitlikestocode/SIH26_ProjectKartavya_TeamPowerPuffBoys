export const D = ["Statistical", "Technical", "Digital Governance", "Behavioural"];

export const DOM = {
  Statistical: { color: "#0E7490", tint: "#E6F4F7", border: "#B7DDE5", label: "Statistical" },
  Technical: { color: "#6D28D9", tint: "#F2EDFB", border: "#CDBDEC", label: "Technical" },
  "Digital Governance": { color: "#B45309", tint: "#FDF0E4", border: "#EFCFAC", label: "Digital Gov." },
  Behavioural: { color: "#15803D", tint: "#EBF5EE", border: "#BBDEC7", label: "Behavioural" },
};

export const SRC = {
  iGOT: { source: "iGOT Karmayogi", srcColor: "#1F5AA6", srcTint: "#EAF0F8", srcBorder: "#B9CCE5", srcFg: "#14396B", cta: "Enrol on iGOT" },
  NSSTA: { source: "NSSTA / TPAC", srcColor: "#6D28D9", srcTint: "#F2EDFB", srcBorder: "#CDBDEC", srcFg: "#4C1D95", cta: "Apply for intake" },
};

export const LOGIN = {
  learner: { title: "Officer / Learner", initial: "O", color: "#1F5AA6", idLabel: "Employee ID or iGOT-registered email", idValue: "ISS-2016-0442", note: "Your competency profile, courses, learning path and assessments.", name: "Dr. Anandi R. Kulkarni", desig: "Deputy Director (Statistics), NSSO Pune", initials: "AK", roleLabel: "Officer", tint: "#EAF0F8", fg: "#14396B", border: "#B9CCE5" },
  trainer: { title: "Trainer / Faculty", initial: "T", color: "#6D28D9", idLabel: "NSSTA faculty ID", idValue: "NSSTA-FAC-118", note: "Upload material, generate and approve items, run QR sessions.", name: "Prof. S. Venkatesan", desig: "Faculty, NSSTA Greater Noida", initials: "SV", roleLabel: "Trainer", tint: "#F2EDFB", fg: "#4C1D95", border: "#CDBDEC" },
  admin: { title: "Administrator (DIID / HR)", initial: "A", color: "#B45309", idLabel: "DIID administrator ID", idValue: "DIID-ADM-004", note: "Workforce analytics, cohort heatmaps and reports. Aggregates only.", name: "Smt. R. Deshpande", desig: "Director, DIID Workforce Planning", initials: "RD", roleLabel: "Administrator", tint: "#FDF0E4", fg: "#9A3412", border: "#EFCFAC" },
};

export const TARGETS = [
  { name: "Assistant Director (ISS · JTS)", track: "Indian Statistical Service · entry grade", req: [3.5, 3.2, 3.2, 3.4], note: "Field and desk work on large-scale surveys; supervises Statistical Investigators and validates schedule-level data." },
  { name: "Deputy Director (ISS · STS)", track: "Indian Statistical Service · senior time scale", req: [4.0, 3.6, 3.6, 3.8], note: "Owns a survey round or subject division; accountable for estimation, release quality and field supervision." },
  { name: "Director (ISS · JAG)", track: "Indian Statistical Service · junior administrative grade", req: [4.5, 4.0, 4.2, 4.6], note: "Heads a division; signs off methodology, release calendar and inter-ministerial data positions." },
  { name: "Additional Director General (ISS · SAG)", track: "Indian Statistical Service · senior administrative grade", req: [4.7, 4.0, 4.5, 4.8], note: "Sets statistical policy for a wing; represents MoSPI before Parliament committees and international bodies." },
  { name: "Junior Statistical Officer (SSS)", track: "Subordinate Statistical Service", req: [3.0, 2.8, 2.8, 2.8], note: "Primary data collection, schedule scrutiny and first-level tabulation." },
  { name: "Senior Statistical Officer (SSS)", track: "Subordinate Statistical Service", req: [3.6, 3.4, 3.2, 3.2], note: "Supervises field teams, handles data processing and prepares tabulation plans." },
  { name: "Statistical Assistant (State DES)", track: "State Directorate of Economics & Statistics", req: [3.2, 3.0, 3.0, 3.0], note: "Maintains state-level series, district returns and administrative data compilations." },
  { name: "Assistant Director (State DES)", track: "State Directorate of Economics & Statistics", req: [3.6, 3.2, 3.4, 3.4], note: "Runs state surveys and district statistical handbooks; interfaces with line departments." },
  { name: "Joint Director (State DES)", track: "State Directorate of Economics & Statistics", req: [4.2, 3.4, 3.8, 4.4], note: "Coordinates the state statistical system, GSDP estimation and central scheme reporting." },
  { name: "Director (State DES)", track: "State Directorate of Economics & Statistics", req: [4.5, 3.6, 4.0, 4.7], note: "Heads the state DES; answerable for state accounts, data governance and capacity building." },
  { name: "Survey Design Specialist (NSSO)", track: "MoSPI / NSO specialist track", req: [4.7, 3.8, 3.6, 3.8], note: "Designs sampling frames, allocation and estimation procedures for national surveys." },
  { name: "National Accounts Analyst (NAD)", track: "MoSPI / NSO specialist track", req: [4.6, 3.6, 3.4, 3.6], note: "Compiles GDP/GVA aggregates, deflators and supply-use tables." },
  { name: "Price Statistics Analyst (CPI / WPI)", track: "MoSPI / NSO specialist track", req: [4.4, 3.6, 3.4, 3.4], note: "Maintains price collection, index compilation and base-revision work." },
  { name: "Data Scientist (DIID / NDAP)", track: "MoSPI / NSO specialist track", req: [4.0, 4.8, 4.6, 3.6], note: "Builds pipelines, ML models and APIs on NDAP; owns data engineering standards." },
  { name: "Geospatial & GIS Analyst", track: "MoSPI / NSO specialist track", req: [4.0, 4.4, 4.0, 3.4], note: "Spatial sampling frames, geo-tagging of units and map-based dissemination." },
  { name: "Data Quality & Metadata Officer", track: "MoSPI / NSO specialist track", req: [4.3, 3.8, 4.4, 3.6], note: "Runs quality assurance frameworks, metadata standards and SDG indicator reporting." },
];

export const SUBS = {
  Statistical: ["Sampling methodology", "Survey estimation & weighting", "National accounts", "Price & index statistics", "Time-series & forecasting", "Data quality frameworks"],
  Technical: ["Python for data analysis", "R & statistical computing", "SQL & data warehousing", "GIS & spatial statistics", "AI / ML foundations", "Cloud & APIs"],
  "Digital Governance": ["NDAP & data stewardship", "Cyber hygiene", "DPDP & data privacy", "Open data & metadata standards", "e-Office & digital workflow"],
  Behavioural: ["Team leadership", "Stakeholder communication", "Briefing & public speaking", "Project management", "Ethics & integrity"],
};

export const SUBOFF = {
  Statistical: [-0.9, 0.3, 0.2, -0.2, -0.5, 0.4],
  Technical: [-0.5, 0.1, 0.3, -0.7, -0.9, -0.1],
  "Digital Governance": [-0.6, 0.4, -0.3, -0.1, 0.6],
  Behavioural: [0.2, 0.5, -0.6, -0.2, 0.4],
};

export const ITEMS = [
  { id: "q1", domain: "Statistical", skill: "Sampling methodology", kind: "Multiple choice",
    stem: "In a stratified random sample where stratum variances differ substantially, which allocation minimises the variance of the overall estimate for a fixed total sample size?",
    options: [["A", "Equal allocation across all strata", 1.5], ["B", "Proportional allocation by stratum size", 3.0], ["C", "Neyman allocation using stratum size and standard deviation", 4.7], ["D", "Allocation proportional to the square of stratum size", 1.0]],
    explain: "Neyman (optimum) allocation weights each stratum by N_h·S_h, so strata that are both large and heterogeneous receive more sample. Proportional allocation ignores variance and is only optimal when stratum variances are equal." },
  { id: "q2", domain: "Statistical", skill: "Survey estimation & weighting", kind: "Job simulation",
    context: "You are supervising an HCES round. A field team reports 14% non-response, concentrated in high-income urban households. The tabulation deadline is in nine days.",
    stem: "What is your first action?",
    options: [["A", "Publish as-is and add a footnote on non-response", 1.2], ["B", "Substitute the nearest available household in each case", 2.0], ["C", "Apply non-response adjustment weights calibrated to auxiliary income data, and document the method", 4.6], ["D", "Extend fieldwork indefinitely until response exceeds 95%", 2.4]],
    explain: "Non-response concentrated in one income group is systematic, not random, so it biases the mean downward. Calibrated adjustment weights with documented methodology is the accepted remedy; nearest-neighbour substitution imports its own bias." },
  { id: "q3", domain: "Technical", skill: "Python for data analysis", kind: "Multiple choice",
    stem: "Which approach correctly computes a weighted mean of household expenditure using survey weights in pandas?",
    options: [["A", "df.groupby('state').mean()", 1.5], ["B", "numpy.average(df.exp, weights=df.wt)", 4.5], ["C", "df.exp.mean() * df.wt.mean()", 1.0], ["D", "df.describe() and read the mean row", 1.0]],
    explain: "Only numpy.average with an explicit weights argument produces Σ(w·x)/Σw. The other options compute unweighted means, which are not valid estimators under a complex design." },
  { id: "q4", domain: "Technical", skill: "SQL & data warehousing", kind: "Multiple choice",
    stem: "A 40-million-row schedule table is queried daily by state and survey round. Which single change most improves query time?",
    options: [["A", "Add a composite index on (state_code, round_id)", 4.4], ["B", "Increase the client fetch size", 2.0], ["C", "Convert the table to CSV extracts per state", 1.4], ["D", "Run VACUUM every hour", 1.8]],
    explain: "A composite index on the two filter columns turns a full scan into an index range scan. Fetch size affects transfer, not selection; per-state CSVs destroy queryability." },
  { id: "q5", domain: "Digital Governance", skill: "DPDP & data privacy", kind: "Multiple choice",
    stem: "A state department requests unit-level survey records including respondent names for scheme targeting. Under the DPDP Act and MoSPI confidentiality policy, what is the correct response?",
    options: [["A", "Share the records — it is a government-to-government transfer", 1.0], ["B", "Refuse, and offer aggregated or de-identified tabulations with a documented purpose check", 4.7], ["C", "Share after removing only the name column", 2.2], ["D", "Escalate to the Minister's office for a decision", 2.0]],
    explain: "Data collected under a statistical guarantee of confidentiality cannot be repurposed for individual administrative action. Removing names alone leaves re-identifiable records; the lawful route is aggregated or properly de-identified output." },
  { id: "q6", domain: "Digital Governance", skill: "NDAP & data stewardship", kind: "Multiple choice",
    stem: "Which metadata element is indispensable for a dataset published on NDAP to be reusable across ministries?",
    options: [["A", "File size and download count", 1.2], ["B", "A machine-readable schema with variable definitions, units and reference period", 4.6], ["C", "The name of the officer who uploaded it", 1.4], ["D", "A PDF report summarising the findings", 2.0]],
    explain: "Reuse depends on a machine-readable schema: variable definitions, units, classifications and reference period. Everything else is useful context but does not make the data interpretable." },
  { id: "q7", domain: "Behavioural", skill: "Stakeholder communication", kind: "Written judgement", essay: true,
    context: "A State DES publicly disputes an NSO estimate for their state two days before a national release, and a journalist has asked you for a comment.",
    stem: "Set out how you would handle this — sequence your actions, say who you would involve, and explain what you would and would not say publicly.",
    explain: "A strong answer verifies the estimate internally first, involves the release-calendar authority and the state DES before the media, distinguishes methodology from politics, and commits to publishing the reconciliation rather than debating figures in the press." },
  { id: "q8", domain: "Behavioural", skill: "Project management", kind: "Job simulation",
    context: "Three weeks before a scheduled release, your data-processing vendor reports a defect that will delay clean tabulations by ten days.",
    stem: "What do you do?",
    options: [["A", "Hold the release date and publish provisional figures without revision flags", 1.5], ["B", "Slip the date quietly and inform users afterwards", 1.0], ["C", "Notify the release-calendar committee immediately, agree a revised date, publish an advance revision notice", 4.6], ["D", "Re-run the tabulation in-house overnight without validating the vendor's fix", 2.2]],
    explain: "Advance-release-calendar discipline requires that any change be notified before the fact, with a stated reason. Unflagged provisional figures and silent slippage both damage credibility more than a documented delay." },
];

const P = (src, title, duration, format, match) => ({ src, title, duration, format, match });
export const SKILLPATH = {
  "Sampling methodology": [P("iGOT", "Foundations of Survey Sampling", "8 hours", "Self-paced online", "88%"), P("NSSTA", "Advanced Sampling Techniques for Large-Scale Household Surveys", "2 weeks", "Residential · Greater Noida", "96%"), P("NSSTA", "TPAC Workshop: Non-response, Weighting & Calibration", "3 days", "In-person workshop", "84%")],
  "Survey estimation & weighting": [P("iGOT", "Estimation Procedures in Sample Surveys", "7 hours", "Self-paced online", "87%"), P("NSSTA", "Weighting, Calibration & Variance Estimation", "1 week", "Residential · lab-based", "93%"), P("NSSTA", "Small Area Estimation for District-Level Indicators", "4 days", "Residential · Greater Noida", "80%")],
  "National accounts": [P("iGOT", "Introduction to National Accounts Statistics", "9 hours", "Self-paced online", "86%"), P("NSSTA", "National Accounts Compilation — SNA 2008 Framework", "2 weeks", "Residential · Greater Noida", "94%"), P("NSSTA", "Supply-Use Tables & Deflator Construction", "5 days", "In-person workshop", "81%")],
  "Price & index statistics": [P("iGOT", "Index Numbers: Concepts and Construction", "6 hours", "Self-paced online", "85%"), P("NSSTA", "CPI & WPI Compilation Practices", "1 week", "Residential · Greater Noida", "92%"), P("NSSTA", "Base Revision & Weighting Diagram Workshop", "3 days", "In-person workshop", "79%")],
  "Time-series & forecasting": [P("iGOT", "Time-Series Analysis for Official Statistics", "10 hours", "Self-paced online", "89%"), P("NSSTA", "Seasonal Adjustment & X-13 in Practice", "4 days", "Residential · lab-based", "90%"), P("NSSTA", "Nowcasting Economic Indicators", "3 days", "In-person workshop", "78%")],
  "Data quality frameworks": [P("iGOT", "Data Quality Assurance Framework Essentials", "6 hours", "Self-paced online", "88%"), P("NSSTA", "Quality Assurance in Survey Operations", "5 days", "Residential · Greater Noida", "91%"), P("NSSTA", "Audit & Certification of Statistical Products", "3 days", "In-person workshop", "77%")],
  "Python for data analysis": [P("iGOT", "Python for Official Statistics — Levels 1 to 3", "24 hours", "Self-paced online", "94%"), P("iGOT", "Pandas & Data Wrangling for Survey Datasets", "12 hours", "Self-paced online", "88%"), P("NSSTA", "Computational Statistics Lab (Python)", "1 week", "Residential · lab-based", "82%")],
  "R & statistical computing": [P("iGOT", "R for Statistical Analysis — Foundation", "10 hours", "Self-paced online", "87%"), P("iGOT", "Survey Analysis in R (survey package)", "8 hours", "Self-paced online", "85%"), P("NSSTA", "Reproducible Reporting with R Markdown", "4 days", "Residential · lab-based", "79%")],
  "SQL & data warehousing": [P("iGOT", "SQL for Government Data Analysts", "9 hours", "Self-paced online", "90%"), P("iGOT", "Query Optimisation & Indexing for Large Tables", "6 hours", "Self-paced online", "84%"), P("NSSTA", "Statistical Data Warehouse Design", "4 days", "Residential · lab-based", "80%")],
  "GIS & spatial statistics": [P("iGOT", "Geospatial Analysis for Official Statistics", "11 hours", "Self-paced online", "92%"), P("NSSTA", "GIS & Spatial Sampling Lab (QGIS)", "1 week", "Residential · lab-based", "95%"), P("NSSTA", "Geo-tagging of Survey Units & Map-Based Dissemination", "3 days", "In-person workshop", "81%")],
  "AI / ML foundations": [P("iGOT", "Artificial Intelligence for Public Administrators", "10 hours", "Self-paced online", "90%"), P("NSSTA", "Machine Learning Applications in Official Statistics", "5 days", "Residential · Delhi", "93%"), P("iGOT", "Responsible AI & Algorithmic Accountability in Government", "6 hours", "Self-paced online", "78%")],
  "Cloud & APIs": [P("iGOT", "Government Cloud Foundations (MeghRaj)", "7 hours", "Self-paced online", "86%"), P("iGOT", "Building & Consuming Data APIs", "8 hours", "Self-paced online", "84%"), P("NSSTA", "Cloud-Hosted Statistical Pipelines", "4 days", "Virtual lab", "77%")],
  "NDAP & data stewardship": [P("iGOT", "Data Stewardship & Metadata Standards on NDAP", "10 hours", "Self-paced online", "91%"), P("NSSTA", "Publishing Statistical Datasets on NDAP", "3 days", "In-person workshop", "89%"), P("NSSTA", "Data Governance & Quality Assurance Frameworks", "4 days", "Residential · Delhi", "80%")],
  "Cyber hygiene": [P("iGOT", "Cyber Hygiene for Government Officials", "5 hours", "Self-paced online", "88%"), P("iGOT", "Secure Handling of Survey Microdata", "6 hours", "Self-paced online", "85%"), P("NSSTA", "Information Security in Statistical Offices", "3 days", "In-person workshop", "76%")],
  "DPDP & data privacy": [P("iGOT", "Data Privacy & the DPDP Act for Government Officials", "6 hours", "Self-paced online", "93%"), P("iGOT", "Statistical Disclosure Control & De-identification", "8 hours", "Self-paced online", "87%"), P("NSSTA", "Confidentiality Policy & Microdata Release Protocols", "3 days", "Residential · Greater Noida", "82%")],
  "Open data & metadata standards": [P("iGOT", "Open Data Standards & DCAT Essentials", "6 hours", "Self-paced online", "87%"), P("iGOT", "SDMX for Statistical Data Exchange", "9 hours", "Self-paced online", "85%"), P("NSSTA", "Metadata Documentation for National Surveys", "4 days", "In-person workshop", "79%")],
  "e-Office & digital workflow": [P("iGOT", "e-Office and Digital File Management", "4 hours", "Self-paced online", "84%"), P("iGOT", "Digital Signatures & Secure Approvals", "3 hours", "Self-paced online", "81%"), P("NSSTA", "Workflow Digitisation in Statistical Offices", "2 days", "In-person workshop", "74%")],
  "Team leadership": [P("iGOT", "Leading Teams in Public Systems", "8 hours", "Self-paced online", "88%"), P("NSSTA", "Leadership for Statistical Officers", "1 week", "Residential · Greater Noida", "91%"), P("NSSTA", "Managing Field Teams Under Pressure", "3 days", "In-person workshop", "78%")],
  "Stakeholder communication": [P("iGOT", "Communicating Statistics to Non-Specialists", "5 hours", "Self-paced online", "89%"), P("NSSTA", "Handling Data Disputes with States & Media", "3 days", "In-person workshop", "90%"), P("iGOT", "Writing Policy Briefs from Statistical Evidence", "7 hours", "Self-paced online", "80%")],
  "Briefing & public speaking": [P("iGOT", "Effective Briefing for Senior Officials", "5 hours", "Self-paced online", "87%"), P("NSSTA", "Presenting Statistical Findings — Practicum", "3 days", "In-person workshop", "92%"), P("NSSTA", "Parliamentary & Committee Briefing Preparation", "2 days", "In-person workshop", "79%")],
  "Project management": [P("iGOT", "Project Management in Public Systems", "14 hours", "Self-paced online", "89%"), P("NSSTA", "Managing a Survey Round End-to-End", "1 week", "Residential · Greater Noida", "93%"), P("iGOT", "Risk & Release-Calendar Management", "6 hours", "Self-paced online", "81%")],
  "Ethics & integrity": [P("iGOT", "Ethics and Integrity in Public Service", "5 hours", "Self-paced online", "86%"), P("iGOT", "Fundamental Principles of Official Statistics", "4 hours", "Self-paced online", "88%"), P("NSSTA", "Professional Independence in Statistical Practice", "2 days", "In-person workshop", "77%")],
};

export const STAGE_META = [
  { phase: "Stage 1", title: "Foundation", note: "Build the underlying concept before anything applied. Self-paced, start this week.", gate: "No prerequisite" },
  { phase: "Stage 2", title: "Application", note: "Apply the concept to real survey work, with a residential or lab component.", gate: "Begins after Stage 1 is complete" },
  { phase: "Stage 3", title: "Specialisation", note: "Consolidation and role-specific depth; counts toward the TPAC in-service requirement.", gate: "Requires the Stage 2 completion certificate" },
];

export const CATALOGUE = [
  { title: "Foundations of Survey Sampling", src: "iGOT", domain: "Statistical", skill: "Sampling methodology", duration: "8 hours", format: "Self-paced online", level: "Foundation", meta: "16 languages · 4.6 ★ (2,140 officials)" },
  { title: "Advanced Sampling Techniques for Large-Scale Household Surveys", src: "NSSTA", domain: "Statistical", skill: "Sampling methodology", duration: "2 weeks", format: "Residential · Greater Noida", level: "Advanced", meta: "Next intake 12 Oct 2026 · 9 of 30 seats left" },
  { title: "Estimation Procedures in Sample Surveys", src: "iGOT", domain: "Statistical", skill: "Survey estimation & weighting", duration: "7 hours", format: "Self-paced online", level: "Intermediate", meta: "Hindi & English · certificate on completion" },
  { title: "National Accounts Compilation — SNA 2008 Framework", src: "NSSTA", domain: "Statistical", skill: "National accounts", duration: "2 weeks", format: "Residential · Greater Noida", level: "Advanced", meta: "TPAC-approved · intake 4 Jan 2027" },
  { title: "CPI & WPI Compilation Practices", src: "NSSTA", domain: "Statistical", skill: "Price & index statistics", duration: "1 week", format: "Residential · Greater Noida", level: "Intermediate", meta: "Next intake 23 Nov 2026" },
  { title: "Time-Series Analysis for Official Statistics", src: "iGOT", domain: "Statistical", skill: "Time-series & forecasting", duration: "10 hours", format: "Self-paced online", level: "Intermediate", meta: "Includes R and Python notebooks" },
  { title: "Python for Official Statistics — Levels 1 to 3", src: "iGOT", domain: "Technical", skill: "Python for data analysis", duration: "24 hours", format: "Self-paced online", level: "Foundation → Advanced", meta: "Virtual lab included · 4.7 ★ (5,880 officials)" },
  { title: "Pandas & Data Wrangling for Survey Datasets", src: "iGOT", domain: "Technical", skill: "Python for data analysis", duration: "12 hours", format: "Virtual lab", level: "Intermediate", meta: "Hands-on with anonymised HCES extracts" },
  { title: "SQL for Government Data Analysts", src: "iGOT", domain: "Technical", skill: "SQL & data warehousing", duration: "9 hours", format: "Virtual lab", level: "Foundation", meta: "Sandboxed warehouse environment" },
  { title: "GIS & Spatial Sampling Lab (QGIS)", src: "NSSTA", domain: "Technical", skill: "GIS & spatial statistics", duration: "1 week", format: "Residential · lab-based", level: "Intermediate", meta: "Next intake 17 Nov 2026 · 14 seats" },
  { title: "Artificial Intelligence for Public Administrators", src: "iGOT", domain: "Technical", skill: "AI / ML foundations", duration: "10 hours", format: "Self-paced online", level: "Foundation", meta: "No coding prerequisite · 12 languages" },
  { title: "Machine Learning Applications in Official Statistics", src: "NSSTA", domain: "Technical", skill: "AI / ML foundations", duration: "5 days", format: "Residential · Delhi", level: "Advanced", meta: "Intake 8 Dec 2026 · nomination required" },
  { title: "Government Cloud Foundations (MeghRaj)", src: "iGOT", domain: "Technical", skill: "Cloud & APIs", duration: "7 hours", format: "Self-paced online", level: "Foundation", meta: "Mandatory for NDAP publishing roles" },
  { title: "Data Privacy & the DPDP Act for Government Officials", src: "iGOT", domain: "Digital Governance", skill: "DPDP & data privacy", duration: "6 hours", format: "Self-paced online", level: "Foundation", meta: "Mandatory refresher · due annually" },
  { title: "Data Stewardship & Metadata Standards on NDAP", src: "iGOT", domain: "Digital Governance", skill: "NDAP & data stewardship", duration: "10 hours", format: "Self-paced online", level: "Intermediate", meta: "Includes SDMX and DCAT modules" },
  { title: "Cyber Hygiene for Government Officials", src: "iGOT", domain: "Digital Governance", skill: "Cyber hygiene", duration: "5 hours", format: "Self-paced online", level: "Foundation", meta: "Mandatory · CERT-In aligned" },
  { title: "Data Governance & Quality Assurance Frameworks", src: "NSSTA", domain: "Digital Governance", skill: "NDAP & data stewardship", duration: "4 days", format: "Residential · Delhi", level: "Advanced", meta: "Intake 2 Feb 2027" },
  { title: "Communicating Statistics to Non-Specialists", src: "iGOT", domain: "Behavioural", skill: "Stakeholder communication", duration: "5 hours", format: "Self-paced online", level: "Foundation", meta: "4.5 ★ (3,410 officials)" },
  { title: "Leadership for Statistical Officers", src: "NSSTA", domain: "Behavioural", skill: "Team leadership", duration: "1 week", format: "Residential · Greater Noida", level: "Advanced", meta: "For STS and above · intake 19 Jan 2027" },
  { title: "Project Management in Public Systems", src: "iGOT", domain: "Behavioural", skill: "Project management", duration: "14 hours", format: "Self-paced online", level: "Intermediate", meta: "Counts toward 60-hour annual requirement" },
  { title: "Ethics and Integrity in Public Service", src: "iGOT", domain: "Behavioural", skill: "Ethics & integrity", duration: "5 hours", format: "Self-paced online", level: "Foundation", meta: "Mandatory for all cadres" },
  { title: "Presenting Statistical Findings — Practicum", src: "NSSTA", domain: "Behavioural", skill: "Briefing & public speaking", duration: "3 days", format: "In-person workshop", level: "Intermediate", meta: "Intake 5 Oct 2026 · 22 seats" },
];

export const INPROGRESS = [
  { title: "Data Privacy & the DPDP Act for Government Officials", src: "iGOT", pct: "64%", meta: "4 of 6 modules · resumes at Module 5" },
  { title: "Time-Series Analysis for Official Statistics", src: "iGOT", pct: "22%", meta: "2 of 9 modules · last opened 28 Aug" },
];

export const CERTS = [
  { title: "National Accounts Statistics — Advanced", meta: "NSSTA · 18 Jul 2026", points: 220 },
  { title: "Data Visualisation for Policy Briefs", meta: "iGOT Karmayogi · 2 Jun 2026", points: 120 },
  { title: "Cyber Hygiene for Government Officials", meta: "iGOT Karmayogi · 14 Apr 2026", points: 80 },
  { title: "Survey Field Supervision Certification", meta: "NSSTA · 9 Feb 2026", points: 180 },
];

export const QUESTIONS = [
  { no: "01", domain: "Statistical", difficulty: "Moderate", confidence: "0.91", page: "14",
    stem: "In a stratified random sample where stratum variances differ substantially, which allocation minimises the variance of the overall estimate for a fixed total sample size?",
    options: [["A", "Equal allocation across all strata"], ["B", "Proportional allocation by stratum size"], ["C", "Neyman (optimum) allocation using stratum size and standard deviation"], ["D", "Allocation proportional to the square of stratum size"]], correct: 2,
    rationale: "Generated from the module's derivation of optimum allocation on p.14. Distractor B is retained because proportional allocation is the most common error in prior batches." },
  { no: "02", domain: "Statistical", difficulty: "Hard", confidence: "0.74", page: "27",
    stem: "A field team reports a 14% non-response rate concentrated in high-income urban households. Which consequence is most likely if no adjustment is made?",
    options: [["A", "Increased sampling variance only, with unbiased estimates"], ["B", "Downward bias in mean consumption expenditure estimates"], ["C", "Upward bias in mean consumption expenditure estimates"], ["D", "No effect, since non-response is random by design"]], correct: 1,
    rationale: "Confidence is lower because the module discusses non-response bias qualitatively without a worked example. Faculty should verify the intended direction of bias before publishing." },
  { no: "03", domain: "Technical", difficulty: "Easy", confidence: "0.88", page: "41",
    stem: "Which pandas operation is most appropriate for applying survey weights when computing a weighted mean of household expenditure?",
    options: [["A", "df.groupby().mean()"], ["B", "numpy.average(values, weights=w)"], ["C", "df.sample(frac=1)"], ["D", "df.describe()"]], correct: 1,
    rationale: "Derived from the module's computational annexe. Tagged Technical rather than Statistical because it tests tool proficiency, not sampling theory." },
  { no: "04", domain: "Statistical", difficulty: "Moderate", confidence: "0.62", page: "33",
    stem: "The design effect (deff) for a two-stage cluster sample is 1.8. What does this imply about the effective sample size relative to a simple random sample of the same size?",
    options: [["A", "It is 1.8 times larger"], ["B", "It is approximately 55% of the SRS sample size"], ["C", "It is unchanged"], ["D", "It cannot be determined without the response rate"]], correct: 1,
    rationale: "Low confidence: the source defines deff but does not state the effective-sample-size relationship explicitly. Flagged for faculty review or rejection." },
];

export const HEAT = [
  { name: "Indian Statistical Service", count: "1,142", vals: [1.1, 2.2, 1.6, 0.9] },
  { name: "Subordinate Statistical Service", count: "4,860", vals: [1.8, 2.9, 2.1, 1.3] },
  { name: "State DES — cadre staff", count: "9,214", vals: [2.1, 3.2, 2.6, 1.7] },
  { name: "MoSPI / NSO — technical", count: "2,488", vals: [1.4, 1.9, 1.2, 1.5] },
  { name: "MoSPI / NSO — administrative", count: "738", vals: [2.6, 3.4, 2.2, 1.1] },
];

export const RAMP = [["#FDF4E7", "#7A4A12"], ["#F8E1BE", "#6B3D0C"], ["#EFC086", "#5A320A"], ["#DC8F4C", "#3F2206"], ["#B0531F", "#FFFFFF"]];

export const EFFECT = [
  { name: "Advanced Sampling Techniques", source: "NSSTA", n: "412", lift: "0.82", pct: "82%", color: "#0E7490" },
  { name: "Python for Official Statistics", source: "iGOT", n: "2,914", lift: "0.71", pct: "71%", color: "#6D28D9" },
  { name: "National Accounts — Advanced", source: "NSSTA", n: "288", lift: "0.64", pct: "64%", color: "#0E7490" },
  { name: "Cyber Hygiene for Officials", source: "iGOT", n: "6,102", lift: "0.38", pct: "38%", color: "#B45309" },
  { name: "Leadership in Public Systems", source: "iGOT", n: "1,744", lift: "0.29", pct: "29%", color: "#15803D" },
];

export const EMERGING = [
  { name: "Administrative data integration", domain: "Digital Governance", delta: "+38%" },
  { name: "Machine learning for imputation", domain: "Technical", delta: "+34%" },
  { name: "Geospatial statistics", domain: "Technical", delta: "+27%" },
  { name: "Data privacy & DPDP compliance", domain: "Digital Governance", delta: "+22%" },
  { name: "Survey automation & CAPI design", domain: "Statistical", delta: "+16%" },
];

export const REPORTS = [
  { name: "Cadre-wise competency gap summary", period: "Q2 FY 26-27", owner: "DIID", status: "Ready", format: "XLSX · PDF" },
  { name: "Training effectiveness — NSSTA programmes", period: "FY 25-26", owner: "NSSTA / TPAC", status: "Ready", format: "PDF" },
  { name: "State DES capacity assessment", period: "Aug 2026", owner: "DIID", status: "Scheduled 30 Sep", format: "XLSX" },
  { name: "Emerging skill demand forecast", period: "24-month horizon", owner: "DIID", status: "Draft — AI forecast", format: "PDF" },
  { name: "Mandatory-course compliance register", period: "Rolling", owner: "HR Division", status: "Ready", format: "XLSX" },
];

export const FLOW = [
  { n: "1", title: "Your trainer displays the session QR", note: "Shown on the classroom screen with the session name, code and expiry time." },
  { n: "2", title: "You scan it in the Kartavya app", note: "The camera opens inside the installed PWA — no separate app, no store download." },
  { n: "3", title: "The session is confirmed", note: "You see the session name, item count and duration, and that it is still open, before any login." },
  { n: "4", title: "You sign in with Parichay", note: "Lightweight single sign-on; your cadre and designation are resolved automatically." },
  { n: "5", title: "The assessment starts", note: "Your responses are attributed to your competency profile as soon as the session closes." },
];

export const ASSIST = [
  { q: "मेरा सांख्यिकीय अंतर कैसे कम होगा?", a: "आपके मूल्यांकन के अनुसार सैंपलिंग मेथोडोलॉजी सबसे बड़ा अंतर है। चरण 1 में iGOT का 'Foundations of Survey Sampling' (8 घंटे) पूरा करें, फिर NSSTA का आवासीय कार्यक्रम।" },
  { q: "Which mandatory courses am I due for?", a: "Two: Cyber Hygiene for Government Officials (annual refresher, due 14 Apr 2027) and Ethics and Integrity in Public Service. Both are self-paced on iGOT, five hours each." },
  { q: "Can I count NSSTA residential weeks toward my 60 hours?", a: "Yes. TPAC-approved residential programmes count at 6 hours per training day, credited automatically once NSSTA marks attendance." },
];

// Converts an inline CSS declaration string ("padding:4px; color:#fff") into
// a React style object. Lets page components carry the exact same style
// strings as the original design source, verbatim, instead of hand-transcribed
// camelCase object literals.
const BORDER_SIDE_PROPS = {
  "border-top": "borderTop",
  "border-right": "borderRight",
  "border-bottom": "borderBottom",
  "border-left": "borderLeft",
};

export function css(str) {
  const out = {};
  if (!str) return out;

  let borderShorthand;
  const sides = {};

  for (const decl of str.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;

    if (prop === "border") {
      borderShorthand = value;
      continue;
    }
    if (BORDER_SIDE_PROPS[prop]) {
      sides[BORDER_SIDE_PROPS[prop]] = value;
      continue;
    }
    const key = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = value;
  }

  if (borderShorthand !== undefined) {
    if (Object.keys(sides).length) {
      // The source mixes the `border` shorthand with a `border-top` (etc.)
      // override for an accent side. React warns if a style object carries
      // both the shorthand and a longhand for the same box, so expand to all
      // four explicit sides instead — same visual result, no warning.
      out.borderTop = sides.borderTop ?? borderShorthand;
      out.borderRight = sides.borderRight ?? borderShorthand;
      out.borderBottom = sides.borderBottom ?? borderShorthand;
      out.borderLeft = sides.borderLeft ?? borderShorthand;
    } else {
      out.border = borderShorthand;
    }
  } else {
    Object.assign(out, sides);
  }

  return out;
}

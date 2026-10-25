// anime.js expects a browser: React Native defines `window` but not `document` or the DOM
// classes it uses for `instanceof` checks. Stub just enough for anime.js to load, then
// animate plain JS objects (no DOM targets) and push values into React state / SVG props.
const g = globalThis as Record<string, unknown>;
class DomStub {}
for (const name of ['NodeList', 'HTMLCollection', 'SVGElement', 'HTMLElement']) {
  if (g[name] === undefined) g[name] = DomStub;
}
const hadDocument = 'document' in g;
if (!hadDocument) {
  g.document = { addEventListener() {}, removeEventListener() {}, hidden: false, documentElement: {} };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const anime = require('animejs') as typeof import('animejs');

// anime.js captured its own reference at load time; don't leave a fake `document` around
// for other libraries that sniff for the web.
if (!hadDocument) delete g.document;

export const { animate, createTimeline, stagger, utils, eases } = anime;

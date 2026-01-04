// main.js — render-on-demand + Z stack mixing + per-mag mapping + per-mag blur/fade
// ✅ 폴더 구조:
// public/assets/zstacks/<specimen>/<variant>/microscope0001.webp ... microscope0024.webp

// -------------------------
// Stack catalog (UI 옵션)
// -------------------------
const STACK_CATALOG = {
  elodea_leaf: {
    label: "검정말 잎",
    variants: {
      natural: { label: "자연 버전" },
      iodine_photosynth: { label: "탈색+아이오딘 (광합성 O)" },
      iodine_no_photosynth: { label: "탈색+아이오딘 (광합성 X)" },
    },
  },
};

// 파일 네이밍 규칙(공통)
const NAME_PREFIX = "microscope";
const NAME_EXT = ".webp";
const START_NUM = 1;
const COUNT = 24;

// “한 번에 한 파일씩” 로딩
const PREFETCH_RADIUS = 0; // ✅ 필요하면 1~2로 올려도 되지만, 너가 원한 방식은 0

const $ = (id) => document.getElementById(id);
const canvas = $("view");

function pad4(n) { return String(n).padStart(4, "0"); }
function clamp(x,a,b){ return Math.min(b, Math.max(a,x)); }
function lerp(a,b,t){ return a + (b-a)*t; }

const ui = {
  specimen: $("specimen"),
  variant: $("variant"),
  loadStatus: $("loadStatus"),

  z: $("z"),
  panX: $("panX"),
  panY: $("panY"),
  brightMaster: $("brightMaster"),
  apertureMaster: $("apertureMaster"),

  // HUD (중복 제거된 id)
  hudMagVal: $("hudMagVal"),
  hudZVal: $("hudZVal"),
  hudPxVal: $("hudPxVal"),
  hudPyVal: $("hudPyVal"),

  // Panel value labels (중복 제거된 id)
  uiZVal: $("uiZVal"),
  uiPxVal: $("uiPxVal"),
  uiPyVal: $("uiPyVal"),

  brightVal: $("brightVal"),
  apertureVal: $("apertureVal"),
zoomNote: $("zoomNote"),
zoom40: $("zoom40"), zoom40_v: $("zoom40_v"),
zoom100: $("zoom100"), zoom100_v: $("zoom100_v"),
zoom400: $("zoom400"), zoom400_v: $("zoom400_v"),
zoom1000: $("zoom1000"), zoom1000_v: $("zoom1000_v"),

  // mapping + blur/fade controls
  z40_at1: $("z40_at1"), z40_at24: $("z40_at24"),
  z100_at1: $("z100_at1"), z100_at24: $("z100_at24"),
  z400_at1: $("z400_at1"), z400_at24: $("z400_at24"),
  z1000_at1: $("z1000_at1"), z1000_at24: $("z1000_at24"),

  z40_blurSpan: $("z40_blurSpan"), z40_fadeSpan: $("z40_fadeSpan"), z40_blurMax: $("z40_blurMax"), z40_fadePow: $("z40_fadePow"),
  z100_blurSpan: $("z100_blurSpan"), z100_fadeSpan: $("z100_fadeSpan"), z100_blurMax: $("z100_blurMax"), z100_fadePow: $("z100_fadePow"),
  z400_blurSpan: $("z400_blurSpan"), z400_fadeSpan: $("z400_fadeSpan"), z400_blurMax: $("z400_blurMax"), z400_fadePow: $("z400_fadePow"),
  z1000_blurSpan: $("z1000_blurSpan"), z1000_fadeSpan: $("z1000_fadeSpan"), z1000_blurMax: $("z1000_blurMax"), z1000_fadePow: $("z1000_fadePow"),
};
// ✅ 배율별 매핑 "기본값 고정" (사진 값)
const MAG_MAP_DEFAULTS = {
  40:   { at1: 0.0,  at24: 40.0, blurSpan: 10.0, fadeSpan: 10.0, blurMax: 7.0, fadePow: 1.5 },
  100:  { at1: 5.2,  at24: 34.8, blurSpan: 10.0, fadeSpan: 10.0, blurMax: 7.0, fadePow: 1.5 },
  400:  { at1: 10.3, at24: 29.7, blurSpan: 8.0,  fadeSpan: 8.0,  blurMax: 8.0, fadePow: 1.7 },
  1000: { at1: 15.5, at24: 25.8, blurSpan: 4.0,  fadeSpan: 4.0,  blurMax: 9.0, fadePow: 2.2 },
};

function applyMappingDefaults(){
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = String(v); };

  for (const mag of [40,100,400,1000]){
    const d = MAG_MAP_DEFAULTS[mag];
    set(`z${mag}_at1`, d.at1);
    set(`z${mag}_at24`, d.at24);
    set(`z${mag}_blurSpan`, d.blurSpan);
    set(`z${mag}_fadeSpan`, d.fadeSpan);
    set(`z${mag}_blurMax`, d.blurMax);
    set(`z${mag}_fadePow`, d.fadePow);
  }
}

function setText(el, v) { if (el) el.textContent = v; }

function getSelectedMag() {
  const checked = document.querySelector('input[name="mag"]:checked');
  return Number(checked?.value ?? 40);
}
const ZOOM_DEFAULTS = { 40: 0.4, 100: 1.0, 400: 4.0, 1000: 10.0 };

function readZoomValue(mag){
  const el = ui[`zoom${mag}`];
  const v = Number(el?.value);
  if (!Number.isFinite(v) || v <= 0) return ZOOM_DEFAULTS[mag] ?? 1.0;
  return v;
}

function getZoomScale(){
  const mag = getSelectedMag();
  return readZoomValue(mag);
}

// -------------------------
// Stack selection + path
// -------------------------
let activeSpecimen = "elodea_leaf";
let activeVariant = "natural";
let activeKey = "";        // "elodea_leaf/natural"
let stackGen = 0;          // 선택 변경 시 증가 (구요청 무시/abort용)

function getBaseDir() {
  // ✅ 네 폴더 구조 그대로
  return `assets/zstacks/${activeSpecimen}/${activeVariant}/`;
}
function makeUrlForIndex(i) {
  const num = START_NUM + i;
  const file = `${NAME_PREFIX}${pad4(num)}${NAME_EXT}`;
  return new URL(getBaseDir() + file, window.location.href).toString();
}

// -------------------------
// Z mapping
// -------------------------
function getMagControls(mag){
  if (mag === 40) {
    return {
      at1: Number(ui.z40_at1.value), at24: Number(ui.z40_at24.value),
      blurSpan: Number(ui.z40_blurSpan.value), fadeSpan: Number(ui.z40_fadeSpan.value),
      blurMax: Number(ui.z40_blurMax.value), fadePow: Number(ui.z40_fadePow.value)
    };
  }
  if (mag === 100) {
    return {
      at1: Number(ui.z100_at1.value), at24: Number(ui.z100_at24.value),
      blurSpan: Number(ui.z100_blurSpan.value), fadeSpan: Number(ui.z100_fadeSpan.value),
      blurMax: Number(ui.z100_blurMax.value), fadePow: Number(ui.z100_fadePow.value)
    };
  }
  if (mag === 400) {
    return {
      at1: Number(ui.z400_at1.value), at24: Number(ui.z400_at24.value),
      blurSpan: Number(ui.z400_blurSpan.value), fadeSpan: Number(ui.z400_fadeSpan.value),
      blurMax: Number(ui.z400_blurMax.value), fadePow: Number(ui.z400_fadePow.value)
    };
  }
  return {
    at1: Number(ui.z1000_at1.value), at24: Number(ui.z1000_at24.value),
    blurSpan: Number(ui.z1000_blurSpan.value), fadeSpan: Number(ui.z1000_fadeSpan.value),
    blurMax: Number(ui.z1000_blurMax.value), fadePow: Number(ui.z1000_fadePow.value)
  };
}

// ✅ Z 매핑 안정화(뒤집힘/동일값 자동 보정)
function normalizeAt(at1, at24){
  let a = at1, b = at24;
  if (Math.abs(b - a) < 0.001) b = a + 0.001;
  return { a, b };
}

// UI Z → (1..24) + blurAmt/fadeAmt
function computeZState(zUI, mag){
  const c = getMagControls(mag);
  const { a, b } = normalizeAt(c.at1, c.at24);

  const span = (b - a);
  const tRaw = (zUI - a) / span;
  const t = clamp(tRaw, 0, 1);

  const zStack = 1 + t * (COUNT - 1);

  const zUI_clamped = a + t * span;
  const dist = Math.abs(zUI - zUI_clamped);

  const blurSpan = Math.max(0.001, c.blurSpan);
  const fadeSpan = Math.max(0.001, c.fadeSpan);

  const blurAmt = clamp(dist / blurSpan, 0, 1);
  const fadeAmt = clamp(dist / fadeSpan, 0, 1);

  return {
    zStack,
    blurAmt,
    fadeAmt,
    blurMax: c.blurMax,
    fadePow: c.fadePow
  };
}

// ------------------------------------------------------------
// 파라미터 UI
// ------------------------------------------------------------
const PARAMS = [
  { key: "exposureEV", label: "노출", min: -4, max: 4, step: 0.01, neutral: 0, combine: "add" },
  { key: "gamma",      label: "감마", min: 0.2, max: 3.0, step: 0.01, neutral: 1, combine: "mul" },
  { key: "contrast",   label: "대비", min: 0.0, max: 3.0, step: 0.01, neutral: 1, combine: "mul" },
  { key: "brightness", label: "밝기", min: -0.5, max: 0.5, step: 0.001, neutral: 0, combine: "add" },
  { key: "sharp",      label: "선명도", min: 0, max: 10, step: 0.01, neutral: 0, combine: "add" },
  { key: "clarity",    label: "명료도", min: 0, max: 10, step: 0.01, neutral: 0, combine: "add" },
  { key: "saturation", label: "채도", min: 0.0, max: 3.0, step: 0.01, neutral: 1, combine: "mul" },
  { key: "lightness",  label: "명도", min: -0.5, max: 0.5, step: 0.001, neutral: 0, combine: "add" },
];

function makeParamBlock(containerId, prefix) {
  const root = $(containerId);
  root.innerHTML = "";
  for (const p of PARAMS) {
    const row = document.createElement("div");
    row.className = "paramRow";

    const lab = document.createElement("label");
    lab.textContent = p.label;

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(p.min);
    input.max = String(p.max);
    input.step = String(p.step);
    input.value = String(p.neutral);
    input.id = `${prefix}_${p.key}`;

    const val = document.createElement("span");
    val.className = "val";
    val.id = `${prefix}_${p.key}_val`;
    val.textContent = Number(input.value).toFixed(3);

    input.addEventListener("input", () => {
      val.textContent = Number(input.value).toFixed(3);
      requestRender();
    });

    row.appendChild(lab);
    row.appendChild(input);
    row.appendChild(val);
    root.appendChild(row);
  }
}
const MAP_KEY = "micro_zmap_v1";
const MAP_IDS = [
  "z40_at1","z40_at24","z40_blurSpan","z40_fadeSpan","z40_blurMax","z40_fadePow",
  "z100_at1","z100_at24","z100_blurSpan","z100_fadeSpan","z100_blurMax","z100_fadePow",
  "z400_at1","z400_at24","z400_blurSpan","z400_fadeSpan","z400_blurMax","z400_fadePow",
  "z1000_at1","z1000_at24","z1000_blurSpan","z1000_fadeSpan","z1000_blurMax","z1000_fadePow",
];

const MAP_DEFAULTS = {};
function snapshotDefaults(){
  for (const id of MAP_IDS){
    const el = document.getElementById(id);
    if (el) MAP_DEFAULTS[id] = el.value; // HTML 기본값 저장
  }
}

function saveMapping(){
  const obj = {};
  for (const id of MAP_IDS){
    const el = document.getElementById(id);
    if (el) obj[id] = el.value;
  }
  localStorage.setItem(MAP_KEY, JSON.stringify(obj));
}

function loadMapping(){
  const raw = localStorage.getItem(MAP_KEY);
  if (!raw) return;
  try{
    const obj = JSON.parse(raw);
    for (const id of MAP_IDS){
      const el = document.getElementById(id);
      if (el && obj[id] != null) el.value = obj[id];
    }
  } catch {}
}

function resetMapping(){
  localStorage.removeItem(MAP_KEY);
  for (const id of MAP_IDS){
    const el = document.getElementById(id);
    if (el && MAP_DEFAULTS[id] != null) el.value = MAP_DEFAULTS[id];
  }
}

makeParamBlock("B0_params", "B0");
makeParamBlock("B100_params", "B100");
makeParamBlock("A0_params", "A0");
makeParamBlock("A100_params", "A100");

// ✅ 너 캡처 값으로 기본값 “픽스(초기 주입)”
const FIX = {
  B0: { exposureEV:-0.390, gamma:1.090, contrast:1.680, brightness:-0.095, sharp:0.700, clarity:0.000, saturation:0.330, lightness:-0.095 },
  B100:{ exposureEV: 2.020, gamma:0.730, contrast:1.720, brightness: 0.239, sharp:0.300, clarity:0.000, saturation:1.370, lightness: 0.125 },
  A0: { exposureEV:-2.260, gamma:1.160, contrast:0.550, brightness:-0.142, sharp:4.580, clarity:4.650, saturation:0.210, lightness:-0.082 },
  A100:{ exposureEV:-1.830, gamma:1.310, contrast:0.690, brightness:-0.062, sharp:0.000, clarity:0.000, saturation:0.970, lightness: 0.005 },
};

function applyDefaults(prefix, vals){
  for (const p of PARAMS) {
    const el = $(`${prefix}_${p.key}`);
    const vEl = $(`${prefix}_${p.key}_val`);
    if (!el) continue;
    const v = vals[p.key];
    if (typeof v === "number") {
      el.value = String(v);
      if (vEl) vEl.textContent = v.toFixed(3);
    }
  }
}
applyDefaults("B0", FIX.B0);
applyDefaults("B100", FIX.B100);
applyDefaults("A0", FIX.A0);
applyDefaults("A100", FIX.A100);

function readParamSet(prefix) {
  const out = {};
  for (const p of PARAMS) out[p.key] = Number($(`${prefix}_${p.key}`).value);
  return out;
}
function lerpParamSet(P0, P1, t) {
  const out = {};
  for (const p of PARAMS) out[p.key] = lerp(P0[p.key], P1[p.key], t);
  return out;
}
function combineParams(B, A) {
  const out = {};
  for (const p of PARAMS) {
    if (p.combine === "add") out[p.key] = (B[p.key] ?? p.neutral) + (A[p.key] ?? p.neutral);
    else out[p.key] = (B[p.key] ?? p.neutral) * (A[p.key] ?? p.neutral);
  }
  out.gamma = Math.max(0.01, out.gamma);
  out.contrast = Math.max(0.0, out.contrast);
  out.saturation = Math.max(0.0, out.saturation);
  return out;
}

// ------------------------------------------------------------
// WebGL2
// ------------------------------------------------------------
const gl = canvas.getContext("webgl2", {
  antialias: false,
  premultipliedAlpha: false,
  powerPreference: "high-performance",
});
if (!gl) throw new Error("WebGL2 not supported");

const VS = `#version 300 es
precision highp float;
out vec2 vUV;
void main() {
  vec2 p = vec2(
    (gl_VertexID == 2) ? 3.0 : -1.0,
    (gl_VertexID == 1) ? 3.0 : -1.0
  );
  vUV = 0.5 * (p + 1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 outColor;
uniform vec2  uFit;   // ✅ 캔버스/이미지 비율 보정 (letterbox용)
uniform sampler2D uEdgeLo;   // ✅ frame 1
uniform sampler2D uEdgeHi;   // ✅ frame 24
uniform float uEdgeReady;    // ✅ 0/1 (업로드 되었는지)

uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;

uniform float uZoom;
uniform vec2  uPanUV;
uniform vec2  uTexel;

uniform float uExposureEV;
uniform float uGamma;
uniform float uContrast;
uniform float uBrightness;
uniform float uSharp;
uniform float uClarity;
uniform float uSaturation;
uniform float uLightness;

uniform float uBlurAmt;
uniform float uFadeAmt;
uniform float uBlurMaxLod;
uniform float uFadePow;

vec3 mixAB(vec2 uv){
  vec3 a = texture(uA, uv).rgb;
  vec3 b = texture(uB, uv).rgb;
  return mix(a, b, uMix);
}

vec3 blur9(sampler2D tex, vec2 uv, float radiusPx){
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 o = texel * radiusPx;

  vec3 c = vec3(0.0);
  c += texture(tex, uv + o*vec2(-1.0,-1.0)).rgb;
  c += texture(tex, uv + o*vec2( 0.0,-1.0)).rgb;
  c += texture(tex, uv + o*vec2( 1.0,-1.0)).rgb;
  c += texture(tex, uv + o*vec2(-1.0, 0.0)).rgb;
  c += texture(tex, uv).rgb;
  c += texture(tex, uv + o*vec2( 1.0, 0.0)).rgb;
  c += texture(tex, uv + o*vec2(-1.0, 1.0)).rgb;
  c += texture(tex, uv + o*vec2( 0.0, 1.0)).rgb;
  c += texture(tex, uv + o*vec2( 1.0, 1.0)).rgb;
  return c / 9.0;
}

vec3 mixAB_blur(vec2 uv, float radiusPx){
  vec3 a = blur9(uA, uv, radiusPx);
  vec3 b = blur9(uB, uv, radiusPx);
  return mix(a, b, uMix);
}

vec3 applyTone(vec3 col){
  col *= pow(2.0, uExposureEV);
  col += vec3(uBrightness);
  col = (col - 0.5) * uContrast + 0.5;
  col = max(col, 0.0);
  col = pow(col, vec3(1.0 / max(uGamma, 0.001)));
  return col;
}
vec3 applySatLight(vec3 col){
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uSaturation);
  col += vec3(uLightness);
  return clamp(col, 0.0, 1.0);
}
vec3 bgCurrent(){ // 기존 autoBg() 내용
  vec2 p = 10.0 * uTexel;
  vec2 q = vec2(1.0) - p;
  vec3 c0 = mixAB(vec2(p.x, p.y));
  vec3 c1 = mixAB(vec2(q.x, p.y));
  vec3 c2 = mixAB(vec2(p.x, q.y));
  vec3 c3 = mixAB(vec2(q.x, q.y));
  vec3 c = (c0 + c1 + c2 + c3) * 0.25;
  c = applySatLight(applyTone(c));
  return c;
}

vec3 edgeAvg(sampler2D tex){
  float m = 0.03; // ✅ 가장자리 샘플링 마진(3%) — 필요하면 0.02~0.06 조절
  vec3 c = vec3(0.0);
  c += texture(tex, vec2(m, 0.5)).rgb;
  c += texture(tex, vec2(1.0-m, 0.5)).rgb;
  c += texture(tex, vec2(0.5, m)).rgb;
  c += texture(tex, vec2(0.5, 1.0-m)).rgb;

  c += texture(tex, vec2(m, m)).rgb;
  c += texture(tex, vec2(1.0-m, m)).rgb;
  c += texture(tex, vec2(m, 1.0-m)).rgb;
  c += texture(tex, vec2(1.0-m, 1.0-m)).rgb;
  return c / 8.0;
}

vec3 bgEdge(){
  vec3 lo = edgeAvg(uEdgeLo);
  vec3 hi = edgeAvg(uEdgeHi);
  vec3 c = mix(lo, hi, 0.5);          // ✅ 1과 24의 “가장자리색”을 반반 섞음
  c = applySatLight(applyTone(c));    // ✅ 밝기/조리개 톤은 동일 적용(자연스럽게)
  return c;
}

vec3 autoBg(){
  vec2 p = 10.0 * uTexel;
  vec2 q = vec2(1.0) - p;
  vec3 c0 = mixAB(vec2(p.x, p.y));
  vec3 c1 = mixAB(vec2(q.x, p.y));
  vec3 c2 = mixAB(vec2(p.x, q.y));
  vec3 c3 = mixAB(vec2(q.x, q.y));
  vec3 c = (c0 + c1 + c2 + c3) * 0.25;
  c = applySatLight(applyTone(c));
  return c;
}

void main(){
  vec2 uv = ((vUV - 0.5) * uFit) / max(uZoom, 0.0001) + 0.5 + uPanUV;

  vec3 bg = mix(bgCurrent(), bgEdge(), clamp(uEdgeReady, 0.0, 1.0));


  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0){
    outColor = vec4(bg, 1.0);
    return;
  }

  float fade = clamp(uFadeAmt, 0.0, 1.0);
  float alpha = pow(1.0 - fade, max(uFadePow, 0.001));

  float blurT = clamp(uBlurAmt, 0.0, 1.0);
  float radiusPx = blurT * max(uBlurMaxLod, 0.0);

  vec3 col = (radiusPx > 0.001) ? mixAB_blur(uv, radiusPx) : mixAB(uv);
  col = applySatLight(applyTone(col));

  if (uSharp > 0.0001 || uClarity > 0.0001){
    vec3 blurS = applySatLight(applyTone(mixAB_blur(uv, 1.3)));
    vec3 blurL = applySatLight(applyTone(mixAB_blur(uv, 3.8)));
    vec3 hpS = col - blurS;
    vec3 hpL = col - blurL;

    float sharpAmt = uSharp * 1.25 * alpha;
    float clarAmt  = uClarity * 1.25 * alpha;
    col = clamp(col + sharpAmt * hpS + clarAmt * hpL, 0.0, 1.0);
  }

  vec3 outCol = mix(bg, col, alpha);
  outColor = vec4(outCol, 1.0);
}
`;

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "shader compile failed");
  }
  return sh;
}
function makeProgram(vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "program link failed");
  }
  return p;
}

const prog = makeProgram(VS, FS);
gl.useProgram(prog);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const loc = {
  uA: gl.getUniformLocation(prog, "uA"),
  uB: gl.getUniformLocation(prog, "uB"),
  uMix: gl.getUniformLocation(prog, "uMix"),
  uZoom: gl.getUniformLocation(prog, "uZoom"),
  uPanUV: gl.getUniformLocation(prog, "uPanUV"),
  uTexel: gl.getUniformLocation(prog, "uTexel"),
  uFit: gl.getUniformLocation(prog, "uFit"),
uEdgeLo: gl.getUniformLocation(prog, "uEdgeLo"),
uEdgeHi: gl.getUniformLocation(prog, "uEdgeHi"),
uEdgeReady: gl.getUniformLocation(prog, "uEdgeReady"),

  uExposureEV: gl.getUniformLocation(prog, "uExposureEV"),
  uGamma: gl.getUniformLocation(prog, "uGamma"),
  uContrast: gl.getUniformLocation(prog, "uContrast"),
  uBrightness: gl.getUniformLocation(prog, "uBrightness"),
  uSharp: gl.getUniformLocation(prog, "uSharp"),
  uClarity: gl.getUniformLocation(prog, "uClarity"),
  uSaturation: gl.getUniformLocation(prog, "uSaturation"),
  uLightness: gl.getUniformLocation(prog, "uLightness"),

  uBlurAmt: gl.getUniformLocation(prog, "uBlurAmt"),
  uFadeAmt: gl.getUniformLocation(prog, "uFadeAmt"),
  uBlurMaxLod: gl.getUniformLocation(prog, "uBlurMaxLod"),
  uFadePow: gl.getUniformLocation(prog, "uFadePow"),
};

function makeTex(unit) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // ✅ mipmap 미사용 (순차 로딩 + 간단)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}
const texA = makeTex(0);
const texB = makeTex(1);
gl.uniform1i(loc.uA, 0);
gl.uniform1i(loc.uB, 1);
const texEdgeLo = makeTex(2);
const texEdgeHi = makeTex(3);
gl.uniform1i(loc.uEdgeLo, 2);
gl.uniform1i(loc.uEdgeHi, 3);

let uploadedEdgeLo = false;
let uploadedEdgeHi = false;

// ------------------------------------------------------------
// Render on demand
// ------------------------------------------------------------
let raf = 0;
function requestRender() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    renderOnce();
  });
}

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}

function updateValueLabels(){
  const mag = getSelectedMag();
  setText(ui.hudMagVal, `${mag}×`);

  const zTxt = Number(ui.z.value).toFixed(1);
  setText(ui.hudZVal, zTxt);
  setText(ui.uiZVal, zTxt);

  const pxTxt = `${ui.panX.value}px`;
  const pyTxt = `${ui.panY.value}px`;
  setText(ui.hudPxVal, pxTxt);
  setText(ui.hudPyVal, pyTxt);
  setText(ui.uiPxVal, pxTxt);
  setText(ui.uiPyVal, pyTxt);

  setText(ui.brightVal, Number(ui.brightMaster.value).toFixed(1));
  setText(ui.apertureVal, Number(ui.apertureMaster.value).toFixed(1));
// ✅ zoom 매핑 표시 + 디버그 슬라이더 값 표시
const z40 = readZoomValue(40);
const z100 = readZoomValue(100);
const z400 = readZoomValue(400);
const z1000 = readZoomValue(1000);

setText(ui.zoom40_v, z40.toFixed(2));
setText(ui.zoom100_v, z100.toFixed(2));
setText(ui.zoom400_v, z400.toFixed(2));
setText(ui.zoom1000_v, z1000.toFixed(2));

setText(ui.zoomNote,);

  // mapping labels
  const pairs = [
    ["z40_at1","z40_at1_v"], ["z40_at24","z40_at24_v"], ["z40_blurSpan","z40_blurSpan_v"], ["z40_fadeSpan","z40_fadeSpan_v"], ["z40_blurMax","z40_blurMax_v"], ["z40_fadePow","z40_fadePow_v"],
    ["z100_at1","z100_at1_v"], ["z100_at24","z100_at24_v"], ["z100_blurSpan","z100_blurSpan_v"], ["z100_fadeSpan","z100_fadeSpan_v"], ["z100_blurMax","z100_blurMax_v"], ["z100_fadePow","z100_fadePow_v"],
    ["z400_at1","z400_at1_v"], ["z400_at24","z400_at24_v"], ["z400_blurSpan","z400_blurSpan_v"], ["z400_fadeSpan","z400_fadeSpan_v"], ["z400_blurMax","z400_blurMax_v"], ["z400_fadePow","z400_fadePow_v"],
    ["z1000_at1","z1000_at1_v"], ["z1000_at24","z1000_at24_v"], ["z1000_blurSpan","z1000_blurSpan_v"], ["z1000_fadeSpan","z1000_fadeSpan_v"], ["z1000_blurMax","z1000_blurMax_v"], ["z1000_fadePow","z1000_fadePow_v"],
  ];
  for (const [id, vid] of pairs){
    const el = $(id), vEl = $(vid);
    if (el && vEl) vEl.textContent = Number(el.value).toFixed(1);
  }
}

// ------------------------------------------------------------
// Image cache + sequential loader (one file at a time)
// ------------------------------------------------------------
let cache = new Array(COUNT).fill(null);        // ImageBitmap
let pendingCtrl = new Array(COUNT).fill(null);  // AbortController or null
let queued = new Array(COUNT).fill(false);
let loadQueue = [];
let loading = false;

let imgW = 0, imgH = 0;

function updateLoadStatus() {
  const loaded = cache.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const base = `${STACK_CATALOG[activeSpecimen]?.label ?? activeSpecimen} / ${STACK_CATALOG[activeSpecimen]?.variants?.[activeVariant]?.label ?? activeVariant}`;
  setText(ui.loadStatus, `${base} • 로딩: ${loaded}/${COUNT}`);
}

async function loadBitmap(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Image fetch failed ${res.status}: ${url}`);
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.startsWith("image/")) {
    const text = await res.text();
    throw new Error(`Not an image (${ct}) at ${url}\n${text.slice(0, 120)}`);
  }
  const blob = await res.blob();
  return await createImageBitmap(blob);
}

function enqueue(i, front = false) {
  if (i < 0 || i >= COUNT) return;
  if (cache[i]) return;
  if (pendingCtrl[i]) return;
  if (queued[i]) return;

  queued[i] = true;
  if (front) loadQueue.unshift(i);
  else loadQueue.push(i);

  pumpQueue();
}

function pumpQueue() {
  if (loading) return;

  // 큐 앞쪽에서 이미 캐시된 항목 정리
  while (loadQueue.length) {
    const i = loadQueue[0];
    if (cache[i]) { loadQueue.shift(); queued[i] = false; continue; }
    if (pendingCtrl[i]) { return; }
    break;
  }
  if (!loadQueue.length) return;

  const i = loadQueue.shift();
  queued[i] = false;

  // 이미 캐시되면 다음
  if (cache[i]) { pumpQueue(); return; }

  const myGen = stackGen;
  const ctrl = new AbortController();
  pendingCtrl[i] = ctrl;
  loading = true;

  const url = makeUrlForIndex(i);
  loadBitmap(url, ctrl.signal)
    .then((bmp) => {
      // 선택이 바뀐 뒤 도착한 결과는 폐기
      if (myGen !== stackGen) {
        if (bmp?.close) bmp.close();
        return;
      }
      cache[i] = bmp;

      if (!imgW || !imgH) {
        imgW = bmp.width;
        imgH = bmp.height;
        gl.uniform2f(loc.uTexel, 1 / imgW, 1 / imgH);
      }
      updateLoadStatus();
      requestRender();
    })
    .catch((err) => {
      if (err?.name === "AbortError") return;
      console.error(err);
      updateLoadStatus();
    })
    .finally(() => {
      if (pendingCtrl[i] === ctrl) pendingCtrl[i] = null;
      loading = false;
      pumpQueue();
    });
}

function clearAllLoadsAndCache() {
  // abort in-flight
  for (let i = 0; i < pendingCtrl.length; i++) {
    const c = pendingCtrl[i];
    if (c) { try { c.abort(); } catch {} }
    pendingCtrl[i] = null;
  }
  // free bitmaps
  for (const bmp of cache) {
    if (bmp && bmp.close) bmp.close();
  }

  cache = new Array(COUNT).fill(null);
  pendingCtrl = new Array(COUNT).fill(null);
  queued = new Array(COUNT).fill(false);
  loadQueue = [];
  loading = false;

  imgW = 0; imgH = 0;
  // 안전값(배경 샘플링용)
  gl.uniform2f(loc.uTexel, 1 / 1024, 1 / 1024);
}

function primeSequentialLoad() {
  // 전체를 순차로 (네가 원한 “한 파일씩” 방식)
  for (let i = 0; i < COUNT; i++) enqueue(i, false);
}

// 텍스처 업로드
function uploadTexture(tex, unit, bmp) {
  if (!bmp) return;
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
}

let uploadedA = -1;
let uploadedB = -1;

// ------------------------------------------------------------
// render
// ------------------------------------------------------------
function renderOnce() {
  resize();
  updateValueLabels();
// ✅ aspect-fit (contain) : 원본 비율 유지 + 레터박스
let fitX = 1.0, fitY = 1.0;
const cAsp = canvas.width / canvas.height;

if (imgW && imgH) {
  const iAsp = imgW / imgH;
  if (cAsp > iAsp) fitX = cAsp / iAsp;   // 캔버스가 더 넓음 → 좌우 레터박스
  else             fitY = iAsp / cAsp;   // 캔버스가 더 좁음 → 상하 레터박스
}
gl.uniform2f(loc.uFit, fitX, fitY);

  const mag = getSelectedMag();
  const zoom = getZoomScale();

  const zUI = Number(ui.z.value);
  const zs = computeZState(zUI, mag);

  const z0 = Math.floor(zs.zStack - 1.0);
  const frac = (zs.zStack - 1.0) - z0;
  const i0 = clamp(z0, 0, COUNT - 1);
  const i1 = clamp(z0 + 1, 0, COUNT - 1);

  gl.uniform1f(loc.uMix, frac);
  gl.uniform1f(loc.uZoom, zoom);

  gl.uniform1f(loc.uBlurAmt, zs.blurAmt);
  gl.uniform1f(loc.uFadeAmt, zs.fadeAmt);
  gl.uniform1f(loc.uBlurMaxLod, zs.blurMax);
  gl.uniform1f(loc.uFadePow, zs.fadePow);

  // ✅ 필요한 프레임을 "우선순위 높게" 큐 앞쪽에 넣음
  enqueue(i0, true);
  enqueue(i1, true);
// ✅ 배경용 엣지 텍스처: 항상 1번(0)과 24번(COUNT-1)
const edgeLoIdx = 0;
const edgeHiIdx = COUNT - 1;

// 순차 로더 큐에 넣기
enqueue(edgeLoIdx, false);
enqueue(edgeHiIdx, false);

// 캐시되면 엣지 텍스처에 1회 업로드
if (cache[edgeLoIdx] && !uploadedEdgeLo) {
  uploadTexture(texEdgeLo, 2, cache[edgeLoIdx]);
  uploadedEdgeLo = true;
}
if (cache[edgeHiIdx] && !uploadedEdgeHi) {
  uploadTexture(texEdgeHi, 3, cache[edgeHiIdx]);
  uploadedEdgeHi = true;
}

// 셰이더에 “엣지 배경 준비됨” 플래그 전달
gl.uniform1f(loc.uEdgeReady, (uploadedEdgeLo && uploadedEdgeHi) ? 1.0 : 0.0);

  if (PREFETCH_RADIUS > 0) {
    for (let k = 1; k <= PREFETCH_RADIUS; k++) {
      enqueue(i0 - k, false);
      enqueue(i1 + k, false);
    }
  }

  if (cache[i0] && uploadedA !== i0) { uploadTexture(texA, 0, cache[i0]); uploadedA = i0; }
  if (cache[i1] && uploadedB !== i1) { uploadTexture(texB, 1, cache[i1]); uploadedB = i1; }

  if (uploadedA < 0 && uploadedB < 0) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return;
  }

  // pan(px)->uv
  const px = Number(ui.panX.value);
  const py = Number(ui.panY.value);
  const panXuv = imgW ? (px / imgW) : 0.0;
  const panYuv = imgH ? (py / imgH) : 0.0;
  gl.uniform2f(loc.uPanUV, panXuv, -panYuv);

  // master sliders -> endpoint lerp -> combine
  const tB = clamp(Number(ui.brightMaster.value) / 100.0, 0, 1);
  const tA = clamp(Number(ui.apertureMaster.value) / 100.0, 0, 1);

  const B0 = readParamSet("B0");
  const B1 = readParamSet("B100");
  const A0 = readParamSet("A0");
  const A1 = readParamSet("A100");

  const PB = lerpParamSet(B0, B1, tB);
  const PA = lerpParamSet(A0, A1, tA);
  const P = combineParams(PB, PA);

  gl.uniform1f(loc.uExposureEV, P.exposureEV);
  gl.uniform1f(loc.uGamma, P.gamma);
  gl.uniform1f(loc.uContrast, P.contrast);
  gl.uniform1f(loc.uBrightness, P.brightness);
  gl.uniform1f(loc.uSharp, P.sharp);
  gl.uniform1f(loc.uClarity, P.clarity);
  gl.uniform1f(loc.uSaturation, P.saturation);
  gl.uniform1f(loc.uLightness, P.lightness);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ------------------------------------------------------------
// init: specimen/variant select
// ------------------------------------------------------------
function populateSpecimenOptions() {
  ui.specimen.innerHTML = "";
  for (const key of Object.keys(STACK_CATALOG)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STACK_CATALOG[key].label ?? key;
    ui.specimen.appendChild(opt);
  }
}

function populateVariantOptions(specimenKey) {
  ui.variant.innerHTML = "";
  const variants = STACK_CATALOG[specimenKey]?.variants ?? {};
  for (const vKey of Object.keys(variants)) {
    const opt = document.createElement("option");
    opt.value = vKey;
    opt.textContent = variants[vKey].label ?? vKey;
    ui.variant.appendChild(opt);
  }
}

function setActiveStackFromUI(force = false) {
  const s = ui.specimen.value || "elodea_leaf";
  const v = ui.variant.value || "natural";
  const key = `${s}/${v}`;

  if (!force && key === activeKey) return;

  activeSpecimen = s;
  activeVariant = v;
  activeKey = key;

  // ✅ 선택 바뀌면: abort + 캐시 해제 + 업로드 상태 리셋
  stackGen++;
  clearAllLoadsAndCache();
  uploadedA = -1;
  uploadedB = -1;
uploadedEdgeLo = false;
uploadedEdgeHi = false;
gl.uniform1f(loc.uEdgeReady, 0.0);

  updateLoadStatus();
  primeSequentialLoad();
  requestRender();
}
function applyMode(mode){
  document.body.dataset.mode = mode;


["zoom40","zoom100","zoom400","zoom1000"].forEach(id => {
  const el = ui[id];
  if (el) el.disabled = (mode !== "debug");
});
  requestRender();
}

// 모드 라디오 바인딩
document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener("change", () => {
    applyMode(r.value);
  });
});

// 초기 모드 적용
applyMode(document.querySelector('input[name="mode"]:checked')?.value ?? "user");

// ------------------------------------------------------------
// init events
// ------------------------------------------------------------
function bindUI() {
  // input/slider류: 렌더만
  const controls = document.querySelectorAll("input");
  controls.forEach((el) => {
    el.addEventListener("input", requestRender);
    el.addEventListener("change", requestRender);
  });

  window.addEventListener("resize", requestRender);
snapshotDefaults();
loadMapping();
applyMappingDefaults();

document.getElementById("saveMapping")?.addEventListener("click", () => {
  saveMapping();
  requestRender();
});
document.getElementById("resetMapping")?.addEventListener("click", () => {
  resetMapping();
  requestRender();
});

  // ✅ selects: 스택 변경 처리
  ui.specimen.addEventListener("change", () => {
    populateVariantOptions(ui.specimen.value);
    // 기본값으로 첫 variant 선택
    ui.variant.value = ui.variant.options[0]?.value ?? "natural";
    setActiveStackFromUI(true);
  });
  ui.variant.addEventListener("change", () => {
    setActiveStackFromUI(true);
  });

  // 초기 UI 세팅
  populateSpecimenOptions();
  ui.specimen.value = activeSpecimen;
  populateVariantOptions(activeSpecimen);
  ui.variant.value = activeVariant;

  // 초기 로드
  setActiveStackFromUI(true);
  requestRender();
  applyMode(document.querySelector('input[name="mode"]:checked')?.value ?? "user");
}

bindUI();

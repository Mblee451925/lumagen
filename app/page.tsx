'use client';
import { useState, useEffect, useRef } from "react";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@300;400&display=swap');`;

const MODELS = [
  { id: "chroma", name: "CHROMA", sub: "Flux · Uncensored", tag: "HOT", credits: 4, desc: "Community Flux fork with censorship removed. Best anatomy and realism." },
  { id: "flux-dev", name: "Flux Dev", sub: "12B · Best quality", tag: null, credits: 4, desc: "Black Forest Labs flagship. Unmatched prompt adherence and detail." },
  { id: "flux-schnell", name: "Flux Schnell", sub: "12B · 4-step fast", tag: "FAST", credits: 1, desc: "4-step distilled model. Near-instant generation for iteration." },
  { id: "qwen2", name: "Qwen Image 2", sub: "Autoregressive", tag: "NEW", credits: 5, desc: "Uncensored out of the box. Exceptional text rendering and realism." },
  { id: "juggernaut", name: "Juggernaut XL v9", sub: "SDXL · Photorealism", tag: null, credits: 3, desc: "Top photorealism SDXL checkpoint. Skin, lighting, texture mastery." },
  { id: "pony", name: "Pony Diffusion v6", sub: "SDXL · Anime", tag: null, credits: 3, desc: "Best stylized/anime SDXL model. Huge LoRA ecosystem." },
  { id: "dreamshaper", name: "DreamShaper XL", sub: "SDXL · Versatile", tag: null, credits: 3, desc: "Excellent all-rounder. Great for concept art and fantasy illustration." },
  { id: "wan", name: "Wan 2.6", sub: "Video · 5s", tag: "VIDEO", credits: 20, desc: "State-of-the-art open video generation. 5 seconds, 720p." },
];

const LORAS = [
  { id: "xlabs-realism", name: "XLabs Realism", cat: "Quality", on: true },
  { id: "skin-detail", name: "Skin Detail v3", cat: "Quality", on: false },
  { id: "cinematic", name: "Cinematic Light", cat: "Style", on: false },
  { id: "hands-fix", name: "Hands Fix XL", cat: "Fix", on: true },
  { id: "pose-ctrl", name: "Pose Control", cat: "Control", on: false },
  { id: "anime-flux", name: "Anime Flux v2", cat: "Style", on: false },
  { id: "oil-paint", name: "Oil Painting", cat: "Style", on: false },
  { id: "neon-noir", name: "Neon Noir", cat: "Style", on: false },
];

const EXPLORE_ITEMS = [
  { id: 1, model: "CHROMA", prompt: "Ancient temple ruins at golden hour, cinematic", w: 1, h: 1, color: "#1a1a2e", accent: "#7c6fff" },
  { id: 2, model: "Flux Dev", prompt: "Portrait of a warrior, dramatic rim lighting", w: 2, h: 2, color: "#1a1a1a", accent: "#c8a882" },
  { id: 3, model: "Qwen 2", prompt: "Bioluminescent forest at night, ethereal", w: 1, h: 1, color: "#0a1628", accent: "#00d4aa" },
  { id: 4, model: "Juggernaut XL", prompt: "Mechanical dragon, concept art, detailed", w: 1, h: 2, color: "#1a0a0a", accent: "#e05c3a" },
  { id: 5, model: "Pony Diffusion", prompt: "Anime girl in cyberpunk cityscape", w: 1, h: 1, color: "#0d0d1a", accent: "#ff6eb4" },
  { id: 6, model: "DreamShaper XL", prompt: "Fantasy castle on floating island, dawn", w: 1, h: 1, color: "#0a1a10", accent: "#4dbd74" },
  { id: 7, model: "CHROMA", prompt: "Abstract fluid art, iridescent colors", w: 2, h: 1, color: "#1a1228", accent: "#b088ff" },
  { id: 8, model: "Flux Schnell", prompt: "Surreal desert with melting clocks", w: 1, h: 1, color: "#1a1200", accent: "#f0c040" },
];

const css = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0c0c0e;
    --bg2: #111114;
    --bg3: #18181c;
    --bg4: #1e1e24;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #f0f0f0;
    --text2: #888;
    --text3: #555;
    --accent: #7c6fff;
    --accent2: #5a4fcc;
    --accent-glow: rgba(124,111,255,0.15);
    --green: #4dbd74;
    --amber: #f0a030;
    --red: #e05c3a;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; line-height: 1.6; min-height: 100vh; overflow-x: hidden; }
  button { font-family: var(--font); cursor: pointer; }
  input, select, textarea { font-family: var(--font); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* NAV */
  .nav { display: flex; align-items: center; gap: 0; height: 52px; border-bottom: 1px solid var(--border); background: rgba(12,12,14,0.95); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; padding: 0 20px; }
  .nav-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; letter-spacing: -0.02em; color: var(--text); text-decoration: none; margin-right: 32px; flex-shrink: 0; }
  .logo-mark { width: 26px; height: 26px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
  .nav-tabs { display: flex; gap: 2px; flex: 1; }
  .nav-tab { padding: 6px 14px; border-radius: 6px; border: none; background: none; color: var(--text2); font-size: 13px; transition: all .15s; }
  .nav-tab:hover { color: var(--text); background: var(--bg3); }
  .nav-tab.active { color: var(--text); background: var(--bg3); }
  .nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .credits-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); font-size: 12px; color: var(--text2); }
  .credits-badge span { color: var(--text); font-weight: 500; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 7px; border: none; font-size: 13px; font-weight: 400; transition: all .15s; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); }
  .btn-ghost { background: none; color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--border2); background: var(--bg3); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }

  /* GENERATE PAGE */
  .gen-layout { display: flex; flex: 1; height: calc(100vh - 52px); overflow: hidden; }
  
  /* SIDEBAR */
  .sidebar { width: 260px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; background: var(--bg); padding: 16px; display: flex; flex-direction: column; gap: 20px; }
  .sidebar-section { display: flex; flex-direction: column; gap: 8px; }
  .section-label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--text3); font-weight: 500; margin-bottom: 2px; }
  .model-item { padding: 10px 12px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; transition: all .12s; background: transparent; display: flex; justify-content: space-between; align-items: flex-start; }
  .model-item:hover { background: var(--bg3); border-color: var(--border); }
  .model-item.selected { background: var(--bg3); border-color: var(--accent); }
  .model-item-left .model-title { font-size: 13px; font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 6px; }
  .model-item-left .model-sub { font-size: 11px; color: var(--text3); margin-top: 1px; font-family: var(--mono); }
  .tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }
  .tag-hot { background: rgba(224,92,58,.15); color: #e05c3a; }
  .tag-new { background: rgba(77,189,116,.15); color: #4dbd74; }
  .tag-fast { background: rgba(240,160,48,.15); color: #f0a030; }
  .tag-video { background: rgba(124,111,255,.15); color: #7c6fff; }
  .model-credits { font-size: 11px; color: var(--text3); font-family: var(--mono); flex-shrink: 0; margin-top: 1px; }

  .slider-row { display: flex; flex-direction: column; gap: 6px; }
  .slider-head { display: flex; justify-content: space-between; }
  .slider-val { font-size: 12px; color: var(--text); font-family: var(--mono); }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 2px; background: var(--bg4); border-radius: 1px; outline: none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; }

  /* MAIN CANVAS */
  .canvas { flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: var(--bg); }
  .canvas-top { padding: 20px 24px 0; }
  .lora-row { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 16px; }
  .lora-row::-webkit-scrollbar { height: 0; }
  .lora-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text3); font-size: 12px; transition: all .12s; cursor: pointer; }
  .lora-chip:hover { border-color: var(--border2); color: var(--text2); }
  .lora-chip.active { border-color: var(--accent); background: var(--accent-glow); color: #a89eff; }
  .lora-chip.browse { border-style: dashed; }

  .prompt-area { border: 1px solid var(--border); border-radius: 10px; background: var(--bg2); overflow: hidden; }
  .prompt-area:focus-within { border-color: var(--accent); }
  .prompt-textarea { width: 100%; background: none; border: none; outline: none; color: var(--text); font-size: 14px; padding: 14px 16px; resize: none; line-height: 1.6; min-height: 88px; }
  .prompt-textarea::placeholder { color: var(--text3); }
  .prompt-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-top: 1px solid var(--border); background: var(--bg3); }
  .prompt-tools { display: flex; gap: 4px; }
  .icon-btn { background: none; border: none; color: var(--text3); padding: 5px 8px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 4px; transition: all .12s; }
  .icon-btn:hover { color: var(--text); background: var(--bg4); }
  .gen-btn { display: flex; align-items: center; gap: 8px; padding: 8px 20px; background: var(--accent); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; }
  .gen-btn:hover { background: var(--accent2); transform: translateY(-1px); }
  .gen-btn:active { transform: translateY(0); }
  .gen-btn.loading { opacity: .7; pointer-events: none; }
  .cost-label { font-size: 11px; opacity: .5; font-family: var(--mono); }

  .params-strip { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin: 12px 0 20px; }
  .param-box { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }
  .param-lbl { font-size: 10px; color: var(--text3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em; }
  .param-val { font-size: 13px; color: var(--text); font-family: var(--mono); }
  .param-select { background: none; border: none; color: var(--text); font-family: var(--mono); font-size: 12px; outline: none; width: 100%; cursor: pointer; }
  .param-select option { background: var(--bg3); }
  .param-input { background: none; border: none; color: var(--text); font-family: var(--mono); font-size: 12px; outline: none; width: 100%; }

  /* OUTPUT GRID */
  .output-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 24px 24px; }
  .output-card { border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--bg2); cursor: pointer; transition: border-color .15s; }
  .output-card:hover { border-color: var(--border2); }
  .output-card.selected { border-color: var(--accent); }
  .output-img { width: 100%; aspect-ratio: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .output-img-inner { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; transition: all .3s; }
  .output-footer { padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); }
  .output-seed { font-size: 11px; color: var(--text3); font-family: var(--mono); }
  .output-actions { display: flex; gap: 2px; }

  /* progress */
  .progress-bar-wrap { height: 2px; background: var(--bg4); border-radius: 1px; overflow: hidden; margin: 0 24px 4px; }
  .progress-bar { height: 100%; background: var(--accent); border-radius: 1px; transition: width .2s ease; }
  .status-line { font-size: 11px; color: var(--text3); font-family: var(--mono); padding: 0 24px 16px; display: flex; gap: 12px; }

  /* EXPLORE */
  .explore-page { flex: 1; overflow-y: auto; }
  .explore-header { padding: 32px 28px 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .explore-header h2 { font-size: 22px; font-weight: 500; letter-spacing: -0.02em; }
  .explore-header p { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .filter-row { display: flex; gap: 6px; padding: 0 28px 20px; overflow-x: auto; }
  .filter-row::-webkit-scrollbar { height: 0; }
  .filter-pill { flex-shrink: 0; padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border); background: none; color: var(--text2); font-size: 12px; cursor: pointer; transition: all .12s; }
  .filter-pill:hover { border-color: var(--border2); color: var(--text); }
  .filter-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .masonry { columns: 4; gap: 10px; padding: 0 28px 28px; }
  .masonry-item { break-inside: avoid; margin-bottom: 10px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); cursor: pointer; position: relative; transition: transform .15s; }
  .masonry-item:hover { transform: translateY(-2px); border-color: var(--border2); }
  .masonry-item:hover .item-overlay { opacity: 1; }
  .item-visual { width: 100%; display: flex; align-items: center; justify-content: center; }
  .item-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,.8)); padding: 20px 10px 10px; opacity: 0; transition: opacity .15s; }
  .item-model { font-size: 10px; color: rgba(255,255,255,.5); font-family: var(--mono); margin-bottom: 2px; }
  .item-prompt { font-size: 11px; color: rgba(255,255,255,.85); line-height: 1.4; }
  .item-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity .15s; }
  .masonry-item:hover .item-actions { opacity: 1; }
  .action-pill { background: rgba(0,0,0,.6); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,.1); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 20px; cursor: pointer; }

  /* MODELS PAGE */
  .models-page { flex: 1; overflow-y: auto; padding: 32px 28px; }
  .models-header { margin-bottom: 28px; }
  .models-header h2 { font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin-bottom: 4px; }
  .models-header p { color: var(--text2); font-size: 13px; }
  .models-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .model-card-full { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: all .15s; }
  .model-card-full:hover { border-color: var(--border2); background: var(--bg3); }
  .model-card-full.featured { border-color: var(--accent); background: var(--accent-glow); }
  .mcf-head { display: flex; justify-content: space-between; align-items: flex-start; }
  .mcf-name { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; }
  .mcf-sub { font-size: 12px; color: var(--text3); font-family: var(--mono); margin-top: 2px; }
  .mcf-desc { font-size: 12px; color: var(--text2); line-height: 1.6; }
  .mcf-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border); }
  .mcf-credits { font-size: 12px; font-family: var(--mono); color: var(--text2); }
  .mcf-credits span { color: var(--accent); }
  .mcf-use { padding: 5px 14px; background: var(--accent); color: #fff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: background .12s; }
  .mcf-use:hover { background: var(--accent2); }

  /* SHIMMER */
  @keyframes shimmer { 0%,100%{opacity:.2} 50%{opacity:.5} }
  .shimmer { animation: shimmer 1.6s ease-in-out infinite; background: var(--bg4); }

  /* fade in */
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp .35s ease forwards; }

  /* AR buttons */
  .ar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .ar-btn { padding: 6px; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text3); font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all .12s; }
  .ar-btn:hover { border-color: var(--border2); color: var(--text2); }
  .ar-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

  .batch-row { display: flex; gap: 6px; }
  .batch-btn { flex: 1; padding: 6px; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text3); font-size: 13px; font-family: var(--mono); transition: all .12s; }
  .batch-btn:hover { border-color: var(--border2); color: var(--text2); }
  .batch-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
  .divider { height: 1px; background: var(--border); }
`;

const svgIcon = (name: string, size: number = 14) => {
  const icons = {
    sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" /><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" /></svg>,
    wand: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l5 5-11 11-5-5z" /><path d="M2 20l4-4" /><path d="M18 2l2 2" /><path d="M4 8l2 2" /><path d="M10 2l2 2" /><path d="M20 10l2 2" /></svg>,
    image: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
    video: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="15" height="12" rx="2" /><path d="M17 10l5-3v10l-5-3V10z" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
    maximize: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
    history: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
    bolt: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  };
  return icons[name as keyof typeof icons] || null;
};

function GeneratePage() {
  const [selectedModel, setSelectedModel] = useState("chroma");
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [steps, setSteps] = useState(28);
  const [cfg, setCfg] = useState(7);
  const [ar, setAr] = useState("1:1");
  const [batch, setBatch] = useState(1);
  const [seed, setSeed] = useState(42069);
  const [loras, setLoras] = useState(LORAS);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState([null, null, null, null]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("image");
  const genRef = useRef(null);

  const model = MODELS.find(m => m.id === selectedModel);
  const activeLoraCount = loras.filter(l => l.on).length;

  function toggleLora(id) {
    setLoras(l => l.map(x => x.id === id ? { ...x, on: !x.on } : x));
  }

  function randomSeed() {
    setSeed(Math.floor(Math.random() * 9999999));
  }

  async function generate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setProgress(0);
    setOutputs([null, null, null, null]);

    // animate progress while waiting
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(p + 2, 90);
      setProgress(p);
    }, 300);

    try {
      const promises = Array.from({ length: batch }, (_, i) =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt, model: selectedModel,
            steps, cfg, ar,
            seed: seed + i,
          }),
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      clearInterval(iv);
      setProgress(100);

      const newOutputs = results.map((r, i) => ({
        id: Date.now() + i,
        seed: seed + i,
        imageUrl: r.imageUrl,
        model: model?.name,
      }));
      while (newOutputs.length < 4) newOutputs.push(null);
      setOutputs(newOutputs);
    } catch (e) {
      clearInterval(iv);
      console.error(e);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }

  const creditCost = model ? model.credits * batch : 4;

  return (
    <div className="gen-layout">
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="section-label">Mode</div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["image", "video", "upscale"].map(m => (
              <button key={m} className={`btn btn-ghost btn-sm${mode === m ? " active" : ""}`}
                style={mode === m ? { borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-glow)" } : {}}
                onClick={() => setMode(m)}>
                {m === "image" ? svgIcon("image", 12) : m === "video" ? svgIcon("video", 12) : svgIcon("maximize", 12)}
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="divider" />
        <div className="sidebar-section">
          <div className="section-label">Model</div>
          {MODELS.filter(m => mode === "video" ? m.tag === "VIDEO" : m.tag !== "VIDEO").map(m => (
            <div key={m.id} className={`model-item${selectedModel === m.id ? " selected" : ""}`} onClick={() => setSelectedModel(m.id)}>
              <div className="model-item-left">
                <div className="model-title">
                  {m.name}
                  {m.tag && <span className={`tag tag-${m.tag.toLowerCase()}`}>{m.tag}</span>}
                </div>
                <div className="model-sub">{m.sub}</div>
              </div>
              <div className="model-credits">{m.credits}cr</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="sidebar-section">
          <div className="section-label">Aspect ratio</div>
          <div className="ar-grid">
            {["1:1", "16:9", "9:16", "4:3"].map(a => (
              <button key={a} className={`ar-btn${ar === a ? " active" : ""}`} onClick={() => setAr(a)}>{a}</button>
            ))}
          </div>
        </div>
        <div className="sidebar-section">
          <div className="slider-row">
            <div className="slider-head">
              <span className="section-label" style={{ margin: 0 }}>Steps</span>
              <span className="slider-val">{steps}</span>
            </div>
            <input type="range" min="4" max="50" step="1" value={steps} onChange={e => setSteps(Number(e.target.value))} />
          </div>
        </div>
        <div className="sidebar-section">
          <div className="slider-row">
            <div className="slider-head">
              <span className="section-label" style={{ margin: 0 }}>CFG scale</span>
              <span className="slider-val">{cfg.toFixed(1)}</span>
            </div>
            <input type="range" min="1" max="15" step="0.5" value={cfg} onChange={e => setCfg(Number(e.target.value))} />
          </div>
        </div>
        <div className="sidebar-section">
          <div className="section-label">Batch</div>
          <div className="batch-row">
            {[1, 2, 4].map(n => (
              <button key={n} className={`batch-btn${batch === n ? " active" : ""}`} onClick={() => setBatch(n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-top">
          <div className="lora-row">
            <span style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", flexShrink: 0, alignSelf: "center", marginRight: 4 }}>LoRAs</span>
            {loras.map(l => (
              <button key={l.id} className={`lora-chip${l.on ? " active" : ""}`} onClick={() => toggleLora(l.id)}>{l.name}</button>
            ))}
            <button className="lora-chip browse" onClick={() => { }}>+ browse</button>
          </div>

          <div className="prompt-area">
            <textarea
              className="prompt-textarea"
              placeholder="Describe your image — Flux handles natural language. Be detailed: lighting, style, mood, composition, subject."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
            />
            <div className="prompt-bar">
              <div className="prompt-tools">
                <button className="icon-btn" onClick={() => { if (prompt.trim()) { const p = `Enhance this image generation prompt for Flux models, making it more detailed and evocative (return only the improved prompt, no explanation): "${prompt}"`; window.sendPrompt?.(p) } }}>
                  {svgIcon("wand", 12)} enhance
                </button>
                <button className="icon-btn">{svgIcon("history", 12)} history</button>
                <button className="icon-btn">{svgIcon("image", 12)} img2img</button>
              </div>
              <button ref={genRef} className={`gen-btn${generating ? " loading" : ""}`} onClick={generate}>
                {svgIcon("sparkles", 13)}
                {generating ? "Generating…" : "Generate"}
                <span className="cost-label">{creditCost} cr</span>
              </button>
            </div>
          </div>

          <div className="params-strip">
            <div className="param-box">
              <div className="param-lbl">Seed</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input className="param-input" type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} style={{ width: "calc(100% - 22px)" }} />
                <button className="icon-btn" style={{ padding: 2 }} onClick={randomSeed}>{svgIcon("refresh", 12)}</button>
              </div>
            </div>
            <div className="param-box">
              <div className="param-lbl">Negative</div>
              <input className="param-input" type="text" value={negPrompt} onChange={e => setNegPrompt(e.target.value)} placeholder="blurry, deformed…" />
            </div>
            <div className="param-box">
              <div className="param-lbl">Scheduler</div>
              <select className="param-select">
                <option>DPM++ 2M Karras</option>
                <option>Euler a</option>
                <option>DDIM</option>
                <option>LMS Karras</option>
              </select>
            </div>
            <div className="param-box">
              <div className="param-lbl">Active LoRAs</div>
              <div className="param-val">{activeLoraCount} / {loras.length}</div>
            </div>
          </div>
        </div>

        {generating && (
          <>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="status-line">
              <span style={{ color: "var(--accent)" }}>{model?.name}</span>
              <span>{progress}% · step {Math.round(progress / 100 * steps)}/{steps}</span>
              <span>{ar} · {steps} steps · cfg {cfg.toFixed(1)}</span>
            </div>
          </>
        )}

        <div className="output-grid" style={{ gridTemplateColumns: batch === 1 ? "1fr" : "1fr 1fr" }}>
          {outputs.slice(0, batch).map((out, i) => (
            <div key={i} className={`output-card${selected === i ? " selected" : ""}`} onClick={() => setSelected(selected === i ? null : i)}>
             <div className="output-img" style={{ background: "var(--bg2)", minHeight: batch === 1 ? 400 : 240 }}>
                {out ? (
                  out.imageUrl ? (
                    <img src={out.imageUrl} alt="generated" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="output-img-inner fade-up" style={{ color: "var(--accent)" }}>
                      {svgIcon("image", 32)}
                      <span style={{ fontSize: 11, opacity: .6, fontFamily: "var(--mono)" }}>{out.model}</span>
                    </div>
                  )
                ) : (
                  <div className="output-img-inner" style={{ color: "var(--text3)" }}>
                    {generating ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--bg4)", borderTopColor: "var(--accent)" }} className="shimmer" />
                        <span style={{ fontSize: 11, fontFamily: "var(--mono)" }}>generating…</span>
                      </div>
                    ) : (
                      <>
                        {svgIcon("image", 24)}
                        <span style={{ fontSize: 11, opacity: .5 }}>output {i + 1}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="output-footer">
                <span className="output-seed">seed: {out ? out.seed.toLocaleString() : "—"}</span>
                <div className="output-actions">
                  <button className="icon-btn" aria-label="Download">{svgIcon("download", 13)}</button>
                  <button className="icon-btn" aria-label="Remix">{svgIcon("refresh", 13)}</button>
                  <button className="icon-btn" aria-label="Upscale">{svgIcon("maximize", 13)}</button>
                  <button className="icon-btn" aria-label="Like">{svgIcon("heart", 13)}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExplorePage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "CHROMA", "Flux Dev", "Qwen Image 2", "Juggernaut XL", "Pony Diffusion", "Video"];
  const items = filter === "All" ? EXPLORE_ITEMS : EXPLORE_ITEMS.filter(i => i.model.includes(filter.split(" ")[0]));

  const heights = [160, 200, 180, 240, 160, 200, 180, 160];

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div>
          <h2>Community</h2>
          <p>Created by the community, with full creative freedom</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm">{svgIcon("grid", 12)} Trending</button>
          <button className="btn btn-ghost btn-sm">{svgIcon("heart", 12)} Most liked</button>
        </div>
      </div>
      <div className="filter-row">
        {filters.map(f => (
          <button key={f} className={`filter-pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="masonry">
        {items.map((item, i) => (
          <div key={item.id} className="masonry-item">
            <div className="item-visual" style={{ height: heights[i % heights.length], background: item.color, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 6 }}>
              <div style={{ color: item.accent, opacity: .7 }}>{svgIcon("image", 28)}</div>
              <span style={{ fontSize: 10, color: item.accent, opacity: .4, fontFamily: "var(--mono)" }}>{item.model}</span>
            </div>
            <div className="item-overlay">
              <div className="item-model">{item.model}</div>
              <div className="item-prompt">{item.prompt}</div>
            </div>
            <div className="item-actions">
              <button className="action-pill">{svgIcon("heart", 10)} like</button>
              <button className="action-pill">{svgIcon("copy", 10)} remix</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelsPage() {
  return (
    <div className="models-page">
      <div className="models-header">
        <h2>Models</h2>
        <p>Current-generation models — updated as new releases drop</p>
      </div>
      <div className="models-grid">
        {MODELS.map((m, i) => (
          <div key={m.id} className={`model-card-full${i === 0 ? " featured" : ""}`}>
            <div className="mcf-head">
              <div>
                <div className="mcf-name">{m.name}</div>
                <div className="mcf-sub">{m.sub}</div>
              </div>
              {m.tag && <span className={`tag tag-${m.tag.toLowerCase()}`}>{m.tag}</span>}
            </div>
            <div className="mcf-desc">{m.desc}</div>
            <div className="mcf-footer">
              <div className="mcf-credits"><span>{m.credits}</span> credits / image</div>
              <button className="mcf-use">Use model</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("generate");
  const [credits] = useState(420);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">
            <div className="logo-mark">{svgIcon("sparkles", 13)}</div>
            lumagen
          </div>
          <div className="nav-tabs">
            {[["generate", "Generate", svgIcon("sparkles", 13)], ["explore", "Explore", svgIcon("grid", 13)], ["models", "Models", svgIcon("image", 13)]].map(([id, label, icon]) => (
              <button key={id} className={`nav-tab${page === id ? " active" : ""}`} onClick={() => setPage(id)}>
                {icon} {label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <div className="credits-badge">
              {svgIcon("bolt", 11)} <span>{credits.toLocaleString()}</span> credits
            </div>
            <button className="btn btn-primary btn-sm">Buy credits</button>
            <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}>{svgIcon("user", 14)}</button>
          </div>
        </nav>

        {page === "generate" && <GeneratePage />}
        {page === "explore" && <ExplorePage />}
        {page === "models" && <ModelsPage />}
      </div>
    </>
  );
}

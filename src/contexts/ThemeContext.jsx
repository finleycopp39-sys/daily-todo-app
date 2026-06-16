import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const THEMES = {
  jarvis:        { id:'jarvis',        name:'JARVIS',         desc:'Electric blue on deep black',      bg:'#0a0a0f', text:'#d0eeff',  textMuted:'140,200,230', accent:'#00d4ff', accent2:'#0066ff', accentRgb:'0,212,255',   bgPattern:'grid',  hudFont:'orbitron',      bodyFont:'exo2'         },
  phantom:       { id:'phantom',       name:'PHANTOM',        desc:'Violet and pink on near-black',    bg:'#0d0a14', text:'#f0e8ff',  textMuted:'196,168,230', accent:'#a855f7', accent2:'#ec4899', accentRgb:'168,85,247',  bgPattern:'hex',   hudFont:'orbitron',      bodyFont:'exo2'         },
  matrix:        { id:'matrix',        name:'MATRIX',         desc:'Neon green on pure black',         bg:'#000300', text:'#00ff41',  textMuted:'0,200,50',    accent:'#00ff41', accent2:'#00cc33', accentRgb:'0,255,65',    bgPattern:'scan',  hudFont:'share-tech',    bodyFont:'share-tech'   },
  solar:         { id:'solar',         name:'SOLAR',          desc:'Amber and gold on warm dark',      bg:'#100900', text:'#fef3c7',  textMuted:'220,170,80',  accent:'#f59e0b', accent2:'#ef4444', accentRgb:'245,158,11',  bgPattern:'dots',  hudFont:'rajdhani',      bodyFont:'exo2'         },
  arctic:        { id:'arctic',        name:'ARCTIC',         desc:'Ice blue on deep navy',            bg:'#030d1c', text:'#e0f7fa',  textMuted:'150,210,220', accent:'#67e8f9', accent2:'#38bdf8', accentRgb:'103,232,249', bgPattern:'clean', hudFont:'space-grotesk', bodyFont:'space-grotesk'},
  midnight_rose: { id:'midnight_rose', name:'MIDNIGHT ROSE',  desc:'Rose gold on near-black',          bg:'#0a0508', text:'#ffe4e6',  textMuted:'220,150,160', accent:'#f43f5e', accent2:'#fb7185', accentRgb:'244,63,94',   bgPattern:'dots',  hudFont:'orbitron',      bodyFont:'inter'        },
};

export const FONT_OPTIONS = {
  orbitron:        { label:'Orbitron',         family:"'Orbitron','Courier New',monospace",         tag:'FUTURISTIC' },
  'share-tech':    { label:'Share Tech Mono',  family:"'Share Tech Mono','Courier New',monospace",  tag:'TERMINAL'   },
  rajdhani:        { label:'Rajdhani',          family:"'Rajdhani',sans-serif",                      tag:'SHARP'      },
  'space-grotesk': { label:'Space Grotesk',     family:"'Space Grotesk',sans-serif",                 tag:'MINIMAL'    },
  exo2:            { label:'Exo 2',             family:"'Exo 2',system-ui,sans-serif",               tag:'SCI-FI'     },
  inter:           { label:'Inter',             family:"'Inter',system-ui,sans-serif",               tag:'NEUTRAL'    },
};

export const BG_OPTIONS = [
  { id:'grid',  label:'GRID',      desc:'HUD grid lines'     },
  { id:'dots',  label:'DOTS',      desc:'Dot matrix'         },
  { id:'scan',  label:'SCAN',      desc:'CRT scan lines'     },
  { id:'hex',   label:'HEX',       desc:'Hexagonal mesh'     },
  { id:'clean', label:'CLEAN',     desc:'Solid background'   },
];

const DEFAULT_PREFS = {
  themeId: 'jarvis',
  customAccent: null,
  bgPattern: null,
  bgIntensity: 'medium',
  hudFont: null,
  bodyFont: null,
  profile: {
    name: '',
    avatarId: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workStart: '09:00',
    workEnd: '18:00',
  },
  notifDefaultTime: '09:00',
  notifDigest: false,
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function getBgCss(pattern, accentRgb, intensity) {
  const a = { subtle:0.02, medium:0.035, strong:0.065 }[intensity] ?? 0.035;
  if (pattern === 'grid') return {
    image: `linear-gradient(rgba(${accentRgb},${a}) 1px,transparent 1px),linear-gradient(90deg,rgba(${accentRgb},${a}) 1px,transparent 1px)`,
    size: '40px 40px',
  };
  if (pattern === 'dots') return {
    image: `radial-gradient(circle,rgba(${accentRgb},${a*3}) 1.5px,transparent 1.5px)`,
    size: '28px 28px',
  };
  if (pattern === 'scan') return {
    image: `repeating-linear-gradient(0deg,rgba(${accentRgb},${a*0.6}) 0px,rgba(${accentRgb},${a*0.6}) 1px,transparent 1px,transparent 14px)`,
    size: '100% 14px',
  };
  if (pattern === 'hex') {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='104'><polygon points='30,1 59,16 59,46 30,61 1,46 1,16' fill='none' stroke='rgb(${accentRgb})' stroke-width='1' stroke-opacity='${(a*2).toFixed(3)}'/><polygon points='30,53 59,68 59,98 30,113 1,98 1,68' fill='none' stroke='rgb(${accentRgb})' stroke-width='1' stroke-opacity='${(a*2).toFixed(3)}'/></svg>`;
    return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, size: '60px 104px' };
  }
  return { image: 'none', size: 'auto' };
}

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('app-prefs') ?? '{}');
      return { ...DEFAULT_PREFS, ...saved, profile: { ...DEFAULT_PREFS.profile, ...(saved.profile ?? {}) } };
    } catch { return DEFAULT_PREFS; }
  });

  const theme = THEMES[prefs.themeId] ?? THEMES.jarvis;
  const accent = prefs.customAccent ?? theme.accent;
  const accentRgb = prefs.customAccent ? hexToRgb(prefs.customAccent) : theme.accentRgb;
  const bgPattern = prefs.bgPattern ?? theme.bgPattern;
  const resolvedHudFont = FONT_OPTIONS[prefs.hudFont ?? theme.hudFont]?.family ?? FONT_OPTIONS.orbitron.family;
  const resolvedBodyFont = FONT_OPTIONS[prefs.bodyFont ?? theme.bodyFont]?.family ?? FONT_OPTIONS.exo2.family;

  useEffect(() => {
    const r = document.documentElement;
    const set = (k,v) => r.style.setProperty(k,v);
    set('--bg', theme.bg);
    set('--surface', `rgba(${accentRgb},0.04)`);
    set('--surface2', `rgba(${accentRgb},0.08)`);
    set('--border', `rgba(${accentRgb},0.18)`);
    set('--border-glow', `rgba(${accentRgb},0.55)`);
    set('--text', theme.text);
    set('--text-muted', `rgba(${theme.textMuted},0.55)`);
    set('--cyan', accent);
    set('--blue', theme.accent2);
    set('--accent-rgb', accentRgb);
    set('--glow-sm', `0 0 10px rgba(${accentRgb},0.45)`);
    set('--glow-md', `0 0 25px rgba(${accentRgb},0.2)`);
    set('--font-hud', resolvedHudFont);
    set('--font-body', resolvedBodyFont);
    const bg = getBgCss(bgPattern, accentRgb, prefs.bgIntensity);
    set('--bg-image', bg.image);
    set('--bg-size', bg.size);
  }, [prefs, theme, accent, accentRgb, bgPattern, resolvedHudFont, resolvedBodyFont]);

  const updatePref = useCallback((key, value) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('app-prefs', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback((updates) => {
    setPrefs(prev => {
      const next = { ...prev, profile: { ...prev.profile, ...updates } };
      localStorage.setItem('app-prefs', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetToTheme = useCallback((themeId) => {
    setPrefs(prev => {
      const next = { ...prev, themeId, customAccent: null, bgPattern: null, hudFont: null, bodyFont: null };
      localStorage.setItem('app-prefs', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ prefs, updatePref, updateProfile, resetToTheme, theme, accent, accentRgb, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

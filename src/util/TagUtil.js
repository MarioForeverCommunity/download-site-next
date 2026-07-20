const TAG_ZH_MAP = {
  "April Fools": "愚人节",
  "Christmas": "圣诞节",
  "Contest": "竞赛",
  "Creepypasta": "都市传说",
  "Halloween": "万圣节",
  "Mod": "改版",
  "Multiplayer": "多人游戏",
  "New Year": "新年",
  "PK!MF": "PK!MF",
  "Remake": "重制",
  "Speedrun": "竞速",
  "Single Level": "单关",
  "Collab": "合作",
  "Demo": "试玩版",
  "Minigame": "小游戏",
  "Joke": "玩笑",
  "Gun": "武器",
  "Hardcore": "硬核",
  "Metroidvania": "银河城",
  "Horror": "恐怖",
  "Festive": "节日",
  "Other": "其他",
  "Untagged": "未标签",
  "Cancelled": "已取消",
  // Softendo genres
  "Endless": "无尽",
  "Find and Click": "益智",
  "Minix": "Minix",
  "Platformer": "平台跳跃",
  "Puzzle": "解谜",
  "Level Editor": "关卡编辑",
  "Vertical-scroll": "纵向滚屏",
};

// 固定标签颜色映射：text 为用户指定深色模式文字颜色
// 浅色模式：text 加深确保白色背景可读，border 为中间色，bg 为浅色
const TAG_COLOR_MAP = {
  "April Fools":  { bg: "#e0f7fa", border: "#00bcd4", text: "#0097a7" },
  "Christmas":    { bg: "#fde3e4", border: "#e06068", text: "#c0303a" },
  "Collab":       { bg: "#ede3f7", border: "#a070d0", text: "#7848a8" },
  "Contest":      { bg: "#fbf0da", border: "#d8a040", text: "#b07820" },
  "Creepypasta":  { bg: "#e8e0f0", border: "#9080a8", text: "#685880" },
  "Demo":         { bg: "#e0ede8", border: "#88b0a0", text: "#689080" },
  "Festive":      { bg: "#d8e5fc", border: "#4880d0", text: "#3058a0" },
  "Gun":          { bg: "#e4e4f0", border: "#a0a0b8", text: "#7878a0" },
  "Halloween":    { bg: "#ffe7d9", border: "#e89050", text: "#c06830" },
  "Hardcore":     { bg: "#fde1ee", border: "#e04090", text: "#c02070" },
  "Horror":       { bg: "#fdd5d7", border: "#e84850", text: "#c02028" },
  "Joke":         { bg: "#f5e0eb", border: "#c06098", text: "#a04078" },
  "Kaizo":        { bg: "#dff0e8", border: "#60c8a0", text: "#40a080" },
  "Metroidvania": { bg: "#efebe9", border: "#795548", text: "#4e342e" },
  "Minigame":     { bg: "#dff5f5", border: "#40b0b0", text: "#289090" },
  "Mod":          { bg: "#e5f2e8", border: "#78b080", text: "#4a8858" },
  "Multiplayer":  { bg: "#fff8e1", border: "#ffc107", text: "#f57f17" },
  "New Year":     { bg: "#fde4fd", border: "#e050e8", text: "#b830c0" },
  "Other":        { bg: "#e2e5ef", border: "#8088a8", text: "#505878" },
  "PK!MF":        { bg: "#fce4e4", border: "#d0706e", text: "#b84a48" },
  "Remake":       { bg: "#dfe8f8", border: "#6080b8", text: "#406098" },
  "STG":          { bg: "#e1e8fc", border: "#6078e0", text: "#4058c0" },
  "Speedrun":     { bg: "#d8faf0", border: "#40d890", text: "#20b070" },
  "Single Level": { bg: "#f0e8f5", border: "#a088c0", text: "#7860a0" },
  "Untagged":     { bg: "#f0f0f0", border: "#b8b8b8", text: "#606060" },
  "Cancelled":    { bg: "#e8e8e8", border: "#909090", text: "#606060" },
  // Softendo genres
  "Endless":          { bg: "#eef5e0", border: "#90b060", text: "#6a8840" },
  "Find and Click":   { bg: "#fde4fd", border: "#e050e8", text: "#b830c0" },
  "Minix":            { bg: "#fce4e4", border: "#d0706e", text: "#b84a48" },
  "Platformer":       { bg: "#dfe8f8", border: "#6080b8", text: "#406098" },
  "Puzzle":           { bg: "#f0e8f5", border: "#a088c0", text: "#7860a0" },
  "Level Editor":     { bg: "#dff5f0", border: "#60b8a8", text: "#409888" },
  "Vertical-scroll":  { bg: "#ede3f7", border: "#9078d0", text: "#6858b0" },
};

// 深色模式：text/border 用指定颜色，bg 为深色柔和背景
const TAG_COLOR_MAP_DARK = {
  "April Fools":  { bg: "#1a3a3a", border: "#00bcd4", text: "#4dd0e1" },
  "Christmas":    { bg: "#3a1818", border: "#FF4B52", text: "#FF4B52" },
  "Collab":       { bg: "#2a1a38", border: "#A981DE", text: "#A981DE" },
  "Contest":      { bg: "#382e18", border: "#ECB147", text: "#ECB147" },
  "Creepypasta":  { bg: "#282030", border: "#816EA4", text: "#816EA4" },
  "Demo":         { bg: "#1e2a28", border: "#93B2A8", text: "#93B2A8" },
  "Festive":      { bg: "#182838", border: "#6595F3", text: "#6595F3" },
  "Gun":          { bg: "#282830", border: "#9A98B6", text: "#9A98B6" },
  "Halloween":    { bg: "#382818", border: "#FF8E57", text: "#FF8E57" },
  "Hardcore":     { bg: "#381828", border: "#FF2285", text: "#FF2285" },
  "Horror":       { bg: "#4a1b0e", border: "#FF151F", text: "#FF151F" },
  "Joke":         { bg: "#301828", border: "#C3578C", text: "#C3578C" },
  "Kaizo":        { bg: "#183028", border: "#7DD1AD", text: "#7DD1AD" },
  "Metroidvania": { bg: "#2a2220", border: "#795548", text: "#a1887f" },
  "Minigame":     { bg: "#183030", border: "#57C2C3", text: "#57C2C3" },
  "Mod":          { bg: "#1e3020", border: "#98C991", text: "#98C991" },
  "Multiplayer":  { bg: "#3a3a1a", border: "#ffc107", text: "#ffd54f" },
  "New Year":     { bg: "#301838", border: "#FF5AFA", text: "#FF5AFA" },
  "Other":        { bg: "#1e2430", border: "#6C779B", text: "#6C779B" },
  "PK!MF":        { bg: "#3a2020", border: "#da6260", text: "#da6260" },
  "Remake":       { bg: "#1e2838", border: "#7E9ED8", text: "#7E9ED8" },
  "STG":          { bg: "#1a2238", border: "#6785F3", text: "#6785F3" },
  "Speedrun":     { bg: "#183828", border: "#3EF5A7", text: "#3EF5A7" },
  "Single Level": { bg: "#281830", border: "#B088C0", text: "#B088C0" },
  "Untagged":     { bg: "#2a2a2a", border: "#E5E5E5", text: "#E5E5E5" },
  "Cancelled":    { bg: "#282828", border: "#A7A7A7", text: "#A7A7A7" },
  // Softendo genres
  "Endless":          { bg: "#1e3020", border: "#A0C072", text: "#A0C072" },
  "Find and Click":   { bg: "#301838", border: "#FF5AFA", text: "#FF5AFA" },
  "Minix":            { bg: "#3a2020", border: "#da6260", text: "#da6260" },
  "Platformer":       { bg: "#1e2838", border: "#7E9ED8", text: "#7E9ED8" },
  "Puzzle":           { bg: "#281830", border: "#B088C0", text: "#B088C0" },
  "Level Editor":     { bg: "#1a3030", border: "#83CCC2", text: "#83CCC2" },
  "Vertical-scroll":  { bg: "#2a1a38", border: "#9F8CE3", text: "#9F8CE3" },
};

// 未知标签的回退颜色
const FALLBACK_TAG_COLOR = { bg: "#ececec", border: "#b5b5b5", text: "#888888" };
const FALLBACK_TAG_COLOR_DARK = { bg: "#2a2a2a", border: "#666666", text: "#aaaaaa" };

export function getTagColor(tag, isDark) {
  const map = isDark ? TAG_COLOR_MAP_DARK : TAG_COLOR_MAP;
  const fallback = isDark ? FALLBACK_TAG_COLOR_DARK : FALLBACK_TAG_COLOR;
  return map[tag] || fallback;
}

export function getTagLabel(tag, lan) {
  if (lan === "zh" && TAG_ZH_MAP[tag]) {
    return TAG_ZH_MAP[tag];
  }
  return tag;
}

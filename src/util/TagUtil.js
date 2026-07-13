const TAG_ZH_MAP = {
  "April Fools": "愚人节",
  "Christmas": "圣诞节",
  "Contest": "竞赛",
  "Creepypasta": "都市传说",
  "Halloween": "万圣节",
  "Mods": "改版",
  "Multiplayer": "多人游戏",
  "New Year": "新年",
  "PK!MF": "PK!MF",
  "Remake": "重制",
  "Speedrun": "竞速",
};

export function getTagLabel(tag, lan) {
  if (lan === "zh" && TAG_ZH_MAP[tag]) {
    return TAG_ZH_MAP[tag];
  }
  return tag;
}

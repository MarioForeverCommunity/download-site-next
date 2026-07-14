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
};

export function getTagLabel(tag, lan) {
  if (lan === "zh" && TAG_ZH_MAP[tag]) {
    return TAG_ZH_MAP[tag];
  }
  return tag;
}

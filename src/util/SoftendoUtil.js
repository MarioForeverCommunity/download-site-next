// Base URLs for Softendo downloads (English version - original)
const BASE_URLS_EN = {
  mario: {
    installer: "https://file.marioforever.net/mario-forever/games/softendo/installer/",
    portable: "https://file.marioforever.net/mario-forever/games/softendo/portable/"
  },
  mff: {
    installer: "https://file.marioforever.net/mario-forever/games/softendo/Flash/exe-installer/",
    portable_swf: "https://file.marioforever.net/mario-forever/games/softendo/Flash/swf/Mario%20Forever%20Flash/",
    portable_exe: "https://file.marioforever.net/mario-forever/games/softendo/Flash/exe/"
  },
  flash: {
    installer: "https://file.marioforever.net/mario-forever/games/softendo/Flash/exe-installer/",
    portable_swf: "https://file.marioforever.net/mario-forever/games/softendo/Flash/swf/Other/",
    portable_exe: "https://file.marioforever.net/mario-forever/games/softendo/Flash/exe/",
    portable_zip: "https://file.marioforever.net/mario-forever/games/softendo/Flash/zip/"
  },
  "non-mario": {
    installer: "https://file.marioforever.net/mario-forever/games/softendo/Non-Mario%20games%20by%20Buziol%20(Softendo)/installer/",
    portable: "https://file.marioforever.net/mario-forever/games/softendo/Non-Mario%20games%20by%20Buziol%20(Softendo)/portable/",
    kliktopia: "https://file.marioforever.net/mario-forever/games/softendo/Non-Mario%20games%20by%20Buziol%20(Softendo)/Kliktopia%20repackages/"
  },
  banesoft: {
    installer: "https://file.marioforever.net/mario-forever/games/banesoft/installer/",
    portable: "https://file.marioforever.net/mario-forever/games/banesoft/portable/"
  }
};

// Base URLs for Softendo downloads (Chinese version)
const BASE_URLS_ZH = {
  mario: {
    installer: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/%E5%AE%89%E8%A3%85%E7%89%88/",
    portable: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/%E7%BB%BF%E8%89%B2%E7%89%88/"
  },
  mff: {
    installer: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/exe-installer/",
    portable_swf: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/swf/Mario%20Forever%20Flash/",
    portable_exe: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/exe/"
  },
  flash: {
    installer: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/exe-installer/",
    portable_swf: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/swf/Other/",
    portable_exe: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/exe/",
    portable_zip: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Flash/zip/"
  },
  "non-mario": {
    installer: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Non-Mario%20games%20by%20Buziol%20(Softendo)/installer/",
    portable: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Non-Mario%20games%20by%20Buziol%20(Softendo)/portable/",
    kliktopia: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Non-Mario%20games%20by%20Buziol%20(Softendo)/Kliktopia%20repackages/"
  },
  banesoft: {
    installer: "https://file.marioforever.net/Mario%20Forever/Banesoft%20%E7%9B%B8%E5%85%B3%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/%E5%AE%89%E8%A3%85%E7%89%88/",
    portable: "https://file.marioforever.net/Mario%20Forever/Banesoft%20%E7%9B%B8%E5%85%B3%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/%E7%BB%BF%E8%89%B2%E7%89%88/"
  }
};

// Special URLs for NSMF games (Chinese version only)
const NSMF_URLS_ZH = {
  installer: "https://file.marioforever.net/Mario%20Forever/New%20Super%20Mario%20Forever%20%E4%B8%8B%E8%BD%BD/%E5%AE%89%E8%A3%85%E7%89%88/",
  portable: "https://file.marioforever.net/Mario%20Forever/New%20Super%20Mario%20Forever%20%E4%B8%8B%E8%BD%BD/%E7%BB%BF%E8%89%B2%E7%89%88/"
};

function getBaseUrl(type, lan, nsmf) {
  // NSMF games use special URLs (Chinese only)
  if (nsmf && lan === "zh") {
    return NSMF_URLS_ZH;
  }
  return lan === "zh" ? BASE_URLS_ZH[type] : BASE_URLS_EN[type];
}

export function isKliktopiaRepackage(verKey) {
  return verKey && verKey.toLowerCase().includes("kliktopia repackage");
}

function processPortableItem(value, baseUrl, label) {
  if (Array.isArray(value)) {
    // 如果值是数组，生成多个链接
    return value.map((item, index) => ({
      label: value.length > 1 ? `${label} ${index + 1}` : label,
      url: baseUrl + encodeURIComponent(item)
    }));
  }
  if (typeof value === "string") {
    return [{ label, url: baseUrl + encodeURIComponent(value) }];
  }
  return [];
}

export function getInstallerUrl(type, fileName, lan = "en", nsmf = false) {
  if (!fileName) return null;
  const urls = getBaseUrl(type, lan, nsmf);
  if (!urls || !urls.installer) return null;
  return urls.installer + encodeURIComponent(fileName);
}

export function getPortableUrls(type, portable, lan = "en", nsmf = false, verKey = null) {
  if (!portable) return [];
  const urls = getBaseUrl(type, lan, nsmf);
  if (!urls) return [];

  // portable is a simple string filename
  if (typeof portable === "string") {
    const useKliktopia = type === "non-mario" && isKliktopiaRepackage(verKey);
    const baseUrl = useKliktopia ? (urls.kliktopia || urls.portable) : (urls.portable || urls.portable_zip || urls.portable_exe);
    if (!baseUrl) return [];
    return [{ label: "portable", url: baseUrl + encodeURIComponent(portable) }];
  }

  // portable is an object with exe/swf/zip keys (for flash/mff types)
  const result = [];

  // Determine base URL for non-mario kliktopia repackage
  const useKliktopia = type === "non-mario" && isKliktopiaRepackage(verKey);
  const defaultBaseUrl = useKliktopia ? urls.kliktopia : urls.portable;

  // Handle exe (for flash/mff types)
  if (portable.exe) {
    const exeBase = urls.portable_exe || defaultBaseUrl;
    if (exeBase) {
      result.push(...processPortableItem(portable.exe, exeBase, "exe"));
    }
  }

  // Handle swf (for flash/mff types)
  if (portable.swf) {
    const swfBase = type === "mff" ? urls.portable_swf : (urls.portable_swf || defaultBaseUrl);
    if (swfBase) {
      result.push(...processPortableItem(portable.swf, swfBase, "swf"));
    }
  }

  // Handle zip (for flash types)
  if (portable.zip) {
    const zipBase = urls.portable_zip || defaultBaseUrl;
    if (zipBase) {
      result.push(...processPortableItem(portable.zip, zipBase, "zip"));
    }
  }

  // Handle other keys (for non-mario/mario/banesoft types)
  if (result.length === 0 && typeof portable === "object") {
    const baseUrl = defaultBaseUrl || urls.portable_zip || urls.portable_exe;
    if (baseUrl) {
      const keys = Object.keys(portable).filter(k => portable[k]);
      for (const key of keys) {
        const value = portable[key];
        if (typeof value === "string" || Array.isArray(value)) {
          result.push(...processPortableItem(value, baseUrl, key));
        }
      }
    }
  }

  return result;
}

export function getTypeLabel(type) {
  const labels = {
    mario: "Mario",
    mff: "MFF",
    flash: "Flash",
    "non-mario": "Non-Mario",
    banesoft: "Banesoft"
  };
  return labels[type] || type;
}

export function getTypeColor(type) {
  const colors = {
    mario: { bg: "#ff3330", border: "#b71c1c" },
    mff: { bg: "#ff9800", border: "#e65100" },
    flash: { bg: "#9c27b0", border: "#6a1b9a" },
    "non-mario": { bg: "#008cff", border: "#0d47a1" },
    banesoft: { bg: "#4caf50", border: "#2e7d32" }
  };
  return colors[type] || { bg: "#888", border: "#555" };
}

export function getTypeDotWidth(type) {
  // Widths based on label text length
  const widths = {
    mario: "2.5em",
    mff: "2em",
    flash: "2.5em",
    "non-mario": "4.3em",
    banesoft: "3.8em"
  };
  return widths[type] || "3em";
}

export function getSoftwareLabel(software) {
  const labels = {
    mmf: "Multimedia Fusion",
    flash: "Flash",
    gamemaker: "GameMaker",
    other: "Other"
  };
  // 支持数组格式的 software
  if (Array.isArray(software)) {
    return software.map(s => labels[s] || s).filter(Boolean);
  }
  return labels[software] || software || "";
}

/**
 * 根据 type 和所有版本的 portable 判断默认的 software 值
 * - 如果所有版本中同时存在 exe 和 zip（即使在不同版本），返回 ["flash", "mmf"]
 * - 否则返回 "flash"
 */
export function getSoftwareDefault(type, entry) {
  if (type !== "mff" && type !== "flash") {
    return null;
  }

  // 收集所有 portable 数据
  const portables = [];

  if (entry.portable) {
    portables.push(entry.portable);
  }

  if (entry.ver && Array.isArray(entry.ver)) {
    for (const verRaw of entry.ver) {
      const verObj = verRaw[Object.keys(verRaw)[0]];
      if (verObj.portable) {
        portables.push(verObj.portable);
      }
    }
  }

  // 检查所有版本中是否存在 exe 和 zip（允许分布在不同版本）
  let hasAnyExe = false;
  let hasAnyZip = false;

  for (const portable of portables) {
    if (portable && typeof portable === "object") {
      if (portable.exe && (typeof portable.exe === "string" || (Array.isArray(portable.exe) && portable.exe.length > 0))) {
        hasAnyExe = true;
      }
      if (portable.zip && (typeof portable.zip === "string" || (Array.isArray(portable.zip) && portable.zip.length > 0))) {
        hasAnyZip = true;
      }
    }
  }

  if (hasAnyExe || hasAnyZip) {
    return ["flash", "mmf"];
  }

  return "flash";
}

export function normalizeSoftendoList(list, lan = "en") {
  const games = [];
  for (const entry of list) {
    const game = { ...entry };
    // Use `game` or `name` field for the title
    game.game = entry.game || entry.name;
    game.category = "softendo";

    // Handle software field with default for mmf/flash types
    // 优先使用显式指定的 software，否则根据 portable 判断
    if (entry.software) {
      game.software = entry.software;
    } else if (entry.type === "mff" || entry.type === "flash") {
      game.software = getSoftwareDefault(entry.type, entry);
    } else {
      game.software = "";
    }

    // Check if this is an NSMF game
    const isNsmf = entry.nsmf === true;

    // Normalize to ver array format
    if (entry.ver && Array.isArray(entry.ver)) {
      // Already multi-version, normalize each version
      game.ver = entry.ver.map((verRaw) => {
        const verKey = Object.keys(verRaw)[0];
        const verObj = verRaw[verKey];
        return {
          [verKey]: {
            ...verObj,
            year: verObj.year,
            installer_url: getInstallerUrl(entry.type, verObj.installer, lan, isNsmf),
            portable_urls: getPortableUrls(entry.type, verObj.portable, lan, isNsmf, verKey)
          }
        };
      });
      // Set current version to first
      const firstVerKey = Object.keys(game.ver[0])[0];
      const firstVerObj = game.ver[0][firstVerKey];
      game.currentVerStr = firstVerKey;
      game.currentVer = firstVerObj;
    } else {
      // Single version entry (no ver field in original YAML)
      const year = entry.year;
      const verObj = {
        year,
        installer: entry.installer,
        portable: entry.portable,
        installer_url: getInstallerUrl(entry.type, entry.installer, lan, isNsmf),
        portable_urls: getPortableUrls(entry.type, entry.portable, lan, isNsmf, String(year))
      };
      game.ver = [{ [String(year)]: verObj }];
      game.currentVerStr = "";
      game.currentVer = verObj;
      game._singleVersion = true;
    }

    games.push(game);
  }
  return games;
}

export function getSoftendoGameName(entry) {
  return entry.game || entry.name || "";
}

export function getSoftendoYearRange(entry) {
  if (!entry.ver || !Array.isArray(entry.ver)) {
    const year = entry.currentVer?.year || entry.year || null;
    if (year === null) return { initialYear: null, latestYear: null, display: "?" };
    return { initialYear: year, latestYear: year, display: String(year) };
  }

  let earliestYear = null;
  let latestYear = null;

  for (const verRaw of entry.ver) {
    const verKey = Object.keys(verRaw)[0];
    if (isKliktopiaRepackage(verKey)) continue;
    const verObj = verRaw[verKey];
    if (verObj.year) {
      if (earliestYear === null || verObj.year < earliestYear) {
        earliestYear = verObj.year;
      }
      if (latestYear === null || verObj.year > latestYear) {
        latestYear = verObj.year;
      }
    }
  }

  const initialYear = entry.initial_year || earliestYear;

  if (initialYear === null && latestYear === null) {
    return { initialYear: null, latestYear: null, display: "?" };
  }

  if (initialYear !== null && latestYear !== null && initialYear !== latestYear) {
    return { initialYear, latestYear, display: `${initialYear} - ${latestYear}` };
  }

  const year = initialYear !== null ? initialYear : latestYear;
  return { initialYear: year, latestYear: year, display: String(year) };
}

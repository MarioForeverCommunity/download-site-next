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
    portable: "https://file.marioforever.net/mario-forever/games/softendo/Non-Mario%20games%20by%20Buziol%20(Softendo)/portable/"
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
    portable: "https://file.marioforever.net/Mario%20Forever/Softendo%20%E5%85%B6%E4%BB%96%E6%B8%B8%E6%88%8F%E4%B8%8B%E8%BD%BD/Non-Mario%20games%20by%20Buziol%20(Softendo)/portable/"
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

export function getInstallerUrl(type, fileName, lan = "en", nsmf = false) {
  if (!fileName) return null;
  const urls = getBaseUrl(type, lan, nsmf);
  if (!urls || !urls.installer) return null;
  return urls.installer + encodeURIComponent(fileName);
}

export function getPortableUrls(type, portable, lan = "en", nsmf = false) {
  if (!portable) return [];
  const urls = getBaseUrl(type, lan, nsmf);
  if (!urls) return [];

  // portable is a simple string filename
  if (typeof portable === "string") {
    const baseUrl = urls.portable || urls.portable_zip || urls.portable_exe;
    if (!baseUrl) return [];
    return [{ label: "portable", url: baseUrl + encodeURIComponent(portable) }];
  }

  // portable is an object with exe/swf/zip keys
  const result = [];
  if (portable.exe && urls.portable_exe) {
    result.push({ label: "exe", url: urls.portable_exe + encodeURIComponent(portable.exe) });
  }
  if (portable.swf) {
    const swfBase = type === "mff" ? urls.portable_swf : (urls.portable_swf || urls.portable);
    if (swfBase) {
      result.push({ label: "swf", url: swfBase + encodeURIComponent(portable.swf) });
    }
  }
  if (portable.zip && urls.portable_zip) {
    result.push({ label: "zip", url: urls.portable_zip + encodeURIComponent(portable.zip) });
  }
  // Fallback: if no specific keys matched but portable is object, try as string
  if (result.length === 0 && typeof portable === "object") {
    const values = Object.values(portable).filter(v => typeof v === "string");
    for (const v of values) {
      const baseUrl = urls.portable || urls.portable_zip || urls.portable_exe;
      if (baseUrl) {
        result.push({ label: "portable", url: baseUrl + encodeURIComponent(v) });
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
  return labels[software] || software || "";
}

export function getSoftwareDefault(type) {
  // mmf and flash types default to flash software
  if (type === "mff" || type === "flash") {
    return "flash";
  }
  return null;
}

export function normalizeSoftendoList(list, lan = "en") {
  const games = [];
  for (const entry of list) {
    const game = { ...entry };
    // Use `game` or `name` field for the title
    game.game = entry.game || entry.name;
    game.category = "softendo";

    // Handle software field with default for mmf/flash types
    game.software = entry.software || getSoftwareDefault(entry.type) || "";

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
            portable_urls: getPortableUrls(entry.type, verObj.portable, lan, isNsmf)
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
        portable_urls: getPortableUrls(entry.type, entry.portable, lan, isNsmf)
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

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { load, YAML11_SCHEMA } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');
const imageIndexPath = join(dataDir, 'image-index.json');

const SITE_BASE_URL = 'https://download.marioforever.net';

// ---------- 通用工具 ----------

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sameMonth = (date, year, month) => {
  if (!date) return false;
  return date.getUTCFullYear() === year && date.getUTCMonth() === month;
};

// 将空格与汉字等非 ASCII 字符转为百分号编码，已编码的 %XX 序列保持不变
const encodeUrlPath = (url) => {
  if (!url) return url;
  return url
    .replace(/[^\x20-\x7E]/g, (char) => encodeURIComponent(char))
    .replace(/ /g, '%20');
};

const getAuthorList = (entry) => {
  if (Array.isArray(entry.author)) return entry.author.filter(Boolean);
  if (entry.author) return [entry.author];
  return [];
};

const formatAuthor = (entry) => getAuthorList(entry).join('、');

const getAuthorKey = (entry) => {
  const authors = getAuthorList(entry);
  return [...authors].sort().join(',');
};

// src/config.js 直接 import 会因 package.json 缺少 JSON import attribute 报错，
// 这里从源码文本中提取 sourceName 数组求值，保证与站点配置保持同步。
const loadSourceName = () => {
  const configPath = join(rootDir, 'src', 'config.js');
  const text = readFileSync(configPath, 'utf8');
  const match = text.match(/export const sourceName\s*=\s*(\[[\s\S]*?\n\])/);
  if (!match) {
    throw new Error('无法从 src/config.js 中解析 sourceName');
  }
  return new Function(`return ${match[1]}`)();
};

const sourceName = loadSourceName();

const getSourceDesc = (link) => {
  if (!link) return null;
  for (const entry of sourceName) {
    if (link.match(entry.domain)) {
      return entry.desc_zh || entry.desc_en || null;
    }
  }
  const match = link.match(/^https?:\/\/([^/]+)/);
  return match ? match[1] : null;
};

const stripInvalidPrefix = (link) => {
  if (typeof link !== 'string') return null;
  if (link.startsWith('~')) return link.substring(1);
  return link || null;
};

// ---------- 资源站链接规则（与 src/util/GameUtil.js 镜像） ----------

const MF_FILE_BASE_PATHS_ZH = {
  android: 'https://file.marioforever.net/Mario Forever/安卓游戏/',
  repackaged: 'https://file.marioforever.net/Mario Forever/重打包作品/',
  chinese: 'https://file.marioforever.net/Mario Forever/国内作品/',
  international: 'https://file.marioforever.net/Mario Forever/国外作品/'
};

const getMfFileUrl = (fileName, ver, entry) => {
  if (!fileName) return null;
  const paths = MF_FILE_BASE_PATHS_ZH;
  if (fileName.toLowerCase().endsWith('.apk')) {
    return `${paths.android}${entry.first_author}/${fileName}`;
  }
  if (ver.repacker) {
    return `${paths.repackaged}${fileName}`;
  }
  if (entry.type === 'chinese') {
    const year = ver.date instanceof Date ? ver.date.toISOString().split('-')[0] : '';
    return `${paths.chinese}${year}/${fileName}`;
  }
  if (entry.type === 'international') {
    return `${paths.international}${entry.first_author}/${fileName}`;
  }
  return null;
};

const MW_LEVEL_BASE_PATH = 'https://file.marioforever.net/Mario Worker/';

const getMwLevelFileUrl = (entry, fileName) => {
  const author = Array.isArray(entry.author) ? '合作作品' : entry.author;
  if (entry.smwp_ver === 'MW 4.4' || entry.smwp_ver === 'MW 4.0') {
    return `${MW_LEVEL_BASE_PATH}Mario Worker 4.4 作品/${author}/${fileName}`;
  }
  const folder = author === '合作作品' ? '合作作品' : `吧友作品/${author}`;
  return `${MW_LEVEL_BASE_PATH}${folder}/${fileName}`;
};

// ---------- 文件名显示（与 src/util/GameUtil.js 镜像） ----------

const removeExtensions = (fileName) => {
  const volumePattern = /\.(7z|rar|zip)\.\d+$/i;
  if (volumePattern.test(fileName)) {
    return fileName.replace(volumePattern, '');
  }
  return fileName.replace(/\.[^.]*$/, '');
};

const processSingleFileName = (fileName) => {
  let displayName = fileName.split('/').pop();
  displayName = removeExtensions(displayName);
  try {
    displayName = decodeURIComponent(displayName);
  } catch {
    // 保持原样
  }
  return displayName;
};

const processFileNamesWithVolumes = (fileNames) => {
  if (!Array.isArray(fileNames)) {
    return fileNames ? [processSingleFileName(fileNames)] : [];
  }

  const displayNames = fileNames.map((fn) => {
    if (fn == null) return null;
    return { original: fn, displayName: processSingleFileName(fn) };
  });

  const groups = new Map();
  displayNames.forEach((item, index) => {
    if (!item) return;
    const baseName = item.displayName.replace(/\s*\(分卷 \d+\)$/, '');
    if (!groups.has(baseName)) groups.set(baseName, []);
    groups.get(baseName).push({ ...item, index });
  });

  const result = new Array(displayNames.length);
  groups.forEach((group, baseName) => {
    if (group.length > 1) {
      const volumePattern = /\.(7z|rar|zip)\.(\d+)$/i;
      group.forEach((item) => {
        const match = item.original.match(volumePattern);
        result[item.index] = match
          ? `${baseName} (分卷 ${parseInt(match[2], 10)})`
          : item.displayName;
      });
    } else {
      result[group[0].index] = group[0].displayName;
    }
  });

  return result;
};

// ---------- MF 数据整理 ----------

const buildMfVersions = (entry) => {
  if (Array.isArray(entry.ver)) {
    return entry.ver.map((raw) => {
      const verStr = Object.keys(raw)[0];
      const verObj = { ...raw[verStr] };
      verObj.date = normalizeDate(verObj.date);
      return { verStr, verObj };
    });
  }
  return [{
    verStr: entry.ver || '',
    verObj: {
      date: normalizeDate(entry.date),
      source_url: entry.source_url,
      source_url_alt: entry.source_url_alt,
      download_url: entry.download_url,
      download_url_alt: entry.download_url_alt,
      file_name: entry.file_name,
      file_url: entry.file_url,
      code: entry.code,
      repacker: entry.repacker,
      current: entry.current
    }
  }];
};

const normalizeMfEntry = (raw) => {
  const entry = { ...raw };
  if (entry.type === 'international' && entry.author_alias) {
    entry.first_author = entry.author_alias;
  } else if (Array.isArray(entry.author)) {
    entry.first_author = entry.author[0];
  } else {
    entry.first_author = entry.author;
  }
  entry.versions = buildMfVersions(entry);

  if (entry.type === 'international' && Array.isArray(entry.ver)) {
    applyOldVersionsPrefix(entry);
  }
  return entry;
};

// 国际作品旧版本归档：与 src/util/useMfList.js 的 old-versions/ 规则一致
const applyOldVersionsPrefix = (entry) => {
  const versions = entry.versions;
  const currentIndexes = versions
    .map((v, idx) => (v.verObj.current === true ? idx : -1))
    .filter((idx) => idx !== -1);
  const times = versions.map((v) => (v.verObj.date ? v.verObj.date.getTime() : NaN));
  const maxDate = Math.max(...times);
  const allLatestIdxs = times
    .map((t, idx) => (t === maxDate ? idx : -1))
    .filter((idx) => idx !== -1);
  const trueLatestIdx = allLatestIdxs.length > 0 ? allLatestIdxs[0] : -1;

  versions.forEach(({ verObj }, idx) => {
    if (!verObj.file_name) return;
    const archived = verObj.current === false ||
      (
        !currentIndexes.includes(idx) &&
        (times[idx] !== maxDate || (allLatestIdxs.includes(idx) && idx !== trueLatestIdx))
      );
    if (
      archived &&
      !verObj.repacker &&
      !verObj.file_name.startsWith('old-versions/') &&
      !verObj.file_name.toLowerCase().endsWith('.apk')
    ) {
      verObj.file_name = 'old-versions/' + verObj.file_name;
    }
  });
};

const pickLatestVersionInMonth = (entry, year, month) => {
  const matched = entry.versions.filter((v) => sameMonth(v.verObj.date, year, month));
  if (matched.length === 0) return null;
  return matched.reduce((latest, v) => {
    const t = v.verObj.date ? v.verObj.date.getTime() : -Infinity;
    const latestT = latest.verObj.date ? latest.verObj.date.getTime() : -Infinity;
    return t > latestT ? v : latest;
  });
};

const getBadge = (entry, year, month) => {
  const tags = Array.isArray(entry.tag) ? entry.tag : [];
  if (tags.some((tag) => String(tag).trim().toLowerCase() === 'single level')) {
    return '单关';
  }
  const dates = entry.versions.map((v) => v.verObj.date).filter(Boolean);
  if (dates.length === 0) return '新作';
  const earliest = Math.min(...dates.map((d) => d.getTime()));
  return sameMonth(new Date(earliest), year, month) ? '新作' : '版本更新';
};

const getMfResourceUrl = (entry, verObj) => {
  if (verObj.file_url) return verObj.file_url;
  if (verObj.file_name) return getMfFileUrl(verObj.file_name, verObj, entry);
  return null;
};

// ---------- 图片解析（与 src/util/ImageUtil.js 镜像） ----------

let imageIndex = null;

const loadImageIndex = () => {
  if (!existsSync(imageIndexPath)) {
    throw new Error(`缺少 ${imageIndexPath}，请先运行 bun run generate-images`);
  }
  imageIndex = JSON.parse(readFileSync(imageIndexPath, 'utf8'));
};

const findGameInfo = (entry, category) => {
  const gameName = entry.game;
  if (!gameName) return null;
  const mapping = imageIndex?.[category];
  if (!mapping) return null;
  const info = mapping[gameName];
  if (!info) return null;
  if (!Array.isArray(info)) return info;
  const authorKey = getAuthorKey(entry);
  return info.find((item) => item.authorKey === authorKey) || null;
};

const getImagePath = (entry, category, verStr) => {
  if (entry.currentVer && entry.currentVer.image) {
    return `/data/${category}/${entry.currentVer.image}`;
  }
  const info = findGameInfo(entry, category);
  if (!info || !info.images || info.images.length === 0) return null;

  const images = info.images;
  const dirName = info.dirName;
  let imageName = null;

  if (category === 'mf-games' && verStr) {
    const titleImages = images.filter((img) => /^title_.+\.[^.]+$/i.test(img));
    for (const img of titleImages) {
      const match = img.match(/^title_(.+)\.[^.]+$/i);
      if (match && verStr.includes(match[1])) {
        imageName = img;
        break;
      }
    }
  }

  if (!imageName) {
    if (category === 'mf-games') {
      imageName = images.find((img) => /^title\.[a-z]+$/i.test(img.toLowerCase())) || images[0];
    } else {
      imageName = images[0];
    }
  }

  if (!imageName) return null;
  const base = dirName ? `/data/${category}/${dirName}/` : `/data/${category}/`;
  return base + imageName;
};

// ---------- 条目组装 ----------

const missingImages = [];

const getImageUrl = (entry, category, verStr) => {
  const path = getImagePath(entry, category, verStr);
  if (!path) {
    missingImages.push(`${category} / ${entry.game}`);
    return null;
  }
  return encodeUrlPath(SITE_BASE_URL + path);
};

const sourceLink = (sourceUrl) => {
  const url = stripInvalidPrefix(sourceUrl);
  if (!url) return null;
  const desc = getSourceDesc(url);
  if (!desc) return null;
  return { label: `发布链接（${desc}）`, url };
};

const resourceLinks = (links) => {
  if (!links || links.length === 0) return [];
  if (links.length === 1) {
    return [{ label: '下载链接（社区资源站）', url: encodeUrlPath(links[0].url) }];
  }
  return links.map((link) => ({
    label: `下载链接（社区资源站 - ${link.name}）`,
    url: encodeUrlPath(link.url)
  }));
};

const buildMfBlock = (entry, ver, year, month) => {
  const links = [];
  // 仅国内作品输出发布链接
  if (entry.type !== 'international') {
    const source = sourceLink(ver.verObj.source_url);
    if (source) links.push(source);
  }

  const resourceUrl = getMfResourceUrl(entry, ver.verObj);
  if (resourceUrl) {
    links.push(...resourceLinks([{ name: null, url: resourceUrl }]));
  }

  return {
    game: entry.game,
    verStr: ver.verStr,
    author: formatAuthor(entry),
    badge: getBadge(entry, year, month),
    image: getImageUrl(entry, 'mf-games', ver.verStr),
    links
  };
};

const buildMwBlock = (entry) => {
  const links = [];
  const source = sourceLink(entry.source_url);
  if (source) links.push(source);

  let resources = [];
  if (entry.file_url) {
    resources = [{ name: null, url: entry.file_url }];
  } else if (Array.isArray(entry.file_name)) {
    const displayNames = processFileNamesWithVolumes(entry.file_name);
    entry.file_name.forEach((fn, idx) => {
      if (fn == null) return;
      resources.push({ name: displayNames[idx], url: getMwLevelFileUrl(entry, fn) });
    });
  } else if (entry.file_name) {
    resources = [{ name: null, url: getMwLevelFileUrl(entry, entry.file_name) }];
  }
  links.push(...resourceLinks(resources));

  return {
    game: entry.game,
    verStr: '',
    author: formatAuthor(entry),
    badge: '',
    image: getImageUrl(entry, 'mw-levels', ''),
    links
  };
};

// ---------- 渲染：markdown ----------

const markdownTitle = (block) => {
  let line = `**${block.game}**`;
  if (block.verStr) line += ` ${block.verStr}`;
  if (block.author) line += ` by ${block.author}`;
  if (block.badge) line += `（**${block.badge}**）`;
  return line;
};

const renderMarkdownBlock = (block) => {
  const parts = [markdownTitle(block)];
  if (block.image) {
    parts.push(`![${block.game}](${block.image})`);
  }
  if (block.links.length > 0) {
    parts.push(block.links.map((link) => `- **${link.label}**：${link.url}`).join('\n'));
  }
  return parts.join('\n\n');
};

const renderMarkdownNote = (note) => `**注**：${note}`;

// ---------- 渲染：Discuz! BBCode ----------

const bbcodeTitle = (block) => {
  let line = `[b]${block.game}[/b]`;
  if (block.verStr) line += ` ${block.verStr}`;
  if (block.author) line += ` by ${block.author}`;
  if (block.badge) line += `（[b]${block.badge}[/b]）`;
  return `[align=center]${line}[/align]`;
};

const renderBbcodeBlock = (block) => {
  const parts = [bbcodeTitle(block)];
  if (block.image) {
    parts.push(`[align=center][img]${block.image}[/img][/align]`);
  }
  if (block.links.length > 0) {
    const items = block.links
      .map((link) => `[*][b]${link.label}[/b]：[url=${link.url}]${link.url}[/url]`)
      .join('\n');
    parts.push(`[list]${items}[/list]`);
  }
  return parts.join('\n');
};

const renderBbcodeNote = (note) => `[b]注[/b]：${note}`;

const renderSections = (sections, renderers, separator) => {
  const chunks = sections.map((section) => {
    const body = section.blocks.length > 0
      ? section.blocks.map(renderers.block).join(separator)
      : '（本月无）';
    const note = section.note && section.blocks.length > 0
      ? `${separator}${renderers.note(section.note)}`
      : '';
    return `${renderers.title(section.title)}${note}${separator}${body}`;
  });
  return chunks.join(separator) + '\n';
};

// ---------- 主流程 ----------

const now = new Date();
let targetYear = now.getFullYear();
let targetMonth = now.getMonth();
if (now.getDate() < 20) {
  targetMonth -= 1;
  if (targetMonth < 0) {
    targetMonth = 11;
    targetYear -= 1;
  }
}

const monthLabel = `${targetYear}年${targetMonth + 1}月`;
const sectionMonth = `${targetMonth + 1}月`;

loadImageIndex();

const mfList = load(readFileSync(join(dataDir, 'list-mf.yaml'), 'utf8'), { schema: YAML11_SCHEMA }) || [];
const mwList = load(readFileSync(join(dataDir, 'list-mw.yaml'), 'utf8'), { schema: YAML11_SCHEMA }) || [];

const mfEntries = mfList.map(normalizeMfEntry);

const mfInMonth = mfEntries
  .map((entry) => ({ entry, ver: pickLatestVersionInMonth(entry, targetYear, targetMonth) }))
  .filter((item) => item.ver)
  .sort((a, b) => (a.ver.verObj.date?.getTime() ?? 0) - (b.ver.verObj.date?.getTime() ?? 0));

const domestic = mfInMonth.filter((item) => item.entry.type !== 'international');
const international = mfInMonth.filter((item) => item.entry.type === 'international');

const mwInMonth = mwList
  .map((entry) => ({ ...entry, date: normalizeDate(entry.date) }))
  .filter((entry) => sameMonth(entry.date, targetYear, targetMonth))
  .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));

const sections = [
  {
    title: `【${sectionMonth}国内Mario Forever作品】`,
    blocks: domestic.map((item) => buildMfBlock(item.entry, item.ver, targetYear, targetMonth))
  },
  {
    title: `【${sectionMonth}国外Mario Forever作品】`,
    note: '由于后续版本更新变化，本月报列出的国外作品社区资源站下载链接可能会在未来出现失效的情况，请访问作品目录站：https://download.marioforever.net/mf-games.html 获取最新链接。',
    blocks: international.map((item) => buildMfBlock(item.entry, item.ver, targetYear, targetMonth))
  },
  {
    title: `【${sectionMonth}Super Mario Worker Project作品】`,
    blocks: mwInMonth.map((entry) => buildMwBlock(entry))
  }
];

const baseName = `monthly-report-${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
const markdownFile = join(rootDir, `${baseName}.md`);
const bbcodeFile = join(rootDir, `${baseName}.bbcode`);

writeFileSync(
  markdownFile,
  renderSections(
    sections,
    { block: renderMarkdownBlock, title: (title) => `## ${title}`, note: renderMarkdownNote },
    '\n\n'
  ),
  'utf8'
);
writeFileSync(
  bbcodeFile,
  renderSections(
    sections,
    {
      block: renderBbcodeBlock,
      title: (title) => `[align=center][size=4][b]${title}[/b][/size][/align]`,
      note: renderBbcodeNote
    },
    '\n'
  ),
  'utf8'
);

console.log(`目标月份：${monthLabel}（今天 ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}）`);
console.log(`国内作品：${domestic.length}，国外作品：${international.length}，SMWP 作品：${mwInMonth.length}`);
if (missingImages.length > 0) {
  console.log(`\n以下作品缺少图片，未输出图片行（共 ${missingImages.length} 个）：`);
  missingImages.forEach((item) => console.log(`  - ${item}`));
}
console.log(`\n已写入：${markdownFile}`);
console.log(`已写入：${bbcodeFile}`);

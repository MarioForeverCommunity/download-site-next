import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');
const imagesDir = join(publicDir, 'data');
const listsDir = join(publicDir, 'lists');
const outputDir = join(publicDir, 'data');
const outputFile = join(outputDir, 'image-index.json');

const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.avif', '.svg'];

function sanitizeName(name) {
  if (!name) return '';
  let sanitized = name.replace(/[:/\\]/g, '');
  sanitized = sanitized.replace(/\.+$/g, '');
  return sanitized;
}

function getImageFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  
  const entries = readdirSync(dir);
  
  return entries
    .filter(entry => {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      return stat.isFile() && imageExtensions.includes(extname(entry).toLowerCase());
    })
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function getSubdirectoriesWithImages(baseDir) {
  if (!existsSync(baseDir)) {
    return {};
  }
  
  const entries = readdirSync(baseDir);
  const result = {};
  
  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      const images = getImageFiles(fullPath);
      if (images.length > 0) {
        result[entry] = images;
      }
    }
  }
  
  return result;
}

function loadYamlList(filename) {
  const filePath = join(listsDir, filename);
  if (!existsSync(filePath)) {
    return [];
  }
  
  const content = readFileSync(filePath, 'utf8');
  return yaml.load(content) || [];
}

function buildGameImageMapping(list, subdirs) {
  const nameCount = {};
  const mapping = {};
  
  for (const entry of list) {
    const gameName = entry.game;
    const sanitizedName = sanitizeName(gameName);
    
    if (nameCount[sanitizedName] === undefined) {
      nameCount[sanitizedName] = 0;
    } else {
      nameCount[sanitizedName]++;
    }
    
    const occurrenceIndex = nameCount[sanitizedName];
    let dirName = sanitizedName;
    
    if (occurrenceIndex > 0) {
      dirName = `${sanitizedName}_${occurrenceIndex + 1}`;
    }
    
    const images = subdirs[dirName];
    
    if (images && images.length > 0) {
      mapping[gameName] = {
        dirName,
        occurrenceIndex,
        images
      };
    }
  }
  
  return mapping;
}

function generateImageIndex() {
  const mfList = loadYamlList('list-mf.yaml');
  const mwList = loadYamlList('list-mw.yaml');
  
  const mfGamesDir = join(imagesDir, 'mf-games');
  const mfSubdirs = getSubdirectoriesWithImages(mfGamesDir);
  
  const mwLevelsDir = join(imagesDir, 'mw-levels');
  const mwSubdirs = getSubdirectoriesWithImages(mwLevelsDir);
  
  const mfMapping = buildGameImageMapping(mfList, mfSubdirs);
  const mwMapping = buildGameImageMapping(mwList, mwSubdirs);
  
  const index = {
    'mf-games': mfMapping,
    'mw-levels': mwMapping
  };
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  writeFileSync(outputFile, JSON.stringify(index, null, 2));
  console.log(`Image index generated: ${outputFile}`);
  console.log(`mf-games subdirs: ${Object.keys(mfSubdirs).length}`);
  console.log(`mw-levels subdirs: ${Object.keys(mwSubdirs).length}`);
  console.log(`mf-games mapped games: ${Object.keys(mfMapping).length}`);
  console.log(`mw-levels mapped games: ${Object.keys(mwMapping).length}`);
  
  const mfUsedDirs = new Set();
  for (const info of Object.values(mfMapping)) {
    mfUsedDirs.add(info.dirName);
  }
  const mfUnusedDirs = Object.keys(mfSubdirs).filter(d => !mfUsedDirs.has(d));
  if (mfUnusedDirs.length > 0) {
    console.log(`\nmf-games unmapped folders (${mfUnusedDirs.length}):`);
    mfUnusedDirs.forEach(d => console.log(`  - ${d}`));
  }
  
  const mwUsedDirs = new Set();
  for (const info of Object.values(mwMapping)) {
    mwUsedDirs.add(info.dirName);
  }
  const mwUnusedDirs = Object.keys(mwSubdirs).filter(d => !mwUsedDirs.has(d));
  if (mwUnusedDirs.length > 0) {
    console.log(`\nmw-levels unmapped folders (${mwUnusedDirs.length}):`);
    mwUnusedDirs.forEach(d => console.log(`  - ${d}`));
  }
}

generateImageIndex();

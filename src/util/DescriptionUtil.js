import axios from 'axios';
import yaml from 'js-yaml';

const listCache = {};
const dirNameMappingCache = {};

function sanitizeName(name) {
  if (!name) return '';
  let sanitized = name.replace(/[:/\\]/g, '');
  sanitized = sanitized.replace(/\.+$/g, '');
  return sanitized;
}

async function loadYamlList(category) {
  if (listCache[category]) return listCache[category];
  
  const listFile = category === 'mw-levels' ? 'list-mw.yaml' : 'list-mf.yaml';
  
  try {
    const response = await axios.get(`/data/${listFile}`);
    if (response.status === 200) {
      const list = yaml.load(response.data) || [];
      listCache[category] = list;
      return list;
    }
  } catch (error) {
    console.error('Failed to load yaml list:', error);
  }
  
  return [];
}

async function buildDirNameMapping(category) {
  if (dirNameMappingCache[category]) return dirNameMappingCache[category];
  
  const list = await loadYamlList(category);
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
    
    mapping[gameName] = dirName;
  }
  
  dirNameMappingCache[category] = mapping;
  return mapping;
}

async function getGameDirName(game, category) {
  const mapping = await buildDirNameMapping(category);
  return mapping[game.game] || sanitizeName(game.game);
}

async function tryLoadFile(filePath) {
  try {
    const response = await axios.get(filePath);
    if (response.status !== 200) {
      return null;
    }
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      return null;
    }
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function loadDescription(game, category, lan) {
  if (!game) return null;
  
  const gameDirName = await getGameDirName(game, category);
  if (!gameDirName) return null;
  
  const filePath = `/data/${category}/${gameDirName}`;
  
  const content = await tryLoadFile(`${filePath}/description.md`);
  if (content) return content;
  
  const fileName = lan === 'zh' ? 'description_zh.md' : 'description_en.md';
  const localizedContent = await tryLoadFile(`${filePath}/${fileName}`);
  if (localizedContent) return localizedContent;
  
  return null;
}

import axios from 'axios';

let imageIndex = null;
let indexLoading = false;
let indexPromise = null;

const pathCache = new Map();
const showcaseCache = new Map();

const REGEX = {
  titleVersion: /^title_(.+)\.[^.]+$/i,
  titleImage: /^title_.+\.[^.]+$/i,
  titleSimple: /^title\.[a-z]+$/i,
  showcase: /^showcase_.+\.[^.]+$/i
};

async function loadImageIndex() {
  if (imageIndex) {
    return imageIndex;
  }
  
  if (indexLoading && indexPromise) {
    return indexPromise;
  }
  
  indexLoading = true;
  indexPromise = axios.get('/data/image-index.json')
    .then(response => {
      imageIndex = response.data;
      indexLoading = false;
      return imageIndex;
    })
    .catch(() => {
      imageIndex = { 'mf-games': {}, 'mw-levels': {} };
      indexLoading = false;
      return imageIndex;
    });
  
  return indexPromise;
}

function parseTitleVersion(filename) {
  const match = filename.match(REGEX.titleVersion);
  return match ? match[1] : null;
}

function findTitleImageForVersion(images, currentVerStr) {
  if (!images || images.length === 0 || !currentVerStr) return null;
  
  const titleImages = images.filter(img => REGEX.titleImage.test(img));
  if (titleImages.length === 0) return null;
  
  for (const img of titleImages) {
    const titleVer = parseTitleVersion(img);
    if (titleVer && currentVerStr.includes(titleVer)) {
      return img;
    }
  }
  
  return null;
}

function findTitleImage(images) {
  if (!images || images.length === 0) return null;
  
  const titleImage = images.find(img => REGEX.titleSimple.test(img.toLowerCase()));
  return titleImage || null;
}

function getFirstImageByAlpha(images) {
  if (!images || images.length === 0) return null;
  return images[0];
}

function getCacheKey(gameName, category, currentVerStr) {
  return `${category}:${gameName}:${currentVerStr || ''}`;
}

function getShowcaseCacheKey(gameName, category) {
  return `${category}:${gameName}`;
}

function getShowcaseImagesInternal(game, category) {
  if (!game) return [];
  
  const gameName = game.game;
  if (!gameName) return [];
  
  const cacheKey = getShowcaseCacheKey(gameName, category);
  if (showcaseCache.has(cacheKey)) {
    return showcaseCache.get(cacheKey);
  }
  
  const gameMapping = imageIndex?.[category];
  if (!gameMapping) return [];
  
  const gameInfo = gameMapping[gameName];
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return [];
  
  const images = gameInfo.images;
  const dirName = gameInfo.dirName;
  
  const showcaseImages = images.filter(img => REGEX.showcase.test(img));
  
  if (showcaseImages.length === 0) {
    showcaseCache.set(cacheKey, []);
    return [];
  }
  
  const result = showcaseImages.map(img => ({
    url: `/data/${category}/${dirName}/${img}`,
    name: img
  }));
  
  showcaseCache.set(cacheKey, result);
  return result;
}

function getGameImagePath(game, category) {
  if (!game) return null;
  
  const gameName = game.game;
  if (!gameName) return null;
  
  const currentVerStr = game.currentVerStr;
  const cacheKey = getCacheKey(gameName, category, currentVerStr);
  
  if (pathCache.has(cacheKey)) {
    return pathCache.get(cacheKey);
  }
  
  const gameMapping = imageIndex?.[category];
  if (!gameMapping) return null;
  
  const gameInfo = gameMapping[gameName];
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return null;
  
  const images = gameInfo.images;
  const dirName = gameInfo.dirName;
  
  let imagePath = null;
  
  if (category === 'mf-games' && currentVerStr) {
    imagePath = findTitleImageForVersion(images, currentVerStr);
  }
  
  if (!imagePath) {
    imagePath = category === 'mf-games' 
      ? findTitleImage(images) || getFirstImageByAlpha(images)
      : getFirstImageByAlpha(images);
  }
  
  if (!imagePath) return null;
  
  const result = `/data/${category}/${dirName}/${imagePath}`;
  
  pathCache.set(cacheKey, result);
  return result;
}

export async function getGameImage(game, category = 'mf-games') {
  await loadImageIndex();
  return getGameImagePath(game, category);
}

export function getGameImageSync(game, category = 'mf-games') {
  if (!imageIndex) {
    return null;
  }
  return getGameImagePath(game, category);
}

export async function getShowcaseImages(game, category = 'mf-games') {
  await loadImageIndex();
  return getShowcaseImagesInternal(game, category);
}

export function getShowcaseImagesSync(game, category = 'mf-games') {
  if (!imageIndex) {
    return [];
  }
  return getShowcaseImagesInternal(game, category);
}

export function createGameImageResolver(category) {
  let loaded = false;
  
  return {
    async init() {
      if (!loaded) {
        await loadImageIndex();
        loaded = true;
      }
    },
    
    resolve(game) {
      if (!loaded || !imageIndex) {
        return null;
      }
      return getGameImagePath(game, category);
    },
    
    isLoaded() {
      return loaded;
    }
  };
}

export { loadImageIndex };

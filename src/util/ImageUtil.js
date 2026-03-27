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
  logoImage: /^logo\.[a-z]+$/i,
  showcase: /^showcase_.+\.[^.]+$/i
};

function getAuthorKey(game) {
  const authors = game.author;
  if (!authors) return '';
  const authorArray = Array.isArray(authors) ? authors : [authors];
  return authorArray.sort().join(',');
}

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

function findLogoImage(images) {
  if (!images || images.length === 0) return null;

  const logoImage = images.find(img => REGEX.logoImage.test(img.toLowerCase()));
  return logoImage || null;
}

function getFirstImageByAlpha(images) {
  if (!images || images.length === 0) return null;
  return images[0];
}

function getCacheKey(gameName, authorKey, category, currentVerStr) {
  return `${category}:${gameName}:${authorKey}:${currentVerStr || ''}`;
}

function getShowcaseCacheKey(gameName, authorKey, category) {
  return `${category}:${gameName}:${authorKey}`;
}

function findGameInfo(game, category) {
  const gameName = game.game;
  if (!gameName) return null;

  const gameMapping = imageIndex?.[category];
  if (!gameMapping) return null;

  const gameInfoOrArray = gameMapping[gameName];
  if (!gameInfoOrArray) return null;

  if (Array.isArray(gameInfoOrArray)) {
    const authorKey = getAuthorKey(game);
    return gameInfoOrArray.find(info => info.authorKey === authorKey) || null;
  }

  return gameInfoOrArray;
}

function naturalSort(a, b) {
  const regex = /(\d+)|(\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';

    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

function getShowcaseImagesInternal(game, category) {
  if (!game) return [];

  const gameName = game.game;
  if (!gameName) return [];

  const authorKey = getAuthorKey(game);
  const cacheKey = getShowcaseCacheKey(gameName, authorKey, category);
  if (showcaseCache.has(cacheKey)) {
    return showcaseCache.get(cacheKey);
  }

  const gameInfo = findGameInfo(game, category);
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return [];

  const images = gameInfo.images;
  const dirName = gameInfo.dirName;

  const showcaseImages = images.filter(img => REGEX.showcase.test(img));

  if (showcaseImages.length === 0) {
    showcaseCache.set(cacheKey, []);
    return [];
  }

  showcaseImages.sort(naturalSort);

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

  const authorKey = getAuthorKey(game);
  const currentVerStr = game.currentVerStr;
  const cacheKey = getCacheKey(gameName, authorKey, category, currentVerStr);

  if (pathCache.has(cacheKey)) {
    return pathCache.get(cacheKey);
  }

  const gameInfo = findGameInfo(game, category);
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

function getModalImagePath(game, category) {
  if (!game) return null;

  const gameInfo = findGameInfo(game, category);
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return null;

  const images = gameInfo.images;
  const dirName = gameInfo.dirName;

  let imagePath = findLogoImage(images);

  if (!imagePath) {
    imagePath = findTitleImage(images);
  }

  if (!imagePath) {
    imagePath = getFirstImageByAlpha(images);
  }

  if (!imagePath) return null;

  return `/data/${category}/${dirName}/${imagePath}`;
}

export function getModalImageSync(game, category = 'mf-games') {
  if (!imageIndex) {
    return null;
  }
  return getModalImagePath(game, category);
}

function getTitleImagePath(game, category) {
  if (!game) return null;

  const gameInfo = findGameInfo(game, category);
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return null;

  const images = gameInfo.images;
  const dirName = gameInfo.dirName;

  const titlePath = findTitleImage(images);
  if (!titlePath) return null;

  return `/data/${category}/${dirName}/${titlePath}`;
}

export function getTitleImageSync(game, category = 'mf-games') {
  if (!imageIndex) {
    return null;
  }
  return getTitleImagePath(game, category);
}

function hasLogoImage(game, category) {
  if (!game) return false;

  const gameInfo = findGameInfo(game, category);
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return false;

  const images = gameInfo.images;
  return !!findLogoImage(images);
}

export function hasLogoImageSync(game, category = 'mf-games') {
  if (!imageIndex) {
    return false;
  }
  return hasLogoImage(game, category);
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

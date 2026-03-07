import axios from 'axios';

let imageIndex = null;
let indexLoading = false;
let indexPromise = null;

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
  const match = filename.match(/^title_(.+)\.[^.]+$/i);
  return match ? match[1] : null;
}

function findTitleImageForVersion(images, currentVerStr) {
  if (!images || images.length === 0 || !currentVerStr) return null;
  
  const titleImages = images.filter(img => /^title_.+\.[^.]+$/i.test(img));
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
  
  const titlePattern = /^title\.[a-z]+$/i;
  const titleImage = images.find(img => titlePattern.test(img.toLowerCase()));
  return titleImage || null;
}

function getFirstImageByAlpha(images) {
  if (!images || images.length === 0) return null;
  return images[0];
}

function getGameImagePath(game, category) {
  if (!game) return null;
  
  const gameName = game.game;
  if (!gameName) return null;
  
  const gameMapping = imageIndex?.[category];
  if (!gameMapping) return null;
  
  const gameInfo = gameMapping[gameName];
  if (!gameInfo || !gameInfo.images || gameInfo.images.length === 0) return null;
  
  const images = gameInfo.images;
  const dirName = gameInfo.dirName;
  const isFlat = gameInfo.isFlat;
  const currentVerStr = game.currentVerStr;
  
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
  
  if (isFlat) {
    return `/images/${category}/${imagePath}`;
  }
  
  return `/images/${category}/${dirName}/${imagePath}`;
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

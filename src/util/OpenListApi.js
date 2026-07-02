import axios from 'axios';

// OpenList API configuration
const OPENLIST_BASE_URL = 'https://file.marioforever.net';

// Cache for file info to avoid repeated requests
const fileInfoCache = new Map();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '';

  const units = [
    { name: 'GB', threshold: 1024 * 1024 * 1024 },
    { name: 'MB', threshold: 1024 * 1024 },
    { name: 'KB', threshold: 1024 },
    { name: 'B', threshold: 1 }
  ];

  for (const unit of units) {
    if (bytes >= unit.threshold) {
      const value = bytes / unit.threshold;
      // Show 2 decimal places for GB and MB, 1 for KB, 0 for B
      const decimals = unit.name === 'GB' || unit.name === 'MB' ? 2 : (unit.name === 'KB' ? 1 : 0);
      return `${value.toFixed(decimals)} ${unit.name}`;
    }
  }

  return `${bytes} B`;
}

/**
 * Extract file path from file.marioforever.net URL
 * @param {string} url - Full URL like https://file.marioforever.net/path/to/file.zip
 * @returns {string|null} - Path like /path/to/file.zip
 */
export function extractPathFromUrl(url) {
  if (!url) return null;

  // Check if it's a file.marioforever.net URL
  if (!url.includes('file.marioforever.net')) return null;

  try {
    const urlObj = new URL(url);
    // Decode the pathname to handle encoded Chinese characters
    return decodeURIComponent(urlObj.pathname);
  } catch (_e) {
    return null;
  }
}

/**
 * Get file info from OpenList API
 * @param {string} path - File path like /Mario Forever/fangames/file.zip
 * @returns {Promise<Object|null>} - File info object with size, name, etc.
 */
export async function getFileInfo(path) {
  if (!path) return null;

  // Check cache first
  const cachedInfo = fileInfoCache.get(path);
  if (cachedInfo && Date.now() - cachedInfo.timestamp < CACHE_EXPIRY_MS) {
    return cachedInfo.data;
  }

  try {
    // Use POST /api/fs/get to get file info
    const response = await axios.post(
      `${OPENLIST_BASE_URL}/api/fs/get`,
      { path, password: '' },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconds timeout
      }
    );

    if (response.data && response.data.code === 200 && response.data.data) {
      const fileInfo = response.data.data;

      // Cache the result
      fileInfoCache.set(path, {
        data: fileInfo,
        timestamp: Date.now()
      });

      return fileInfo;
    }

    return null;
  } catch (_e) {
    // Silently fail - don't block the UI if API is unavailable
    console.warn('OpenList API request failed:', _e.message);
    return null;
  }
}

/**
 * Get file size from URL
 * @param {string} url - Full URL
 * @returns {Promise<number|null>} - File size in bytes
 */
export async function getFileSizeFromUrl(url) {
  const path = extractPathFromUrl(url);
  if (!path) return null;

  const fileInfo = await getFileInfo(path);
  if (fileInfo && fileInfo.size) {
    return fileInfo.size;
  }

  return null;
}

/**
 * Get formatted file size from URL
 * @param {string} url - Full URL
 * @returns {Promise<string>} - Formatted size string like "123.45 MB"
 */
export async function getFormattedFileSize(url) {
  const size = await getFileSizeFromUrl(url);
  return formatFileSize(size);
}

/**
 * Batch fetch file sizes for multiple URLs
 * @param {string[]} urls - Array of URLs
 * @returns {Promise<Map<string, string>>} - Map of URL to formatted size
 */
export async function batchFetchFileSizes(urls) {
  const result = {};

  if (!urls || urls.length === 0) return result;

  // Filter URLs that are from file.marioforever.net
  const validUrls = urls.filter(url => url && url.includes('file.marioforever.net'));

  // Fetch in parallel with limit of 5 concurrent requests
  const batchSize = 5;
  for (let i = 0; i < validUrls.length; i += batchSize) {
    const batch = validUrls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      const size = await getFormattedFileSize(url);
      if (size) {
        result[url] = size;
      }
    });
    await Promise.all(promises);
  }

  return result;
}

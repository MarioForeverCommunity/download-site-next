import axios from 'axios';

// OpenList API configuration
const OPENLIST_BASE_URL = 'https://file.marioforever.net';
const CDN_HOST = 'mf-cdn.kevinh.wang';

// Cache for file info to avoid repeated requests
const fileInfoCache = new Map();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * fetch 包装，添加超时控制
 * @param {string} url - 请求 URL
 * @param {object} [options] - fetch options
 * @param {number} [timeout=5000] - 超时毫秒
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

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
    let path = decodeURIComponent(urlObj.pathname);
    // 资源站直链（/d/ 前缀）的路径需去掉前缀后才是资源站上的实际路径
    if (path.startsWith('/d/')) {
      path = path.slice(3);
    }
    return path;
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
 * 通过 HEAD 请求获取 CDN (Cloudflare R2) 文件大小，失败时回退到 Range 请求
 * @param {string} url - CDN URL
 * @returns {Promise<number|null>} - File size in bytes
 */
async function getFileSizeFromCdnUrl(url) {
  // Check cache first
  const cachedSize = fileInfoCache.get(url);
  if (cachedSize && Date.now() - cachedSize.timestamp < CACHE_EXPIRY_MS) {
    return cachedSize.data;
  }

  try {
    // HEAD 请求（无 body 传输）
    let response = await fetchWithTimeout(url, { method: 'HEAD' });
    if (response.ok) {
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        fileInfoCache.set(url, { data: size, timestamp: Date.now() });
        return size;
      }
    }

    // 回退：Range 请求仅取 1 字节，从 Content-Range 解析总大小
    response = await fetchWithTimeout(url, { headers: { Range: 'bytes=0-0' } });
    if (response.ok || response.status === 206) {
      const contentRange = response.headers.get('Content-Range');
      if (contentRange) {
        const match = contentRange.match(/\/(\d+)$/);
        if (match) {
          const size = parseInt(match[1], 10);
          fileInfoCache.set(url, { data: size, timestamp: Date.now() });
          return size;
        }
      }
    }

    return null;
  } catch (_e) {
    console.warn('CDN file size request failed:', _e.message);
    return null;
  }
}

/**
 * Get file size from URL
 * @param {string} url - Full URL (资源站或 CDN)
 * @returns {Promise<number|null>} - File size in bytes
 */
export async function getFileSizeFromUrl(url) {
  if (!url) return null;

  // CDN URLs: 使用 HEAD/Range 请求
  if (url.includes(CDN_HOST)) {
    return getFileSizeFromCdnUrl(url);
  }

  // 资源站 URLs: 使用 OpenList API
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

  // Filter URLs that are from resource site or CDN
  const validUrls = urls.filter(url => url && (url.includes('file.marioforever.net') || url.includes(CDN_HOST)));

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

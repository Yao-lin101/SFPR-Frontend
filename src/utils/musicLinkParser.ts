/**
 * 网易云音乐链接解析工具
 * 支持多种格式的网易云音乐分享链接，提取音乐ID并生成标准化的嵌入链接
 */

// 网易云音乐嵌入播放器的基础URL
const NETEASE_EMBED_BASE_URL = 'https://music.163.com/outchain/player?type=2&id=';
const NETEASE_PROGRAM_EMBED_BASE_URL = 'https://music.163.com/outchain/player?type=3&id=';
const NETEASE_AUTO_PLAY = '&auto=1&height=66';

/**
 * 从网易云音乐分享链接中提取音乐ID
 * 支持的链接格式:
 * 1. https://music.163.com/#/song?id=1234567
 * 2. https://music.163.com/song?id=1234567
 * 3. http://music.163.com/song/1234567/
 * 4. https://y.music.163.com/m/song?id=1234567
 * 5. 分享链接: https://y.music.163.com/m/song/1234567/?...
 * 6. 移动端分享链接: https://m.music.163.com/...
 * 7. 网易云音乐APP分享的短链接
 * 8. 电台节目链接: https://music.163.com/#/program?id=1234567
 * 
 * @param link 用户输入的网易云音乐链接
 * @returns 解析后的标准嵌入链接，如果解析失败则返回null
 */
export function parseNeteaseMusicLink(link: string): string | null {
  if (!link || typeof link !== 'string') {
    return null;
  }

  // 清理链接，移除多余空格
  const cleanLink = link.trim();
  
  // 如果已经是嵌入链接格式，直接返回
  if (cleanLink.startsWith(NETEASE_EMBED_BASE_URL) || 
      cleanLink.startsWith(NETEASE_PROGRAM_EMBED_BASE_URL)) {
    return cleanLink;
  }

  // 检查是否是电台节目链接
  const isProgramLink = cleanLink.includes('/program') || cleanLink.includes('program?');
  
  // 尝试提取ID
  let id: string | null = null;

  if (isProgramLink) {
    // 电台节目链接的ID提取
    const programPatterns = [
      // 标准网页链接 ?id= 格式
      /music\.163\.com\/(?:#\/)?program\?(?:.*&)?id=(\d+)/i,
      // 其他可能的电台节目链接格式
      /program\/(\d+)/i,
    ];

    // 尝试所有电台节目正则表达式
    for (const pattern of programPatterns) {
      const match = cleanLink.match(pattern);
      if (match) {
        id = match[1];
        break;
      }
    }

    // 如果成功提取到电台节目ID，生成标准嵌入链接
    if (id) {
      return `${NETEASE_PROGRAM_EMBED_BASE_URL}${id}${NETEASE_AUTO_PLAY}`;
    }
  } else {
    // 歌曲链接的ID提取
    // 正则表达式匹配各种可能的链接格式
    const songPatterns = [
      // 标准网页链接 ?id= 格式
      /music\.163\.com\/(?:#\/)?song\?id=(\d+)/i,
      // 路径格式 /song/id/
      /music\.163\.com\/song\/(\d+)/i,
      // 移动端链接
      /y\.music\.163\.com\/m\/song(?:\/)?(\d+)?(?:\/|\?id=)(\d+)?/i,
      // 移动端 m.music.163.com
      /m\.music\.163\.com\/.*[?&]id=(\d+)/i
    ];

    // 尝试所有歌曲正则表达式
    for (const pattern of songPatterns) {
      const match = cleanLink.match(pattern);
      if (match) {
        // 根据不同的匹配组获取ID
        id = match[1] || match[2];
        break;
      }
    }

    // 如果没有匹配到ID，尝试从文本中提取纯数字（可能是ID）
    if (!id && /song.*?(\d{5,})/.test(cleanLink)) {
      const match = cleanLink.match(/song.*?(\d{5,})/);
      if (match) {
        id = match[1];
      }
    }

    // 如果成功提取到歌曲ID，生成标准嵌入链接
    if (id) {
      return `${NETEASE_EMBED_BASE_URL}${id}${NETEASE_AUTO_PLAY}`;
    }
  }

  // 解析失败
  return null;
}

/**
 * 检查链接是否为有效的网易云音乐链接
 * 
 * @param link 用户输入的链接
 * @returns 是否为有效的网易云音乐链接
 */
export function isValidNeteaseMusicLink(link: string): boolean {
  return !!parseNeteaseMusicLink(link);
}

/**
 * 从嵌入链接中提取音乐ID
 * 
 * @param embedLink 嵌入链接
 * @returns 音乐ID
 */
export function extractMusicIdFromEmbed(embedLink: string): string | null {
  if (!embedLink) return null;
  
  const match = embedLink.match(/id=(\d+)/);
  return match ? match[1] : null;
} 
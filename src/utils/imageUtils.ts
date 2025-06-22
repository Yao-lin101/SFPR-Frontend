/**
 * 压缩图片到指定大小以下
 * @param file 原始图片文件
 * @param maxSizeKB 最大文件大小（KB）
 * @param quality 初始压缩质量（0-1）
 * @returns Promise<File> 压缩后的文件
 */
export const compressImage = async (
  file: File, 
  maxSizeKB: number = 500, 
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸，保持宽高比
      let { width, height } = img;
      
      // 根据文件大小动态调整最大尺寸
      const fileSizeMB = file.size / (1024 * 1024);
      let maxDimension: number;
      
      if (fileSizeMB > 10) {
        maxDimension = 800; // 超大文件，大幅缩小
      } else if (fileSizeMB > 5) {
        maxDimension = 1200; // 大文件，中等缩小
      } else if (fileSizeMB > 2) {
        maxDimension = 1600; // 中等文件，适度缩小
      } else {
        maxDimension = 1920; // 小文件，保持较高质量
      }
      
      // 如果图片尺寸超过限制，按比例缩放
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图片到canvas
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 递归压缩直到文件大小满足要求
      const compress = (currentQuality: number, attempt: number = 1) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }
            
            const sizeKB = blob.size / 1024;
            console.log(`压缩尝试 ${attempt}: 质量=${currentQuality.toFixed(2)}, 大小=${sizeKB.toFixed(0)}KB`);
            
            if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
              // 达到目标大小或质量已经很低了
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else if (attempt >= 10) {
              // 防止无限循环，最多尝试10次
              console.warn(`压缩达到最大尝试次数，最终大小: ${sizeKB.toFixed(0)}KB`);
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // 动态调整质量下降幅度
              let qualityStep: number;
              if (sizeKB > maxSizeKB * 3) {
                qualityStep = 0.2; // 大幅超标，大幅降低质量
              } else if (sizeKB > maxSizeKB * 2) {
                qualityStep = 0.15; // 中等超标，中等降低质量
              } else {
                qualityStep = 0.1; // 轻微超标，小幅降低质量
              }
              
              compress(Math.max(0.1, currentQuality - qualityStep), attempt + 1);
            }
          },
          file.type === 'image/png' ? 'image/jpeg' : file.type, // PNG转换为JPEG以获得更好的压缩率
          currentQuality
        );
      };
      
      compress(quality);
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 检查文件是否为图片
 * @param file 文件对象
 * @returns boolean
 */
export const isImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns string 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 
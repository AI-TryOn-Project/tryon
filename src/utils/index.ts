import Compressor from 'compressorjs';


export const getBase64ByFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });
  };

export const resizeImg = async (originFile: File, maxSize = 1920): Promise<File> => {
    return new Promise((resolve, reject) => {
      new Compressor(originFile, {
        quality: 1,
        maxWidth: maxSize,
        maxHeight: maxSize,
        success: (blob) => {
          const file = new File([blob], originFile.name, { type: originFile.type });
          resolve(file);
        },
        error: reject,
      });
    });
  };

  export async function processAndGenerateThumbnail(file: File, maxSize: number) {
    if (file.size / 1024 / 1024 > maxSize) {
      return null;
    }
    const minimizedImg = await resizeImg(file);
  
    // 本地保存缩略图展示用
    const thumbnailFile = await resizeImg(file, 128);
    const thumbnailDataUrl = await getBase64ByFile(thumbnailFile);
    return { minimizedImg, thumbnailDataUrl };
  }

import { Area } from "react-easy-crop";

export async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Gagal mendapatkan konteks canvas 2D."));
      }
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error("Gagal membuat blob dari canvas."));
        }
        resolve(blob);
      }, "image/jpeg", 0.9);
    };
    image.onerror = (error) => reject(error);
  });
}
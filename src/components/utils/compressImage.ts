import imageCompression from "browser-image-compression";

const compressImage = async (image: File) => {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(image, options);
  return compressedFile;
};

export default compressImage;

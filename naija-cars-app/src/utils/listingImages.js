export const compressListingImage = (file) => new Promise((resolve, reject) => {
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    try {
      const maxWidth = 1200;
      const maxHeight = 900;
      const scale = Math.min(
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
        1
      );

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = Math.max(Math.round(image.naturalWidth * scale), 1);
      canvas.height = Math.max(Math.round(image.naturalHeight * scale), 1);

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(imageUrl);

        if (!blob) {
          reject(new Error('Unable to prepare image for upload'));
          return;
        }

        resolve(new File([blob], file.name || 'listing-photo.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.82);
    } catch (error) {
      URL.revokeObjectURL(imageUrl);
      reject(error);
    }
  };

  image.onerror = () => {
    URL.revokeObjectURL(imageUrl);
    reject(new Error('Unable to read image'));
  };

  image.src = imageUrl;
});

export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to prepare image for upload'));
  reader.readAsDataURL(file);
});

export const prepareListingImageData = async (files) => Promise.all(
  files.map(async (file) => {
    const compressed = await compressListingImage(file);
    const imageData = await readFileAsDataUrl(compressed);
    return {
      imageData,
      filename: file.name || 'listing-photo.jpg'
    };
  })
);

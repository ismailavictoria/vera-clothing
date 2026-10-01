export const MAX_PRODUCT_IMAGES = 5;

/** Validate and normalize ordered product image references at a catalogue boundary. */
export function validateProductImages(images: readonly string[]): string[] {
  if (!Array.isArray(images)) {
    throw new TypeError('Product images must be an array of URL or storage-path strings.');
  }

  const normalized = images
    .filter((image): image is string => typeof image === 'string')
    .map((image) => image.trim())
    .filter(Boolean);

  if (normalized.length > MAX_PRODUCT_IMAGES) {
    throw new RangeError(`A product can have no more than ${MAX_PRODUCT_IMAGES} images.`);
  }

  return normalized;
}

/** The first ordered image is the product's main/featured image. */
export function getMainProductImage(images: readonly string[]): string {
  return images[0] ?? '';
}

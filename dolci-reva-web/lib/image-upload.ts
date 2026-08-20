/** Formats image acceptés côté admin (tous sauf GIF). */
export const ACCEPTED_IMAGE_TYPES =
  "image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/svg+xml,image/heic,image/heif,image/avif,image/tiff,.jpg,.jpeg,.png,.webp,.bmp,.svg,.heic,.heif,.avif,.tif,.tiff";

export function isAcceptedImageFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (type === "image/gif" || name.endsWith(".gif")) return false;
  if (type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|bmp|svg|heic|heif|avif|tiff?)$/i.test(name);
}

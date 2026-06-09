export function cloudinaryThumb(url: string, width = 96) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${width},c_fill,f_auto,q_auto/`);
}

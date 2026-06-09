import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

function ensureConfig() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* to .env.local");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function uploadInvoiceFile(
  buffer: Buffer,
  filename: string,
  mime: string
) {
  ensureConfig();

  const isPdf = mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
  const resourceType = isPdf ? "raw" : "image";
  const baseName = filename.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_").slice(0, 80);

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
    format?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "spello-invoices",
        resource_type: resourceType,
        public_id: `${baseName}-${Date.now()}`,
        ...(isPdf ? {} : { quality: "auto:good", fetch_format: "auto" }),
      },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error("Upload failed"));
        else resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    mime: isPdf ? "application/pdf" : mime || `image/${result.format || "jpeg"}`,
    resourceType: result.resource_type as "image" | "raw",
  };
}

export async function deleteInvoiceFile(publicId: string, resourceType: "image" | "raw" = "image") {
  if (!publicId || !isCloudinaryConfigured()) return;
  ensureConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function cloudinaryThumb(url: string, width = 96) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${width},c_fill,f_auto,q_auto/`);
}

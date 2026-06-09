import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isCloudinaryConfigured, uploadInvoiceFile } from "@/lib/cloudinary";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary not configured. Add CLOUDINARY_* to environment." },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const allowed = ["image/", "application/pdf"];
    if (!allowed.some((t) => file.type.startsWith(t) || file.type === t)) {
      return NextResponse.json({ error: "Only images and PDFs allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadInvoiceFile(buffer, file.name, file.type || "application/octet-stream");

    return NextResponse.json({
      url: uploaded.url,
      publicId: uploaded.publicId,
      name: file.name,
      mime: uploaded.mime,
      resourceType: uploaded.resourceType,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

import { ImageResponse } from "next/og";
import { AppIconImage } from "@/lib/app-icon-image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam, 10);

  if (![192, 512].includes(size)) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<AppIconImage size={size} />, {
    width: size,
    height: size,
  });
}

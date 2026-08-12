import { NextRequest, NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const user = await requireAuthorAPI();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  // Validate file size (5 MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 5 MB" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if directory already exists
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Return the URL that can be used directly in the browser (Next.js serves the /public folder)
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ url, publicId: filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file to local storage" }, { status: 500 });
  }
}

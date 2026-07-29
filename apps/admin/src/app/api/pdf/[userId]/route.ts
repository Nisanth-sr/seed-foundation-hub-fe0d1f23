import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getUserDetail } from "@/lib/users";
import { pdfFilename, renderUserPdf } from "@/lib/pdf";

type Props = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const detail = await getUserDetail(userId);
    if (!detail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const buffer = await renderUserPdf(detail);
    const filename = pdfFilename(detail);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    const status = message.includes("Unauthorized") || message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

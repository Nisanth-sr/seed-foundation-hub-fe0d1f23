import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import {
  decodeSourceFile,
  MAX_CHATBOT_SOURCE_FILES,
  MAX_CHATBOT_SOURCE_TOTAL_BYTES,
  validateSourceFileName,
} from "@/lib/chatbot-files";
import { isUuid } from "@/lib/chatbot-http";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;
  if (!isUuid(userId)) return Response.json({ error: "User not found" }, { status: 404 });

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "A source file is required" }, { status: 400 });
  }
  if (!(file instanceof File)) return Response.json({ error: "A source file is required" }, { status: 400 });

  try {
    const mimeType = validateSourceFileName(file.name, file.type, file.size);
    const content = decodeSourceFile(new Uint8Array(await file.arrayBuffer()));
    const fileName = file.name.replace(/[\\/]/g, "_").replace(/[\u0000-\u001f]/g, "").trim();
    if (!fileName || fileName.length > 255) throw new Error("File name must be between 1 and 255 characters");
    const admin = createChatbotAdminClient();
    const { data: existingFiles, error: existingFilesError } = await admin.from("chatbot_source_files")
      .select("byte_size").eq("user_id", userId);
    if (existingFilesError) return Response.json({ error: "Could not check the user's source files" }, { status: 500 });
    const existingBytes = (existingFiles ?? []).reduce((total, item) => total + item.byte_size, 0);
    if ((existingFiles ?? []).length >= MAX_CHATBOT_SOURCE_FILES) {
      return Response.json({ error: `A user can have at most ${MAX_CHATBOT_SOURCE_FILES} source files` }, { status: 400 });
    }
    if (existingBytes + file.size > MAX_CHATBOT_SOURCE_TOTAL_BYTES) {
      return Response.json({ error: "A user's source files may total no more than 256 KiB" }, { status: 400 });
    }
    const { data, error } = await admin.from("chatbot_source_files").insert({
      user_id: userId,
      file_name: fileName,
      mime_type: mimeType,
      content,
      byte_size: file.size,
    }).select("id, file_name, mime_type, byte_size, created_at").single();
    if (error || !data) return Response.json({ error: "Could not save source file" }, { status: 500 });
    return Response.json({ source: data }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid source file" }, { status: 400 });
  }
}

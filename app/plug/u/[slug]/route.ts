import { handlePlug } from "../../../../../worker/plug.js";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const response = await handlePlug(new Request(`https://espacios.me/communiverse/plug/u/${slug}`));
  if (!response) return new Response("Not found", { status: 404 });
  return response;
}

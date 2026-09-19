import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sin esto, Next.js puede tratar de generar esta página como estática en el
// build (ya que no lee nada obviamente dinámico), y el redirect() que hace
// según la sesión queda "horneado" en el build en vez de evaluarse en cada
// visita — eso es lo que causaba el 404 en Netlify. force-dynamic obliga a
// que esta ruta se ejecute en el servidor en cada request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  redirect(session ? "/feed" : "/login");
}

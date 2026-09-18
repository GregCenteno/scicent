import Link from "next/link";

export const metadata = { title: "Aviso de privacidad — Scicent" };

// PLANTILLA DE PARTIDA, no asesoría legal. Antes de lanzar en serio,
// haz que un abogado la revise: confirma qué ley de protección de datos
// aplica a tus usuarios (LFPDPPP en México, GDPR/UK-GDPR en Europa/Reino
// Unido, CCPA en California, etc.) y ajusta las secciones de derechos y
// transferencias en consecuencia. Los corchetes [ASÍ] marcan los datos
// que tienes que completar tú.
export default function PrivacyPage() {
  return (
    <div className="legal-shell">
      <div className="legal-card">
        <p className="legal-flag">
          Plantilla de partida — no es asesoría legal. Revísala con un abogado antes de lanzar
          públicamente y completa los datos entre corchetes.
        </p>
        <h1>Aviso de privacidad</h1>
        <p className="legal-updated">Última actualización: [FECHA]</p>

        <h2>1. Responsable</h2>
        <p>
          [RAZÓN SOCIAL / NOMBRE] es responsable del tratamiento de tus datos personales al usar
          Scicent. Contacto: [CORREO DE CONTACTO].
        </p>

        <h2>2. Qué datos guardamos</h2>
        <p>
          Nombre, nombre de usuario, correo y contraseña (nunca en texto plano — se guarda un
          hash con bcrypt). También guardamos tus "me gusta", guardados, reposts y a quién sigues,
          para poder mostrártelos y personalizar tu feed.
        </p>

        <h2>3. Para qué los usamos</h2>
        <p>
          Para operar tu cuenta y sesión, mostrarte tu feed personalizado y guardados, hacer
          funcionar la parte social (seguir/repostear) y, si nos escribes, responder tus
          solicitudes de soporte.
        </p>

        <h2>4. Con quién los compartimos</h2>
        <p>
          Con nuestro proveedor de base de datos y de hosting (por ejemplo, Neon/Supabase y
          Vercel u otro que uses) únicamente para operar el servicio. No vendemos tus datos ni
          los compartimos con anunciantes.
        </p>

        <h2>5. Tus derechos (acceso, rectificación, cancelación, oposición)</h2>
        <p>
          Puedes pedirnos ver, corregir o borrar tus datos, o cerrar tu cuenta, escribiendo a
          [CORREO DE CONTACTO]. [Completa: plazo de respuesta según la ley que te aplique.]
        </p>

        <h2>6. Seguridad</h2>
        <p>
          Las contraseñas se guardan con hash (bcrypt), la sesión usa cookies firmadas (JWT) y
          las conexiones a producción deben ir siempre sobre HTTPS.
        </p>

        <h2>7. Cambios a este aviso</h2>
        <p>Si actualizamos este aviso de forma relevante, lo anunciaremos en la app.</p>

        <p className="legal-back">
          <Link href="/register">← Volver al registro</Link>
        </p>
      </div>
    </div>
  );
}

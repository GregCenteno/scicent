import Link from "next/link";

export const metadata = { title: "Términos de uso — Scicent" };

// PLANTILLA DE PARTIDA, no asesoría legal. Antes de lanzar en serio,
// haz que un abogado la revise y la ajuste a tu jurisdicción, tu modelo de
// negocio real (¿cobras? ¿hay publicidad? ¿procesas datos de menores?) y
// las leyes de protección de datos que apliquen a tus usuarios (LFPDPPP en
// México, GDPR si tienes usuarios en la UE, etc.). Los corchetes [ASÍ]
// marcan los datos que tienes que completar tú.
export default function TermsPage() {
  return (
    <div className="legal-shell">
      <div className="legal-card">
        <p className="legal-flag">
          Plantilla de partida — no es asesoría legal. Revísala con un abogado antes de lanzar
          públicamente y completa los datos entre corchetes.
        </p>
        <h1>Términos de uso</h1>
        <p className="legal-updated">Última actualización: [FECHA]</p>

        <h2>1. Qué es Scicent</h2>
        <p>
          Scicent es un feed de literatura científica del área de salud (enfermería, medicina,
          farmacia, nutrición, rehabilitación, odontología y laboratorio clínico), operado por
          [RAZÓN SOCIAL / NOMBRE], con contacto en [CORREO DE CONTACTO].
        </p>

        <h2>2. Tu cuenta</h2>
        <p>
          Para usar el feed personalizado, guardar artículos, seguir cuentas y repostear
          necesitas crear una cuenta con un nombre de usuario único, correo y contraseña. Eres
          responsable de mantener tu contraseña en privado y de la actividad que ocurra en tu
          cuenta.
        </p>

        <h2>3. Contenido de terceros</h2>
        <p>
          Los artículos que ves provienen de fuentes externas (principalmente Europe PMC /
          PubMed) y son propiedad de sus autores y editoriales originales. Scicent solo indexa
          metadatos (título, resumen, fuente, enlace) — "Leer original" te lleva siempre a la
          fuente. No reclamamos derechos sobre ese contenido.
        </p>

        <h2>4. Uso aceptable</h2>
        <p>
          No está permitido: hacer scraping masivo del servicio, suplantar a otra persona o
          cuenta, publicar contenido ilegal a través de los comentarios de repost, ni intentar
          vulnerar la seguridad de la plataforma.
        </p>

        <h2>5. Este no es consejo médico</h2>
        <p>
          El contenido del feed es informativo/educativo para profesionales y estudiantes del
          área de salud. No sustituye el criterio clínico ni el consejo médico profesional.
        </p>

        <h2>6. Cambios y cierre de cuenta</h2>
        <p>
          Podemos actualizar estos términos; los cambios importantes se avisarán en la app.
          Puedes solicitar el cierre de tu cuenta y el borrado de tus datos escribiendo a
          [CORREO DE CONTACTO].
        </p>

        <h2>7. Jurisdicción</h2>
        <p>[Completa: leyes aplicables y jurisdicción para disputas.]</p>

        <p className="legal-back">
          <Link href="/register">← Volver al registro</Link>
        </p>
      </div>
    </div>
  );
}

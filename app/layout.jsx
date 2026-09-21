import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Scicent",
  description: "Feed vertical de literatura real de enfermería, medicina, farmacia, farmacología, nutrición, rehabilitación, odontología y laboratorio clínico.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Le dice a iOS que se puede abrir en modo standalone (sin la barra de
  // Safari) cuando se agrega a la pantalla de inicio.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Scicent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f2a45",
};

// Registra el service worker (ver public/sw.js) para que Chrome/Android
// ofrezca "Instalar app" / "Agregar a pantalla de inicio". Se hace con un
// script inline en vez de un componente cliente para no tener que convertir
// todo el layout en "use client".
const swRegisterScript = `
(function(){
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();
`;

// Aplica el tema guardado ANTES de que React hidrate, para no ver un
// parpadeo claro→oscuro (u oscuro→claro) al cargar la página.
const themeInitScript = `
(function(){
  try{
    var saved = localStorage.getItem("scicent-theme");
    if(saved === "light" || saved === "dark"){
      document.documentElement.setAttribute("data-theme", saved);
    }
  }catch(e){}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

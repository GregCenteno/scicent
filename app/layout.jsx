import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Scicent",
  description: "Feed vertical de literatura real de enfermería, medicina, farmacia, nutrición, rehabilitación, odontología y laboratorio clínico.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

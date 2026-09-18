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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Frank_Ruhl_Libre, Libre_Franklin, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next'

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300"],
});

export const metadata: Metadata = {
  title: "Latin Media",
  description:
    "Noticias de todo el país. Ocho redacciones, una sola vara: contar lo que pasa, claro y sin vueltas.",
};

export const viewport: Viewport = {
  themeColor: "#FCFAF6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${bodoniModa.variable} ${frankRuhlLibre.variable} ${libreFranklin.variable} ${montserrat.variable}`}
    >
  <body>
  {children}
  <Script
    src="https://platform.twitter.com/widgets.js"
    strategy="lazyOnload"
  />
  <SpeedInsights />
  <Analytics />
</body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Merriweather, Montserrat, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next'

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300"],
});

export const metadata: Metadata = {
  // dominio oficial: las URLs de canonical, og:url, etc. se arman sobre este
  metadataBase: new URL("https://latinmediaok.com"),
  title: { default: "Latin Media", template: "%s | Latin Media" },
  description:
    "Noticias de todo el país. Ocho redacciones, una sola vara: contar lo que pasa, claro y sin vueltas.",
  verification: {
    google: "MVeX-9uOfDFD9McsGA9P9TLiFh_plpfO-jdehn1w0sY",
    other: { "facebook-domain-verification": "h0ivoj7ezkfaz91leqa0ce8sjb4uxl" },
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EFDF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${bodoniModa.variable} ${merriweather.variable} ${sourceSans.variable} ${montserrat.variable}`}
    >
  <body>
  {children}
  <Script
    src="https://platform.twitter.com/widgets.js"
    strategy="lazyOnload"
  />
  <Analytics />
</body>
    </html>
  );
}
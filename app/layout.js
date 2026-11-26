import "@fontsource/dosis/latin-600.css";
import "./style.css";

import { absoluteUrl, siteOrigin } from "../lib/seo.js";

export const metadata = {
  metadataBase: siteOrigin,
  verification: {google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined},
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: "/pwa/icon-192.png",
  },
};

export const viewport = { themeColor: "#2c185b" };

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta property="og:logo" content={absoluteUrl("/pwa/icon-512.png")} />
      </head>
      <body>{children}</body>
    </html>
  );
}

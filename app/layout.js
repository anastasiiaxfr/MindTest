import "@fontsource/dosis/latin-600.css";
import "./style.css";

const title = "MindTest — A little space for your mind";
const description =
  "Explore how you think with three playful quizzes in logic, memory and mental age.";
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const image = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "MindTest quizzes with Momo, the lavender brain mascot",
};

const metadataOrigin = vercelHost ? "https://" + vercelHost : process.env.APP_URL?.trim();
const metadataBase = metadataOrigin ? new URL(metadataOrigin) : undefined;
const logoPath = "/pwa/icon-512.png";
const logoUrl = metadataBase ? new URL(logoPath, metadataBase).href : logoPath;

export const metadata = {
  metadataBase,
  title,
  description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: "/pwa/icon-192.png",
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "MindTest",
    url: "/",
    images: [image],
  },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

export const viewport = { themeColor: "#2c185b" };

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta property="og:logo" content={logoUrl} />
      </head>
      <body>{children}</body>
    </html>
  );
}

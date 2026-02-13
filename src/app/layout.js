import "./globals.css";
import styles from "@/app/page.module.css";
import GithubIcon from "../components/Icons/GithubIcon";
import Link from "next/link";
import LoginButton from "../components/LoginButton/LoginButton";
import { Toaster } from "react-hot-toast";
import { Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import InstallPrompt from "@/components/InstallPrompt/InstallPrompt";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Spärmen",
  description: "Spex lyrics database",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spärmen",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  applicationName: "Spärmen",
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Spärmen</title>
      </head>
      <body className={notoSans.className}>
        <AuthProvider>
          <Toaster position="bottom-right" />
          <div className={styles.navbar}>
            <LoginButton />
            <Link href="/" prefetch={true}>
              <h1>Spärmen</h1>
            </Link>
            <a
              href="https://github.com/erik-gullberg-devoteam/sparmen-v2"
              target="_blank"
              aria-label="GitHub repository"
            >
              <GithubIcon style={{ width: 35, height: 35 }} />
            </a>
          </div>
          <main className={styles.main}>{children}</main>
          <InstallPrompt />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

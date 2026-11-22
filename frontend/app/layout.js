import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata = {
  title: "JanSambandha",
  description:
    "Local government annual planning, project evaluation and citizen engagement",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plex.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
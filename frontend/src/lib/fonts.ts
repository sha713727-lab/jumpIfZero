import { Montserrat, Nunito } from "next/font/google";

export const nourd = Nunito({
  subsets: ["latin"],
  variable: "--font-nourd",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const heroDisplay = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
});

import { Font } from "@react-pdf/renderer";

const SANS = process.env.PDF_FONT_SANS || "/public/fonts/NotoSansJP-Regular.ttf";
const SANS_BOLD = process.env.PDF_FONT_SANS_BOLD || "/public/fonts/NotoSansJP-Bold.ttf";
const SERIF = process.env.PDF_FONT_SERIF || "/public/fonts/NotoSerifJP-Regular.ttf";

export function registerFontsJP() {
  try {
    Font.register({ family: "NotoSansJP", src: SANS });
    Font.register({ family: "NotoSansJP-Bold", src: SANS_BOLD });
    Font.register({ family: "NotoSerifJP", src: SERIF });
  } catch { /* no-op in dev if missing */ }
}

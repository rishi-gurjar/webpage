import {
  Butcherman,
  Creepster,
  Fruktur,
  Grenze_Gotisch,
  MedievalSharp,
  Metal_Mania,
  New_Rocker,
  Pirata_One,
  Rye,
  UnifrakturCook,
  UnifrakturMaguntia,
} from "next/font/google";

const maguntia = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-maguntia",
});

const cook = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-g-cook",
});

const grenze = Grenze_Gotisch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-grenze",
});

const fruktur = Fruktur({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-fruktur",
});

const medieval = MedievalSharp({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-medieval",
});

const rocker = New_Rocker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-rocker",
});

const pirata = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-pirata",
});

const metal = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-metal",
});

const butcherman = Butcherman({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-butcherman",
});

const creepster = Creepster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-creepster",
});

const rye = Rye({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-g-rye",
});

export const JACQUARD_24 = "'Jacquard 24', serif";

export const FACES = [
  { family: JACQUARD_24 },
  { family: "var(--font-g-maguntia)", face: maguntia },
  { family: "var(--font-g-cook)", face: cook },
  { family: "var(--font-g-grenze)", face: grenze },
  { family: "var(--font-g-fruktur)", face: fruktur },
  { family: "var(--font-g-medieval)", face: medieval },
  { family: "var(--font-g-rocker)", face: rocker },
  { family: "var(--font-g-pirata)", face: pirata },
  { family: "var(--font-g-metal)", face: metal },
  { family: "var(--font-g-butcherman)", face: butcherman },
  { family: "var(--font-g-creepster)", face: creepster },
  { family: "var(--font-g-rye)", face: rye },
] as const;

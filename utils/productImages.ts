
import { ImageSourcePropType } from "react-native";

const FALLBACK = require("@/assets/images/products/ceramica.png");

const IMAGE_MAP: Record<string, ImageSourcePropType> = {

  // JUST TO SHOWCASE must be deleted after migration to blob storage.

  "ceramica.png": require("@/assets/images/products/ceramica.png"),
  "platos.png": require("@/assets/images/products/platos.png"),

  "tasa.png": require("@/assets/images/products/tasa.png"),
  "telas.png": require("@/assets/images/products/telas.png"),
  "arte.png": require("@/assets/images/products/arte.png"),


};

export function getProductImage(
  filename: string | undefined | null
): ImageSourcePropType {
  if (!filename) return FALLBACK;
  return IMAGE_MAP[filename] ?? FALLBACK;
}

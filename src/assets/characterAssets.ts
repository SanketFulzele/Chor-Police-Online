import raja from "./raja.jpg";
import police from "./police.jpeg";
import sipahi from "./sipahi.jpg";
import chor from "./chor.jpg";
import daku from "./daku.jpeg";
import joker from "./joker.jpeg";
import jasoos from "./jasoos.jpeg";
import aamAadmi from "./aam-aadmi.jpeg";
import backcard from "./backcard.jpg";

export const characterAssets = {
  RAJA: raja,
  POLICE: police,
  SIPAHI: sipahi,
  CHOR: chor,
  DAKU: daku,
  JOKER: joker,
  JASOOS: jasoos,
  AAM_AADMI: aamAadmi,
  BACK: backcard,
} as const;

export type CharacterAssetKey = keyof typeof characterAssets;

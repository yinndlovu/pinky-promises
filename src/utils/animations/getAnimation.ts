// animation files
import hugAnimation from "../../assets/animations/hug.json";
import kissAnimation from "../../assets/animations/kiss.json";
import winkAnimation from "../../assets/animations/wink.json";
import nudgeAnimation from "../../assets/animations/nudge.json";
import rollAnimation from "../../assets/animations/roll.json";
import holdAnimation from "../../assets/animations/hold.json";
import cuddleAnimation from "../../assets/animations/cuddle.json";
import caressAnimation from "../../assets/animations/caress.json";
import embraceAnimation from "../../assets/animations/embrace.json";

export const animationMap: { [key: string]: any } = {
  hug: hugAnimation,
  cuddle: cuddleAnimation,
  hold: holdAnimation,
  embrace: embraceAnimation,
  caress: caressAnimation,
  kiss: kissAnimation,
  wink: winkAnimation,
  nudge: nudgeAnimation,
  roll: rollAnimation,
};

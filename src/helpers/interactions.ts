export function getInteractionMessage(action: string) {
  switch (action) {
    case "kiss":
      return "just gave you a kiss";
    case "hug":
      return "gave you a hug";
    case "cuddle":
      return "cuddled you";
    case "hold":
      return "held your hand";
    case "nudge":
      return "nudged you";
    case "caress":
      return "caressed you";
    case "embrace":
      return "embraced you";
    case "wink":
      return "winked at you";
    case "roll":
      return "rolled their eyes at you";
    default:
      return `interacted with you`;
  }
}

export function getInteractionFeedback(action: string, partnerName: string) {
  switch (action) {
    case "kiss":
      return `Mwah! You just gave ${partnerName} a kiss! Aww 🤍`;
    case "hug":
      return `You just gave ${partnerName} a hug! So sweet`;
    case "cuddle":
      return `You just cuddled with ${partnerName}. So cozy 🤍`;
    case "hold":
      return `You just held hands with ${partnerName}. Aww, cuties!`;
    case "nudge":
      return `You just nudged ${partnerName}`;
    case "caress":
      return `You just caressed ${partnerName} 🤍`;
    case "embrace":
      return `You just embraced ${partnerName}. Aww, lovebirds 🤍`;
    case "wink":
      return `You just winked at ${partnerName}`;
    case "roll":
      return `You just rolled your eyes at ${partnerName} 🙄`;
    default:
      return `You just interacted with ${partnerName}`;
  }
}

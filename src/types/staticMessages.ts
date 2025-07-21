import { Message } from "./types";

export const sweetMessagesSent: Message[] = [
  {
    id: "1",
    content: "You are amazing!",
    date: "2024-06-01",
    viewed: true,
    type: "sweet",
    sender: "me",
    receiver: "partner",
  },
  // ...more
];

export const sweetMessagesReceived: Message[] = [
  {
    id: "2",
    content: "You make me smile!",
    date: "2024-06-02",
    viewed: false,
    type: "sweet",
    sender: "partner",
    receiver: "me",
  },
  // ...more
];

export const ventMessagesSent: Message[] = [
  {
    id: "3",
    content: "I felt a bit ignored yesterday.",
    date: "2024-06-03",
    viewed: true,
    type: "vent",
    sender: "me",
    receiver: "partner",
  },
  // ...more
];

export const ventMessagesReceived: Message[] = [
  {
    id: "4",
    content: "I was stressed about work.",
    date: "2024-06-04",
    viewed: false,
    type: "vent",
    sender: "partner",
    receiver: "me",
  },
  // ...more
];

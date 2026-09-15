import type { Expense, Gathering, Person, Profile } from "./types";

const day = 86400000;
const hour = 3600000;

export function seedNow(now = Date.now()) {
  const people: Person[] = [
    {
      id: "me",
      name: "نیکی",
      avatar: "/avatars/niki.jpg",
      color: "person-5",
      isMe: true,
    },
    {
      id: "ali",
      name: "علی",
      avatar: "/avatars/ali.jpg",
      color: "person-1",
    },
    {
      id: "sara",
      name: "سارا",
      avatar: "/avatars/sara.jpg",
      color: "person-2",
    },
    {
      id: "mehdi",
      name: "مهدی",
      avatar: "/avatars/mehdi.jpg",
      color: "person-3",
    },
    {
      id: "nazanin",
      name: "نازنین",
      avatar: "/avatars/nazanin.jpg",
      color: "person-4",
    },
    {
      id: "reza",
      name: "رضا",
      avatar: "/avatars/reza.jpg",
      color: "person-6",
    },
    {
      id: "elham",
      name: "الهام",
      avatar: "/avatars/elham.jpg",
      color: "person-1",
    },
    {
      id: "kian",
      name: "کیان",
      avatar: "/avatars/kian.jpg",
      color: "person-3",
    },
  ];

  const northMembers = ["me", "ali", "sara", "mehdi", "nazanin"];

  const gatherings: Gathering[] = [
    {
      id: "g-north",
      name: "شمال · آخر هفته",
      cover: "/covers/north.jpg",
      memberIds: northMembers,
      currency: "IRT",
      createdAt: now - 4 * day,
    },
    {
      id: "g-bday",
      name: "تولد سارا",
      cover: "/covers/birthday.jpg",
      memberIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      currency: "IRT",
      createdAt: now - 10 * day,
    },
    {
      id: "g-work",
      name: "سفر کاری",
      cover: "/covers/work.jpg",
      memberIds: ["me", "mehdi", "kian"],
      currency: "IRT",
      createdAt: now - 18 * day,
    },
  ];

  const expenses: Expense[] = [
    {
      id: "e-villa",
      gatheringId: "g-north",
      title: "ویلا",
      amount: 3_600_000,
      category: "lodging",
      payerId: "ali",
      participantIds: northMembers,
      split: "equal",
      date: now - day - 9.5 * hour,
      createdAt: now - day,
    },
    {
      id: "e-dinner",
      gatheringId: "g-north",
      title: "شام",
      amount: 1_250_000,
      category: "food",
      payerId: "sara",
      participantIds: northMembers,
      split: "equal",
      date: now - day - 3.75 * hour,
      createdAt: now - day,
    },
    {
      id: "e-gas",
      gatheringId: "g-north",
      title: "بنزین",
      amount: 760_000,
      category: "transport",
      payerId: "mehdi",
      participantIds: northMembers,
      split: "equal",
      date: now - 2 * day,
      createdAt: now - 2 * day,
    },
    {
      id: "e-snacks",
      gatheringId: "g-north",
      title: "تنقلات",
      amount: 1_500_000,
      category: "shopping",
      payerId: "nazanin",
      participantIds: northMembers,
      split: "equal",
      date: now - 3 * day,
      createdAt: now - 3 * day,
    },
    {
      id: "e-cake",
      gatheringId: "g-bday",
      title: "کیک تولد",
      amount: 980_000,
      category: "food",
      payerId: "me",
      participantIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 8 * day,
      createdAt: now - 8 * day,
    },
    {
      id: "e-rest",
      gatheringId: "g-bday",
      title: "رستوران",
      amount: 2_100_000,
      category: "food",
      payerId: "ali",
      participantIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 8 * day + 3 * hour,
      createdAt: now - 8 * day,
    },
    {
      id: "e-gift",
      gatheringId: "g-bday",
      title: "کادو گروهی",
      amount: 720_000,
      category: "shopping",
      payerId: "nazanin",
      participantIds: ["me", "ali", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 9 * day,
      createdAt: now - 9 * day,
    },
    {
      id: "e-deco",
      gatheringId: "g-bday",
      title: "بادکنک و دکور",
      amount: 350_000,
      category: "shopping",
      payerId: "sara",
      participantIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 9 * day,
      createdAt: now - 9 * day,
    },
    {
      id: "e-taxi-b",
      gatheringId: "g-bday",
      title: "اسنپ",
      amount: 180_000,
      category: "transport",
      payerId: "reza",
      participantIds: ["me", "ali", "sara", "reza"],
      split: "equal",
      date: now - 8 * day,
      createdAt: now - 8 * day,
    },
    {
      id: "e-music",
      gatheringId: "g-bday",
      title: "آهنگ و اسپیکر",
      amount: 220_000,
      category: "other",
      payerId: "mehdi",
      participantIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 10 * day,
      createdAt: now - 10 * day,
    },
    {
      id: "e-drinks",
      gatheringId: "g-bday",
      title: "نوشیدنی",
      amount: 300_000,
      category: "food",
      payerId: "me",
      participantIds: ["me", "ali", "sara", "mehdi", "nazanin", "reza"],
      split: "equal",
      date: now - 8 * day,
      createdAt: now - 8 * day,
    },
    {
      id: "e-hotel",
      gatheringId: "g-work",
      title: "هتل",
      amount: 1_200_000,
      category: "lodging",
      payerId: "me",
      participantIds: ["me", "mehdi", "kian"],
      split: "equal",
      date: now - 16 * day,
      createdAt: now - 16 * day,
    },
    {
      id: "e-train",
      gatheringId: "g-work",
      title: "بلیط قطار",
      amount: 540_000,
      category: "transport",
      payerId: "kian",
      participantIds: ["me", "mehdi", "kian"],
      split: "equal",
      date: now - 18 * day,
      createdAt: now - 18 * day,
    },
    {
      id: "e-lunch",
      gatheringId: "g-work",
      title: "ناهار کاری",
      amount: 280_000,
      category: "food",
      payerId: "mehdi",
      participantIds: ["me", "mehdi", "kian"],
      split: "equal",
      date: now - 16 * day,
      createdAt: now - 16 * day,
    },
    {
      id: "e-cafe",
      gatheringId: "g-work",
      title: "کافه جلسه",
      amount: 160_000,
      category: "food",
      payerId: "me",
      participantIds: ["me", "kian"],
      split: "equal",
      date: now - 15 * day,
      createdAt: now - 15 * day,
    },
    {
      id: "e-taxi-w",
      gatheringId: "g-work",
      title: "تاکسی فرودگاه",
      amount: 120_000,
      category: "transport",
      payerId: "kian",
      participantIds: ["me", "mehdi", "kian"],
      split: "equal",
      date: now - 15 * day,
      createdAt: now - 15 * day,
    },
  ];

  const profile: Profile = {
    name: "نیکی",
    avatar: "/avatars/niki.jpg",
    defaultCurrency: "IRT",
    seenWelcome: false,
  };

  return { people, gatherings, expenses, profile };
}

export function emptyNow(): {
  people: Person[];
  gatherings: Gathering[];
  expenses: Expense[];
  profile: Profile;
} {
  return {
    people: [
      {
        id: "me",
        name: "من",
        avatar: "",
        color: "person-5",
        isMe: true,
      },
    ],
    gatherings: [],
    expenses: [],
    profile: {
      name: "من",
      avatar: "",
      defaultCurrency: "IRT",
      seenWelcome: false,
    },
  };
}


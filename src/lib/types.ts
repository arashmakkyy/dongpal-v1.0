export type Currency = "IRT" | "IRR" | "USD" | "EUR";

export type Category = "food" | "transport" | "lodging" | "shopping" | "other";

export type PersonColor =
  | "person-1"
  | "person-2"
  | "person-3"
  | "person-4"
  | "person-5"
  | "person-6";

export type Person = {
  id: string;
  name: string;
  avatar: string;
  color: PersonColor;
  isMe?: boolean;
};

export type Gathering = {
  id: string;
  name: string;
  cover: string;
  memberIds: string[];
  currency: Currency;
  createdAt: number;
  archived?: boolean;
  sourceId?: string;
};

export type Expense = {
  id: string;
  gatheringId: string;
  title: string;
  amount: number;
  category: Category;
  payerId: string;
  participantIds: string[];
  split: "equal" | "unequal";
  shares?: Record<string, number>;
  note?: string;
  date: number;
  createdAt: number;
  receiptImage?: string;
};

export type Profile = {
  name: string;
  avatar: string;
  defaultCurrency: Currency;
  seenWelcome: boolean;
};

export type Transfer = {
  fromId: string;
  toId: string;
  amount: number;
};

export const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: "IRT", label: "تومان", symbol: "تومان" },
  { id: "IRR", label: "ریال", symbol: "ریال" },
  { id: "USD", label: "دلار", symbol: "$" },
  { id: "EUR", label: "یورو", symbol: "€" },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "food", label: "غذا" },
  { id: "transport", label: "حمل‌ونقل" },
  { id: "lodging", label: "اقامت" },
  { id: "shopping", label: "خرید" },
  { id: "other", label: "سایر" },
];

export const COVERS = [
  { id: "north", src: "/covers/north.jpg", label: "شمال" },
  { id: "birthday", src: "/covers/birthday.jpg", label: "تولد" },
  { id: "work", src: "/covers/work.jpg", label: "کار" },
  { id: "cafe", src: "/covers/cafe.jpg", label: "کافه" },
  { id: "picnic", src: "/covers/picnic.jpg", label: "پیک‌نیک" },
  { id: "beach", src: "/covers/beach.jpg", label: "ساحل" },
  { id: "concert", src: "/covers/concert.jpg", label: "کنسرت" },
] as const;

export const PERSON_COLORS: PersonColor[] = [
  "person-1",
  "person-2",
  "person-3",
  "person-4",
  "person-5",
  "person-6",
];

import { Banknote, CreditCard } from "lucide-react";

export type PaymentMethod =
  | "CARD"
  | "TRANSFER"
  | "VIRTUAL_ACCOUNT"
  | "EASY_PAY";
// | "DIRECT_DEPOSIT";

export type PaymentMethodItem = {
  id: PaymentMethod;
  name: string;
  Icon: React.ElementType;
};

export const paymentMethodsList: PaymentMethodItem[] = [
  {
    id: "CARD",
    name: "카드∙간편결제",
    Icon: CreditCard,
  },
  {
    id: "TRANSFER",
    name: "계좌이체",
    Icon: Banknote,
  },
  {
    id: "VIRTUAL_ACCOUNT",
    name: "가상계좌",
    Icon: Banknote,
  },
  // {
  //   id: "DIRECT_DEPOSIT",
  //   name: "직접 계좌이체",
  //   Icon: Banknote,
  // },
];

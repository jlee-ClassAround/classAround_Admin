import { formatPrice } from "./formats";

interface Props {
  discountedPrice: number | null;
  originalPrice: number;
  isInstallment: boolean;
}

export function courseDisplayPrice({
  discountedPrice,
  originalPrice,
  isInstallment,
}: Props) {
  const displayDiscount =
    originalPrice === 0 || discountedPrice === 0
      ? "100% 할인"
      : discountedPrice
      ? `${Math.round(100 - (discountedPrice / originalPrice) * 100)}% 할인`
      : null;

  let salePrice = discountedPrice ? discountedPrice : originalPrice;
  if (discountedPrice === 0) {
    salePrice = discountedPrice;
  }

  const displayPrice =
    originalPrice === 0 || discountedPrice === 0
      ? "0"
      : isInstallment
      ? `월 ${formatPrice(Math.round(salePrice / 12))}`
      : formatPrice(salePrice);

  let cancelPrice = discountedPrice ? formatPrice(originalPrice) : null;
  if (discountedPrice === 0) {
    cancelPrice = formatPrice(originalPrice);
  }

  return {
    displayDiscount,
    displayPrice,
    cancelPrice,
  };
}

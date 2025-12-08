import { CourseOption, ProductType } from "@prisma/client";

interface CalculatePriceProps {
  productType: ProductType;
  originalPrice: number | null;
  discountedPrice: number | null;
  selectedOption?: CourseOption;
}

export function calculatePrice({
  productType,
  originalPrice,
  discountedPrice,
  selectedOption,
}: CalculatePriceProps) {
  if (productType === "OPTION" && selectedOption) {
    return {
      originalPrice: selectedOption.originalPrice,
      discountedPrice: selectedOption.discountedPrice,
    };
  }

  return {
    originalPrice: originalPrice ?? undefined,
    discountedPrice: discountedPrice ?? undefined,
  };
}

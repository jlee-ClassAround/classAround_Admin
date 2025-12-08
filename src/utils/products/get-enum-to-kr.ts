export function getProductCategoryToKr(
  productCategory: "COURSE" | "EBOOK" | null
) {
  switch (productCategory) {
    case "COURSE":
      return "강의";
    case "EBOOK":
      return "전자책";
    default:
      return "-";
  }
}

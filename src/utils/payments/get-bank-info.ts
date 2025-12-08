import { BANK_LIST } from "@/constants/payments/bank-list";

/**
 * 은행 코드로 은행명을 찾는 함수
 * @param bankCode - 은행 코드 (2자리 문자열)
 * @returns 은행명 또는 undefined (찾지 못한 경우)
 */
export function getBankNameByCode(bankCode: string): string | undefined {
  const bank = BANK_LIST.find((bank) => bank.code === bankCode);
  return bank?.name;
}

/**
 * 은행명으로 은행 코드를 찾는 함수
 * @param bankName - 은행명
 * @returns 은행 코드 또는 undefined (찾지 못한 경우)
 */
export function getBankCodeByName(bankName: string): string | undefined {
  const bank = BANK_LIST.find((bank) => bank.name === bankName);
  return bank?.code;
}

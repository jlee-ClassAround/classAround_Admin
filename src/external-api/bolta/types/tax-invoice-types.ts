/**
 * 전자세금계산서 발행 요청
 */
export interface RequestTaxInvoice {
  /**
   * 작성일자
   */
  date: string | Date;
  /**
   * 세금계산서 비고
   */
  description?: string;
  items: 전자세금계산서품목[];
  /**
   * 발행목적
   */
  purpose: 발행목적;
  supplied: 전자세금계산서공급받는자;
  supplier: 전자세금계산서공급자;
  [property: string]: any;
}

/**
 * 전자세금계산서 품목
 */
export interface 전자세금계산서품목 {
  /**
   * 공급일자
   */
  date: string | Date;
  /**
   * 품목 비고
   */
  description?: string;
  /**
   * 품목명
   */
  name: string;
  /**
   * 수량
   */
  quantity?: number;
  /**
   * 규격
   */
  specification?: string;
  supplyCost: number;
  tax?: number;
  /**
   * 단가
   */
  unitPrice?: number;
  [property: string]: any;
}

/**
 * 발행목적
 */
export enum 발행목적 {
  Claim = "CLAIM",
  Receipt = "RECEIPT",
}

/**
 * 전자세금계산서 공급받는자
 */
export interface 전자세금계산서공급받는자 {
  /**
   * 주소
   */
  address?: string;
  /**
   * 종목
   */
  businessItem?: string;
  /**
   * 업태
   */
  businessType?: string;
  /**
   * 사업자등록번호
   */
  identificationNumber: string;
  /**
   * 담당자
   */
  managers: 전자세금계산서담당자[];
  /**
   * 상호명
   */
  organizationName: string;
  /**
   * 대표자명
   */
  representativeName: string;
  /**
   * 종사업장번호
   */
  taxRegistrationId?: string;
  [property: string]: any;
}

/**
 * 전자세금계산서 담당자
 *
 * 담당자
 */
export interface 전자세금계산서담당자 {
  /**
   * 이메일
   */
  email: string;
  /**
   * 이름
   */
  name?: string;
  /**
   * 휴대전화번호
   */
  telephone?: string;
  [property: string]: any;
}

/**
 * 전자세금계산서 공급자
 */
export interface 전자세금계산서공급자 {
  /**
   * 주소
   */
  address?: string;
  /**
   * 종목
   */
  businessItem?: string;
  /**
   * 업태
   */
  businessType?: string;
  /**
   * 사업자등록번호
   */
  identificationNumber: string;
  /**
   * 담당자
   */
  manager: 전자세금계산서담당자;
  /**
   * 상호명
   */
  organizationName: string;
  /**
   * 대표자명
   */
  representativeName: string;
  /**
   * 종사업장번호
   */
  taxRegistrationId?: string;
  [property: string]: any;
}

export type ResponseTaxInvoice =
  | {
      issuanceKey: string;
      [property: string]: any;
    }
  | {
      code: string;
      message: string;
      [property: string]: any;
    };

export type TaxInvoiceWebhookEvent = {
  eventType: string;
  data: {
    issuanceKey: string;
    taxInvoiceUrl: string;
  };
};

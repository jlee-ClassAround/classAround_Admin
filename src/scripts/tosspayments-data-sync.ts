import { PrismaClient } from "@prisma/client";
import { getEncryptedSecretKey } from "@/external-api/tosspayments/services/get-encrypted-secret-key";
import {
  TossPayment,
  Cancel,
} from "@/external-api/tosspayments/types/tosspayment-object";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();

interface MismatchData {
  orderId: string;
  paymentKey: string;
  dbId: string;
  mismatches: {
    field: string;
    dbValue: any;
    tossValue: any;
  }[];
}

// 토스페이먼츠 status를 DB paymentStatus로 매핑
// DB paymentStatus: COMPLETED, REFUNDED, PARTIAL_REFUNDED, WAITING_FOR_DEPOSIT
function mapTossStatusToDbStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DONE: "COMPLETED", // 결제 완료
    CANCELED: "REFUNDED", // 전액 환불
    PARTIAL_CANCELED: "PARTIAL_REFUNDED", // 부분 환불
    WAITING_FOR_DEPOSIT: "WAITING_FOR_DEPOSIT", // 가상계좌 입금 대기
    // 아래 상태들은 DB에 저장되지 않지만, 비교를 위해 매핑
    READY: "READY", // 결제 생성 (초기 상태)
    IN_PROGRESS: "IN_PROGRESS", // 결제 진행 중
    ABORTED: "ABORTED", // 결제 승인 실패
    EXPIRED: "EXPIRED", // 결제 만료
  };
  return statusMap[status] || status;
}

// 취소 이력에서 총 취소 금액 계산
function calculateTotalCancelAmount(cancels: Cancel[] | null): number {
  if (!cancels || cancels.length === 0) return 0;
  return cancels.reduce((sum, cancel) => sum + cancel.cancelAmount, 0);
}

// 취소 이력에서 마지막 취소 시간 가져오기
function getLastCanceledAt(cancels: Cancel[] | null): Date | null {
  if (!cancels || cancels.length === 0) return null;
  const lastCancel = cancels[cancels.length - 1];
  return new Date(lastCancel.canceledAt);
}

// paymentKey로 토스페이먼츠에서 결제 정보 조회 (상점 정보와 무관하게 조회 가능)
async function getPaymentByPaymentKey(
  paymentKey: string
): Promise<TossPayment | null> {
  try {
    const encryptedSecretKey = getEncryptedSecretKey();
    const url = `https://api.tosspayments.com/v1/payments/${encodeURIComponent(
      paymentKey
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: encryptedSecretKey },
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 응답 상세 로깅
      if (data.code) {
        console.error(
          `[TOSS_API_ERROR] ${paymentKey}: [${data.code}] ${data.message}`
        );
        if (data.extra) {
          console.error(`  Extra:`, JSON.stringify(data.extra, null, 2));
        }
      } else {
        console.error(
          `[TOSS_API_ERROR] ${paymentKey}: HTTP ${response.status} ${response.statusText}`
        );
        console.error(`  Response:`, JSON.stringify(data, null, 2));
      }
      return null;
    }

    // 에러 응답 체크 (성공 응답이지만 code가 있는 경우)
    if (data.code) {
      console.error(`[TOSS_API_ERROR] ${paymentKey}:`, data.message);
      return null;
    }

    return data as TossPayment;
  } catch (error) {
    console.error(`[GET_PAYMENT_ERROR] ${paymentKey}:`, error);
    if (error instanceof Error) {
      console.error(`  Error message:`, error.message);
    }
    return null;
  }
}

// DB 데이터와 토스 데이터 비교 (paymentStatus만 비교)
function comparePaymentData(
  dbPayment: {
    id: string;
    orderId: string;
    paymentKey: string;
    paymentStatus: string;
    cancelAmount: number | null;
    cancelReason: string | null;
    refundableAmount: number | null;
    canceledAt: Date | null;
    finalPrice: number;
  },
  tossPayment: TossPayment
): MismatchData | null {
  // paymentStatus만 비교
  const dbStatus = dbPayment.paymentStatus;
  const tossStatusMapped = mapTossStatusToDbStatus(tossPayment.status);

  // DB에 저장되는 상태값: COMPLETED, REFUNDED, PARTIAL_REFUNDED, WAITING_FOR_DEPOSIT
  // 토스의 READY, IN_PROGRESS, ABORTED, EXPIRED는 DB에 저장되지 않으므로 비교에서 제외
  const validDbStatuses = [
    "COMPLETED",
    "REFUNDED",
    "PARTIAL_REFUNDED",
    "WAITING_FOR_DEPOSIT",
  ];

  // 토스 상태가 DB에 저장되지 않는 상태(READY, IN_PROGRESS, ABORTED, EXPIRED)면 스킵
  if (!validDbStatuses.includes(tossStatusMapped)) {
    return null; // DB에 저장되지 않는 상태이므로 비교하지 않음
  }

  if (dbStatus === tossStatusMapped) {
    return null; // 일치하면 null 반환
  }

  // 불일치하는 경우만 반환
  return {
    orderId: dbPayment.orderId,
    paymentKey: dbPayment.paymentKey,
    dbId: dbPayment.id,
    mismatches: [
      {
        field: "paymentStatus",
        dbValue: dbStatus,
        tossValue: tossStatusMapped,
      },
    ],
  };
}

async function main() {
  console.log("🔄 토스페이먼츠 데이터 동기화 검사 시작...\n");

  try {
    // DB에서 모든 TossCustomer 조회
    const dbPayments = await db.tossCustomer.findMany({
      select: {
        id: true,
        orderId: true,
        paymentKey: true,
        paymentStatus: true,
        cancelAmount: true,
        cancelReason: true,
        refundableAmount: true,
        canceledAt: true,
        finalPrice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 총 ${dbPayments.length}개의 결제 내역을 확인합니다.\n`);

    const mismatches: MismatchData[] = [];
    let errorCount = 0;

    // 필터링: 처리할 결제만 추출
    const paymentsToProcess = dbPayments.filter((payment) => {
      // FREE로 시작하는 orderId는 무료 결제일 수 있으므로 스킵
      if (payment.orderId.startsWith("FREE-")) {
        errorCount++;
        if (errorCount <= 3) {
          console.warn(
            `⚠️  [${payment.orderId}] 무료 결제는 토스페이먼츠에 없을 수 있습니다. 스킵합니다.`
          );
        }
        return false;
      }

      // paymentKey가 없으면 스킵
      if (!payment.paymentKey) {
        errorCount++;
        if (errorCount <= 3) {
          console.warn(
            `⚠️  [${payment.orderId}] paymentKey가 없어서 스킵합니다.`
          );
        }
        return false;
      }

      return true;
    });

    console.log(`📋 실제 처리할 결제: ${paymentsToProcess.length}개\n`);

    // 병렬 처리 (배치 단위로 처리하여 API 호출 제한 고려)
    const BATCH_SIZE = 20; // 동시에 처리할 개수
    let processedCount = 0;

    for (let i = 0; i < paymentsToProcess.length; i += BATCH_SIZE) {
      const batch = paymentsToProcess.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (dbPayment) => {
          try {
            const tossPayment = await getPaymentByPaymentKey(
              dbPayment.paymentKey
            );

            if (!tossPayment) {
              errorCount++;
              // 첫 번째 오류만 상세 정보 출력
              if (errorCount === 1) {
                console.warn(`\n⚠️  첫 번째 오류 상세 정보:`);
                console.warn(`  OrderId: ${dbPayment.orderId}`);
                console.warn(`  PaymentKey: ${dbPayment.paymentKey}`);
                console.warn(`  DB ID: ${dbPayment.id}`);
                console.warn(
                  `  위 오류의 상세 내용은 위의 [TOSS_API_ERROR] 로그를 확인하세요.\n`
                );
              }
              // 이후 오류는 간단히만 출력 (너무 많이 출력되지 않도록)
              if (errorCount <= 5) {
                console.warn(
                  `⚠️  [${dbPayment.orderId}] 토스페이먼츠에서 결제 정보를 찾을 수 없습니다.`
                );
              }
              return null;
            }

            return comparePaymentData(dbPayment, tossPayment);
          } catch (error) {
            errorCount++;
            console.error(`[PROCESS_ERROR] ${dbPayment.orderId}:`, error);
            return null;
          }
        })
      );

      // 결과 수집
      results.forEach((mismatch) => {
        if (mismatch) {
          mismatches.push(mismatch);
        }
      });

      processedCount += batch.length;
      if (
        processedCount % 50 === 0 ||
        processedCount === paymentsToProcess.length
      ) {
        console.log(`진행 중... ${processedCount}/${paymentsToProcess.length}`);
      }
    }

    console.log(`\n✅ 검사 완료!\n`);
    console.log(`📈 통계:`);
    console.log(`  - 총 결제 내역: ${dbPayments.length}개`);
    console.log(`  - 처리 완료: ${processedCount - errorCount}개`);
    console.log(`  - 오류: ${errorCount}개`);
    console.log(`  - 불일치 발견: ${mismatches.length}개\n`);

    if (mismatches.length === 0) {
      console.log("✅ 모든 데이터가 일치합니다!");
      return;
    }

    console.log("❌ 불일치 데이터 상세:\n");
    mismatches.forEach((mismatch, index) => {
      console.log(`[${index + 1}] OrderId: ${mismatch.orderId}`);
      console.log(`    PaymentKey: ${mismatch.paymentKey}`);
      console.log(`    DB ID: ${mismatch.dbId}`);
      console.log(`    불일치 항목:`);
      mismatch.mismatches.forEach((m) => {
        console.log(`      - ${m.field}:`);
        console.log(`        DB: ${JSON.stringify(m.dbValue)}`);
        console.log(`        Toss: ${JSON.stringify(m.tossValue)}`);
      });
      console.log("");
    });

    // JSON 파일로 저장
    const outputPath = path.join(process.cwd(), "toss-mismatches.json");
    fs.writeFileSync(outputPath, JSON.stringify(mismatches, null, 2));
    console.log(`📄 상세 결과가 ${outputPath}에 저장되었습니다.`);
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류 발생:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();

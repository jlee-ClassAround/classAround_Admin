const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const db = new PrismaClient();

const BATCH_SIZE = 50; // 동시 처리할 요청 수
const BATCH_INTERVAL = 100; // 배치 간 대기 시간 (ms)

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendBatchTracking() {
  try {
    const workbook = xlsx.readFile(
      "/Users/changwook/Downloads/영끌남 5기 결제자.xlsx"
    );
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
    const sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const phoneList = sheetJson
      .filter((item: any) => item["연락처"])
      .map((item: any) => item["연락처"].replace(/[^0-9]/g, ""));

    const users = await db.user.findMany({
      where: {
        roleId: {
          equals: null,
        },
        phone: {
          in: phoneList,
        },
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        phone: true,
      },
    });

    console.log(`총 ${users.length}명의 유저에 대해 tracking을 시작합니다.`);
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      const promises = batch.map(async (user: any) => {
        try {
          const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
              },
              body: JSON.stringify({
                title: "foo",
                body: "bar",
                userId: user.id,
              }),
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // const response = await fetch(
          //   "https://d3vun18xqshzq8.cloudfront.net/external/member-tracking",
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       memberId: user.id,
          //       parameterName: "uYaCh9",
          //       firstName: user.username,
          //       nickname: user.nickname,
          //       billingPhone: user.phone,
          //     }),
          //   }
          // );

          // if (!response.ok) {
          //   throw new Error(`HTTP error! status: ${response.status}`);
          // }

          successCount++;
        } catch (error) {
          failCount++;
          console.error(`❌ Failed to track user ${user.id}:`, error);
        }
      });

      // 현재 배치 처리 대기
      await Promise.all(promises);
      processedCount += batch.length;

      // 진행률 표시
      const progress = ((processedCount / users.length) * 100).toFixed(2);
      console.log(`진행률: ${progress}% (${processedCount}/${users.length})`);
      console.log(`성공: ${successCount}, 실패: ${failCount}`);

      // 서버 부하 방지를 위한 대기
      if (i + BATCH_SIZE < users.length) {
        await sleep(BATCH_INTERVAL);
      }
    }

    console.log("\n========== 작업 완료 ==========");
    console.log(`성공: ${successCount}`);
    console.log(`실패: ${failCount}`);
    console.log(`총 처리: ${users.length}`);
  } catch (error) {
    console.error("Batch tracking failed:", error);
  } finally {
    await db.$disconnect();
  }
}

// 에러 핸들링 추가
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

sendBatchTracking().catch((e) => {
  console.error(e);
  process.exit(1);
});

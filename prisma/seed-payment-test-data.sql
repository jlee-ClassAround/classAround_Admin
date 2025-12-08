-- =====================================================
-- 결제 요약 정보 테스트 데이터 생성 SQL
-- =====================================================

-- 1. 테스트 유저 생성
INSERT INTO "User" (id, username, email, phone, "createdAt", "updatedAt")
VALUES 
  ('test-user-1', '김테스트', 'test1@example.com', '01012345678', NOW(), NOW()),
  ('test-user-2', '이테스트', 'test2@example.com', '01087654321', NOW(), NOW()),
  ('test-user-3', '박테스트', 'test3@example.com', '01011112222', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. 테스트 코스 생성
INSERT INTO "Course" (id, title, "originalPrice", "discountedPrice", "isPublished", "createdAt", "updatedAt")
VALUES 
  ('test-course-1', '테스트 강의 1', 100000, 80000, true, NOW(), NOW()),
  ('test-course-2', '테스트 강의 2', 200000, 150000, true, NOW(), NOW()),
  ('test-course-3', '테스트 강의 3', 50000, 40000, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 이번 달 성공 결제 데이터 (10건)
-- =====================================================
DO $$
DECLARE
  i INT;
  user_id TEXT;
  order_id TEXT;
  payment_id TEXT;
  order_item_id TEXT;
  amount INT;
  current_month_start TIMESTAMP;
BEGIN
  current_month_start := DATE_TRUNC('month', NOW());
  
  FOR i IN 1..10 LOOP
    user_id := 'test-user-' || ((i % 3) + 1);
    order_id := 'test-order-current-' || i;
    payment_id := 'test-payment-current-' || i;
    order_item_id := 'test-orderitem-current-' || i;
    amount := (50000 + (i * 10000));
    
    -- Order 생성
    INSERT INTO "Order" (
      id, "orderName", "orderNumber", type, status,
      amount, "remainingAmount", "paidAmount",
      "originalPrice", "discountedPrice",
      "userId", "createdAt", "updatedAt"
    ) VALUES (
      order_id,
      '테스트 주문 ' || i,
      'ORD-' || TO_CHAR(current_month_start + (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      'BULK_PAYMENT',
      'PAID',
      amount,
      0,
      amount,
      amount + 20000,
      amount,
      user_id,
      current_month_start + (i || ' days')::INTERVAL,
      current_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Payment 생성 (DONE 상태)
    INSERT INTO "Payment" (
      id, "tossPaymentKey", amount, "isTaxFree", fee,
      "paymentMethod", "paymentStatus",
      "orderId", "createdAt", "updatedAt"
    ) VALUES (
      payment_id,
      'test-toss-key-current-' || i,
      amount,
      false,
      FLOOR(amount * 0.03),
      'CARD',
      'DONE',
      order_id,
      current_month_start + (i || ' days')::INTERVAL,
      current_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- OrderItem 생성
    INSERT INTO "OrderItem" (
      id, "productCategory", "productId", "productTitle",
      quantity, "originalPrice", "discountedPrice",
      "orderId", "courseId", "createdAt", "updatedAt"
    ) VALUES (
      order_item_id,
      'COURSE',
      'test-course-' || ((i % 3) + 1),
      '테스트 강의 ' || ((i % 3) + 1),
      1,
      amount + 20000,
      amount,
      order_id,
      'test-course-' || ((i % 3) + 1),
      current_month_start + (i || ' days')::INTERVAL,
      current_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 저번 달 성공 결제 데이터 (8건)
-- =====================================================
DO $$
DECLARE
  i INT;
  user_id TEXT;
  order_id TEXT;
  payment_id TEXT;
  order_item_id TEXT;
  amount INT;
  previous_month_start TIMESTAMP;
BEGIN
  previous_month_start := DATE_TRUNC('month', NOW() - INTERVAL '1 month');
  
  FOR i IN 1..8 LOOP
    user_id := 'test-user-' || ((i % 3) + 1);
    order_id := 'test-order-previous-' || i;
    payment_id := 'test-payment-previous-' || i;
    order_item_id := 'test-orderitem-previous-' || i;
    amount := (40000 + (i * 8000));
    
    -- Order 생성
    INSERT INTO "Order" (
      id, "orderName", "orderNumber", type, status,
      amount, "remainingAmount", "paidAmount",
      "originalPrice", "discountedPrice",
      "userId", "createdAt", "updatedAt"
    ) VALUES (
      order_id,
      '지난달 주문 ' || i,
      'ORD-' || TO_CHAR(previous_month_start + (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      'BULK_PAYMENT',
      'PAID',
      amount,
      0,
      amount,
      amount + 15000,
      amount,
      user_id,
      previous_month_start + (i || ' days')::INTERVAL,
      previous_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Payment 생성 (DONE 상태)
    INSERT INTO "Payment" (
      id, "tossPaymentKey", amount, "isTaxFree", fee,
      "paymentMethod", "paymentStatus",
      "orderId", "createdAt", "updatedAt"
    ) VALUES (
      payment_id,
      'test-toss-key-previous-' || i,
      amount,
      false,
      FLOOR(amount * 0.03),
      'CARD',
      'DONE',
      order_id,
      previous_month_start + (i || ' days')::INTERVAL,
      previous_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- OrderItem 생성
    INSERT INTO "OrderItem" (
      id, "productCategory", "productId", "productTitle",
      quantity, "originalPrice", "discountedPrice",
      "orderId", "courseId", "createdAt", "updatedAt"
    ) VALUES (
      order_item_id,
      'COURSE',
      'test-course-' || ((i % 3) + 1),
      '테스트 강의 ' || ((i % 3) + 1),
      1,
      amount + 15000,
      amount,
      order_id,
      'test-course-' || ((i % 3) + 1),
      previous_month_start + (i || ' days')::INTERVAL,
      previous_month_start + (i || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 이번 달 환불 데이터 (3건)
-- =====================================================
DO $$
DECLARE
  i INT;
  user_id TEXT;
  order_id TEXT;
  payment_id TEXT;
  order_item_id TEXT;
  cancel_id TEXT;
  amount INT;
  cancel_amount INT;
  current_month_start TIMESTAMP;
BEGIN
  current_month_start := DATE_TRUNC('month', NOW());
  
  FOR i IN 1..3 LOOP
    user_id := 'test-user-' || ((i % 3) + 1);
    order_id := 'test-order-refund-' || i;
    payment_id := 'test-payment-refund-' || i;
    order_item_id := 'test-orderitem-refund-' || i;
    cancel_id := 'test-cancel-' || i;
    amount := (80000 + (i * 10000));
    
    -- 전액 환불 2건
    IF i <= 2 THEN
      cancel_amount := amount;
      
      -- Order 생성
      INSERT INTO "Order" (
        id, "orderName", "orderNumber", type, status,
        amount, "remainingAmount", "paidAmount",
        "originalPrice", "discountedPrice",
        "userId", "createdAt", "updatedAt"
      ) VALUES (
        order_id,
        '환불된 주문 ' || i,
        'ORD-' || TO_CHAR(current_month_start + (i + 15 || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD((100 + i)::TEXT, 4, '0'),
        'BULK_PAYMENT',
        'REFUNDED',
        amount,
        amount,
        0,
        amount + 20000,
        amount,
        user_id,
        current_month_start + (i + 15 || ' days')::INTERVAL,
        current_month_start + (i + 15 || ' days')::INTERVAL
      )
      ON CONFLICT (id) DO NOTHING;
      
      -- Payment 생성 (CANCELED 상태)
      INSERT INTO "Payment" (
        id, "tossPaymentKey", amount, "isTaxFree", fee,
        "paymentMethod", "paymentStatus",
        "cancelAmount", "cancelReason", "canceledAt",
        "orderId", "createdAt", "updatedAt"
      ) VALUES (
        payment_id,
        'test-toss-key-refund-' || i,
        amount,
        false,
        FLOOR(amount * 0.03),
        'CARD',
        'CANCELED',
        cancel_amount,
        '단순 변심',
        current_month_start + (i + 16 || ' days')::INTERVAL,
        order_id,
        current_month_start + (i + 15 || ' days')::INTERVAL,
        current_month_start + (i + 16 || ' days')::INTERVAL
      )
      ON CONFLICT (id) DO NOTHING;
      
    -- 부분 환불 1건
    ELSE
      cancel_amount := FLOOR(amount / 2);
      
      -- Order 생성
      INSERT INTO "Order" (
        id, "orderName", "orderNumber", type, status,
        amount, "remainingAmount", "paidAmount",
        "originalPrice", "discountedPrice",
        "userId", "createdAt", "updatedAt"
      ) VALUES (
        order_id,
        '부분 환불 주문 ' || i,
        'ORD-' || TO_CHAR(current_month_start + (i + 15 || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD((100 + i)::TEXT, 4, '0'),
        'BULK_PAYMENT',
        'PARTIAL_REFUNDED',
        amount,
        cancel_amount,
        amount - cancel_amount,
        amount + 20000,
        amount,
        user_id,
        current_month_start + (i + 15 || ' days')::INTERVAL,
        current_month_start + (i + 15 || ' days')::INTERVAL
      )
      ON CONFLICT (id) DO NOTHING;
      
      -- Payment 생성 (PARTIAL_CANCELED 상태)
      INSERT INTO "Payment" (
        id, "tossPaymentKey", amount, "isTaxFree", fee,
        "paymentMethod", "paymentStatus",
        "cancelAmount", "cancelReason", "canceledAt",
        "orderId", "createdAt", "updatedAt"
      ) VALUES (
        payment_id,
        'test-toss-key-refund-' || i,
        amount,
        false,
        FLOOR(amount * 0.03),
        'CARD',
        'PARTIAL_CANCELED',
        cancel_amount,
        '부분 환불 요청',
        current_month_start + (i + 16 || ' days')::INTERVAL,
        order_id,
        current_month_start + (i + 15 || ' days')::INTERVAL,
        current_month_start + (i + 16 || ' days')::INTERVAL
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- OrderItem 생성
    INSERT INTO "OrderItem" (
      id, "productCategory", "productId", "productTitle",
      quantity, "originalPrice", "discountedPrice",
      "orderId", "courseId", "createdAt", "updatedAt"
    ) VALUES (
      order_item_id,
      'COURSE',
      'test-course-' || ((i % 3) + 1),
      '테스트 강의 ' || ((i % 3) + 1),
      1,
      amount + 20000,
      amount,
      order_id,
      'test-course-' || ((i % 3) + 1),
      current_month_start + (i + 15 || ' days')::INTERVAL,
      current_month_start + (i + 15 || ' days')::INTERVAL
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- PaymentCancel 기록 생성
    INSERT INTO "PaymentCancel" (
      id, "cancelAmount", "cancelReason", "taxFreeAmount",
      "refundableAmount", "cancelStatus", "canceledAt", "paymentId"
    ) VALUES (
      cancel_id,
      cancel_amount,
      CASE WHEN i <= 2 THEN '단순 변심' ELSE '부분 환불 요청' END,
      0,
      cancel_amount,
      'DONE',
      current_month_start + (i + 16 || ' days')::INTERVAL,
      payment_id
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 데이터 확인 쿼리
-- =====================================================

-- 이번 달 성공 결제 확인
SELECT 
  '이번 달 성공 결제' as "구분",
  COUNT(*) as "건수",
  SUM(amount) as "총 금액"
FROM "Payment"
WHERE "paymentStatus" = 'DONE'
  AND "createdAt" >= DATE_TRUNC('month', NOW());

-- 저번 달 성공 결제 확인
SELECT 
  '저번 달 성공 결제' as "구분",
  COUNT(*) as "건수",
  SUM(amount) as "총 금액"
FROM "Payment"
WHERE "paymentStatus" = 'DONE'
  AND "createdAt" >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
  AND "createdAt" < DATE_TRUNC('month', NOW());

-- 이번 달 환불 확인
SELECT 
  '이번 달 환불' as "구분",
  COUNT(*) as "건수",
  SUM("cancelAmount") as "환불 금액"
FROM "Payment"
WHERE "paymentStatus" IN ('CANCELED', 'PARTIAL_CANCELED')
  AND "createdAt" >= DATE_TRUNC('month', NOW());

-- 전체 요약
SELECT 
  (SELECT SUM(amount) FROM "Payment" 
   WHERE "paymentStatus" = 'DONE' 
   AND "createdAt" >= DATE_TRUNC('month', NOW())) as "이번달_매출",
   
  (SELECT SUM(amount) FROM "Payment" 
   WHERE "paymentStatus" = 'DONE' 
   AND "createdAt" >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
   AND "createdAt" < DATE_TRUNC('month', NOW())) as "저번달_매출",
   
  (SELECT SUM("cancelAmount") FROM "Payment" 
   WHERE "paymentStatus" IN ('CANCELED', 'PARTIAL_CANCELED')
   AND "createdAt" >= DATE_TRUNC('month', NOW())) as "환불_금액",
   
  (SELECT COUNT(*) FROM "Payment" 
   WHERE "paymentStatus" IN ('CANCELED', 'PARTIAL_CANCELED')
   AND "createdAt" >= DATE_TRUNC('month', NOW())) as "환불_건수";


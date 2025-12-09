import validator from "validator";
import { z } from "zod";

// 강의 - 수업 스키마
export const lessonSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  description: z.string().optional(),
  videoType: z.string().default("vimeo"),
  videoUrl: z.string().optional(),
  isPublished: z.coerce.boolean().default(false),
});
export type LessonSchema = z.infer<typeof lessonSchema>;

// 강의 - 챕터 스키마
export const chapterSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  description: z.string().optional(),
});
export type ChapterSchema = z.infer<typeof chapterSchema>;

// 강의 스키마
export const courseSchema = z
  .object({
    title: z.string().min(1, "제목을 입력해주세요."),
    description: z.string().optional(),
    thumbnail: z.string({
      message: "이미지를 업로드해주세요.",
    }),
    isPublished: z.coerce.boolean().default(false),
    isHidden: z.coerce.boolean().default(false),
    accessDuration: z.coerce.number().optional(),

    productType: z.enum(["SIMPLE", "OPTION"]).default("SIMPLE"),

    originalPrice: z.coerce.number().optional(),
    discountedPrice: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ),
    showInInstallment: z.coerce.boolean().default(false),
    isTaxFree: z.coerce.boolean().default(false),

    categoryId: z.string().optional().nullable(),
    productBadgeIds: z.array(z.string()).optional(),

    isUpcoming: z.coerce.boolean().default(false),
    endDate: z.date().optional().nullable(),

    kakaoRoomLink: z.string().optional(),
    kakaoRoomPassword: z.string().optional(),

    isFocusMode: z.coerce.boolean().default(false),
  })
  .superRefine(
    ({ originalPrice, discountedPrice, productType, isFocusMode }, ctx) => {
      if (productType === "OPTION") {
        if (isFocusMode) {
          ctx.addIssue({
            code: "custom",
            message: "포커스모드는 옵션 상품에 적용할 수 없습니다.",
            path: ["isFocusMode"],
            fatal: true,
          });
          return z.NEVER;
        }
        return true;
      }

      if (originalPrice !== 0 && !originalPrice) {
        ctx.addIssue({
          code: "custom",
          message: "가격은 필수입니다.",
          path: ["originalPrice"],
          fatal: true,
        });
        return z.NEVER;
      }

      if (!originalPrice && discountedPrice) {
        ctx.addIssue({
          code: "custom",
          message: "원가를 입력해주세요.",
          path: ["originalPrice"],
          fatal: true,
        });
        return z.NEVER;
      }

      if (originalPrice && discountedPrice) {
        if (originalPrice < discountedPrice) {
          ctx.addIssue({
            code: "custom",
            message: "할인가가 원가보다 높을 수 없습니다.",
            path: ["discountedPrice"],
            fatal: true,
          });
          return z.NEVER;
        }
      }

      return true;
    }
  );
export type CourseSchema = z.infer<typeof courseSchema>;

export const optionSchema = z
  .object({
    name: z.string().min(1, "옵션명을 입력해주세요."),
    originalPrice: z.coerce.number().min(0, "원가는 0 이상이어야 합니다."),
    discountedPrice: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ),
    isTaxFree: z.coerce.boolean().default(false),
    maxPurchaseCount: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ),
  })
  .superRefine(({ originalPrice, discountedPrice }, ctx) => {
    if (originalPrice !== 0 && !originalPrice) {
      ctx.addIssue({
        code: "custom",
        message: "가격은 필수입니다.",
        path: ["originalPrice"],
        fatal: true,
      });
      return z.NEVER;
    }

    if (!originalPrice && discountedPrice) {
      ctx.addIssue({
        code: "custom",
        message: "원가를 입력해주세요.",
        path: ["originalPrice"],
        fatal: true,
      });
      return z.NEVER;
    }

    if (originalPrice && discountedPrice) {
      if (originalPrice < discountedPrice) {
        ctx.addIssue({
          code: "custom",
          message: "할인가가 원가보다 높을 수 없습니다.",
          path: ["discountedPrice"],
          fatal: true,
        });
        return z.NEVER;
      }
    }

    return true;
  });
export type OptionSchema = z.infer<typeof optionSchema>;

// 무료 강의 스키마
export const freeCourseSchema = z.object({
  title: z.string().min(1, "강의 제목을 입력해주세요."),
  description: z.string().optional(),
  thumbnail: z.string({
    message: "이미지를 업로드해주세요.",
  }),
  categoryId: z.string().optional().nullable(),
  productBadgeIds: z.array(z.string()).optional(),
  isPublished: z.coerce.boolean().default(false),
  isHidden: z.coerce.boolean().default(false),
  isUpcoming: z.coerce.boolean().default(false),
  endDate: z.date().optional().nullable(),

  kakaoRoomLink: z
    .string()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "올바른 URL을 입력해주세요." }
    )
    .optional(),
  kakaoRoomPassword: z.string().optional(),
  kakaoTemplateId: z.string().optional(),
  location: z.string().optional(),
  webhookUrl: z.string().optional(),
  kajabiTagId: z.string().optional(),
});
export type FreeCourseSchema = z.infer<typeof freeCourseSchema>;

// 강사 스키마
export const teacherSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  info: z.string().optional(),
  profile: z.string().optional(),
  isPublished: z.coerce.boolean().default(false),
  categoryId: z.string().optional().nullable(),
});
export type TeacherSchema = z.infer<typeof teacherSchema>;

// 쿠폰 스키마
export const couponSchema = z.object({
  name: z.string().min(1, "쿠폰명을 입력해주세요."),
  description: z.string().nullable(),
  code: z.string().min(6, "코드를 생성해주세요. 코드는 6자 이상이어야 합니다."),
  discountType: z.string().min(1, "할인 방식을 선택해주세요."),
  discountAmount: z.coerce
    .number({
      message: "할인 금액 혹은 비율을 입력해주세요.",
    })
    .min(0, "마이너스 값은 입력할 수 없습니다."),
  expiryDate: z.date({
    message: "만료일을 입력해주세요.",
  }),
  usageLimit: z.coerce
    .number({
      message: "숫자를 입력해주세요.",
    })
    .min(0, "1이상의 값만 입력할 수 있습니다.")
    .nullable()
    .optional(),
  courses: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
});
export type CouponSchema = z.infer<typeof couponSchema>;

// 회원정보 변경 스키마
export const userInfoSchema = z.object({
  username: z.string(),
  nickname: z.string(),
  avatar: z.string().optional(),
  optedIn: z.coerce.boolean().default(false),
});
export type UserInfoSchema = z.infer<typeof userInfoSchema>;

// 공지사항 스키마
export const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  isPublished: z.coerce.boolean().default(false),
});
export type NoticeSchema = z.infer<typeof noticeSchema>;

// 자주 묻는 질문 스키마
export const faqSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  categoryId: z.string().optional().nullable(),
  isPublished: z.coerce.boolean().default(false),
});
export type FaqSchema = z.infer<typeof faqSchema>;

// 이벤트 스키마
export const eventSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  thumbnail: z.string().optional(),
});
export type EventSchema = z.infer<typeof eventSchema>;

// 수강후기 스키마
export const userReviewSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  courseId: z.string().min(1, "강의를 선택해주세요."),
});
export type UserReviewSchema = z.infer<typeof userReviewSchema>;

// 관리자 페이지 수강후기 스키마
export const adminReviewSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  userId: z.string().min(1, { message: "작성자는 필수 입력 항목입니다." }),
  courseId: z.string().min(1, "강의를 선택해주세요."),
  rating: z.coerce
    .number()
    .min(1, "평점은 1 이상이어야 합니다.")
    .max(5, "평점은 5 이하여야 합니다.")
    .default(5),
});
export type AdminReviewSchema = z.infer<typeof adminReviewSchema>;

// 1:1문의 스키마
export const contactSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});
export type ContactSchema = z.infer<typeof contactSchema>;

// 이미지 슬라이더 스키마
export const sliderSchema = z.object({
  title: z.string().min(1, { message: "제목은 필수 입력 항목입니다." }),
  isShowTitle: z.coerce.boolean().default(false),
  teacherName: z.string().optional(),
  openDate: z.date().optional(),
  badge: z.string().optional(),
  image: z.string().min(1, { message: "이미지는 필수 입력 항목입니다." }),
  link: z
    .string()
    .refine(
      (link) => {
        if (link === "") return true;
        if (link.startsWith("/")) return true;
        try {
          new URL(link);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "올바른 URL 혹은 경로를 입력해주세요.",
      }
    )
    .optional(),
  isBlank: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(false),
  position: z.coerce
    .number({
      message: "숫자를 입력해주세요.",
    })
    .min(0, "순서는 0 이상이어야 합니다.")
    .max(100, "순서는 100 이하여야 합니다."),
});
export type SliderSchema = z.infer<typeof sliderSchema>;

// 관리자 수익 인증 스키마
export const adminRevenueSchema = z.object({
  title: z.string().min(1, { message: "제목은 필수 입력 항목입니다." }),
  content: z.string().min(1, { message: "내용은 필수 입력 항목입니다." }),
  photo: z.string().optional(),
  amount: z.coerce.number().optional(),
  videoUrl: z.string().optional(),
  userId: z.string().min(1, { message: "작성자는 필수 입력 항목입니다." }),
});
export type AdminRevenueSchema = z.infer<typeof adminRevenueSchema>;

// 유저 수익 인증 스키마
export const revenueSchema = z.object({
  title: z.string().min(1, { message: "제목은 필수 입력 항목입니다." }),
  content: z.string().min(1, { message: "내용은 필수 입력 항목입니다." }),
  photo: z.string().optional(),
  amount: z.coerce.number().optional(),
  videoUrl: z.string().optional(),
});
export type RevenueSchema = z.infer<typeof revenueSchema>;

// 사이트 기본 설정 스키마
export const siteSettingSchema = z.object({
  contactLink: z.string().optional(),
  youtubeLink: z.string().optional(),
  instagramLink: z.string().optional(),
  naverCafeLink: z.string().optional(),
  communityLink: z.string().optional(),
  teacherApplyLink: z.string().optional(),
  recruitmentLink: z.string().optional(),
  businessName: z.string().optional(),
  businessInfo: z.string().optional(),
  courseRefundPolicy: z.string().optional(),
  ebookRefundPolicy: z.string().optional(),
  marketingPolicy: z.string().optional(),
});
export type SiteSettingSchema = z.infer<typeof siteSettingSchema>;

// 관리자 페이지 유저정보 스키마
export const userDataSchema = z.object({
  username: z.string().min(1, "이름은 필수 입력 항목입니다."),
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  phone: z.string().refine((phone) => {
    if (phone === "") return true;
    return validator.isMobilePhone(phone, "ko-KR");
  }, "올바른 전화번호를 입력해주세요."),
  nickname: z.string().optional(),
});
export type UserDataSchema = z.infer<typeof userDataSchema>;

// 약관 스키마
export const termsSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});
export type TermsSchema = z.infer<typeof termsSchema>;

// 컬럼 스키마
export const postSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  thumbnail: z.string().optional(),
  // isPublished: z.coerce.boolean().default(false),
  externalLink: z
    .string()
    .refine((link) => {
      if (link === "") return true;
      try {
        new URL(link);
        return true;
      } catch {
        return false;
      }
    }, "올바른 URL을 입력해주세요.")
    .optional(),
});
export type PostSchema = z.infer<typeof postSchema>;

// 전자책 스키마
export const ebookSchema = z
  .object({
    title: z
      .string({ message: "제목을 입력해주세요." })
      .min(1, "제목을 입력해주세요."),
    description: z.string().optional(),
    thumbnail: z
      .string({ message: "이미지를 업로드해주세요." })
      .min(1, "이미지를 업로드해주세요."),
    originalPrice: z.coerce
      .number({ message: "가격을 입력해주세요." })
      .min(0, "가격을 입력해주세요.")
      .optional(),
    discountedPrice: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ),
    isTaxFree: z.coerce.boolean().default(false),
    fileUrl: z.string().min(1, "파일을 업로드해주세요."),
    categoryId: z.string().optional().nullable(),
    productBadgeIds: z.array(z.string()).optional(),

    isPublished: z.coerce.boolean().default(false),
    isFocusMode: z.coerce.boolean().default(false),
    showInInstallment: z.coerce.boolean().default(false),
    isUpcoming: z.coerce.boolean().default(false),
    endDate: z.date().optional(),
  })
  .superRefine(({ originalPrice, discountedPrice }, ctx) => {
    if (originalPrice === 0 || discountedPrice === 0) return true;
    if (originalPrice !== 0 && !originalPrice) {
      ctx.addIssue({
        code: "custom",
        message: "가격은 필수입니다.",
        path: ["originalPrice"],
        fatal: true,
      });
      return z.NEVER;
    }

    if (!originalPrice && discountedPrice) {
      ctx.addIssue({
        code: "custom",
        message: "원가를 입력해주세요.",
        path: ["originalPrice"],
        fatal: true,
      });
      return z.NEVER;
    }

    if (originalPrice && discountedPrice) {
      if (originalPrice < discountedPrice) {
        ctx.addIssue({
          code: "custom",
          message: "할인가가 원가보다 높을 수 없습니다.",
          path: ["discountedPrice"],
          fatal: true,
        });
        return z.NEVER;
      }
    }
    return true;
  });

export type EbookSchema = z.infer<typeof ebookSchema>;

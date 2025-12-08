export interface KakaoUser {
  id: number; // 유저 고유 ID
  connected_at: string; // 연결된 시각 (ISO8601 형식)
  kakao_account?: KakaoAccount; // 카카오 계정 정보 (동의 여부에 따라 포함될 수 있음)
  properties?: Record<string, string>; // 사용자 정의 프로퍼티 키-값 쌍
  for_partner?: {
    uuid: string; // 파트너를 위한 UUID
  };
}

export interface KakaoAccount {
  // 프로필 또는 닉네임 동의항목 필요
  profile_nickname_needs_agreement?: boolean;
  // 프로필 또는 프로필 사진 동의항목 필요
  profile_image_needs_agreement?: boolean; // 프로필 사진 동의 필요 여부
  profile?: Profile; // 프로필 정보 (동의 여부에 따라 포함될 수 있음)

  // 이름 동의항목 필요
  name_needs_agreement?: boolean;
  name?: string;

  // 카카오계정(이메일) 동의항목 필요
  email_needs_agreement?: boolean;
  is_email_valid?: boolean;
  is_email_verified?: boolean;
  email?: string;

  // 연령대 동의항목 필요
  age_range_needs_agreement?: boolean;
  age_range?: string; // 연령대 (예: "20~29")

  // 출생 연도 동의항목 필요
  birthyear_needs_agreement?: boolean;
  birthyear?: string; // 출생 연도 (예: "2002")

  // 생일 동의항목 필요
  birthday_needs_agreement?: boolean;
  birthday?: string; // 생일 (예: "1130")
  birthday_type?: "SOLAR" | "LUNAR"; // 생일 타입 (양력/음력)

  // 성별 동의항목 필요
  gender_needs_agreement?: boolean;
  gender?: "male" | "female";

  // 카카오계정(전화번호) 동의항목 필요
  phone_number_needs_agreement?: boolean;
  phone_number?: string; // 전화번호 (예: "+82 010-1234-5678")

  // CI(연계정보) 동의항목 필요
  ci_needs_agreement?: boolean;
  ci?: string; // 연계정보 (CI)
  ci_authenticated_at?: string; // CI 인증 시각 (ISO8601 형식)
}

export interface Profile {
  // 프로필 또는 닉네임 동의항목 필요
  nickname?: string;

  // 프로필 또는 프로필 사진 동의항목 필요
  thumbnail_image_url?: string; // 썸네일 이미지 URL
  profile_image_url?: string; // 프로필 이미지 URL
  is_default_image?: boolean; // 기본 이미지 여부
  is_default_nickname?: boolean; // 기본 닉네임 여부
}

import Image from "next/image";
import Link from "next/link";
import { MainLogo } from "@/components/common/main-logo";
import { getCachedSiteSetting } from "@/queries/global/site-setting";
import { CTAButton } from "@/components/common/cta-button";

export async function MainFooter() {
  const siteSetting = await getCachedSiteSetting();

  return (
    <footer className="py-10 md:py-20 bg-background text-foreground">
      <div className="fit-container space-y-10 md:space-y-20">
        <div>
          <Link href="/">
            <MainLogo theme="dark" width="140" symbol />
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <div className="flex flex-col items-start gap-y-8">
            <div className="text-2xl md:text-4xl lg:text-5xl font-nexonWarhaven">
              도움이 필요하신가요?
            </div>
            {siteSetting?.contactLink && (
              <CTAButton
                label="문의하기"
                link={siteSetting.contactLink}
                target="_blank"
              />
            )}
          </div>
          <div className="flex flex-col items-end gap-y-10">
            <div className="flex gap-4 items-center flex-wrap max-w-[300px] justify-end">
              <Link
                href="/privacy-policy"
                className="hover:text-primary hover:underline transition-colors"
              >
                개인정보보호방침
              </Link>
              <Link
                href="/terms-of-use"
                className="hover:text-primary hover:underline transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/refund-policy"
                className="hover:text-primary hover:underline transition-colors"
              >
                환불규정
              </Link>
              {siteSetting?.recruitmentLink && (
                <a
                  href={siteSetting.recruitmentLink}
                  target="_blank"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  채용
                </a>
              )}
              {siteSetting?.teacherApplyLink && (
                <a
                  href={siteSetting.teacherApplyLink}
                  target="_blank"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  강사 신청 및 협업 제안
                </a>
              )}
            </div>
            <div className="space-y-2 text-right">
              <div className="text-foreground/80 font-medium">
                {siteSetting?.businessName}
              </div>
              <div className="text-sm text-foreground/50 whitespace-pre-line text-right">
                {siteSetting?.businessInfo}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-foreground/50">
            © 2024 Copyright by Classaround
          </div>
          <div className="flex items-center gap-x-6">
            <a href={siteSetting?.youtubeLink ?? ""} target="_blank">
              <Image
                width={24}
                height={24}
                src={"/social/youtube.svg"}
                alt="Youtube"
              />
            </a>
            <a href={siteSetting?.instagramLink ?? ""} target="_blank">
              <Image
                width={24}
                height={24}
                src={"/social/instagram.svg"}
                alt="Instagram"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

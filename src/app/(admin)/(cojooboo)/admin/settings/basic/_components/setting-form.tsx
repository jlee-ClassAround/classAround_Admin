"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { siteSettingSchema, SiteSettingSchema } from "@/validations/schemas";
import { SiteSetting } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBasicSettings } from "../../_actions/update-basic-settings";

interface Props {
  initialData: SiteSetting | null;
}

export function SettingForm({ initialData }: Props) {
  const router = useRouter();

  const form = useForm<SiteSettingSchema>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      ...initialData,
      siteTitle: initialData?.siteTitle || "",
      siteDescription: initialData?.siteDescription || "",
      favicon: initialData?.favicon || "",
      openGraphImage: initialData?.openGraphImage || "",

      businessName: initialData?.businessName || "",
      businessInfo: initialData?.businessInfo || "",

      gtmId: initialData?.gtmId || "",

      contactLink: initialData?.contactLink || "",
      youtubeLink: initialData?.youtubeLink || "",
      instagramLink: initialData?.instagramLink || "",
      naverCafeLink: initialData?.naverCafeLink || "",
      teacherApplyLink: initialData?.teacherApplyLink || "",
      recruitmentLink: initialData?.recruitmentLink || "",

      courseRefundPolicy: initialData?.courseRefundPolicy || "",
      ebookRefundPolicy: initialData?.ebookRefundPolicy || "",
      marketingPolicy: initialData?.marketingPolicy || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: SiteSettingSchema) => {
    try {
      await updateBasicSettings(values);
      toast.success("저장되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-lg">사이트 기본 설정</h2>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting || !isValid}>
                  {isSubmitting ? (
                    <>
                      저장중 <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>저장</>
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-5">
              <FormField
                name="siteTitle"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사이트 제목</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="siteDescription"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사이트 설명</FormLabel>
                    <FormControl>
                      <Textarea rows={5} disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-lg">사이트 푸터 설정</h2>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting || !isValid}>
                  {isSubmitting ? (
                    <>
                      저장중 <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>저장</>
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-5">
              <FormField
                name="businessName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자 이름</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="businessInfo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자 정보</FormLabel>
                    <FormControl>
                      <Textarea rows={5} disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-lg">소셜 및 외부 링크</h2>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting || !isValid}>
                  {isSubmitting ? (
                    <>
                      저장중 <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>저장</>
                  )}
                </Button>
              </div>
            </div>
            <FormField
              name="contactLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문의하기 CTA 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="youtubeLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>유튜브 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    사이트 푸터 링크로 설정됩니다.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              name="instagramLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>인스타그램 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    사이트 푸터 링크로 설정됩니다.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              name="naverCafeLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>네이버 카페 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    사이트 푸터 링크로 설정됩니다.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              name="teacherApplyLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>강사 지원 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="recruitmentLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채용 링크</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

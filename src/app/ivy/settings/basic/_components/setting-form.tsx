'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { siteSettingSchema, SiteSettingSchema } from '@/lib/ivy/schemas';
import { useRouter } from 'next/navigation';
import { SiteSetting } from '@/generated/ivy';
import { Textarea } from '@/components/ui/textarea';
import { updateBasicSettings } from '../../actions/update-basic-settings';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import Tiptap from '@/components/tiptap/tiptap';

interface Props {
    initialData: SiteSetting | null;
}

export function SettingForm({ initialData }: Props) {
    const router = useRouter();

    const form = useForm<SiteSettingSchema>({
        resolver: zodResolver(siteSettingSchema),
        defaultValues: {
            ...initialData,
            contactLink: initialData?.contactLink || '',
            youtubeLink: initialData?.youtubeLink || '',
            instagramLink: initialData?.instagramLink || '',
            naverCafeLink: initialData?.naverCafeLink || '',
            communityLink: initialData?.communityLink || '',
            teacherApplyLink: initialData?.teacherApplyLink || '',
            recruitmentLink: initialData?.recruitmentLink || '',
            businessName: initialData?.businessName || '',
            businessInfo: initialData?.businessInfo || '',
            courseRefundPolicy: initialData?.courseRefundPolicy || '',
            ebookRefundPolicy: initialData?.ebookRefundPolicy || '',
            marketingPolicy: initialData?.marketingPolicy || '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: SiteSettingSchema) => {
        try {
            await updateBasicSettings(values);
            toast.success('저장되었습니다.');
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '알 수 없는 오류');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <Card className="p-8">
                    <div className="flex items-center justify-between border-b pb-5 mb-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5 md:col-span-1">
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
                        <div className="space-y-5 md:col-span-1">
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
                                name="communityLink"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>커뮤니티 링크</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>
                                            메인페이지 커뮤니티 링크로 설정됩니다.
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
                        </div>
                    </div>
                </Card>
                <Card className="p-8">
                    <div className="flex items-center justify-between border-b pb-5 mb-6">
                        <h2 className="font-semibold text-lg">강의 환불 정책</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5 md:col-span-1">
                            <FormField
                                name="courseRefundPolicy"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>강의 환불 정책</FormLabel>
                                        <FormControl>
                                            <Tiptap
                                                content={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="marketingPolicy"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>무료강의 마케팅 동의 정책</FormLabel>
                                        <FormControl>
                                            <Tiptap
                                                content={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-5 md:col-span-1">
                            <FormField
                                name="ebookRefundPolicy"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>전자책 환불 정책</FormLabel>
                                        <FormControl>
                                            <Tiptap
                                                content={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </Card>
            </form>
        </Form>
    );
}

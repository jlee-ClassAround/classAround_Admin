'use client';

import { Button } from '@/components/ui/button';
import { useDetailImagesStore } from '@/store/use-detail-images';
import { ImageUp } from 'lucide-react';
import { useState } from 'react';
import { DetailImageList } from './detail-image-list';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGE } from '@/constants/validate-message';
import { toast } from 'sonner';
import { FileDropzone } from '@/components/cojooboo/file-dropzone';

interface Props {
    disabled?: boolean;
}

export function DetailImageUpload({ disabled = false }: Props) {
    const [isImageUploading, setIsImageUploading] = useState(false);

    const { uploadImages } = useDetailImagesStore();

    return (
        <div className="">
            <div className="text-sm font-medium mb-2">상세페이지 이미지</div>
            <DetailImageList />
            <div className="text-xs text-slate-500 mt-2">드래그하여 순서를 변경할 수 있습니다.</div>
            {isImageUploading && (
                <FileDropzone
                    bucket="images"
                    setState={() => setIsImageUploading(false)}
                    onDetailImagesUpload={uploadImages}
                    maxFiles={30}
                    maxSizeMB={50}
                />
            )}

            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                disabled={disabled}
                onClick={() => setIsImageUploading((c) => !c)}
            >
                {isImageUploading ? (
                    <>취소</>
                ) : (
                    <>
                        <ImageUp />
                        이미지 추가하기
                    </>
                )}
            </Button>
        </div>
    );
}

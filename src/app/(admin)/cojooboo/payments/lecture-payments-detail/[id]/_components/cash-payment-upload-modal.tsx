'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { uploadCashPaymentsAction } from '../actions';
import { FileUp, Loader2 } from 'lucide-react';

export function CashPaymentUploadModal({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const data = evt.target?.result;
                const wb = XLSX.read(data, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                const jsonData = XLSX.utils.sheet_to_json(ws);

                if (jsonData.length === 0) throw new Error('데이터가 없는 파일입니다.');

                const safeData = JSON.parse(JSON.stringify(jsonData));

                const res = await uploadCashPaymentsAction(courseId, safeData);

                if (res.success) {
                    toast.success(`${res.count}건의 현금결제가 처리되었습니다.`);
                } else {
                    toast.error(res.message);
                }
            } catch (err: any) {
                console.error('UPLOAD_ERROR:', err);
                toast.error(err.message || '파일 처리 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
                if (e.target) e.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                type="file"
                accept=".xlsx, .xls"
                id="cash-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
            />
            <Button asChild variant="outline" size="sm" disabled={loading}>
                <label htmlFor="cash-upload" className="cursor-pointer flex items-center">
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileUp className="mr-2 h-4 w-4" />
                    )}
                    현금결제 XLSX 업로드
                </label>
            </Button>
        </div>
    );
}

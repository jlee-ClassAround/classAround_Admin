'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentLogView } from './payment-log-view';

interface PaymentLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
}

export function PaymentLogDialog({ open, onOpenChange, orderId }: PaymentLogDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        결제 및 환불 상세 이력
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <PaymentLogView orderId={orderId} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

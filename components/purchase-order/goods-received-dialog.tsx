'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GoodsReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (goodsReceived: boolean) => void;
  totalAmount: number;
  itemCount: number;
}

export function GoodsReceivedDialog({
  open,
  onOpenChange,
  onConfirm,
  totalAmount,
  itemCount,
}: GoodsReceivedDialogProps) {
  const [goodsReceived, setGoodsReceived] = useState<boolean | null>(null);

  const handleConfirm = () => {
    if (goodsReceived !== null) {
      onConfirm(goodsReceived);
      onOpenChange(false);
      setGoodsReceived(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setGoodsReceived(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Konfirmasi Purchase Order
            <Badge variant="outline" className="text-xs">
              {itemCount} items
            </Badge>
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Total pembelian: <span className="font-semibold text-lg">Rp {totalAmount.toLocaleString()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Apakah barang sudah diterima dari supplier?
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 py-4">
          <button
            type="button"
            onClick={() => setGoodsReceived(true)}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
              goodsReceived === true
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Sudah Diterima</div>
            <div className="text-xs text-muted-foreground">Status: Received</div>
          </button>

          <button
            type="button"
            onClick={() => setGoodsReceived(false)}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
              goodsReceived === false
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Belum Diterima</div>
            <div className="text-xs text-muted-foreground">Status: Pending</div>
          </button>
        </div>

        <DialogFooter>
          <Button
            className='cursor-pointer'
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Batal
          </Button>
          <Button
            className='cursor-pointer'
            type="button"
            onClick={handleConfirm}
            disabled={goodsReceived === null}
          >
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

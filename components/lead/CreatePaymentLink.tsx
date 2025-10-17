'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { IndianRupee } from 'lucide-react';

interface CreatePaymentLinkProps {
  onLinkCreate: (feeType: 'Login / IMD Fee' | 'Other Fees', amount: number, remarks: string) => void;
  prefillData?: { feeType: 'Login / IMD Fee' | 'Other Fees', amount: number, remarks: string } | null;
}

export default function CreatePaymentLink({ onLinkCreate, prefillData }: CreatePaymentLinkProps) {
  const [feeType, setFeeType] = useState<'Login / IMD Fee' | 'Other Fees' | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (prefillData) {
      setFeeType(prefillData.feeType);
      setAmount(prefillData.amount);
      setRemarks(prefillData.remarks);
    }
  }, [prefillData]);


  const handleSubmit = () => {
    if (feeType && amount) {
      onLinkCreate(feeType, amount, remarks);
    }
  };
  
  const canSubmit = feeType && amount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="feeType">Fee Type <span className="text-red-500">*</span></Label>
          <Select value={feeType} onValueChange={(value) => setFeeType(value as any)}>
            <SelectTrigger id="feeType" className="h-12">
              <SelectValue placeholder="Choose fee type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Login / IMD Fee">Login / IMD Fee</SelectItem>
              <SelectItem value="Other Fees">Other Fees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
          <div className="relative">
             <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/[^0-9]/g, '')))}
              placeholder="1180"
              className="h-12 pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="remarks">Remarks (Optional, max 100 characters)</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any additional notes or remarks..."
            maxLength={100}
          />
           <p className="text-xs text-gray-500 mt-1 text-right">{remarks.length}/100</p>
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
        Send Payment Link to Customer
      </Button>
    </div>
  );
}
'use client';

import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Lead, PaymentSession } from '@/contexts/LeadContext';
import { Copy, RefreshCw, Send, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentDetailsProps {
  payment: PaymentSession;
  lead: Lead;
  onRefresh: (paymentId: string) => void;
  onResend: (paymentId: string) => void;
  onDelete: (paymentId: string) => void;
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function PaymentDetails({ payment, lead, onRefresh, onResend, onDelete }: PaymentDetailsProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.link).then(() => {
      toast({ title: 'Copied!', description: 'Payment link copied to clipboard.' });
    });
  };

  const isFinalStatus = payment.status === 'Paid' || payment.status === 'Failed';

  const getStatusBadge = () => {
    switch(payment.status) {
      case 'Paid': return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'Failed': return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
    }
  };
  
  const getTimelineIcon = (status: 'complete' | 'pending' | 'failed') => {
      if (status === 'complete') return <CheckCircle className="w-5 h-5 text-green-600 bg-white rounded-full" />;
      if (status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600 bg-white rounded-full" />;
      return <Clock className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {payment.status === 'Paid' && (
            <div className='flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg'>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                    <h3 className='font-semibold text-green-800'>Payment Received</h3>
                    <p className='text-sm text-green-700'>{formatCurrency(payment.amount)} received on {format(new Date(payment.timeline.received!), 'dd MMM yyyy, h:mm a')}</p>
                </div>
            </div>
        )}
        {payment.status === 'Failed' && (
            <div className='flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg'>
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                    <h3 className='font-semibold text-red-800'>Payment Failed</h3>
                    <p className='text-sm text-red-700'>The payment attempt was not successful.</p>
                </div>
            </div>
        )}

      {/* Fee Details */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{payment.feeType}</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(payment.amount)}</p>
            </div>
            {getStatusBadge()}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2 border-t">
            <DetailItem label="Application ID" value={lead.appId} />
            <DetailItem label="Customer Mobile" value={`+91 ${lead.customerMobile}`} />
            <DetailItem label="Created On" value={format(new Date(payment.createdAt), 'dd MMM yyyy, h:mm a')} />
          </div>
        </CardContent>
      </Card>

      {/* Payment Link */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Link</h3>
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-2">
            <span className="text-xs text-blue-600 truncate flex-1">{payment.link}</span>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="w-8 h-8 ml-2">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Timeline */}
      <Card>
          <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Timeline</h3>
              <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                      {getTimelineIcon('complete')}
                      <div className='flex-1'>
                          <p className="font-medium text-gray-800">Link Created</p>
                          <p className="text-xs text-gray-500">Payment link generated successfully</p>
                          <p className="text-xs text-gray-400">{format(new Date(payment.timeline.created), "dd MMM yyyy, h:mm a")}</p>
                      </div>
                  </li>
                  <div className="pl-2.5 h-6 border-l-2 border-dashed border-gray-300"></div>
                   <li className="flex items-start gap-3">
                      {getTimelineIcon('complete')}
                      <div className='flex-1'>
                          <p className="font-medium text-gray-800">Link Sent</p>
                          <p className="text-xs text-gray-500">Payment link sent to customer</p>
                           <p className="text-xs text-gray-400">{format(new Date(payment.timeline.sent), "dd MMM yyyy, h:mm a")}</p>
                      </div>
                  </li>
                   <div className="pl-2.5 h-6 border-l-2 border-dashed border-gray-300"></div>
                   <li className="flex items-start gap-3">
                      {getTimelineIcon(payment.status === 'Paid' ? 'complete' : payment.status === 'Failed' ? 'failed' : 'pending')}
                      <div className='flex-1'>
                          <p className="font-medium text-gray-800">Payment Received</p>
                          <p className="text-xs text-gray-500">{payment.status === 'Paid' ? `Payment completed successfully` : payment.status === 'Failed' ? 'Payment attempt failed' : 'Waiting for customer payment'}</p>
                           {payment.timeline.received && <p className="text-xs text-gray-400">{format(new Date(payment.timeline.received), "dd MMM yyyy, h:mm a")}</p>}
                      </div>
                  </li>
              </ul>
          </CardContent>
      </Card>

      {/* Actions */}
      <Card>
          <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
              <div className="space-y-2">
                  <Button onClick={() => onRefresh(payment.id)} className="w-full h-11 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold">
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
                  </Button>
                  <Button onClick={() => onResend(payment.id)} disabled={isFinalStatus} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      <Send className="w-4 h-4 mr-2" /> Resend Link to Customer
                  </Button>
                  <Button onClick={() => onDelete(payment.id)} disabled={isFinalStatus} variant="outline" className="w-full h-11 border-red-300 text-red-600 hover:bg-red-50 font-semibold">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Payment Link
                  </Button>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
    </div>
);
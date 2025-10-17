
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndianRupee, Clock, Plus, Copy, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentSession {
    id: string;
    type: 'Login Fee' | 'IMD Fee' | 'Other Fees';
    amount: number;
    link: string;
    status: 'Pending' | 'Successful' | 'Expired';
    createdAt: Date;
    updatedAt: Date;
}

const initialPayments: PaymentSession[] = [
    {
        id: 'PAY001',
        type: 'Login Fee',
        amount: 1180,
        link: 'https://pay.saarathi.com/LD001234/login',
        status: 'Pending',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1800000), // 30 min min ago
    },
    {
        id: 'PAY002',
        type: 'IMD Fee',
        amount: 5000,
        link: 'https://pay.saarathi.com/LD001234/imd',
        status: 'Successful',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
    }
];

// Helper function to format currency
const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `₹${value.toLocaleString('en-IN')}`;
};

// Helper component for Payment Session Card
const PaymentSessionCard: React.FC<{ session: PaymentSession, onDelete: (id: string) => void, onResend: (id: string) => void }> = ({ session, onDelete, onResend }) => {
    
    const { toast } = useToast();
    
    const getStatusStyle = (status: PaymentSession['status']) => {
        switch(status) {
            case 'Successful': return 'bg-green-100 text-green-700';
            case 'Expired': return 'bg-red-100 text-red-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    }

    const handleCopy = () => {
        // Mock clipboard write functionality
        navigator.clipboard.writeText(session.link).then(() => {
            toast({ title: 'Copied!', description: 'Payment link copied to clipboard.', className: 'bg-blue-50 border-blue-200' });
        });
    };

    return (
        <Card className="p-4 border-2 shadow-md">
            <CardContent className="p-0 space-y-4">
                {/* Title and Status */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="text-lg font-bold text-[#003366] flex items-center">
                        {session.type} - {formatCurrency(session.amount)}
                    </h4>
                    <Badge className={getStatusStyle(session.status)}>
                        {session.status}
                    </Badge>
                </div>
                
                {/* Creation Time */}
                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    Created: {format(session.createdAt, 'dd MMM yyyy, h:mm a')}
                </div>

                {/* Payment Link */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Payment Link</p>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <span className="text-xs text-blue-600 truncate flex-1">{session.link}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="w-8 h-8 ml-2 text-gray-500 hover:bg-gray-100">
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                        onClick={() => onResend(session.id)}
                        disabled={session.status !== 'Pending'}
                        className="h-10 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Link
                    </Button>
                    <Button 
                        onClick={() => onDelete(session.id)}
                        disabled={session.status === 'Successful'}
                        variant="outline"
                        className="h-10 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete & Create New
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


export default function Step10PaymentPage() {
    const { currentLead, updateLead } = useLead();
    const router = useRouter();
    const { toast } = useToast();
    
    // Total steps updated to 11
    const totalSteps = 11;

    const [payments, setPayments] = useState<PaymentSession[]>(
        currentLead?.formData?.step10?.payments || initialPayments
    );
    const [currentTab, setCurrentTab] = useState('Login Fee');

    useEffect(() => {
        if (!currentLead) {
            router.replace('/leads');
        }
    }, [currentLead, router]);

    const handleCreatePaymentLink = (type: PaymentSession['type'] = currentTab as PaymentSession['type']) => {
        if (!currentLead) return;

        const newSession: PaymentSession = {
            id: Date.now().toString(),
            type: type,
            amount: type === 'Login Fee' ? 1180 : type === 'IMD Fee' ? 5000 : 2500,
            link: `https://pay.saarathi.com/${currentLead.appId}/${type.toLowerCase().replace(/ /g, '-')}/${Date.now()}`,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedPayments = payments.filter(p => p.type !== type).concat(newSession);

        setPayments(updatedPayments);
        updateLead(currentLead.id, {
            formData: {
                ...currentLead.formData,
                step10: { payments: updatedPayments }
            }
        });
        setCurrentTab(type);
        toast({ title: 'Link Created', description: `New payment link created for ${type}.`, action: <CheckCircle className='w-4 h-4 text-green-600' /> });
    };

    const handleDeleteAndCreate = (id: string) => {
        const sessionToDelete = payments.find(p => p.id === id);
        if (sessionToDelete) {
            // Delete the old one and create a new one for the same type
            const type = sessionToDelete.type;
            const updatedList = payments.filter(p => p.id !== id);
            setPayments(updatedList); // Update state first to avoid duplicate creation logic
            handleCreatePaymentLink(type);
        }
    }
    
    const handleResendLink = (id: string) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, updatedAt: new Date() } : p));
        toast({ title: 'Link Resent', description: 'Payment link sent to customer mobile.', action: <RefreshCw className='w-4 h-4 text-blue-600' /> });
    }

    const handleNext = () => {
        if (!currentLead) return;
        
        // Save current step data (implicitly done via updateLead calls but final save here)
        updateLead(currentLead.id, {
            formData: {
                ...currentLead.formData,
                step10: { payments }
            },
            currentStep: 11
        });
        router.push('/lead/step11');
    };

    const handleExit = () => {
        if (!currentLead) { router.push('/leads'); return; }
        updateLead(currentLead.id, { 
             formData: { ...currentLead.formData, step10: { payments } },
             currentStep: 10 
        });
        router.push('/leads');
    };
    
    const handlePrevious = () => {
        router.push('/lead/step9');
    };
    
    const currentTabType = currentTab as PaymentSession['type'];
    const sessionsForCurrentTab = payments.filter(p => p.type === currentTabType).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const isLinkNeeded = sessionsForCurrentTab.length === 0 || sessionsForCurrentTab[0].status !== 'Pending';

    const renderPaymentContent = (type: PaymentSession['type']) => {
        const sessions = payments.filter(p => p.type === type).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        if (sessions.length === 0) {
            return (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">No payment sessions found for {type}.</p>
                    <p className="text-sm text-gray-400 mt-2">Use the button below to create a new link.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {sessions.map(session => (
                    <PaymentSessionCard 
                        key={session.id} 
                        session={session} 
                        onDelete={handleDeleteAndCreate}
                        onResend={handleResendLink}
                    />
                ))}
            </div>
        )
    };
    
    const formatLoanAmount = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    if (!currentLead) {
        return null;
    }

    return (
        <DashboardLayout 
            title="Payments for this Lead" 
            showNotifications={false}
            showExitButton={true}
            onExit={handleExit}
        >
          <div className="max-w-2xl mx-auto pb-24">
            <ProgressBar currentStep={10} totalSteps={totalSteps} />

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              
              {/* Applicant Info Section (Based on Image) */}
              <Card className="border-l-4 border-blue-600 shadow-md">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-[#003366]">{currentLead.customerName || 'N/A'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Lead ID: {currentLead.appId} &bull; {formatLoanAmount(currentLead.loanAmount || 0)}
                        </p>
                    </div>
                    <Badge className={cn('mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold', payments.some(p => p.status === 'Pending') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}>
                        {payments.some(p => p.status === 'Pending') ? 'In Progress' : 'Fees Paid'}
                    </Badge>
                </CardContent>
              </Card>

              {/* Payment Tabs */}
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger value="Login Fee" className="py-2 text-sm font-medium">Login Fee</TabsTrigger>
                  <TabsTrigger value="IMD Fee" className="py-2 text-sm font-medium">IMD Fee</TabsTrigger>
                  <TabsTrigger value="Other Fees" className="py-2 text-sm font-medium">Other Fees</TabsTrigger>
                </TabsList>
                
                <TabsContent value="Login Fee" className="mt-4">{renderPaymentContent('Login Fee')}</TabsContent>
                <TabsContent value="IMD Fee" className="mt-4">{renderPaymentContent('IMD Fee')}</TabsContent>
                <TabsContent value="Other Fees" className="mt-4">{renderPaymentContent('Other Fees')}</TabsContent>
              </Tabs>
            </div>
            
            {/* Fixed Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4">
                <div className="flex gap-3 max-w-2xl mx-auto">
                    <Button onClick={handlePrevious} variant="outline" className="flex-1 h-12 rounded-lg">
                      Previous
                    </Button>
                     <Button 
                        onClick={() => handleCreatePaymentLink(currentTabType)}
                        className="flex-1 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
                        // Only enable if there are no pending links for the current tab, or if a link is needed
                        // Disabled for simplicity in mock, assuming user can always generate a link
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Payment Link
                    </Button>
                    <Button onClick={handleNext} className="flex-1 h-12 rounded-lg bg-green-600 hover:bg-green-700">
                      Next
                    </Button>
                </div>
            </div>
          </div>
        </DashboardLayout>
    );
}

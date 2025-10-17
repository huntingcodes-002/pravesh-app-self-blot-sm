'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import ProgressBar from '../../../components/ProgressBar';
import { useLead, PaymentSession } from '../../../contexts/LeadContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import CreatePaymentLink from '../../../components/lead/CreatePaymentLink';
import PaymentDetails from '../../../components/lead/PaymentDetails';

type PaymentView = 'main' | 'create' | 'details';

export default function Step10PaymentPage() {
    const { currentLead, updateLead, addPaymentToLead, updatePaymentInLead, deletePaymentFromLead } = useLead();
    const router = useRouter();
    const { toast } = useToast();
    
    const [view, setView] = useState<PaymentView>('main');
    const [selectedPayment, setSelectedPayment] = useState<PaymentSession | null>(null);
    const [prefillData, setPrefillData] = useState<{ feeType: 'Login / IMD Fee' | 'Other Fees', amount: number, remarks: string } | null>(null);

    const payments = currentLead?.payments || [];
    const hasSuccessfulPayment = payments.some(p => p.status === 'Paid');

    useEffect(() => {
        if (!currentLead) {
            router.replace('/leads');
        }
    }, [currentLead, router]);

    // Effect to update selected payment when currentLead changes (for auto-refresh)
    useEffect(() => {
        if (currentLead && selectedPayment) {
            const updatedSelectedPayment = currentLead.payments.find(p => p.id === selectedPayment.id);
            setSelectedPayment(updatedSelectedPayment || null);
        }
    }, [currentLead, selectedPayment]);


    const handleCreateNewLink = () => {
        setPrefillData(null); // Clear any prefill data
        setView('create');
    }

    const handleLinkCreate = (feeType: 'Login / IMD Fee' | 'Other Fees', amount: number, remarks: string) => {
        if (!currentLead) return;

        const now = new Date().toISOString();
        const newPayment: PaymentSession = {
            id: `PAY-${Date.now()}`,
            feeType,
            amount,
            remarks,
            status: 'Pending',
            link: `https://pay.saarathi.com/${feeType === 'Login / IMD Fee' ? 'login-fee' : 'other-fee'}/${currentLead.appId}`,
            createdAt: now,
            updatedAt: now,
            timeline: {
                created: now,
                sent: now,
            }
        };

        addPaymentToLead(currentLead.id, newPayment);
        setSelectedPayment(newPayment);
        setView('details');
        toast({ title: 'Payment Link Sent!', description: `A new payment link has been sent to the customer.` });
    };
    
    const handleViewDetails = (payment: PaymentSession) => {
        setSelectedPayment(payment);
        setView('details');
    };

    const handleRefreshStatus = (paymentId: string) => {
        if (!currentLead) return;
        
        const paymentToUpdate = currentLead.payments.find(p => p.id === paymentId);
        if (!paymentToUpdate) {
            toast({ title: 'Error', description: 'Could not find payment to refresh.', variant: 'destructive' });
            return;
        }

        let newStatus: 'Paid' | 'Failed' = Math.random() > 0.3 ? 'Paid' : 'Failed';
        if (paymentToUpdate.status === 'Paid') newStatus = 'Paid';
        if (paymentToUpdate.status === 'Failed') newStatus = 'Failed';

        const updatedPayment: Partial<PaymentSession> = {
            status: newStatus,
            timeline: {
                ...paymentToUpdate.timeline,
                received: new Date().toISOString()
            }
        };
        
        updatePaymentInLead(currentLead.id, paymentId, updatedPayment);
        
        toast({ title: 'Status Refreshed', description: `Payment status is now ${newStatus}.` });
    };
    
    const handleResendLink = (paymentId: string) => {
        if (!currentLead) return;
        const paymentToUpdate = currentLead.payments.find(p => p.id === paymentId);
        if (!paymentToUpdate) return;

        updatePaymentInLead(currentLead.id, paymentId, { 
            timeline: { ...paymentToUpdate.timeline, sent: new Date().toISOString() }
        });
        toast({ title: 'Link Resent', description: 'Payment link has been resent to the customer.' });
    };

    const handleDeleteFromDetails = (paymentId: string) => {
        if (!currentLead) return;
        deletePaymentFromLead(currentLead.id, paymentId);
        setView('create');
        setSelectedPayment(null);
        setPrefillData(null);
        toast({ title: 'Payment Link Deleted', description: 'You can create a new one.', variant: 'destructive' });
    };

    const handleDeleteAndRecreate = (paymentId: string) => {
        if (!currentLead) return;
        const paymentToDelete = currentLead.payments.find(p => p.id === paymentId);
        if (!paymentToDelete) return;
        
        setPrefillData({
            feeType: paymentToDelete.feeType,
            amount: paymentToDelete.amount,
            remarks: paymentToDelete.remarks || ''
        });
        deletePaymentFromLead(currentLead.id, paymentId);
        setView('create');
        toast({ title: 'Create New Link', description: 'Previous link deleted. Please confirm details to create a new one.' });
    };
    
    const handleExit = () => {
        if (view !== 'main') {
            setView('main');
            setSelectedPayment(null);
        } else {
            router.push('/leads');
        }
    };
    
    const handleNext = () => {
        if (!currentLead) return;
        updateLead(currentLead.id, { currentStep: 11 });
        router.push('/lead/step11');
    };

    const handlePrevious = () => {
        router.push('/lead/step9');
    };
    
    const formatLoanAmount = (amount?: number) => {
        if (!amount) return 'N/A';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    if (!currentLead) {
        return null;
    }
    
    const getTitle = () => {
        if (view === 'create') return 'Create Payment Link';
        if (view === 'details') return 'Payment Details';
        return 'Payments for this Lead';
    }
    
    return (
        <DashboardLayout 
            title={getTitle()} 
            showNotifications={false}
            showExitButton={true}
            onExit={handleExit}
        >
          <div className="max-w-2xl mx-auto pb-24">
            <ProgressBar currentStep={10} totalSteps={11} />

            {view === 'main' && (
                <>
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <Card className="border-l-4 border-blue-600 shadow-md">
                            <CardContent className="p-4">
                                <h3 className="text-lg font-semibold text-[#003366]">{currentLead.customerName || 'N/A'}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Lead ID: {currentLead.appId} &bull; {formatLoanAmount(currentLead.loanAmount)}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-800">User Payments</h3>
                            {payments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No payments created for this lead yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {payments.map(p => (
                                        <Card key={p.id}>
                                            <div className="cursor-pointer hover:bg-gray-50 rounded-t-lg" onClick={() => handleViewDetails(p)}>
                                                <CardContent className="p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{p.feeType}</p>
                                                        <p className="text-sm text-gray-600">{formatCurrency(p.amount)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={cn(p.status === 'Paid' ? 'bg-green-100 text-green-700' : p.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                                                            {p.status}
                                                        </Badge>
                                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </CardContent>
                                            </div>
                                            {p.status === 'Pending' && (
                                                <CardFooter className="p-2 border-t bg-gray-50 grid grid-cols-2 gap-2 rounded-b-lg">
                                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleResendLink(p.id); }}>
                                                        <RefreshCw className="w-4 h-4 mr-2"/> Resend link
                                                    </Button>
                                                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteAndRecreate(p.id); }}>
                                                        <Trash2 className="w-4 h-4 mr-2"/> Delete & Create New
                                                    </Button>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4">
                        <div className="flex gap-3 max-w-2xl mx-auto">
                            <Button onClick={handlePrevious} variant="outline" className="flex-1 h-12 rounded-lg">
                              Previous
                            </Button>
                             {hasSuccessfulPayment ? (
                                 <Button onClick={handleNext} className="flex-1 h-12 rounded-lg bg-green-600 hover:bg-green-700">
                                   Next
                                 </Button>
                             ) : (
                                 <Button onClick={handleCreateNewLink} className="flex-1 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold">
                                   <Plus className="w-5 h-5 mr-2" />
                                   Create New Payment Link
                                 </Button>
                             )}
                        </div>
                    </div>
                </>
            )}
            
            {view === 'create' && <CreatePaymentLink onLinkCreate={handleLinkCreate} prefillData={prefillData} />}
            
            {view === 'details' && selectedPayment && (
                <PaymentDetails
                    payment={selectedPayment}
                    lead={currentLead}
                    onRefresh={handleRefreshStatus}
                    onResend={handleResendLink}
                    onDelete={handleDeleteFromDetails}
                />
            )}
            
          </div>
        </DashboardLayout>
    );
}
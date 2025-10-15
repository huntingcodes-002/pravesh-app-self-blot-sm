'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Step11EvaluationPage() { 
  const { currentLead, updateLead, updateLeadStatus } = useLead(); 
  const router = useRouter();
  const { toast } = useToast();
  
  // State directly maps to the required fields from step11.html
  const [formData, setFormData] = useState({
    emiBouncesReason: currentLead?.formData?.step11_eval?.emiBouncesReason || '', // Required field 1
    highInquiriesReason: currentLead?.formData?.step11_eval?.highInquiriesReason || '', // Required field 2
  });

  useEffect(() => {
    if (currentLead?.formData?.step11_eval) {
        setFormData({
            emiBouncesReason: currentLead.formData.step11_eval.emiBouncesReason || '',
            highInquiriesReason: currentLead.formData.step11_eval.highInquiriesReason || '',
        });
    }
  }, [currentLead]);
  
  const setField = (key: keyof typeof formData, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleReject = () => {
    if (!currentLead) return;
    updateLeadStatus(currentLead.id, 'Rejected'); 
    toast({
        title: 'Application Rejected',
        description: `Lead ${currentLead.appId} status set to Rejected.`,
        variant: 'destructive',
    });
    router.push('/leads');
  };

  // Removed Save Draft handler/button

  const handleApprove = () => {
    if (!currentLead) return;
    
    // Check conditional fields must be filled
    if (!formData.emiBouncesReason.trim() || !formData.highInquiriesReason.trim()) {
        toast({
            title: 'Missing Explanations',
            description: 'Please answer all conditional questions before approving.',
            variant: 'destructive',
        });
        return;
    }

    // Save final evaluation data
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step11_eval: { ...formData }
      }
    });
    
    updateLeadStatus(currentLead.id, 'Approved'); 
    
    toast({
        title: 'Application Approved',
        description: `Lead ${currentLead.appId} status set to Approved.`,
        className: 'bg-green-50 border-green-200',
    });

    router.push('/leads'); 
  };

  const handlePrevious = () => {
    // Back to Documents page (Step 10)
    router.push('/lead/step10'); 
  };
  
  const canApprove = formData.emiBouncesReason.trim() && formData.highInquiriesReason.trim();


  return (
    <DashboardLayout 
        title="Evaluation & Assessment" 
        showNotifications={false}
        showExitButton={true}
        // NOTE: The exit button uses handleSaveDraft in the DashboardLayout,
        // so we temporarily redirect the onExit prop to a simple draft save or null
        onExit={handlePrevious} // Redirecting exit button to Previous to avoid confusion, since draft is explicitly removed from main flow
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={11} totalSteps={11} /> 

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit & Risk Evaluation</h2>

            {/* Application Summary Card - Mimics HTML structure */}
            <Card className="mb-6">
                <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Application Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Customer:</span>
                            <p className="font-medium text-gray-900">{currentLead?.customerName || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Loan Amount:</span>
                            <p className="font-medium text-gray-900">₹{currentLead?.loanAmount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        {/* Adding mock/placeholder summary data based on HTML/context */}
                        <div>
                            <span className="text-gray-500">Employment:</span>
                            <p className="font-medium text-gray-900">{currentLead?.formData?.step5?.occupationType || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Monthly Income:</span>
                            <p className="font-medium text-gray-900">₹45,000 (Mock)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* 1. BRE Results - Conditional Approval Section (Primary focus of HTML) */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6 space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Conditional Approval</h3>
                  <p className="text-sm text-amber-800">
                    The application requires additional clarification before approval. Please answer the following questions:
                  </p>
                </div>
              </div>
              
              {/* Conditional Questions - Required */}
              <div className="space-y-4 pt-2">
                <div>
                    <Label htmlFor="emiBouncesReason">
                        Why are there more than 3 EMI bounces in the last 12 months? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                        id="emiBouncesReason" 
                        rows={3} 
                        value={formData.emiBouncesReason}
                        onChange={(e) => setField('emiBouncesReason', e.target.value)}
                        placeholder="Please provide a detailed explanation..."
                        className="min-h-[80px] mt-2"
                        required
                    />
                </div>
                
                <div>
                    <Label htmlFor="highInquiriesReason">
                        Reason for high credit inquiries (8 inquiries in last 6 months)? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                        id="highInquiriesReason" 
                        rows={3} 
                        value={formData.highInquiriesReason}
                        onChange={(e) => setField('highInquiriesReason', e.target.value)}
                        placeholder="Please provide a detailed explanation..."
                        className="min-h-[80px] mt-2"
                        required
                    />
                </div>
              </div>
            </div>

            {/* 2. Credit Assessment / Risk Info Section */}
            <div className="space-y-6">
              
              {/* Credit Assessment Cards */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Credit Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-blue-700 font-medium mb-1">Credit Score</p>
                      <p className="text-3xl font-bold text-blue-900">720</p>
                      <p className="text-xs text-blue-600 mt-1">Good</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-green-700 font-medium mb-1">Total Exposure</p>
                      <p className="text-3xl font-bold text-green-900">₹8.5L</p>
                      <p className="text-xs text-green-600 mt-1">Within Limits</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Risk Factors List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">High EMI Bounces</span>
                        <Badge className="bg-red-100 text-red-700">High Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Multiple Inquiries</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Stable Employment</span>
                        <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-sm text-gray-700">DPD Status:</span>
                          <span className="font-medium text-orange-600">30+ DPD (Mock)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Debt-to-Income Ratio</span>
                        <Badge className="bg-red-100 text-red-700">High Risk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {/* Reject Button */}
            <Button
              onClick={handleReject}
              variant="outline"
              className="h-auto min-h-12 w-full border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 text-center px-3 py-2 whitespace-normal break-words"
            >
              Reject
            </Button>

            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="h-auto min-h-12 w-full border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 text-center px-3 py-2 whitespace-normal break-words"
            >
              Previous
            </Button>

            {/* Approve Button */}
            <Button
              onClick={handleApprove}
              disabled={!canApprove}
              className={`h-auto min-h-12 w-full font-semibold text-white rounded-xl shadow-md transition-all duration-200 text-center px-3 py-2 whitespace-normal break-words ${
                canApprove
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:scale-[1.02]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Approve & Finalize
            </Button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

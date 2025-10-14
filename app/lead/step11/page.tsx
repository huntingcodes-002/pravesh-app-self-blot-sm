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
  
  // Update form data key to step11_eval
  const [formData, setFormData] = useState({
    emiBouncesReason: currentLead?.formData?.step11_eval?.emiBouncesReason || '', // Required field 1
    highInquiriesReason: currentLead?.formData?.step11_eval?.highInquiriesReason || '', // Required field 2
  });
  const [explanation1, setExplanation1] = useState(currentLead?.formData?.step11_eval?.explanation1 || ''); 
  const [explanation2, setExplanation2] = useState(currentLead?.formData?.step11_eval?.explanation2 || ''); 

  useEffect(() => {
    if (currentLead?.formData?.step11_eval) {
        setFormData({
            emiBouncesReason: currentLead.formData.step11_eval.emiBouncesReason || '',
            highInquiriesReason: currentLead.formData.step11_eval.highInquiriesReason || '',
        });
        // Keeping explanation fields for custom data, though HTML didn't explicitly map them to risk answers
        setExplanation1(currentLead.formData.step11_eval.explanation1 || '');
        setExplanation2(currentLead.formData.step11_eval.explanation2 || '');
    }
  }, [currentLead]);
  
  const setField = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

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

  const handleSaveDraft = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step11_eval: { ...formData, explanation1, explanation2 }
      },
      currentStep: 11
    });
    toast({
        title: 'Draft Saved',
        description: `Evaluation draft saved successfully.`,
    });
    router.push('/leads');
  };

  const handleApprove = () => {
    if (!currentLead) return;
    
    // Check conditional fields (if present, they must be filled)
    if (!formData.emiBouncesReason.trim() || !formData.highInquiriesReason.trim()) {
        toast({
            title: 'Missing Explanations',
            description: 'Please answer all conditional questions before approving.',
            variant: 'destructive',
        });
        return;
    }

    // Save evaluation data
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step11_eval: { ...formData, explanation1, explanation2 }
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
        title="Evaluation & Assessment - Step 11" 
        showNotifications={false}
        showExitButton={true}
        onExit={handleSaveDraft} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={11} totalSteps={11} /> 

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit & Risk Evaluation</h2>

            {/* Application Summary - kept generic for brevity */}
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
                    </div>
                </CardContent>
            </Card>


            {/* 1. BRE Results - Conditional Approval Section */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6 space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Conditional Approval</h3>
                  <p className="text-sm text-amber-800">
                    The application requires additional clarification before approval.
                  </p>
                </div>
              </div>
              
              {/* Conditional Questions */}
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
                      {/* Placeholder for other factors */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Credit History</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
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

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={handleReject}
              variant="outline"
              className="h-12 border-red-200 text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="h-12"
            >
              Save Draft
            </Button>
            <Button
              onClick={handlePrevious} 
              variant="outline"
              className="h-12"
            >
              Previous
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!canApprove}
              className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Approve & Finalize
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

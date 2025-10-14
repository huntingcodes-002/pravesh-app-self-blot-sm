'use client';

import React, { useState } from 'react';
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

export default function Step10Page() {
  const { currentLead, updateLead, submitLead } = useLead();
  const router = useRouter();
  const [explanation1, setExplanation1] = useState('');
  const [explanation2, setExplanation2] = useState('');

  const handleReject = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, { status: 'Rejected' });
    router.push('/leads');
  };

  const handleSaveDraft = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step10: { explanation1, explanation2 }
      }
    });
    router.push('/leads');
  };

  const handleCancel = () => {
    router.push('/leads');
  };

  const handleApprove = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step10: { explanation1, explanation2 }
      },
      currentStep: 11
    });
    router.push('/lead/step11');
  };

  return (
    <DashboardLayout title="Evaluation & Assessment" showNotifications={false}>
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={10} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit & Risk Evaluation</h2>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Conditional Approval</h3>
                <p className="text-sm text-amber-800">
                  This application has been flagged for conditional approval based on business rules. Please review the assessment below and provide explanations where necessary.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="explanation1">Risk Mitigation Explanation</Label>
                <Textarea
                  id="explanation1"
                  value={explanation1}
                  onChange={(e) => setExplanation1(e.target.value)}
                  placeholder="Explain the risk factors and mitigation strategies..."
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="explanation2">Additional Comments</Label>
                <Textarea
                  id="explanation2"
                  value={explanation2}
                  onChange={(e) => setExplanation2(e.target.value)}
                  placeholder="Any additional comments or observations..."
                  className="min-h-[100px] mt-2"
                />
              </div>

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

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Repayment Capacity</span>
                        <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Credit History</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Employment Stability</span>
                        <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Collateral Value</span>
                        <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
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
              onClick={handleCancel}
              variant="outline"
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Approve & Proceed
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

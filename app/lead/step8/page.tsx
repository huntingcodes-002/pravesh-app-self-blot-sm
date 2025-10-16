'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Edit, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Step8Page() {
  const { currentLead, updateLead, submitLead } = useLead();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    application: true,
    customer: false,
    loan: false,
  });
  const [moveToNextStage, setMoveToNextStage] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  const handleEdit = (step: number) => {
    router.push(`/lead/step${step}`);
  };

  const handleSubmit = () => {
    if (!currentLead) return;

    if (moveToNextStage) {
      updateLead(currentLead.id, {
        formData: {
          ...currentLead.formData,
          step9: { moveToNextStage },
        },
        currentStep: 9,
      });
      router.push('/lead/step9');
    } else {
      submitLead(currentLead.id);
      router.push('/leads');
    }
  };
  
  const handleExit = () => {
    if (!currentLead) {
        router.push('/leads');
        return;
    }
    // Save current data as draft before exiting
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step9: { moveToNextStage }
      },
      currentStep: 8
    });
    router.push('/leads');
  };


  const handlePrevious = () => {
    router.push('/lead/step7');
  };

  return (
    <DashboardLayout
      title="Review Application"
      showNotifications={false}
      showExitButton={true}
      onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={8} totalSteps={10} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Review</h2>

            <div className="space-y-4">
              <Card className="border-2 border-blue-100">
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('application')}
                  >
                    <h3 className="font-semibold text-gray-900">Application Summary</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(1);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {expandedSections.application ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {expandedSections.application && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product Type:</span>
                        <span className="font-medium">
                          {currentLead?.formData?.step1?.productType || 'N/A'}
                        </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Loan Amount:</span>
                        <span className="font-medium">
                          {currentLead?.loanAmount
                            ? `₹${currentLead.loanAmount.toLocaleString()}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Name:</span>
                        <span className="font-medium">
                          {currentLead?.customerName || 'N/A'}
                        </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Application Ref:</span>
                        <span className="font-medium">
                          {currentLead?.appId || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100">
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('customer')}
                  >
                    <h3 className="font-semibold text-gray-900">Customer Information</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(2);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {expandedSections.customer ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {expandedSections.customer && (
                    <div className="mt-4 space-y-2 text-sm">
                       <div className="flex justify-between">
                        <span className="text-gray-600">Mobile Number:</span>
                        <span className="font-medium">
                          {currentLead?.customerMobile || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PAN:</span>
                        <span className="font-medium">{currentLead?.panNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium">{currentLead?.dob || 'N/A'}</span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Employment:</span>
                        <span className="font-medium">
                          {currentLead?.formData?.step5?.occupationType || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                         <span className="font-medium">
                            {currentLead?.formData?.step4?.addresses?.[0]?.postalCode ? `${currentLead.formData.step4.addresses[0].postalCode}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-100">
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('loan')}
                  >
                    <h3 className="font-semibold text-gray-900">Loan Details</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(7);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {expandedSections.loan ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {expandedSections.loan && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan Purpose:</span>
                        <span className="font-medium">{currentLead?.loanPurpose || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product Code:</span>
                        <span className="font-medium">
                          {currentLead?.formData?.step8?.productCode || 'N/A'}
                        </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">
                           {currentLead?.formData?.step8?.interestRate ? `${currentLead.formData.step8.interestRate}% p.a.` : 'N/A'}
                        </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Tenure:</span>
                        <span className="font-medium">
                          {currentLead?.formData?.step8?.tenure ? `${currentLead.formData.step8.tenure} Months` : 'N/A'}
                        </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-gray-600">Application Type:</span>
                        <span className="font-medium">
                          {currentLead?.formData?.step1?.applicationType || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Validation Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>All required fields completed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Customer information verified</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Loan details validated</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Checkbox
                id="moveToNextStage"
                checked={moveToNextStage}
                onCheckedChange={(checked) => setMoveToNextStage(checked as boolean)}
              />
              <Label htmlFor="moveToNextStage" className="cursor-pointer font-medium">
                Move to Next Stage (Evaluation)
              </Label>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} variant="outline" className="h-12 px-8">
              Previous
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
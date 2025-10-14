'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Step6Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const [coApplicants, setCoApplicants] = useState<any[]>([]);

  useEffect(() => {
    if (currentLead?.formData?.step6) {
      setCoApplicants(currentLead.formData.step6.coApplicants || []);
    }
  }, [currentLead]);

  const handleAddCoApplicant = () => {
    const newCoApplicant = {
      id: Date.now().toString(),
      name: 'Co-Applicant ' + (coApplicants.length + 1),
      relationship: 'Spouse',
      mobile: '+91 9876543210',
      email: 'coapplicant@example.com'
    };
    setCoApplicants([...coApplicants, newCoApplicant]);
  };

  const handleDeleteCoApplicant = (id: string) => {
    setCoApplicants(coApplicants.filter(ca => ca.id !== id));
  };

  const handleNext = () => {
    if (!currentLead) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step6: { coApplicants }
      },
      currentStep: 7
    });
    router.push('/lead/step7');
  };

  const handlePrevious = () => {
    router.push('/lead/step5');
  };

  return (
    <DashboardLayout title="Co-Applicant Details" showNotifications={false}>
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={6} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Co-Applicant Information</h2>

            <Button
              onClick={handleAddCoApplicant}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Co-Applicant
            </Button>

            <div className="space-y-4">
              {coApplicants.map((coApplicant, index) => (
                <Card key={coApplicant.id} className="border-2 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{coApplicant.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Relationship:</span> {coApplicant.relationship}</p>
                          <p><span className="font-medium">Mobile:</span> {coApplicant.mobile}</p>
                          <p><span className="font-medium">Email:</span> {coApplicant.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoApplicant(coApplicant.id)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {coApplicants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No co-applicants added yet</p>
                  <p className="text-sm mt-1">Click the button above to add a co-applicant</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="h-12 px-8"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

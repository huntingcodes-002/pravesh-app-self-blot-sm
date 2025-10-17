'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Step5Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  // Using an explicit type for mock data structure
  interface CoApplicant {
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
    gender: string;
    pan: string;
    // We omit complex nested form data for mock simplicity here
  }
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);

  useEffect(() => {
    if (currentLead?.formData?.step6) {
      setCoApplicants(currentLead.formData.step6.coApplicants || []);
    }
  }, [currentLead]);

  const handleAddCoApplicant = () => {
    const newCoApplicant: CoApplicant = {
      id: Date.now().toString(),
      firstName: 'Priya', 
      lastName: 'Sharma', 
      relationship: 'Spouse', 
      gender: 'Female',
      pan: 'ABCDE1234F'
    };
    setCoApplicants([...coApplicants, newCoApplicant]);
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
        step6: { coApplicants }
      },
      currentStep: 5
    });
    router.push('/leads');
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
      currentStep: 6
    });
    router.push('/lead/step6');
  };

  const handlePrevious = () => {
    router.push('/lead/step4');
  };

  return (
    <DashboardLayout 
        title="Co-Applicant Details" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={5} totalSteps={11} totalSteps={10} />

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
                        <h3 className="font-semibold text-gray-900 mb-2">{coApplicant.firstName} {coApplicant.lastName}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Relationship:</span> {coApplicant.relationship}</p>
                          <p><span className="font-medium">Gender:</span> {coApplicant.gender}</p>
                          <p><span className="font-medium">PAN:</span> {coApplicant.pan}</p>
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
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Step4Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();

  const [formData, setFormData] = useState({
    occupationType: currentLead?.formData?.step5?.occupationType || 'salaried',
    // Salaried
    employerName: currentLead?.formData?.step5?.employerName || '',
    designation: currentLead?.formData?.step5?.designation || '',
    employmentType: currentLead?.formData?.step5?.employmentType || 'permanent',
    employmentStatus: currentLead?.formData?.step5?.employmentStatus || 'present',
    industry: currentLead?.formData?.step5?.industry || '',
    natureOfBusiness: currentLead?.formData?.step5?.natureOfBusiness || '',
    // Self Employed Non-Professional
    orgName: currentLead?.formData?.step5?.orgName || '',
    natureOfBusinessSENP: currentLead?.formData?.step5?.natureOfBusinessSENP || '',
    industrySENP: currentLead?.formData?.step5?.industrySENP || '',
    // Self Employed Professional
    orgNameSEP: currentLead?.formData?.step5?.orgNameSEP || '',
    natureOfProfession: currentLead?.formData?.step5?.natureOfProfession || '',
    registrationNumber: currentLead?.formData?.step5?.registrationNumber || '',
    yearsInProfession: currentLead?.formData?.step5?.yearsInProfession || '',
    industrySEP: currentLead?.formData?.step5?.industrySEP || '',
    // Others
    natureOfOccupation: currentLead?.formData?.step5?.natureOfOccupation || '',
    // Retired
    previousOccupation: currentLead?.formData?.step5?.previousOccupation || '',
  });

  useEffect(() => {
    if (currentLead?.formData?.step5) {
      setFormData(currentLead.formData.step5);
    }
  }, [currentLead]);

  const setField = (key: string, value: string) => setFormData({ ...formData, [key]: value });

  const handleNext = () => {
    if (!currentLead) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step5: formData,
      },
      currentStep: 5,
    });
    router.push('/lead/step5');
  };

  const handleExit = () => {
    if (!currentLead) {
      router.push('/leads');
      return;
    }
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step5: formData,
      },
      currentStep: 4,
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step3');
  };
  
  const canProceed = () => {
    switch (formData.occupationType) {
      case 'salaried':
        return formData.employerName && formData.designation;
      case 'self-employed-non-professional':
        return formData.natureOfBusinessSENP;
      case 'self-employed-professional':
        return formData.orgNameSEP && formData.natureOfProfession && formData.yearsInProfession;
      case 'others':
        return formData.natureOfOccupation;
      case 'retired':
        return true;
      default:
        return false;
    }
  };

  return (
    <DashboardLayout
      title="Employment Details"
      showNotifications={false}
      showExitButton={true}
      onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={4} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Employment Information</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="occupationType">
                Occupation Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.occupationType}
                onValueChange={(value) => setField('occupationType', value)}
              >
                <SelectTrigger id="occupationType" className="h-12">
                  <SelectValue placeholder="Select Occupation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self-employed-non-professional">
                    Self Employed Non-Professional
                  </SelectItem>
                  <SelectItem value="self-employed-professional">
                    Self Employed Professional
                  </SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.occupationType === 'salaried' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employerName">
                    Employer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => setField('employerName', e.target.value)}
                    placeholder="Enter employer name"
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="designation">
                    Designation <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setField('designation', e.target.value)}
                    placeholder="Enter designation"
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setField('employmentType', value)}
                  >
                    <SelectTrigger id="employmentType" className="h-12">
                      <SelectValue placeholder="Select Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => setField('employmentStatus', value)}
                  >
                    <SelectTrigger id="employmentStatus" className="h-12">
                      <SelectValue placeholder="Select Employment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setField('industry', value)}
                  >
                    <SelectTrigger id="industry" className="h-12">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="information-technology">Information Technology</SelectItem>
                      <SelectItem value="banking-finance">Banking & Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="natureOfBusiness">Nature of Business</Label>
                  <Select
                    value={formData.natureOfBusiness}
                    onValueChange={(value) => setField('natureOfBusiness', value)}
                  >
                    <SelectTrigger id="natureOfBusiness" className="h-12">
                      <SelectValue placeholder="Select Nature of Business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-development">Software Development</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="trading">Trading</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {formData.occupationType === 'self-employed-non-professional' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={formData.orgName}
                    onChange={(e) => setField('orgName', e.target.value)}
                    placeholder="Enter organization name"
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="nature-business-senp">Nature of Business <span className="text-red-500">*</span></Label>
                   <Select
                    value={formData.natureOfBusinessSENP}
                    onValueChange={(value) => setField('natureOfBusinessSENP', value)}
                  >
                    <SelectTrigger id="nature-business-senp" className="h-12">
                      <SelectValue placeholder="Select Nature of Business" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="industry-senp">Industry</Label>
                  <Select
                    value={formData.industrySENP}
                    onValueChange={(value) => setField('industrySENP', value)}
                  >
                    <SelectTrigger id="industry-senp" className="h-12">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.occupationType === 'self-employed-professional' && (
              <div className="space-y-4">
                 <div>
                  <Label htmlFor="org-name-sep">Organization Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="org-name-sep"
                     value={formData.orgNameSEP}
                    onChange={(e) => setField('orgNameSEP', e.target.value)}
                    placeholder="Enter organization name"
                    className="h-12"
                  />
                </div>
                 <div>
                  <Label htmlFor="nature-profession">Nature of Profession <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.natureOfProfession}
                    onValueChange={(value) => setField('natureOfProfession', value)}
                  >
                    <SelectTrigger id="nature-profession" className="h-12">
                      <SelectValue placeholder="Select Nature of Profession" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="lawyer">Lawyer</SelectItem>
                        <SelectItem value="chartered-accountant">Chartered Accountant</SelectItem>
                        <SelectItem value="architect">Architect</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registration-number">Registration Number</Label>
                  <Input
                    id="registration-number"
                    value={formData.registrationNumber}
                    onChange={(e) => setField('registrationNumber', e.target.value)}
                    placeholder="Enter registration number"
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="years-profession">Years in Profession <span className="text-red-500">*</span></Label>
                  <Input
                    id="years-profession"
                    type="number"
                    value={formData.yearsInProfession}
                    onChange={(e) => setField('yearsInProfession', e.target.value)}
                    placeholder="Enter years in profession"
                    className="h-12"
                  />
                </div>
                 <div>
                  <Label htmlFor="industry-sep">Industry</Label>
                  <Select
                    value={formData.industrySEP}
                    onValueChange={(value) => setField('industrySEP', value)}
                  >
                    <SelectTrigger id="industry-sep" className="h-12">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="financial-services">Financial Services</SelectItem>
                        <SelectItem value="architecture">Architecture</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {formData.occupationType === 'others' && (
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor="nature-occupation">Nature of Occupation <span className="text-red-500">*</span></Label>
                         <Select
                            value={formData.natureOfOccupation}
                            onValueChange={(value) => setField('natureOfOccupation', value)}
                        >
                            <SelectTrigger id="nature-occupation" className="h-12">
                            <SelectValue placeholder="Select Nature of Occupation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="housewife">Housewife</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                                <SelectItem value="freelancer">Freelancer</SelectItem>
                                <SelectItem value="others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {formData.occupationType === 'retired' && (
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor="previous-occupation">Previous Occupation</Label>
                        <Input
                            id="previous-occupation"
                             value={formData.previousOccupation}
                            onChange={(e) => setField('previousOccupation', e.target.value)}
                            placeholder="Enter previous occupation"
                            className="h-12"
                        />
                    </div>
                 </div>
            )}

          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} variant="outline" className="h-12 px-8">
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
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
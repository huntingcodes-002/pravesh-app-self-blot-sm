'use client';

import React from 'react';
import { X, FileText, User, IndianRupee, MapPin, Briefcase, Users, Home, AlertTriangle, Wallet, File } from 'lucide-react';
import { Lead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ApplicationPreviewProps {
  lead: Lead;
  onClose: () => void;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
};

const PreviewSection = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="space-y-3">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800 border-b pb-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <h3>{title}</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div className="py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
);

export default function ApplicationPreview({ lead, onClose }: ApplicationPreviewProps) {
  const { formData, status, appId, customerFirstName, customerLastName, customerMobile, panNumber, dob, payments } = lead;
  
  const leadStatus = status;
  const successfulPayment = payments?.find(p => p.status === 'Paid');
  
  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 'N/A';

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Application Preview - {appId}</h2>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
          <X className="w-5 h-5" />
        </Button>
      </header>

      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
            
            {/* Status */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <p className="font-semibold text-lg text-gray-700">Current Status</p>
                <Badge className={`px-4 py-1 text-base font-bold ${
                    leadStatus === 'Draft' ? 'bg-gray-400' : 
                    leadStatus === 'Submitted' ? 'bg-blue-600' :
                    leadStatus === 'Approved' ? 'bg-green-600' :
                    leadStatus === 'Disbursed' ? 'bg-teal-600' :
                    'bg-red-600'
                } text-white`}>
                    {leadStatus}
                </Badge>
            </div>
            
            <PreviewSection title="Application Details" icon={FileText}>
                <DetailItem label="Product Type" value={formData?.step1?.productType} />
                <DetailItem label="Application Type" value={formData?.step1?.applicationType} />
            </PreviewSection>
            
            <Separator />

            <PreviewSection title="Customer Information" icon={User}>
                <DetailItem label="Full Name" value={`${customerFirstName || ''} ${customerLastName || ''}`.trim()} />
                <DetailItem label="Mobile" value={customerMobile ? `+91-${customerMobile}` : 'N/A'} />
                {formData?.step2?.hasPan === 'no' ? (
                    <DetailItem label={formData?.step2?.alternateIdType || 'Alternate ID'} value={formData?.step2?.documentNumber} />
                ) : (
                    <DetailItem label="PAN Number" value={panNumber} />
                )}
                <DetailItem label="Date of Birth" value={dob} />
                <DetailItem label="Age" value={age !== 'N/A' ? `${age} years` : 'N/A'} />
                <DetailItem label="Gender" value={lead.gender} />
                <DetailItem label="Email" value={formData?.step2?.email} />
            </PreviewSection>

            <Separator />

            {formData?.step3?.addresses?.map((addr: any, index: number) => (
                <React.Fragment key={addr.id}>
                    <PreviewSection title={`Address ${index + 1} ${addr.isPrimary ? '(Primary)' : ''}`} icon={MapPin}>
                        <DetailItem label="Address Type" value={addr.addressType} />
                        <DetailItem label="Address Line 1" value={addr.addressLine1} />
                        <DetailItem label="Address Line 2" value={addr.addressLine2} />
                        <DetailItem label="Postal Code" value={addr.postalCode} />
                        <DetailItem label="Country" value={addr.country} />
                    </PreviewSection>
                    <Separator />
                </React.Fragment>
            ))}

            <PreviewSection title="Employment Details" icon={Briefcase}>
                <DetailItem label="Occupation Type" value={formData?.step4?.occupationType} />
                {formData?.step4?.occupationType === 'salaried' && (
                    <>
                        <DetailItem label="Employer Name" value={formData?.step4?.employerName} />
                        <DetailItem label="Designation" value={formData?.step4?.designation} />
                        <DetailItem label="Industry" value={formData?.step4?.industry} />
                    </>
                )}
                 {formData?.step4?.occupationType === 'self-employed-professional' && (
                    <>
                        <DetailItem label="Organization" value={formData?.step4?.orgNameSEP} />
                        <DetailItem label="Nature of Profession" value={formData?.step4?.natureOfProfession} />
                        <DetailItem label="Years in Profession" value={formData?.step4?.yearsInProfession} />
                    </>
                )}
            </PreviewSection>

            <Separator />

            {formData?.step5?.coApplicants?.length > 0 && (
                <>
                    <PreviewSection title="Co-Applicant Details" icon={Users}>
                        {formData.step5.coApplicants.map((coApp: any, index: number) => (
                             <DetailItem key={index} label={`Co-Applicant ${index + 1}`} value={`${coApp.firstName} ${coApp.lastName} (${coApp.relationship})`} />
                        ))}
                    </PreviewSection>
                    <Separator />
                </>
            )}
            
            <PreviewSection title="Collateral" icon={Home}>
                <DetailItem label="Type" value={formData?.step6?.collateralType} />
                <DetailItem label="Ownership" value={formData?.step6?.ownershipType} />
                <DetailItem label="Estimated Value" value={formatCurrency(Number(formData?.step6?.propertyValue))} />
                <DetailItem label="Location" value={formData?.step6?.location} />
            </PreviewSection>

            <Separator />

            <PreviewSection title="Loan Details" icon={IndianRupee}>
                <DetailItem label="Amount Requested" value={formatCurrency(lead.loanAmount)} />
                <DetailItem label="Purpose" value={lead.loanPurpose || formData?.step7?.loanPurpose} />
                <DetailItem label="Product Code" value={formData?.step7?.productCode} />
                <DetailItem label="Tenure" value={formData?.step7?.tenure ? `${formData.step7.tenure} ${formData.step7.tenureUnit}` : 'N/A'} />
                <DetailItem label="Interest Rate" value={formData?.step7?.interestRate ? `${formData.step7.interestRate}%` : 'N/A'} />
                <DetailItem label="Assigned Officer" value={formData?.step7?.assignedOfficer} />
            </PreviewSection>

            <Separator />

            <PreviewSection title="Uploaded Documents" icon={File}>
                {formData?.step9?.files?.length > 0 ? formData.step9.files.map((file: any) => (
                    <DetailItem key={file.id} label={file.type} value={`${file.name} (${file.status})`} />
                )) : <DetailItem label="Documents" value="None uploaded" />}
            </PreviewSection>

            <Separator />

            <PreviewSection title="Payments" icon={Wallet}>
                {successfulPayment ? (
                    <>
                        <DetailItem label="Payment Status" value={<Badge className="bg-green-100 text-green-700">Paid</Badge>} />
                        <DetailItem label="Amount Paid" value={formatCurrency(successfulPayment.amount)} />
                        <DetailItem label="Fee Type" value={successfulPayment.feeType} />
                        <DetailItem label="Paid On" value={successfulPayment.timeline.received ? new Date(successfulPayment.timeline.received).toLocaleString() : 'N/A'} />
                    </>
                ) : (
                    <DetailItem label="Payment Status" value={<Badge className="bg-orange-100 text-orange-700">Pending</Badge>} />
                )}
            </PreviewSection>

            <Separator />
            
            <PreviewSection title="Evaluation & Assessment" icon={AlertTriangle}>
                <DetailItem label="EMI Bounces Reason" value={formData?.step11?.emiBouncesReason || 'Not assessed yet'} />
                <DetailItem label="High Inquiries Reason" value={formData?.step11?.highInquiriesReason || 'Not assessed yet'} />
            </PreviewSection>

        </div>
      </ScrollArea>
    </div>
  );
}

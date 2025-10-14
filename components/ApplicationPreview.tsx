'use client';

import React from 'react';
import { X, FileText, User, IndianRupee, MapPin, Briefcase, Users, Home, AlertTriangle } from 'lucide-react';
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
    if (value === undefined) return 'N/A';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
};

const PreviewSection = ({ title, icon: Icon, children }: any) => (
    <div className="space-y-3">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800 border-b pb-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <h3>{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
    </div>
);

export default function ApplicationPreview({ lead, onClose }: ApplicationPreviewProps) {
  const { formData, status, appId, customerFirstName, customerLastName, customerMobile, panNumber, dob } = lead;
  
  const leadStatus = status;

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Application Preview - {appId}</h2>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
          <X className="w-5 h-5" />
        </Button>
      </header>

      <ScrollArea className="flex-1 p-6">
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
            
            <PreviewSection title="Customer Information" icon={User}>
                <DetailItem label="Full Name" value={`${customerFirstName || 'N/A'} ${customerLastName || ''}`} />
                <DetailItem label="Mobile" value={customerMobile || 'N/A'} />
                <DetailItem label="PAN Number" value={panNumber || 'N/A'} />
                <DetailItem label="Date of Birth" value={dob || 'N/A'} />
                <DetailItem label="Age" value={lead.age ? `${lead.age} years` : 'N/A'} />
                <DetailItem label="Gender" value={lead.gender || 'N/A'} />
            </PreviewSection>
            
            <Separator />

            <PreviewSection title="Loan Details" icon={IndianRupee}>
                <DetailItem label="Amount Requested" value={formatCurrency(lead.loanAmount)} />
                <DetailItem label="Purpose" value={lead.loanPurpose || formData?.step8?.loanPurpose || 'N/A'} />
                <DetailItem label="Product Code" value={formData?.step8?.productCode || 'N/A'} />
                <DetailItem label="Tenure" value={formData?.step8?.tenure ? `${formData.step8.tenure} months` : 'N/A'} />
            </PreviewSection>

            <Separator />

            <PreviewSection title="Collateral" icon={Home}>
                <DetailItem label="Type" value={formData?.step7?.collateralType || 'N/A'} />
                <DetailItem label="Ownership" value={formData?.step7?.ownershipType || 'N/A'} />
                <DetailItem label="Estimated Value" value={formatCurrency(Number(formData?.step7?.propertyValue))} />
                <DetailItem label="Location" value={formData?.step7?.location || 'N/A'} />
            </PreviewSection>

            <Separator />

            <PreviewSection title="Employment" icon={Briefcase}>
                <DetailItem label="Occupation Type" value={formData?.step5?.occupationType || 'N/A'} />
                <DetailItem label="Employer Name" value={formData?.step5?.employerName || 'N/A'} />
                <DetailItem label="Designation" value={formData?.step5?.designation || 'N/A'} />
            </PreviewSection>

            <Separator />

            <PreviewSection title="Risk Assessment (Step 9 Data)" icon={AlertTriangle}>
                <DetailItem label="Risk Mitigation Expl." value={formData?.step9?.explanation1 || 'Not assessed yet'} />
                <DetailItem label="Additional Comments" value={formData?.step9?.explanation2 || 'None'} />
            </PreviewSection>
            
        </div>
      </ScrollArea>
    </div>
  );
}

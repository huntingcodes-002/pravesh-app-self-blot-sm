'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Lead {
  id: string;
  appId: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Disbursed' | 'Rejected';
  customerName: string;
  customerMobile: string;
  customerFirstName?: string;
  customerLastName?: string;
  panNumber?: string;
  dob?: string;
  age?: number;
  gender?: string;
  loanAmount?: number;
  loanPurpose?: string;
  currentStep: number;
  formData: any;
  createdAt: string;
  updatedAt: string;
}

interface LeadContextType {
  leads: Lead[];
  currentLead: Lead | null;
  createLead: () => void;
  updateLead: (leadId: string, data: Partial<Lead>) => void;
  submitLead: (leadId: string) => void;
  setCurrentLead: (lead: Lead | null) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);

  useEffect(() => {
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      const dummyLeads: Lead[] = [
        {
          id: '1',
          appId: 'APP-2025-001',
          status: 'Draft',
          customerName: 'John Doe',
          customerMobile: '+91 9876543210',
          currentStep: 3,
          formData: {},
          createdAt: '2025-10-10T10:00:00Z',
          updatedAt: '2025-10-12T14:30:00Z'
        },
        {
          id: '2',
          appId: 'APP-2025-002',
          status: 'Submitted',
          customerName: 'Jane Smith',
          customerMobile: '+91 9876543211',
          currentStep: 11,
          formData: {},
          createdAt: '2025-10-09T09:00:00Z',
          updatedAt: '2025-10-11T16:45:00Z'
        },
        {
          id: '3',
          appId: 'APP-2025-003',
          status: 'Approved',
          customerName: 'Robert Johnson',
          customerMobile: '+91 9876543212',
          currentStep: 11,
          formData: {},
          createdAt: '2025-10-08T11:00:00Z',
          updatedAt: '2025-10-10T10:20:00Z'
        },
        {
          id: '4',
          appId: 'APP-2025-004',
          status: 'Draft',
          customerName: 'Maria Garcia',
          customerMobile: '+91 9876543213',
          currentStep: 5,
          formData: {},
          createdAt: '2025-10-11T13:00:00Z',
          updatedAt: '2025-10-13T09:15:00Z'
        },
        {
          id: '5',
          appId: 'APP-2025-005',
          status: 'Disbursed',
          customerName: 'Michael Brown',
          customerMobile: '+91 9876543214',
          currentStep: 11,
          formData: {},
          createdAt: '2025-10-05T08:00:00Z',
          updatedAt: '2025-10-08T12:00:00Z'
        }
      ];
      setLeads(dummyLeads);
      localStorage.setItem('leads', JSON.stringify(dummyLeads));
    }
  }, []);

  const saveLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
  };

  const createLead = () => {
    const newLead: Lead = {
      id: Date.now().toString(),
      appId: `APP-2025-${String(leads.length + 1).padStart(3, '0')}`,
      status: 'Draft',
      customerName: '',
      customerMobile: '',
      currentStep: 1,
      formData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedLeads = [...leads, newLead];
    saveLeads(updatedLeads);
    setCurrentLead(newLead);
  };

  const updateLead = (leadId: string, data: Partial<Lead>) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            ...data,
            customerName: `${data.customerFirstName || lead.customerFirstName || ''} ${data.customerLastName || lead.customerLastName || ''}`.trim() || lead.customerName,
            updatedAt: new Date().toISOString()
          }
        : lead
    );
    saveLeads(updatedLeads);
    if (currentLead?.id === leadId) {
      const updatedCurrent = updatedLeads.find(l => l.id === leadId);
      if (updatedCurrent) {
        setCurrentLead(updatedCurrent);
      }
    }
  };

  const submitLead = (leadId: string) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId
        ? { ...lead, status: 'Submitted' as const, updatedAt: new Date().toISOString() }
        : lead
    );
    saveLeads(updatedLeads);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        currentLead,
        createLead,
        updateLead,
        submitLead,
        setCurrentLead
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
}

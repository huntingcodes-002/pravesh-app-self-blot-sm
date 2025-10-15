
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type LeadStatus = 'Draft' | 'Submitted' | 'Approved' | 'Disbursed' | 'Rejected';

export interface Lead {
  id: string;
  appId: string;
  status: LeadStatus;
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
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  setCurrentLead: (lead: Lead | null) => void;
  deleteLead: (leadId: string) => void; // New function
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const STORAGE_KEY = 'leads';

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);

  useEffect(() => {
    const storedLeads = localStorage.getItem(STORAGE_KEY);
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      // Dummy data initialization
    }
  }, []);

  const saveLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
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
        ? { ...lead, status: 'Submitted' as const, currentStep: 10, updatedAt: new Date().toISOString() }
        : lead
    );
    saveLeads(updatedLeads);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId
        ? { ...lead, status: status, updatedAt: new Date().toISOString() }
        : lead
    );
    saveLeads(updatedLeads);
  };
  
  const deleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    saveLeads(updatedLeads);
    if (currentLead?.id === leadId) {
      setCurrentLead(null);
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        currentLead,
        createLead,
        updateLead,
        submitLead,
        updateLeadStatus,
        setCurrentLead,
        deleteLead
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

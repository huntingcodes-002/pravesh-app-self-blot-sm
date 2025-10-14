'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLead } from '@/contexts/LeadContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, FileText, Send, CheckCircle, IndianRupee, AlertTriangle, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { leads, createLead } = useLead();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    router.replace('/login');
    return null;
  }

  const leadsInDraft = leads.filter((l) => l.status === 'Draft').length;
  const leadsSubmitted = leads.filter((l) => l.status === 'Submitted').length;
  // Dummy data for Approved/Disbursed based on spec
  const leadsApproved = 12; 
  const leadsDisbursed = 8;

  const handleCreateNewLead = () => {
    createLead();
    router.push('/lead/step1'); // Redirect to the first step
  };

  const dashboardCards = [
    { title: 'Leads in Draft', icon: FileText, count: leadsInDraft, color: 'text-gray-500', bg: 'bg-gray-100' },
    { title: 'Leads Submitted', icon: Send, count: leadsSubmitted, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Leads Approved', icon: CheckCircle, count: leadsApproved, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Disbursed Leads', icon: IndianRupee, count: leadsDisbursed, color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  const dummyAlerts = [
    { id: 1, message: 'Lead APP-2025-002: Needs document validation.', time: '2 mins ago', color: 'border-red-400' },
    { id: 2, message: 'New lead APP-2025-006 created by RM.', time: '1 hour ago', color: 'border-blue-400' },
    { id: 3, message: 'Client Jane Smith updated contact details.', time: 'Yesterday', color: 'border-yellow-400' },
  ];

  return (
    <DashboardLayout title={`Hello, ${user.name.split(' ')[0]}`} notificationCount={dummyAlerts.length}>
      <div className="space-y-8">
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleCreateNewLead}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Lead
          </Button>
          <Button 
            onClick={() => router.push('/leads')}
            variant="outline" 
            className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Go to Lead Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Quick Overview Cards (4) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dashboardCards.map((item, index) => (
            <Card key={index} className="transition-all hover:shadow-md border-2">
              <CardContent className="p-4 flex flex-col items-start space-y-2">
                <div className={item.bg + ' p-2 rounded-full'}>
                  <item.icon className={item.color + ' w-5 h-5'} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-600">{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Urgent Alerts
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dummyAlerts.map((alert) => (
              <Card key={alert.id} className={'border-l-4 ' + alert.color} onClick={() => router.push('/leads')}>
                <CardContent className="p-4 flex justify-between items-center cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                </CardContent>
              </Card>
            ))}
          </div>
          {dummyAlerts.length === 0 && (
            <Card className="text-center py-6 text-gray-500 border-dashed">
              <p>No urgent alerts right now.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

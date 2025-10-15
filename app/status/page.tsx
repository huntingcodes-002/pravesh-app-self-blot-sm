'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useLead, LeadStatus } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatusUpdatePage() {
    const { leads, updateLeadStatus } = useLead();
    const { toast } = useToast();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [newStatus, setNewStatus] = useState<LeadStatus>('Approved');
    const [isUpdating, setIsUpdating] = useState(false);

    // Filter leads that are ready for status updates (Submitted or Approved)
    const updateableLeads = leads.filter(l => l.status !== 'Draft' && l.status !== 'Rejected');
    
    // Filter by search term
    const filteredLeads = updateableLeads.filter(lead => 
        lead.appId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateStatus = () => {
        if (!selectedLeadId || !newStatus) return;

        setIsUpdating(true);
        // Simulate API delay
        setTimeout(() => {
            updateLeadStatus(selectedLeadId, newStatus);
            setIsUpdating(false);
            setSearchTerm('');
            setSelectedLeadId('');

            toast({
                title: 'Status Updated',
                description: `Application ${selectedLeadId} status set to ${newStatus}.`,
                className: 'bg-green-50 border-green-200'
            });

        }, 800);
    };

    const currentStatus = leads.find(l => l.id === selectedLeadId)?.status;

    return (
        <DashboardLayout title="Update Application Status">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="shadow-lg">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center space-x-3 border-b pb-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-semibold text-gray-900">Application Pipeline Management</h3>
                        </div>

                        {/* 1. Search/Select Application */}
                        <div>
                            <Label htmlFor="leadSearch" className="mb-2">Search or Select Application</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="leadSearch"
                                    placeholder="Enter App ID or Customer Name"
                                    className="pl-10 h-12"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedLeadId('');
                                    }}
                                />
                            </div>
                            
                            {/* Filtered Results Dropdown */}
                            {searchTerm && filteredLeads.length > 0 && (
                                <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-md">
                                    {filteredLeads.map((lead) => (
                                        <div 
                                            key={lead.id}
                                            onClick={() => {
                                                setSelectedLeadId(lead.id);
                                                setSearchTerm(lead.appId);
                                            }}
                                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm"
                                        >
                                            <span className="font-medium text-gray-900">{lead.appId}</span> - {lead.customerName} ({lead.status})
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchTerm && filteredLeads.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2 p-2">No results found.</p>
                            )}
                        </div>
                        
                        {/* 2. Display Current Status */}
                        {selectedLeadId && currentStatus && (
                            <div className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700">Current Status:</p>
                                <span className={cn("text-sm font-semibold px-3 py-1 rounded-full", currentStatus === 'Approved' ? 'bg-green-100 text-green-700' : currentStatus === 'Disbursed' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700')}>
                                    {currentStatus}
                                </span>
                            </div>
                        )}

                        {/* 3. Select New Status */}
                        <div>
                            <Label htmlFor="newStatus">Select New Status</Label>
                            <Select
                                value={newStatus}
                                onValueChange={(value) => setNewStatus(value as LeadStatus)}
                                disabled={!selectedLeadId || isUpdating}
                            >
                                <SelectTrigger id="newStatus" className="h-12">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Disbursed">Disbursed</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Status changes move the application to the next stage of the pipeline.</p>
                        </div>
                        
                        {/* 4. Action Button */}
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={!selectedLeadId || isUpdating || newStatus === currentStatus}
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            {isUpdating ? 'Updating...' : `Finalize Status Change to ${newStatus}`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Eye, Play, Edit, Calendar, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLead, Lead, LeadStatus } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ApplicationPreview from '@/components/ApplicationPreview';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { format } from 'date-fns'; // <-- IMPORTANT: Added format import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useEmblaCarousel from 'embla-carousel-react';

interface FilterState {
    startDate: Date | undefined;
    endDate: Date | undefined;
    status: LeadStatus | 'All';
}

// Helper function to render badge variant based on status
const getStatusBadge = (status: LeadStatus) => {
  const statusMap = {
    'Draft': 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    'Submitted': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'Approved': 'bg-green-100 text-green-700 hover:bg-green-200',
    'Disbursed': 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    'Rejected': 'bg-red-100 text-red-700 hover:bg-red-200',
  };
  return (
    <Badge className={cn('text-xs font-semibold uppercase px-3 py-1', statusMap[status] || statusMap['Draft'])}>
      {status}
    </Badge>
  );
};

// Summary Card Component for Carousel
const SummaryCard = ({ title, count, color, bg }: { title: string, count: number, color: string, bg: string }) => (
    <div className="min-w-[150px] sm:min-w-[unset] basis-1/3 flex-shrink-0 flex-grow-0 p-1">
        <Card className={cn("transition-all h-full border-2", bg)}>
            <CardContent className="p-4 flex flex-col items-start space-y-1">
                <p className={cn("text-xl font-bold", color)}>{count}</p>
                <p className="text-xs text-gray-600">{title}</p>
            </CardContent>
        </Card>
    </div>
);


export default function LeadsDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { leads, setCurrentLead, createLead, updateLeadStatus } = useLead();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<FilterState>({ startDate: undefined, endDate: undefined, status: 'All' });
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, skipSnaps: true, loop: false });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Embla Carousel Controls
  const onSelect = () => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (emblaApi) {
      onSelect();
      emblaApi.on('reInit', onSelect);
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi]);

  // Auth Redirect Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Combined Filter and Search Logic
  const filteredLeads = leads.filter((lead) => {
    const searchMatch =
        lead.appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customerMobile.includes(searchTerm);

    const statusMatch = filters.status === 'All' || lead.status === filters.status;

    const date = new Date(lead.createdAt);
    const startDateMatch = !filters.startDate || date >= filters.startDate;
    const endDateMatch = !filters.endDate || date <= filters.endDate;

    return searchMatch && statusMatch && startDateMatch && endDateMatch;
  });

  const handleStartLead = () => {
    createLead();
    router.push('/lead/step1');
  };

  const handleAction = (lead: Lead, action: 'view' | 'edit') => {
    setCurrentLead(lead);
    if (action === 'view') {
        setPreviewLead(lead); // Open preview modal
    } else {
        // Edit/Play navigates to the current step or starts review
        const path = lead.currentStep ? `/lead/step${lead.currentStep}` : `/lead/step1`;
        router.push(path);
    }
  };

  const handleClearFilters = () => {
      setFilters({ startDate: undefined, endDate: undefined, status: 'All' });
  };
  
  // Summary Data for Carousel
  const totalLeads = leads.length;
  const leadsInDraft = leads.filter(l => l.status === 'Draft').length;
  const leadsSubmitted = leads.filter(l => l.status === 'Submitted').length;
  const leadsApproved = leads.filter(l => l.status === 'Approved').length;
  const leadsRejected = leads.filter(l => l.status === 'Rejected').length;
  const leadsDisbursed = leads.filter(l => l.status === 'Disbursed').length;

  const dashboardCards = [
    { title: 'Total Leads', count: totalLeads, color: 'text-blue-900', bg: 'bg-blue-100' },
    { title: 'In Draft', count: leadsInDraft, color: 'text-gray-700', bg: 'bg-gray-100' },
    { title: 'Submitted', count: leadsSubmitted, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Approved', count: leadsApproved, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Rejected', count: leadsRejected, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Disbursed', count: leadsDisbursed, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout title="Lead Dashboard" showNotifications={false}>
      <Sheet open={previewLead !== null} onOpenChange={(open) => !open && setPreviewLead(null)}>
        {/* Preview Modal (Req 4) */}
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          {previewLead && <ApplicationPreview lead={previewLead} onClose={() => setPreviewLead(null)} />}
        </SheetContent>
      </Sheet>
      
      <div className="space-y-6">
        {/* Summary Carousel (Req 1) */}
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -mx-1">
                    {dashboardCards.map((item, index) => (
                        <SummaryCard key={index} {...item} />
                    ))}
                </div>
            </div>
            {/* Carousel Controls */}
            <Button 
                onClick={() => emblaApi?.scrollPrev()} 
                disabled={!canScrollPrev} 
                variant="outline" 
                size="icon" 
                className="absolute top-1/2 left-0 transform -translate-y-1/2 h-8 w-8 z-10 bg-white/70 backdrop-blur-sm"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
                onClick={() => emblaApi?.scrollNext()} 
                disabled={!canScrollNext} 
                variant="outline" 
                size="icon" 
                className="absolute top-1/2 right-0 transform -translate-y-1/2 h-8 w-8 z-10 bg-white/70 backdrop-blur-sm"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by App ID, Name, or Mobile"
              className="pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filter Button (Req 3) */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-12 shrink-0 p-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Filter className="w-5 h-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Filter Leads</h4>
                    
                    {/* Status Filter */}
                    <div>
                        <Label htmlFor="statusFilter">Status</Label>
                        <Select 
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value as LeadStatus | 'All' })}
                        >
                            <SelectTrigger id="statusFilter" className="h-10">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {['All', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Disbursed'].map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !filters.startDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {filters.startDate ? format(filters.startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={filters.startDate}
                                    onSelect={(date) => setFilters({ ...filters, startDate: date })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div>
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !filters.endDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {filters.endDate ? format(filters.endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={filters.endDate}
                                    onSelect={(date) => setFilters({ ...filters, endDate: date })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleClearFilters} variant="outline" className="w-full h-10 mt-2">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                </PopoverContent>
            </Popover>
        </div>

        {/* Lead List */}
        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No leads found matching your filters.</p>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left side: ID, Name, Mobile, Timestamp */}
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{lead.appId}</p>
                      <p className="text-sm font-medium text-gray-700">{lead.customerName || 'New Lead'}</p>
                      <p className="text-xs text-gray-500">{lead.customerMobile}</p>
                      {/* NEW: Updated Timestamp */}
                      <p className="text-xs text-gray-400">
                        Updated: {format(new Date(lead.updatedAt), 'd MMM yyyy, hh:mm a')}
                      </p>
                      <div className="pt-1">
                        {getStatusBadge(lead.status)}
                      </div>
                    </div>

                    {/* Right side: Actions (View, Play/Edit, Preview) */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAction(lead, 'view')}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full text-blue-600 hover:bg-blue-100"
                        title="Application Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button 
                        onClick={() => handleAction(lead, 'edit')}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full text-green-600 hover:bg-green-100"
                        title={lead.status === 'Draft' ? 'Continue Application' : 'Edit Details'}
                      >
                        {lead.status === 'Draft' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {/* Status Selection (Req 6) */}
                      {lead.status !== 'Draft' && (
                        <Select 
                            value={lead.status}
                            onValueChange={(newStatus) => lead.id && updateLeadStatus(lead.id, newStatus as LeadStatus)}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs font-semibold px-2">
                              <SelectValue placeholder={lead.status} />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Disbursed">Disbursed</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Floating Plus Button */}
        <Button
          onClick={handleStartLead}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700"
          title="Create New Lead"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </DashboardLayout>
  );
}

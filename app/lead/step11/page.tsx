'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, XCircle, Loader, Trash2, RotateCcw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLead } from '@/contexts/LeadContext';
import { validateFile } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  status: 'Processing' | 'Success' | 'Failed';
  error?: string;
}

export default function Step11Page() {
  const { currentLead, updateLead, submitLead } = useLead();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !documentType) {
      toast({
        title: 'Error',
        description: 'Please select a document type first',
        variant: 'destructive'
      });
      return;
    }

    const file = files[0];
    const fileId = Date.now().toString();

    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: documentType,
      status: 'Processing'
    };

    setUploadedFiles([...uploadedFiles, newFile]);

    toast({
      title: 'Processing',
      description: `Uploading ${file.name}...`
    });

    setTimeout(() => {
      const validation = validateFile(file.name);

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: validation.valid ? 'Success' : 'Failed',
                error: validation.error
              }
            : f
        )
      );

      if (validation.valid) {
        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully`,
          className: 'bg-green-50 border-green-200'
        });
      } else {
        toast({
          title: 'Failed',
          description: validation.error || 'File validation failed',
          variant: 'destructive'
        });
      }
    }, 1500);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, status: 'Processing' as const } : f))
    );

    setTimeout(() => {
      setUploadedFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'Success' as const, error: undefined } : f))
      );
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
        className: 'bg-green-50 border-green-200'
      });
    }, 1000);
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
  };

  const handleSaveDraft = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step11: { files: uploadedFiles }
      }
    });
    router.push('/leads');
  };

  const handleSubmitWithoutDocs = () => {
    if (!currentLead) return;
    submitLead(currentLead.id);
    toast({
      title: 'Success',
      description: 'Lead submitted without documents',
      className: 'bg-green-50 border-green-200'
    });
    setTimeout(() => router.push('/leads'), 1000);
  };

  const handleSaveAndContinue = () => {
    const requiredTypes = ['PAN', 'Adhaar', 'BankStatement', 'CollateralProperty'];
    const successFiles = uploadedFiles.filter(f => f.status === 'Success');
    const hasAllRequired = requiredTypes.every(type =>
      successFiles.some(f => f.name.toLowerCase().includes(type.toLowerCase().substring(0, 3)))
    );

    if (!hasAllRequired) {
      toast({
        title: 'Validation Failed',
        description: 'All 4 documents (PAN, Adhaar, Bank Statement, Collateral Property) must be successfully uploaded',
        variant: 'destructive'
      });
      return;
    }

    if (!currentLead) return;
    submitLead(currentLead.id);
    toast({
      title: 'Success',
      description: 'Lead submitted successfully with all documents',
      className: 'bg-green-50 border-green-200'
    });
    setTimeout(() => router.push('/leads'), 1000);
  };

  return (
    <DashboardLayout title="Document Upload" showNotifications={false}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">KYC Documents</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Select Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="h-12">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAN">PAN Card</SelectItem>
                    <SelectItem value="Adhaar">Adhaar Card</SelectItem>
                    <SelectItem value="BankStatement">Bank Statement</SelectItem>
                    <SelectItem value="CollateralProperty">Collateral Property Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                onClick={() => documentType && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  documentType
                    ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                    : 'border-gray-300 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <Upload className={`w-12 h-12 mx-auto mb-3 ${documentType ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`font-medium ${documentType ? 'text-blue-900' : 'text-gray-500'}`}>
                  {documentType ? 'Click to upload file' : 'Select document type first'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Valid filenames for demo:</p>
                <p>pan.jpg, adhaar.jpg, bankStm.pdf, colProp.jpg</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {file.status === 'Processing' && (
                                <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                              )}
                              {file.status === 'Success' && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              {file.status === 'Failed' && (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.type}</p>
                                {file.error && <p className="text-xs text-red-600 mt-1">{file.error}</p>}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-3">
                              {file.status === 'Failed' && (
                                <button
                                  onClick={() => handleRetry(file.id)}
                                  className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="h-12"
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitWithoutDocs}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Submit without Docs
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

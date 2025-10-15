
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, XCircle, Loader, Trash2, RotateCcw, Camera } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { validateFile } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  status: 'Processing' | 'Success' | 'Failed';
  error?: string;
  remark?: string;
}

export default function Step10Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentRemark, setDocumentRemark] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    currentLead?.formData?.step10?.files || []
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !documentType) {
      toast({
        title: 'Error',
        description: 'Please select a document type first',
        variant: 'destructive',
      });
      return;
    }

    const file = files[0];
    const fileId = Date.now().toString();

    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: documentType,
      status: 'Processing',
      remark: documentRemark,
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    toast({ title: 'Processing', description: `Uploading ${file.name}...` });

    setTimeout(() => {
      const validation = validateFile(file.name);

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: validation.valid ? 'Success' : 'Failed',
                error: validation.error,
              }
            : f
        )
      );

      if (validation.valid) {
        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully`,
          className: 'bg-green-50 border-green-200',
        });
      } else {
        toast({
          title: 'Failed',
          description: validation.error || 'File validation failed',
          variant: 'destructive',
        });
      }
    }, 1500);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setDocumentRemark('');
    setDocumentType('');
  };

  const startCamera = async () => {
    if (!documentType) {
        toast({
            title: 'Error',
            description: 'Please select a document type first',
            variant: 'destructive'
        });
        return;
    }
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({
        title: 'Camera Error',
        description: 'Could not access the camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };
  
  const captureImage = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');

            const fileId = Date.now().toString();
            const newFile: UploadedFile = {
              id: fileId,
              name: `capture_${fileId}.jpg`,
              type: documentType,
              status: 'Success', 
              remark: documentRemark,
            };

            setUploadedFiles((prev) => [...prev, newFile]);
            toast({
              title: 'Success',
              description: `${newFile.name} captured and uploaded.`,
              className: 'bg-green-50 border-green-200',
            });
        }
        
        stopCamera();
    }
  };
  
   const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  const handleRetry = (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'Processing' as const, error: undefined } : f))
    );

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'Success' as const, error: undefined } : f))
      );
      toast({
        title: 'Success',
        description: 'File re-uploaded successfully',
        className: 'bg-green-50 border-green-200',
      });
    }, 1000);
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId));
  };
  
  const handleSaveAndContinue = () => {
    const requiredTypes = ['PAN', 'Adhaar', 'BankStatement', 'CollateralProperty', 'CollateralPhotos'];
    const successFiles = uploadedFiles.filter(f => f.status === 'Success');
    
    const hasAllRequired = requiredTypes.every(type =>
      successFiles.some(f => f.type === type)
    );

    if (!hasAllRequired) {
      toast({
        title: 'Validation Failed',
        description: 'All 5 required documents must be successfully uploaded',
        variant: 'destructive'
      });
      return;
    }

    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step10: { files: uploadedFiles } 
      },
      currentStep: 11 
    });
    
    router.push('/lead/step11'); 
  };
  
  const handleContinueWithoutDocs = () => { 
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step10: { files: uploadedFiles }
      },
      currentStep: 11 
    });
    router.push('/lead/step11'); 
  };


  const handleExit = () => {
    if (!currentLead) {
      router.push('/leads');
      return;
    }
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step10: { files: uploadedFiles },
      },
      currentStep: 10,
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step9');
  };

  return (
    <DashboardLayout
      title="Document Upload"
      showNotifications={false}
      showExitButton={true}
      onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={10} totalSteps={11} />

        {isCameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay className="w-full max-w-md h-auto" />
            <div className="flex space-x-4 mt-4">
                <Button onClick={captureImage} className="bg-green-600 hover:bg-green-700">Capture</Button>
                <Button onClick={stopCamera} variant="destructive">Cancel</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 text-center">
              Upload documents for this lead if available. This step is optional but recommended for faster processing.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">KYC Documents</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Select Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="h-12">
                    <SelectValue placeholder="Choose document type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAN">PAN</SelectItem>
                    <SelectItem value="Adhaar">Aadhaar</SelectItem>
                    <SelectItem value="BankStatement">Income – Bank Statement</SelectItem>
                    <SelectItem value="CollateralProperty">Collateral – Ownership Proof</SelectItem>
                    <SelectItem value="CollateralPhotos">Collateral – Property Photos (Geo required)</SelectItem>
                    <SelectItem value="BusinessGST">Business – GST Certificate</SelectItem>
                    <SelectItem value="Other">Other Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {documentType && (
                <div>
                  <Label htmlFor="documentRemark">Add Note (Optional)</Label>
                  <Input
                    id="documentRemark"
                    type="text"
                    value={documentRemark}
                    onChange={(e) => setDocumentRemark(e.target.value)}
                    placeholder="e.g., Old GST, expires this year"
                    className="h-10"
                  />
                </div>
              )}

              {documentType && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Choose Upload Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 space-y-1 border-2 border-blue-300 hover:bg-blue-50"
                    >
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-xs font-medium text-center">Capture from Camera</span>
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 space-y-1 border-2 border-blue-300 hover:bg-blue-50"
                    >
                      <Upload className="w-6 h-6 text-blue-600" />
                      <span className="text-xs font-medium text-center">Select from Files</span>
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.pdf"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Valid filenames for demo:</p>
                <p>pan.jpg, adhaar.jpg, bankStm.pdf, colOwn.jpg, colPic.jpg</p>
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
                                {file.remark && <p className="text-xs text-gray-700 mt-1">Note: {file.remark}</p>}
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

          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} variant="outline" className="h-12 px-8">
              Previous
            </Button>
            <div className="grid grid-cols-2 gap-3 flex-1 ml-4">
              <Button
                onClick={handleContinueWithoutDocs}
                variant="outline"
                className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
              >
                Continue without Docs
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
      </div>
    </DashboardLayout>
  );
}

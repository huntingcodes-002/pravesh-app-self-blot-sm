
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, XCircle, Loader, Trash2, RotateCcw, Camera, AlertTriangle } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  status: 'Processing' | 'Success' | 'Failed';
  error?: string;
  remark?: string;
}

const ALL_DOC_TYPES = [
    { value: "PAN", label: "PAN" },
    { value: "Adhaar", label: "Aadhaar" },
    { value: "BankStatement", label: "Income – Bank Statement" },
    { value: "CollateralProperty", label: "Collateral – Ownership Proof" },
    { value: "CollateralPhotos", label: "Collateral – Property Photos (Geo required)" },
    { value: "BusinessGST", label: "Business – GST Certificate" },
    { value: "Other", label: "Other Document" },
];

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
  
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

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
            ? { ...f, status: validation.valid ? 'Success' : 'Failed', error: validation.error }
            : f
        )
      );
      toast({
        title: validation.valid ? 'Success' : 'Failed',
        description: validation.valid ? `${file.name} uploaded successfully` : validation.error || 'File validation failed',
        variant: validation.valid ? 'default' : 'destructive',
        className: validation.valid ? 'bg-green-50 border-green-200' : ''
      });
    }, 1500);

    if (fileInputRef.current) fileInputRef.current.value = '';
    setDocumentRemark('');
    setDocumentType('');
  };

  const startCamera = async () => {
    if (!documentType) {
        toast({ title: 'Error', description: 'Please select a document type first', variant: 'destructive' });
        return;
    }
    setCameraPermissionDenied(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraPermissionDenied(true);
      } else {
        toast({ title: 'Camera Error', description: 'Could not access the camera.', variant: 'destructive'});
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const captureImage = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const fileId = Date.now().toString();
            const newFile: UploadedFile = {
              id: fileId,
              name: `capture_${fileId}.jpg`,
              type: documentType,
              status: 'Success', // By default, camera captures are considered valid
              remark: documentRemark,
            };
            setUploadedFiles((prev) => [...prev, newFile]);
            toast({ title: 'Success', description: `${documentType} captured and uploaded.`, className: 'bg-green-50 border-green-200' });
        }
        stopCamera();
        setDocumentRemark('');
        setDocumentType('');
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
    // ... retry logic (unchanged)
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId));
  };
  
  const handleSaveAndContinue = () => {
    const requiredTypes = ['PAN', 'Adhaar', 'BankStatement', 'CollateralProperty', 'CollateralPhotos'];
    const successFiles = uploadedFiles.filter(f => f.status === 'Success');
    const hasAllRequired = requiredTypes.every(type => successFiles.some(f => f.type === type));

    if (!hasAllRequired) {
      toast({ title: 'Validation Failed', description: 'All 5 required documents must be successfully uploaded.', variant: 'destructive' });
      return;
    }
    if (!currentLead) return;
    updateLead(currentLead.id, { formData: { ...currentLead.formData, step10: { files: uploadedFiles } }, currentStep: 11 });
    router.push('/lead/step11'); 
  };
  
  const handleContinueWithoutDocs = () => { 
    if (!currentLead) return;
    updateLead(currentLead.id, { formData: { ...currentLead.formData, step10: { files: uploadedFiles } }, currentStep: 11 });
    router.push('/lead/step11'); 
  };

  const handleExit = () => {
    if (!currentLead) { router.push('/leads'); return; }
    updateLead(currentLead.id, { formData: { ...currentLead.formData, step10: { files: uploadedFiles } }, currentStep: 10 });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step9');
  };

  const availableDocTypes = ALL_DOC_TYPES.filter(
    docType => !uploadedFiles.some(file => file.type === docType.value && file.status === 'Success')
  );

  return (
    <DashboardLayout title="Document Upload" showNotifications={false} showExitButton={true} onExit={handleExit}>
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={10} totalSteps={11} />

        {isCameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg h-auto rounded-lg border-4 border-gray-600" />
            <div className="flex space-x-4 mt-4">
                <Button onClick={captureImage} className="bg-green-600 hover:bg-green-700">
                  <Camera className="w-4 h-4 mr-2" /> Capture
                </Button>
                <Button onClick={stopCamera} variant="destructive">Cancel</Button>
            </div>
          </div>
        )}

        <AlertDialog open={cameraPermissionDenied} onOpenChange={setCameraPermissionDenied}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" /> Camera Access Required</AlertDialogTitle>
              <AlertDialogDescription>
                Please allow camera access in your browser settings to capture documents directly from your device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setCameraPermissionDenied(false)}>Close</Button>
              <AlertDialogAction onClick={() => { setCameraPermissionDenied(false); startCamera(); }}>
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
           <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">KYC & Other Documents</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Select Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="h-12"><SelectValue placeholder="Choose document type..." /></SelectTrigger>
                  <SelectContent>
                    {availableDocTypes.map(doc => (
                        <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {documentType && (
                <div>
                  <Label htmlFor="documentRemark">Add Note (Optional)</Label>
                  <Input id="documentRemark" type="text" value={documentRemark} onChange={(e) => setDocumentRemark(e.target.value)} placeholder="e.g., Old GST, expires this year" className="h-10" />
                </div>
              )}

              {documentType && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Choose Upload Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={startCamera} variant="outline" className="flex flex-col items-center justify-center h-20 space-y-1 border-2 border-blue-300 hover:bg-blue-50">
                            <Camera className="w-6 h-6 text-blue-600" />
                            <span className="text-xs font-medium text-center">Capture from Camera</span>
                        </Button>
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex flex-col items-center justify-center h-20 space-y-1 border-2 border-blue-300 hover:bg-blue-50">
                            <Upload className="w-6 h-6 text-blue-600" />
                            <span className="text-xs font-medium text-center">Select from Files</span>
                        </Button>
                    </div>
                  </div>
              )}
              
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".jpg,.jpeg,.png,.pdf" />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Valid filenames for demo:</p>
                <p>pan.jpg, adhaar.jpg, bankStm.pdf, colOwn.jpg, colPic.jpg</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 my-4">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <Card key={file.id} className={
                        file.status === 'Success' ? 'border-green-200' :
                        file.status === 'Failed' ? 'border-red-200' :
                        'border-blue-200'
                      }>
                        <CardContent className="p-3">
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
                            <div className="flex space-x-1 ml-2">
                              {file.status === 'Failed' && (
                                <Button variant="ghost" size="icon" onClick={() => handleRetry(file.id)} className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100">
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)} className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

          <div className="flex flex-col gap-3 pt-4">
            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="h-auto min-h-12 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 text-center"
            >
              Previous
            </Button>

            {/* Continue without Docs */}
            <Button
              onClick={handleContinueWithoutDocs}
              variant="outline"
              className="h-auto min-h-12 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 text-center"
            >
              Continue without Docs
            </Button>

            {/* Save & Continue */}
            <Button
              onClick={handleSaveAndContinue}
              className="h-auto min-h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center"
            >
              Save & Continue
            </Button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

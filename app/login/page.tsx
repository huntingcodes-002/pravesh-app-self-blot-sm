'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MOCK_USER } from '@/lib/mock-auth';

const formSchema = z.object({
  email: z.string().email({
    message: 'Enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: MOCK_USER.email,
      password: MOCK_USER.password,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    const success = await login(data.email, data.password);

    if (success) {
      toast({
        title: 'Login Successful',
        description: 'Redirecting to OTP verification.',
        className: 'bg-green-50 border-green-200',
      });
      // Redirect to the OTP page after successful password check
      router.push('/otp');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <LogIn className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">Saarathi Finance</CardTitle>
          <CardDescription>
            Enter your credentials to access the Lead Management System.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="rm1@rm.com"
                        type="email"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          className="h-12 pr-10"
                          {...field}
                        />
                         <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 font-semibold">
                Continue
              </Button>
              <div className="text-center text-xs text-gray-500 pt-2">
                Use mock credentials: 
                <span className="font-semibold"> {MOCK_USER.email} / {MOCK_USER.password}</span>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export const MOCK_USER = {
  email: 'rm1@rm.com',
  password: '12qwaszx',
  name: 'Albert Einstein',
  rmId: 'RM-MH-MU-AE201',
  phone: '911'
};

export const MOCK_OTP = '342286';

export const VALID_PAN = 'AFZPK7190K';

export const VALID_FILES = {
  'pan.jpg': 'PAN',
  'adhaar.jpg': 'Adhaar',
  'bankStm.pdf': 'BankStatement',
  'colProp.jpg': 'CollateralProperty'
};

export function validatePAN(pan: string): boolean {
  return pan.toUpperCase() === VALID_PAN;
}

export function validateOTP(otp: string): boolean {
  return otp === MOCK_OTP;
}

export function validateLogin(email: string, password: string): boolean {
  return email === MOCK_USER.email && password === MOCK_USER.password;
}

export function validateFile(fileName: string): { valid: boolean; error?: string; type?: string } {
  const file = VALID_FILES[fileName as keyof typeof VALID_FILES];
  if (file) {
    return { valid: true, type: file };
  }
  return { valid: false, error: 'File name is invalid.' };
}

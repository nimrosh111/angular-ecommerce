// src/app/models/auth.models.ts
export interface LoginResponse {
    jwtToken: string;
    customerId: string;  // Assuming your response has customerId
    role: string; 
  }
  
  export interface RegisterResponse {
    message: string;
    customer: any;  // Replace with your actual customer model
  }
  
#!/bin/bash

echo "🚀 Starting Next.js Frontend Setup for PTC Training Portal..."

# 1. Install Dependencies
echo "📦 Installing required dependencies..."
npm install axios lucide-react clsx tailwind-merge react-hook-form

# 2. Create Directory Structure
echo "📁 Creating folder architecture..."
mkdir -p src/app/trainings/[id]
mkdir -p src/app/admin/dashboard
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/trainings
mkdir -p src/components/admin
mkdir -p src/lib
mkdir -p src/types

# 3. Create Type Definitions for Backend .NET Contract
echo "📝 Creating TypeScript Interfaces (src/types/index.ts)..."
cat << 'EOF' > src/types/index.ts
export interface Training {
  id: number;
  title: string;
  category: string;
  description: string;
  startDate: string;
  duration: string;
  location: string;
  quota: number;
  availableSeats: number;
  imageUrl?: string;
}

export interface Booking {
  id: number;
  trainingId: number;
  trainingTitle?: string;
  employeeName: string;
  nip: string;
  department: string;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface CreateBookingPayload {
  trainingId: number;
  employeeName: string;
  nip: string;
  department: string;
  email: string;
}
EOF

# 4. Create Axios API Client Configuration
echo "🔌 Creating API Client configuration (src/lib/api.ts)..."
cat << 'EOF' > src/lib/api.ts
import axios from 'axios';

// Ganti URL sesuai port Backend .NET temanmu (biasanya https://localhost:7001 atau http://localhost:5000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Helper Services
export const TrainingService = {
  getAll: async () => (await apiClient.get('/trainings')).data,
  getById: async (id: string | number) => (await apiClient.get(`/trainings/${id}`)).data,
};

export const BookingService = {
  getAll: async () => (await apiClient.get('/bookings')).data,
  create: async (data: any) => (await apiClient.post('/bookings', data)).data,
  updateStatus: async (id: number, status: 'Approved' | 'Rejected') => 
    (await apiClient.put(`/bookings/${id}/status`, { status })).data,
  delete: async (id: number) => (await apiClient.delete(`/bookings/${id}`)).data,
};
EOF

# 5. Add Environment Variable Sample
echo "⚙️ Creating .env.local file..."
cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

echo "✅ Setup Completed Successfully! Ready to build frontend pages."
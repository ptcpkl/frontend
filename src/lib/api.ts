import axios from 'axios';
import type { Booking, BookingStatus, CreateBookingDto, Training } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MOCK_TRAININGS: Training[] = [
  {
    id: 1,
    title: 'HSE Leadership & Safety Culture',
    category: 'HSE',
    description:
      'Program pelatihan untuk membangun budaya keselamatan kerja dan kepemimpinan HSE di lingkungan operasional Pertamina.',
    syllabus:
      '1. Prinsip Dasar HSE Leadership\n2. Safety Culture Assessment\n3. Incident Investigation & Root Cause Analysis\n4. Behavioral Based Safety (BBS)\n5. HSE Management System (SMK3)',
    startDate: '2026-09-14T08:00:00',
    duration: '5 Hari',
    location: 'Jakarta Training Center',
    quota: 30,
    availableSeats: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Strategic Leadership for Managers',
    category: 'Leadership',
    description:
      'Mengasah kemampuan kepemimpinan strategis bagi para manajer untuk menghadapi tantangan bisnis energi modern.',
    syllabus:
      '1. Strategic Thinking & Decision Making\n2. Change Management\n3. High Performance Team Building\n4. Executive Communication\n5. Coaching & Mentoring',
    startDate: '2026-10-05T08:00:00',
    duration: '4 Hari',
    location: 'Balikpapan Training Center',
    quota: 25,
    availableSeats: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Data Analytics & Business Intelligence',
    category: 'IT & Energy',
    description:
      'Pelatihan analisis data dan business intelligence untuk mendukung pengambilan keputusan berbasis data di sektor energi.',
    syllabus:
      '1. Data Fundamentals & SQL\n2. Data Visualization with Power BI\n3. Statistical Analysis for Business\n4. Machine Learning Essentials\n5. Energy Data Case Study',
    startDate: '2026-11-02T08:00:00',
    duration: '5 Hari',
    location: 'Surabaya Training Center',
    quota: 20,
    availableSeats: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    title: 'Process Safety Management (PSM)',
    category: 'HSE',
    description:
      'Pelatihan komprehensif tentang manajemen keselamatan proses untuk industri migas dan petrokimia.',
    syllabus:
      '1. PSM Framework & Regulations\n2. Hazard Identification & Risk Assessment\n3. Process Hazard Analysis (PHA)\n4. Emergency Response Planning\n5. PSM Audit & Compliance',
    startDate: '2026-12-07T08:00:00',
    duration: '5 Hari',
    location: 'Cilacap Training Center',
    quota: 25,
    availableSeats: 0,
    imageUrl:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    title: 'Digital Transformation in Energy Sector',
    category: 'IT & Energy',
    description:
      'Memahami strategi transformasi digital dan implementasi teknologi baru di industri energi.',
    syllabus:
      '1. Digital Strategy Framework\n2. IoT & Smart Energy\n3. Cloud Computing for Energy\n4. Cybersecurity Fundamentals\n5. Digital Transformation Roadmap',
    startDate: '2027-01-18T08:00:00',
    duration: '3 Hari',
    location: 'Jakarta Training Center',
    quota: 35,
    availableSeats: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: 'Effective Supervisory Management',
    category: 'Leadership',
    description:
      'Pelatihan manajemen supervisi untuk meningkatkan efektivitas pengawasan dan kinerja tim di lapangan.',
    syllabus:
      '1. Supervisory Roles & Responsibilities\n2. Effective Delegation\n3. Performance Management\n4. Conflict Resolution\n5. Team Motivation',
    startDate: '2027-02-08T08:00:00',
    duration: '4 Hari',
    location: 'Palembang Training Center',
    quota: 30,
    availableSeats: 22,
    imageUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    trainingId: 1,
    trainingTitle: 'HSE Leadership & Safety Culture',
    employeeName: 'Budi Santoso',
    nip: '12345678',
    department: 'HSSE Department',
    email: 'budi.santoso@pertamina.com',
    status: 'Pending',
    createdAt: '2026-08-01T09:30:00',
  },
  {
    id: 5,
    trainingId: 2,
    trainingTitle: 'Strategic Leadership for Managers',
    employeeName: 'Berq Pratama',
    nip: '99887766',
    department: 'Information Technology (IT)',
    email: 'berq@pertamina.com',
    status: 'Approved',
    createdAt: '2026-08-05T11:00:00',
  },
  {
    id: 6,
    trainingId: 3,
    trainingTitle: 'Data Analytics & Business Intelligence',
    employeeName: 'Berq Pratama',
    nip: '99887766',
    department: 'Information Technology (IT)',
    email: 'berq@pertamina.com',
    status: 'Pending',
    createdAt: '2026-08-06T09:15:00',
  },
  {
    id: 2,
    trainingId: 2,
    trainingTitle: 'Strategic Leadership for Managers',
    employeeName: 'Siti Rahayu',
    nip: '87654321',
    department: 'HR Department',
    email: 'siti.rahayu@pertamina.com',
    status: 'Approved',
    createdAt: '2026-08-02T14:15:00',
  },
  {
    id: 3,
    trainingId: 3,
    trainingTitle: 'Data Analytics & Business Intelligence',
    employeeName: 'Andi Wijaya',
    nip: '11223344',
    department: 'IT Department',
    email: 'andi.wijaya@pertamina.com',
    status: 'Rejected',
    createdAt: '2026-08-03T10:45:00',
  },
  {
    id: 4,
    trainingId: 1,
    trainingTitle: 'HSE Leadership & Safety Culture',
    employeeName: 'Dewi Lestari',
    nip: '55667788',
    department: 'Operations Department',
    email: 'dewi.lestari@pertamina.com',
    status: 'Pending',
    createdAt: '2026-08-04T08:20:00',
  },
];

const MOCK_DELAY = 600;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));
}

export const TrainingService = {
  getAll: async (): Promise<Training[]> => {
    try {
      const response = await apiClient.get<Training[]>('/trainings');
      return response.data;
    } catch {
      return delay(MOCK_TRAININGS);
    }
  },
  getById: async (id: string | number): Promise<Training> => {
    try {
      const response = await apiClient.get<Training>(`/trainings/${id}`);
      return response.data;
    } catch {
      const training = MOCK_TRAININGS.find((item) => item.id === Number(id));
      if (!training) {
        throw new Error(`Training with id ${id} not found`);
      }
      return delay(training);
    }
  },
};

export const BookingService = {
  getAll: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>('/bookings');
      return response.data;
    } catch {
      return delay(MOCK_BOOKINGS);
    }
  },
  getByEmail: async (email: string): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>('/bookings', { params: { email } });
      return response.data;
    } catch {
      const filtered = MOCK_BOOKINGS.filter(
        (booking) => booking.email.toLowerCase() === email.toLowerCase(),
      );
      return delay(filtered);
    }
  },
  create: async (data: CreateBookingDto): Promise<Booking> => {
    try {
      const response = await apiClient.post<Booking>('/bookings', data);
      return response.data;
    } catch {
      const training = MOCK_TRAININGS.find((item) => item.id === data.trainingId);
      const newBooking: Booking = {
        id: MOCK_BOOKINGS.length + 1,
        trainingId: data.trainingId,
        trainingTitle: training?.title,
        employeeName: data.employeeName,
        nip: data.nip,
        department: data.department,
        email: data.email,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      MOCK_BOOKINGS.unshift(newBooking);
      return delay(newBooking);
    }
  },
  updateStatus: async (id: number, status: BookingStatus): Promise<Booking> => {
    try {
      const response = await apiClient.put<Booking>(`/bookings/${id}/status`, { status });
      return response.data;
    } catch {
      const booking = MOCK_BOOKINGS.find((item) => item.id === id);
      if (!booking) {
        throw new Error(`Booking with id ${id} not found`);
      }
      const updated = { ...booking, status };
      const index = MOCK_BOOKINGS.findIndex((item) => item.id === id);
      MOCK_BOOKINGS[index] = updated;
      return delay(updated);
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/bookings/${id}`);
    } catch {
      const index = MOCK_BOOKINGS.findIndex((item) => item.id === id);
      if (index !== -1) {
        MOCK_BOOKINGS.splice(index, 1);
      }
      await delay(undefined);
    }
  },
};
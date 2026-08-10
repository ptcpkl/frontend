export interface Training {
  id: number;
  title: string;
  category: string;
  description: string;
  syllabus: string;
  startDate: string;
  duration: string;
  location: string;
  quota: number;
  availableSeats: number;
  imageUrl?: string;
}

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Booking {
  id: number;
  trainingId: number;
  trainingTitle?: string;
  employeeName: string;
  nip: string;
  department: string;
  email: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingDto {
  trainingId: number;
  employeeName: string;
  nip: string;
  department: string;
  email: string;
}
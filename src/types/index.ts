export interface Training {
  id: number;
  title: string;
  category: string;
  description: string;
  syllabus: string;
  location: string;
  startDate: string;
  endDate: string;
  quota: number;
  availableSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type TrainingInput = Pick<
  Training,
  'title' | 'category' | 'description' | 'syllabus' | 'location' | 'startDate' | 'endDate' | 'quota' | 'status'
>;

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Booking {
  id: number;
  trainingId: number;
  userId: number | null;
  trainingTitle: string;
  fullName: string;
  nip: string;
  department: string;
  email: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  trainingId: number;
}

export interface DashboardSummary {
  totalTrainings: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  popularTrainings: Array<{
    trainingId: number;
    title: string;
    participantCount: number;
  }>;
}

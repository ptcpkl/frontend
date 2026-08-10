import { NextResponse } from 'next/server';
import { DEPARTMENTS } from '@/lib/auth';

// In-memory store for registered users (demo purposes)
// In production, this would be handled by the backend .NET Web API
const registeredUsers = new Map<string, { name: string; email: string; nip: string; department: string; password: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, nip, department, password } = body;

    // Validate required fields
    if (!name || !email || !nip || !department || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[a-zA-Z0-9._%+-]+@pertamina\.com$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Gunakan email Pertamina (@pertamina.com).' },
        { status: 400 },
      );
    }

    // Validate NIP format
    if (!/^\d{6,20}$/.test(nip)) {
      return NextResponse.json(
        { success: false, message: 'NIP harus berupa angka 6–20 digit.' },
        { status: 400 },
      );
    }

    // Validate department is in the allowed list
    if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
      return NextResponse.json(
        { success: false, message: 'Departemen tidak valid.' },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 8 karakter.' },
        { status: 400 },
      );
    }

    // Check if email already registered
    if (registeredUsers.has(email)) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 409 },
      );
    }

    // Store the user (demo only - in production this goes to the backend)
    registeredUsers.set(email, { name, email, nip, department, password });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 },
    );
  }
}
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'جديد' | 'محتمل' | 'دائم';
  tags: string[];
  createdAt: string;
  lastContact?: string;
  notes?: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'مكالمة' | 'مقابلة' | 'إيميل' | 'رسالة';
  date: string;
  duration?: number;
  outcome: 'إيجابي' | 'سلبي' | 'محايد';
  notes: string;
  nextAction?: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  value: number;
  status: 'جاري' | 'مغلق' | 'مرفوض';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  notes?: string;
  rejectionReason?: string;
}

export interface Task {
  id: string;
  title: string;
  customerId?: string;
  description: string;
  dueDate: string;
  priority: 'عالي' | 'متوسط' | 'منخفض';
  status: 'قيد الانتظار' | 'جاري' | 'مكتمل';
  createdAt: string;
}

export interface Settings {
  language: 'ar' | 'en';
  currency: 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED';
  theme: 'default' | 'green' | 'purple' | 'orange';
  darkMode: boolean;
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}
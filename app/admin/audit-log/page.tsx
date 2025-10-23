import { AuditLogPageClient } from "./audit-log-client"
import { getUserData } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getProducts } from '@/components/cashier/cashier-action';
import { getAuditLogs, getStockLogs } from '@/components/audit-log/audit-log-action';
import type { AuditLog, StockLog } from '@/components/audit-log/audit-log-action';
import type { Product } from '@/components/cashier/cashier-action';

interface ExtendedUserData {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    role?: string
  }
}

export default async function AuditLogPage() {
  const userData = await getUserData() as ExtendedUserData;

  if (!userData) {
    redirect('/login');
  }

  // Fetch data for audit logs
  let auditLogs: AuditLog[] = [];
  let stockLogs: StockLog[] = [];
  let products: Product[] = [];

  try {
    [auditLogs, stockLogs, products] = await Promise.all([
      getAuditLogs(100),
      getStockLogs(100),
      getProducts()
    ]);
  } catch (error) {
    console.error('Error fetching audit log data:', error);
  }

  return (
    <AuditLogPageClient
      initialProducts={products}
      userData={{
        id: userData.id,
        email: userData.email || '',
        full_name: userData.user_metadata?.full_name || userData.email || '',
        role: userData.user_metadata?.role || 'user'
      }}
      initialAuditLogs={auditLogs}
      initialStockLogs={stockLogs}
    />
  )
}
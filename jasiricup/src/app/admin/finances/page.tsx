// src/app/admin/finances/page.tsx
import FinancesClient from "./FinancesClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Financial Dashboard | Admin',
  description: 'Manage JaSiriCup finances, donations, and expenses.',
};

export default function FinancesPage() {
  return <FinancesClient />;
}
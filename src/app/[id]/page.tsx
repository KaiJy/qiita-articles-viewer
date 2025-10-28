'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/templates/MainLayout';
import { ItemDetail } from '@/components/organisms/ItemDetail';

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;

  return (
    <MainLayout>
      <ItemDetail itemId={itemId} />
    </MainLayout>
  );
}

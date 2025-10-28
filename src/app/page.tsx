'use client';

import { MainLayout } from '@/components/templates/MainLayout';
import { ItemList } from '@/components/organisms/ItemList';

export default function Home() {
  return (
    <MainLayout>
      <ItemList />
    </MainLayout>
  );
}
'use client';

import { ProgressDashboard } from '@/components/Gamification';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Mijn Voortgang</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bekijk je achievements, badges en skill progression
        </p>
        
        <ProgressDashboard />
      </div>
    </div>
  );
}
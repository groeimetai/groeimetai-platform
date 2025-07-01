'use client';

import { ApiPlayground } from '@/components/ApiPlayground';

export default function ApiSandboxDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <ApiPlayground 
        courseId="demo-course" 
        initialProvider="openai"
        initialEndpoint="/chat/completions"
      />
    </div>
  );
}
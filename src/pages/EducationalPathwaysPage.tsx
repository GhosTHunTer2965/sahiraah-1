import React from 'react';
import { EducationalPathways } from '@/components/EducationalPathways';

const EducationalPathwaysPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Educational Pathways</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore structured career pathways from your current education level to your dream job. 
          Get step-by-step guidance, timelines, and actionable roadmaps for various career fields.
        </p>
      </div>
      <EducationalPathways />
    </div>
  );
};

export default EducationalPathwaysPage;
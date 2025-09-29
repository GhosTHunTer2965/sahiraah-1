import React from 'react';
import { CollegeExplorer } from '@/components/CollegeExplorer';

const CollegeExplorerPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">College Explorer</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover top colleges and universities across India. Find detailed information about courses, 
          admission requirements, rankings, and more to make informed decisions about your education.
        </p>
      </div>
      <CollegeExplorer />
    </div>
  );
};

export default CollegeExplorerPage;
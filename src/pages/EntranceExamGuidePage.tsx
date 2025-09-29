import React from 'react';
import { EntranceExamGuide } from '@/components/EntranceExamGuide';

const EntranceExamGuidePage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Entrance Exam Guide</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Comprehensive guide to entrance exams across different fields. Get exam patterns, 
          syllabus, preparation strategies, and important dates for JEE, NEET, GATE, and more.
        </p>
      </div>
      <EntranceExamGuide />
    </div>
  );
};

export default EntranceExamGuidePage;
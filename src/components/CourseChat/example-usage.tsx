import React from 'react';
import { CourseChat } from './index';

// Example usage of the CourseChat component
const ExamplePage: React.FC = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px',
        height: '600px'
      }}>
        <CourseChat />
      </div>
    </div>
  );
};

export default ExamplePage;

// Note: You'll need to install these dependencies:
// npm install react-markdown react-syntax-highlighter
// npm install --save-dev @types/react-syntax-highlighter
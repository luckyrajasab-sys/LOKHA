import React from 'react';
import { SignUpForm } from '../components/auth/SignUpForm';

interface SignUpPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSuccess, onNavigateToLogin }) => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 12rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.25rem'
    }}>
      <SignUpForm
        onSuccess={onSuccess}
        onNavigateToLogin={onNavigateToLogin}
      />
    </div>
  );
};

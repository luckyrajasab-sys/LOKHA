import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToSignUp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateToSignUp }) => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 12rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.25rem'
    }}>
      <LoginForm
        onSuccess={onSuccess}
        onNavigateToSignUp={onNavigateToSignUp}
      />
    </div>
  );
};

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { BuilderOffersSection } from '../components/home/BuilderOffersSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { TrustSection } from '../components/home/TrustSection';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const handleSearch = (_params: any) => {
    // Navigate to properties exploration view
    onNavigate('properties');
  };

  return (
    <main>
      <HeroSection onSearch={handleSearch} />
      <BuilderOffersSection />
      <FeaturedSection />
      <TrustSection />
    </main>
  );
};

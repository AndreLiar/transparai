//src/components/LandingComponents/FeatureSection.tsx
// src/components/LandingComponents/FeatureSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './FeatureSection.css';

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  ctaVariant?: 'primary' | 'outline';
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  image,
  ctaText,
  ctaLink,
  ctaVariant = 'primary',
  reverse = false,
}) => {
  return (
    <section className={`feature-section ${reverse ? 'reverse' : ''}`}>
      <div className="feature-content">
        <div className="feature-text">
          <h3>{title}</h3>
          <p>{description}</p>
          <Link to={ctaLink} className={`btn ${ctaVariant}`}>
            {ctaText}
          </Link>
        </div>
        <div className="feature-image">
          <img src={image} alt={title} />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

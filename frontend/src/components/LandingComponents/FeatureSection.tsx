//src/components/LandingComponents/FeatureSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  ctaVariant?: string; // Bootstrap variant, e.g., 'primary', 'outline-secondary'
  bg?: string;          // Optional background color class, e.g., 'bg-light'
  reverse?: boolean;    // Reverse layout: image on right
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  image,
  ctaText,
  ctaLink,
  ctaVariant = 'primary',
  bg = 'bg-white',
  reverse = false
}) => {
  return (
    <section className={`py-5 ${bg}`}>
      <div className="container d-flex flex-column flex-md-row align-items-center">
        {reverse ? (
          <>
            <div className="col-md-6 pe-md-5 order-md-2 mb-4 mb-md-0">
              <img src={image} alt={title} className="img-fluid" />
            </div>
            <div className="col-md-6 order-md-1">
              <h3>{title}</h3>
              <p className="lead">{description}</p>
              <Link to={ctaLink} className={`btn btn-${ctaVariant} mt-3`}>
                {ctaText}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="col-md-6 mb-4 mb-md-0">
              <img src={image} alt={title} className="img-fluid" />
            </div>
            <div className="col-md-6 ps-md-5">
              <h3>{title}</h3>
              <p className="lead">{description}</p>
              <Link to={ctaLink} className={`btn btn-${ctaVariant} mt-3`}>
                {ctaText}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeatureSection;

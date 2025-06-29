import React from 'react';
import "../../assets/styles/client/HowItWork.css";
import { motion } from 'framer-motion';
import { UserPlus, Upload, Gavel, CreditCard, Star } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Sign Up',
    icon: <UserPlus size={28} />,
    description: 'Create a free account as a buyer or a seller to join the Bidit community.',
  },
  {
    number: 2,
    title: 'List or Browse Items',
    icon: <Upload size={28} />,
    description: 'If you\'re a seller, list your item for auction. If you\'re a buyer, explore active listings and find what you\'re interested in.',
  },
  {
    number: 3,
    title: 'Start Bidding',
    icon: <Gavel size={28} />,
    description: 'Place your bids before the auction ends. Stay updated in real time and increase your chances of winning.',
  },
  {
    number: 4,
    title: 'Win & Pay',
    icon: <CreditCard size={28} />,
    description: 'If you win an auction, complete the payment securely through our platform and get your item delivered.',
  },
  {
    number: 5,
    title: 'Rate the Experience',
    icon: <Star size={28} />,
    description: 'Both buyers and sellers can leave ratings to build trust within the community.',
  },
];

const HowItWork = () => {
  return (
    <div className="how-it-work-container">
      <header className="how-it-work-hero">
        <h1>How Bidit Works</h1>
        <p>Understand the simple steps to start bidding or selling today.</p>
      </header>

      <section className="how-it-work-section">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className="how-it-work-step"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="how-it-work-step-header">
              <div className="how-it-work-step-number">{step.number}</div>
              <div className="how-it-work-step-title">
                {step.icon}
                <h2>{step.title}</h2>
              </div>
            </div>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default HowItWork;

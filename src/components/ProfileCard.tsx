import React from 'react';
import { Phone, MessageCircle, Camera } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  loves: number;
  isVerified?: boolean;
  isClub?: boolean;
  description?: string;
  price?: string;
  membershipTier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
  hideText?: boolean;
  hideText?: boolean;
}

const tierStyles = {
  FREE: {
    card: 'bg-white',
    badge: 'bg-gray-500',
    name: 'text-gray-800',
    buttons: 'bg-gray-500 hover:bg-gray-600',
    heart: 'text-gray-500'
  },
  PROMO: {
    card: 'bg-white',
    badge: 'bg-pink-500',
    name: 'text-pink-500',
    buttons: 'bg-pink-500 hover:bg-pink-600',
    heart: 'text-pink-500'
  },
  PRO: {
    card: 'bg-white',
    badge: 'bg-pink-500',
    name: 'text-pink-500',
    buttons: 'bg-pink-500 hover:bg-pink-600', 
    heart: 'text-pink-500'
  },
  'PRO-PLUS': {
    card: 'bg-gradient-to-br from-pink-100 to-pink-50',
    badge: 'bg-pink-500',
    name: 'text-pink-600 font-semibold',
    buttons: 'bg-pink-500 hover:bg-pink-600',
    heart: 'text-pink-500',
    border: 'border-2 border-pink-300'
  },
  ULTRA: {
    card: 'bg-yellow-50 border-2 border-yellow-400',
    badge: 'bg-pink-500',
    name: 'text-pink-500 font-bold',
    buttons: 'bg-pink-500 hover:bg-pink-600',
    heart: 'text-pink-500'
  }
};

export default function ProfileCard({
  name,
  location,
  imageUrl,
  rating,
  loves,
  isVerified = false,
  isClub = false,
  description,
  price,
  membershipTier = 'FREE',
  hideText = false
}: ProfileCardProps) {
  const styles = tierStyles[membershipTier];

  return (
    <div className={`${styles.card} ${membershipTier === 'PRO-PLUS' ? styles.border : ''} rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${membershipTier === 'ULTRA' ? 'hover:border-yellow-500' : ''} h-[500px]`}>
      <div className="relative">
        {price && (
          <div className={`absolute top-0 right-0 ${styles.badge} text-white px-4 py-1 rounded-bl-lg transform transition-all duration-300 hover:scale-110 font-medium`}>
            <div className="absolute top-0 right-0 -translate-y-full translate-x-1/2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="h-3 w-3" />
              <span>8</span>
            </div>
            {price}
            <div className="absolute top-0 right-0 -translate-y-full translate-x-1/2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="h-3 w-3" />
              <span>8</span>
            </div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={name}
          className={`w-full ${hideText ? 'h-[500px]' : 'h-80'} object-cover transition-all duration-300 hover:brightness-110 ${membershipTier === 'ULTRA' ? 'hover:contrast-[1.02]' : ''}`}
        />
        {hideText && (
          <div className="absolute bottom-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-lg text-sm transform transition-all duration-300 hover:scale-110">
            PROMO
          </div>
        )}
        <div className={`absolute top-2 left-2 ${styles.badge} text-white px-3 py-1 rounded-lg flex items-center`}>
          {!hideText && <span className="text-xl font-bold">{rating}</span>}
        </div>
        {isVerified && (
          <div className="absolute top-2 left-20 bg-green-500 text-white px-2 py-1 rounded-lg text-sm transform transition-all duration-300 hover:scale-110 hover:bg-green-600">
            Verified ✓
          </div>
        )}
      </div>
      {!hideText && <div className="p-4 relative">
        {(membershipTier === 'ULTRA' || membershipTier === 'PRO-PLUS' || membershipTier === 'PRO' || membershipTier === 'PROMO') && (
          <div className={`absolute -top-4 right-4 ${
            membershipTier === 'ULTRA' ? 'bg-pink-500' : 
            membershipTier === 'PRO-PLUS' ? 'bg-pink-400' :
            membershipTier === 'PROMO' ? 'bg-pink-300' :
            'bg-pink-300'
          } text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-md transform transition-all duration-300 hover:scale-105`}>
            {membershipTier}
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-xl font-semibold ${styles.name} transition-colors duration-300`}>{name}</h3>
          <span className="text-gray-500">{location}</span>
        </div>
        {description && membershipTier !== 'FREE' && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span className={`${styles.heart} transition-transform duration-300 hover:scale-125 inline-block`}>❤</span>
            <span className="text-gray-600">{loves} Loves</span>
          </div>
          <div className="flex space-x-2">
            <button className={`p-2 rounded-full ${styles.buttons} text-white transform transition-all duration-300 hover:scale-110 hover:rotate-12`}>
              <Phone className="h-5 w-5" />
            </button>
            <button className={`p-2 rounded-full ${styles.buttons} text-white transform transition-all duration-300 hover:scale-110 hover:-rotate-12`}>
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
}
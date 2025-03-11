import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
          <span className="text-lg font-bold text-blue-600">${ad.price.toLocaleString()}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{ad.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{ad.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Car, Smartphone, Sofa, Home, Briefcase, Wrench } from 'lucide-react';
import { categories } from '../data';

const iconMap = {
  car: Car,
  smartphone: Smartphone,
  sofa: Sofa,
  home: Home,
  briefcase: Briefcase,
  wrench: Wrench,
};

export default function CategoryList() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap];
        return (
          <button
            key={category.id}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
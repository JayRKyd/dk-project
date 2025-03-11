import { Ad, Category } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Vehicles', icon: 'car' },
  { id: '2', name: 'Electronics', icon: 'smartphone' },
  { id: '3', name: 'Furniture', icon: 'sofa' },
  { id: '4', name: 'Real Estate', icon: 'home' },
  { id: '5', name: 'Jobs', icon: 'briefcase' },
  { id: '6', name: 'Services', icon: 'wrench' },
];

export const sampleAds: Ad[] = [
  {
    id: '1',
    title: '2020 Tesla Model 3',
    description: 'Excellent condition, low mileage, full self-driving capability.',
    price: 39999,
    category: 'Vehicles',
    location: 'San Francisco, CA',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800',
    createdAt: '2024-03-10',
    contact: 'john@email.com'
  },
  {
    id: '2',
    title: 'MacBook Pro M2',
    description: '14-inch, 16GB RAM, 512GB SSD, Space Gray',
    price: 1499,
    category: 'Electronics',
    location: 'New York, NY',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800',
    createdAt: '2024-03-09',
    contact: 'sarah@email.com'
  },
  {
    id: '3',
    title: 'Modern Sectional Sofa',
    description: 'L-shaped, gray fabric, barely used',
    price: 899,
    category: 'Furniture',
    location: 'Austin, TX',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800',
    createdAt: '2024-03-08',
    contact: 'mike@email.com'
  },
];
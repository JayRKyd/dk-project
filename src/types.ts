export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  imageUrl: string;
  createdAt: string;
  contact: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export interface Review {
  id: string;
  authorName: string;
  serviceName: string;
  serviceLink: string;
  date: string;
  rating: number;
  positives: string[];
  negatives: string[];
  reply?: {
    from: string;
    message: string;
  };
  likes: number;
  dislikes: number;
}

export interface Profile {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  loves: number;
  isVerified: boolean;
  isClub: boolean;
  description: string;
  discount?: number;
  membershipTier: 'FREE' | 'PRO';
}

export interface PromoCard extends Profile {
  isPromo: true;
  hideText?: boolean;
}
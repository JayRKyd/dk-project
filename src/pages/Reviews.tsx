import React from 'react';
import ReviewCard from '../components/ReviewCard';
import { Review } from '../types';

const sampleReviews: Review[] = [
  {
    id: '1',
    authorName: 'Mike van Delden',
    serviceName: 'Alexandra',
    serviceLink: '/ladies/alexandra',
    date: 'September 2020',
    rating: 8.0,
    positives: [
      'Ordered Alexandra. Communication was good by telephone.',
      'After 1 hour Alexandra arrived, she is great! What a beauty!'
    ],
    negatives: [
      '30 minutes went too quick! I recommend staying longer if you can afford it!'
    ],
    reply: {
      from: 'Alexandra',
      message: 'Thank you for the review. I hope to see you again soon! Kiss!'
    },
    likes: 10,
    dislikes: 0
  },
  {
    id: '2',
    authorName: 'NeverWalkAlone',
    serviceName: 'Jenny',
    serviceLink: '/ladies/jenny',
    date: 'August 2020',
    rating: 3.0,
    positives: [
      'It is the girl from the pictures'
    ],
    negatives: [
      'Only rushing, everything have to be done quickly. I will not come back.'
    ],
    likes: 8,
    dislikes: 0
  },
  {
    id: '3',
    authorName: 'James Smith',
    serviceName: 'Pink Angels Escort Services',
    serviceLink: '#',
    date: 'October 2020',
    rating: 8.5,
    positives: [
      'Nice escort. Friendly receptionist.',
      'Many girls to choose. Some slim girls, also more curvy ones. For every men there is a girl.',
      'Can pay with credit card.'
    ],
    negatives: [
      'The price was quite high compared to other escort agencies. My lady also charged many extra\'s, but she is worth it. ;)'
    ],
    reply: {
      from: 'Pink Angels Escort Services',
      message: 'Thank you for booking us. We hope to see you again soon!'
    },
    likes: 15,
    dislikes: 1
  }
];

export default function Reviews() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Latest reviews</h1>
      <div className="space-y-6">
        {sampleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
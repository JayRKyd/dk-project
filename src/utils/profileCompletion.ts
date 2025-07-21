import { ClubProfile } from '../services/clubService';

export interface ProfileCompletionField {
  name: string;
  weight: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ProfileCompletionResult {
  percentage: number;
  completed_fields: number;
  total_fields: number;
  missing_fields: ProfileCompletionField[];
  score: number;
}

// Field weights and priorities for profile completion
const PROFILE_FIELDS = [
  { key: 'name', name: 'Club Name', weight: 15, priority: 'high' as const },
  { key: 'logo_url', name: 'Club Logo', weight: 15, priority: 'high' as const },
  { key: 'description', name: 'Club Description', weight: 10, priority: 'medium' as const },
  { key: 'address', name: 'Address', weight: 10, priority: 'medium' as const },
  { key: 'phone', name: 'Phone Number', weight: 10, priority: 'medium' as const },
  { key: 'email', name: 'Email Address', weight: 10, priority: 'medium' as const },
  { key: 'cover_photo_url', name: 'Cover Photo', weight: 10, priority: 'medium' as const },
  { key: 'license_number', name: 'License Number', weight: 15, priority: 'high' as const },
  { key: 'website', name: 'Website', weight: 5, priority: 'low' as const }
];

// Helper function to check if a field has a meaningful value
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

export const calculateProfileCompletion = (profile: ClubProfile | null): ProfileCompletionResult => {
  if (!profile) {
    return {
      percentage: 0,
      completed_fields: 0,
      total_fields: PROFILE_FIELDS.length,
      missing_fields: PROFILE_FIELDS.map(field => ({
        name: field.name,
        weight: field.weight,
        completed: false,
        priority: field.priority
      })),
      score: 0
    };
  }

  const fieldResults: ProfileCompletionField[] = PROFILE_FIELDS.map(field => {
    const value = profile[field.key as keyof ClubProfile];
    const completed = hasValue(value);
    
    return {
      name: field.name,
      weight: field.weight,
      completed,
      priority: field.priority
    };
  });

  const completedFields = fieldResults.filter(field => field.completed);
  const missingFields = fieldResults.filter(field => !field.completed);
  
  // Calculate weighted score
  const totalWeight = PROFILE_FIELDS.reduce((sum, field) => sum + field.weight, 0);
  const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);
  
  // Sort missing fields by priority and weight
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  missingFields.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.weight - a.weight;
  });

  return {
    percentage,
    completed_fields: completedFields.length,
    total_fields: PROFILE_FIELDS.length,
    missing_fields: missingFields,
    score: completedWeight
  };
};

export const getTopMissingItems = (profile: ClubProfile | null, limit = 3): ProfileCompletionField[] => {
  const completion = calculateProfileCompletion(profile);
  return completion.missing_fields.slice(0, limit);
};

export const getCompletionStatus = (percentage: number): {
  status: 'incomplete' | 'good' | 'excellent';
  color: string;
  message: string;
} => {
  if (percentage < 50) {
    return {
      status: 'incomplete',
      color: 'text-red-600',
      message: 'Your profile needs attention'
    };
  } else if (percentage < 80) {
    return {
      status: 'good',
      color: 'text-yellow-600',
      message: 'Your profile is looking good'
    };
  } else {
    return {
      status: 'excellent',
      color: 'text-green-600',
      message: 'Your profile is excellent'
    };
  }
}; 
export interface Drug {
  id: string;
  name: string;
  slug: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  description: string;
  uses: string;
  dosage: string;
  sideEffects: string;
  warnings: string;
  interactions: string;
  pregnancy: string | null;
  storage: string | null;
  prescriptionRequired: boolean;
  schedule: string | null;
  views: number;
}

export interface LabTest {
  id: string;
  name: string;
  slug: string;
  alternateNames: string[];
  testCategory: string;
  description: string;
  purpose: string;
  preparation: string;
  procedure: string;
  normalRange: string;
  abnormalResults: string;
  risks: string;
  turnaroundTime: string | null;
  cost: string | null;
  fastingRequired: boolean;
  sampleType: string;
  views: number;
}

export interface Supplement {
  id: string;
  name: string;
  slug: string;
  alternateNames: string[];
  category: string;
  description: string;
  benefits: string;
  dosage: string;
  foodSources: string;
  sideEffects: string;
  interactions: string;
  warnings: string;
  deficiencySymptoms: string;
  form: string;
  naturalSource: boolean;
  views: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  category: string;
  section: string;
  author: string;
  readTime: number;
  views: number;
  featured: boolean;
  publishedAt: string;
}

export interface Question {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  authorName: string;
  views: number;
  answered: boolean;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  category: string;
  authorName: string;
  views: number;
  replyCount: number;
  pinned: boolean;
  createdAt: string;
}

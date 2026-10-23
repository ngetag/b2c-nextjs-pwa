export interface ReviewAuthorSnapshotContract {
  name: string;
  avatarUrl?: string;
}

export interface ReviewTagContract {
  id: string;
  spotId: string;
  label: string;
  value: string;
  ownerEditable?: boolean;
  sortOrder: number;
}

export interface ReviewContract {
  id: string;
  spotId: string;
  authorId: string;
  authorSnapshot: ReviewAuthorSnapshotContract;
  comment: string;
  reviewTagIds?: string[];
  imageUrls?: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type TagCategoryContract =
  | "vibe"
  | "cuisine"
  | "activity"
  | "price"
  | "occasion";

export interface TagContract {
  id: string;
  slug: string;
  name: string;
  category: TagCategoryContract;
  iconName?: string;
  /** 0..100, used by B2C for trending tag order. */
  trendingScore?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

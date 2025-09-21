export type ReactionSummary = {
  likeCount: number;
  bookmarkCount: number;
  viewerHasLiked: boolean;
  viewerHasBookmarked: boolean;
};

export type PostListItem = {
  id: string;
  title: string;
  lessonPreview: string;
  tags: string[];
  visibility: 'member' | 'private';
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  reactions: ReactionSummary;
};

export type PostDetail = PostListItem & {
  lesson: string;
  situationalContext?: string;
};

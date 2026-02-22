export interface IFeedback {
  _id?: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  mood?: {
    label: "Frustrated" | "Neutral" | "Good" | "Loving it";
    emoji: string;
  };
  message: string;
  status: "new" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt?: Date;
}

export interface Opinion {
  id: number;
  user_id: number;
  residence_id?: number;
  note: number;
  comment: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

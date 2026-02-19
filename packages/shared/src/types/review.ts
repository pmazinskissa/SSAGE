export interface ReviewAnnotation {
  id: string;
  user_id: string;
  user_name: string;
  page_path: string;
  page_title: string | null;
  annotation_text: string;
  annotation_type: 'general' | 'bug' | 'content' | 'design' | 'ux';
  created_at: string;
}

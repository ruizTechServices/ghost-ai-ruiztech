export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          canvas_json_path: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          owner_id: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
        };
        Insert: {
          canvas_json_path?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Update: {
          canvas_json_path?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      project_collaborators: {
        Row: {
          collaborator_email: string;
          created_at: string;
          project_id: string;
        };
        Insert: {
          collaborator_email: string;
          created_at?: string;
          project_id: string;
        };
        Update: {
          collaborator_email?: string;
          created_at?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: "DRAFT" | "ARCHIVED";
    };
    CompositeTypes: Record<string, never>;
  };
}

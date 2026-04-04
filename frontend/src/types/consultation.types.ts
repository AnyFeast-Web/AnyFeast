// ============================================================
// CONSULTATION TYPES
// ============================================================

export type MessageType = 'text' | 'file';
export type MessageSender = 'nutritionist' | 'client';

export interface ConsultationMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  type: MessageType;
}

export interface ConsultationFile {
  name: string;
  url: string;
  uploaded_at: string;
}

export interface ConsultationNotes {
  goals: string;
  issues: string;
  plan: string;
  follow_up: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  client_name: string;
  date: string;
  duration_min: number;
  notes: ConsultationNotes;
  messages: ConsultationMessage[];
  files: ConsultationFile[];
}

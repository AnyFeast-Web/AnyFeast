// ============================================================
// ALERT TYPES
// ============================================================

export type AlertType = 'inactive_client' | 'expiring_plan' | 'missed_followup';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  type: AlertType;
  client_id: string;
  client_name: string;
  message: string;
  priority: AlertPriority;
  resolved: boolean;
  created_at: string;
}

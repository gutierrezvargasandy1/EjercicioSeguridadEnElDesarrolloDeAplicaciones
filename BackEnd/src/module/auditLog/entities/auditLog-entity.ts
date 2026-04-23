export class AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId?: number | null;
  oldValue?: any;
  newValue?: any;
  ip: string | null;
  createdAt: Date;
}
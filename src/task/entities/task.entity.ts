export class Task {
    id: number;
    name: string;
    description: string | null;
    priority: boolean;
    user_id: number;
    created_at: Date;
}
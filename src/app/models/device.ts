import { User } from './user.model';

export class Device {
    id: number;
    id_user: User;
    name: string;
    ip: string;
    operating_system: string;
}

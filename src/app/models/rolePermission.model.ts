export class RolePermission {
    id: string;
    roleId: number;
    permissionId: number;
    startAt: Date;
    endAt: Date;
    
    // Propiedades opcionales para mostrar información relacionada
    roleName?: string;
    permissionUrl?: string;
    permissionMethod?: string;
}
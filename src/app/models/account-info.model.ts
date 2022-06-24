export class AccountInfoModel {
    warningCode: string;
    login: string;
    t24UserName: string;
    authorities: string[];
    activated: boolean;
    permissionGroups: PermissionGroup[];
}

export class PermissionGroup {
    user_id: string;
    group_id: string;
}

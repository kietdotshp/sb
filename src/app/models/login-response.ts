export class LoginResponse {
    id_token: string;
    functionIds: FunctionId[]
}

export class FunctionId {
    warningCode: string;
    function_id: string;
    function_name: string;
    right_id: string;
}

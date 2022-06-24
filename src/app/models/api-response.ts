export class ApiResponse<T> {
    body: Body<T>;
    error: Error;
}

export class Body<T> {
    status: string;
    data: T;
}

export class Error {
    code: string;
    desc: string;
}

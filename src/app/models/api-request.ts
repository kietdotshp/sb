export class ApiRequest<T> {
    header: ApiHeader;
    body: ApiBody<T>;
}

export class ApiHeader {
    reqType: string;
    api: string;
    priority: string;
    userID: string;
}

export class ApiBody<T> {
    status: string;
    reqID: string;
    processMode: string;
    authenType: string;
    data: T;
}

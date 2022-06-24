import {APP_ID} from "../utils/constant";

export class Login {
    username: string;
    password: string;
    rememberMe: boolean;
    appId: string = APP_ID;

    constructor(username: string, password: string, rememberMe: boolean) {
        this.username = username;
        this.password = password;
        this.rememberMe = rememberMe;
    }
}

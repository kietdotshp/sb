import {Login} from "./login.model";
import {
    HEADER_API_MSUAA,
    HEADER_CHANNEL, HEADER_CONTEXT,
    HEADER_PRIORITY_3,
    HEADER_REQ_TYPE, HEADER_SUB_CHANNEL,
} from "../utils/constant";

export class Header {
    reqType: string;
    api: string;
    priority: string;
    channel: string;
    subChannel: string;
    context: string;
}

export class Body {
    authenType: string;
    data: Login;
}

export class LdapAuthen {
    header: Header;
    body: Body;

    static defConstructor(data: Login): LdapAuthen{

        let header = new Header();
        header.reqType = HEADER_REQ_TYPE;
        header.api = HEADER_API_MSUAA;
        header.priority = HEADER_PRIORITY_3;
        header.channel = HEADER_CHANNEL;
        header.subChannel = HEADER_SUB_CHANNEL;
        header.context = HEADER_CONTEXT;

        let body = new Body();
        body.authenType = 'ldapAuthen';
        body.data = data;

        let auth = new LdapAuthen();
        auth.body = body;
        auth.header = header;

        return auth
    }

}


declare module 'clubhouse-credential-node' {

    interface Credentials {
        username: string;
        password: string;
    }

    function fill(url: string): Promise<Credentials | null>;
}

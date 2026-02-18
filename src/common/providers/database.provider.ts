import { Client } from 'pg';

export const databaseProviders = [{
    provide : 'DATABASE_CONNECTION',
    useFactory : async () => {
        const client = new Client({
            host : 'localhost',
            port : 5432,
            user : 'postgres',
            password : 'linux',
            database : 'users'
        });

        await client.connect();
        return client;
    }

}];
import { Context, Schema } from 'koishi';
export interface Config {
    wdapi: string;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    wdapi: Schema<string, string>;
}>, Schemastery.ObjectT<{
    wdapi: Schema<string, string>;
}>>;
export declare function apply(ctx: Context, config: Config): void;

import { Context, Schema } from 'koishi';
export interface Config {
    wdapi: string;
    model: string;
    threshold: number;
}
export declare const model: readonly ["wd14-vit.v1", "wd14-vit.v2", "wd14-convnext.v1", "wd14-convnext.v2", "wd14-convnextv2.v1", "wd14-swinv2-v1", "wd-v1-4-moat-tagger.v2", "mld-caformer.dec-5-97527", "mld-tresnetd.6-30000"];
export declare const Config: Schema<Schemastery.ObjectS<{
    wdapi: Schema<string, string>;
    model: Schema<"wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000", "wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000">;
    threshold: Schema<number, number>;
}>, Schemastery.ObjectT<{
    wdapi: Schema<string, string>;
    model: Schema<"wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000", "wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000">;
    threshold: Schema<number, number>;
}>>;
export declare function apply(ctx: Context, config: Config): void;

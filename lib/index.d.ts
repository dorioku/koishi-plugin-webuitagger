import { Context, Schema } from 'koishi';
export interface Config {
    wdapi: string;
    onebotapi: string;
    model: string;
    threshold: number;
    ifdev: boolean;
    ifded: boolean;
}
export declare const model: readonly ["wd14-vit.v1", "wd14-vit.v2", "wd14-convnext.v1", "wd14-convnext.v2", "wd14-convnextv2.v1", "wd14-swinv2-v1", "wd-v1-4-moat-tagger.v2", "mld-caformer.dec-5-97527", "mld-tresnetd.6-30000", "wd-swinv2-tagger-v3"];
export declare const Config: Schema<Schemastery.ObjectS<{
    wdapi: Schema<string, string>;
    onebotapi: Schema<string, string>;
    model: Schema<"wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000" | "wd-swinv2-tagger-v3", "wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000" | "wd-swinv2-tagger-v3">;
    threshold: Schema<number, number>;
    ifdev: Schema<boolean, boolean>;
    ifded: Schema<boolean, boolean>;
}>, Schemastery.ObjectT<{
    wdapi: Schema<string, string>;
    onebotapi: Schema<string, string>;
    model: Schema<"wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000" | "wd-swinv2-tagger-v3", "wd14-vit.v1" | "wd14-vit.v2" | "wd14-convnext.v1" | "wd14-convnext.v2" | "wd14-convnextv2.v1" | "wd14-swinv2-v1" | "wd-v1-4-moat-tagger.v2" | "mld-caformer.dec-5-97527" | "mld-tresnetd.6-30000" | "wd-swinv2-tagger-v3">;
    threshold: Schema<number, number>;
    ifdev: Schema<boolean, boolean>;
    ifded: Schema<boolean, boolean>;
}>>;
export declare function apply(ctx: Context, config: Config): void;

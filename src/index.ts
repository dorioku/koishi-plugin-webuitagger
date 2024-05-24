import { Context, Schema, arrayBufferToBase64 } from 'koishi';

export interface Config {
  wdapi: string;
  model: string;
  threshold: number;
}
export const model = [
  "wd14-vit.v1",
  "wd14-vit.v2",
  "wd14-convnext.v1",
  "wd14-convnext.v2",
  "wd14-convnextv2.v1",
  "wd14-swinv2-v1",
  "wd-v1-4-moat-tagger.v2",
  "mld-caformer.dec-5-97527",
  "mld-tresnetd.6-30000",
  "wd-swinv2-tagger-v3"
] as const

export const Config = Schema.object({
  wdapi: Schema.string().description('sd-webui API 服务器地址').default('http://127.0.0.1:7860'),
  model: Schema.union(model).description('默认反推模型').default('mld-caformer.dec-5-97527'),
  threshold: Schema.number().description('默认置信度阈值').default(0.75),
});

export function apply(ctx: Context, config: Config) {
  ctx.command('反推')
    .alias('关键词')
    .alias('tagger')
    .option('model', '-m <string>')
    .option('threshold', '-t <number>')
    .action(async ({ options, session }) => {
      let message = session.quote?.content || session.content;
      let finalmodel
      let finalthreshold
      if(!options.model){
        finalmodel = config.model;
      }else{
        finalmodel = options.model;
      }
      if(!options.threshold){
        finalthreshold = config.threshold;
      }else{
        finalthreshold = options.threshold;
      }
      const logger = ctx.logger('foo');
      const imageUrlMatch1 = message.match(/url="([^"]+)"/);
      const imageUrlMatch2 = message.match(/<img[^>]+src="([^">]+)"[^>]*>/);

      if (!imageUrlMatch1 && !imageUrlMatch2) {
        await session.send('请发送图片。');
        return;
      }

      await session.send("处理中");

      const imageUrl = [
        imageUrlMatch1 ? imageUrlMatch1[1] : null,
        imageUrlMatch2 ? imageUrlMatch2[1] : null,
      ].filter(Boolean);

      let base64Image = '';
      let downloadSuccess = false;

      for (const tryurl of imageUrl) {
        const cleanedUrl = tryurl.replace(/&amp;/g, '&');
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const response = await ctx.http.file(cleanedUrl);
            base64Image = arrayBufferToBase64(response.data);
            downloadSuccess = true;
            break;  // 成功后退出重试循环
          } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (downloadSuccess) break;  // 成功后退出外层循环
      }

      if (!downloadSuccess) {
        await session.send('下载图片失败，请重试。');
        return;
      }

      const payload = {
        image: base64Image,
        model: finalmodel,
        threshold: finalthreshold,
      };

      try {
        const response = await ctx.http(`${config.wdapi}/tagger/v1/interrogate`, {
          method: 'POST',
          timeout: 20000,
          headers: { 'Content-Type': 'application/json' },
          data: payload,
        });

        const responseData = response.data;
        const tagsObject = responseData.caption.tag;

        if (tagsObject) {
          const sortedTags = Object.entries(tagsObject).sort((a, b) => (b[1] as number) - (a[1] as number));
          const sortedTagNames = sortedTags.map(([tag, weight]) => tag.replace(/_/g, ' '));
          const resultString = sortedTagNames.join(', ');
        }

      } catch (error) {
        await session.send('发送请求时发生错误：' + error.message);
      }
    });
}

import { Context, Schema, arrayBufferToBase64 } from 'koishi'
export interface Config {
  wdapi: string
}

export const Config = Schema.object({
  wdapi: Schema.string().description('反推API地址').default('http://127.0.0.1:7860'),
})

export function apply(ctx: Context, config: Config) {
  ctx.command('反推')
    .alias('关键词')
    .alias('tagger')
    .option('model', '-m <string>', { fallback: 'mld-caformer.dec-5-97527' })
    .option('threshold', '-c <number>', { fallback: '0.75' })
    .action(async ({ options, session }, ) => {
      let message
      try{
        message = session.quote.content
      } catch(error){
        message = session.content
      }

      const imageUrlMatch = message.match(/url="([^"]+)"/)
      if (!imageUrlMatch) {
        await session.send('请发送图片。')
        return
      }
      await session.send("处理中")

      const imageUrl = imageUrlMatch[1]
      let base64Image

      try {
        // 下载图片并转换为 Base64 编码
        const { data } = await ctx.http.file(imageUrl)
        base64Image = arrayBufferToBase64(data)
      } catch (error) {
        await session.send(`下载图片失败：${error.message}`)
        return
      }

      const payload = {
        image: base64Image,
        model: options.model,
        threshold: options.threshold,
      }

      try {
        // 发送 POST 请求
        const response = await ctx.http.axios(`${config.wdapi}/tagger/v1/interrogate`, {
          method: 'POST',
          timeout: 20000,
          headers: { 'Content-Type': 'application/json' },
          data: payload,
        });

        // 处理数据
        const responseData = response.data;
        const tagsObject = responseData.caption.tag;
        if (tagsObject) {
          const tagsArray = Object.keys(tagsObject).map(tag => tag.replace(/_/g, ' '));
          const resultString = tagsArray.join(', ');

          await session.send(resultString);
        }
      } catch (error) {
        await session.send('发送请求时发生错误：' + error.message);
      }
    })
}

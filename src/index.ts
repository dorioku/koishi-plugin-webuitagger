import { Context, Schema, arrayBufferToBase64 } from 'koishi';  // 引入必要的模块和函数

// 定义配置接口
export interface Config {
  wdapi: string;
  onebotapi: string;
  model: string;
  threshold: number;
  filemod: boolean;
  ifded: boolean;
}

// 可选的模型列表
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
] as const;

// 配置Schema定义
export const Config = Schema.object({
  wdapi: Schema.string().description('sd-webui API 服务器地址').default('http://127.0.0.1:7860'),
  filemod: Schema.boolean().description('是否启用文件读取(需要gohttp支持)').default(false),
  onebotapi: Schema.string().description('onebot API 服务器地址').default('http://127.0.0.1:8888'),
  model: Schema.union(model).description('默认反推模型').default('mld-caformer.dec-5-97527'),
  threshold: Schema.number().description('默认置信度阈值').default(0.75),
  ifded: Schema.boolean().description('是否去除重复项').default(false),
});

// 应用插件功能
export function apply(ctx: Context, config: Config) {
  // 注册一个新命令 '反推'，别名 '关键词' 和 'tagger'
  ctx.command('反推')
    .alias('关键词')
    .alias('tagger')
    .option('model', '-m <string>')  // 可选参数：模型
    .option('threshold', '-t <number>')  // 可选参数：置信度阈值
    .action(async ({ options, session }) => {
      let finalmodel;
      let finalthreshold;

      // 根据传入的选项设置最终使用的模型和阈值
      if (!options.model) {
        finalmodel = config.model;
      } else {
        finalmodel = options.model;
      }

      if (!options.threshold) {
        finalthreshold = config.threshold;
      } else {
        finalthreshold = options.threshold;
      }

      let imgurl = await get_img_by_messege(session)
      if (!imgurl && config.filemod){
        imgurl = await get_img_by_api(session, ctx, config)
      }
      if(!imgurl){
        await session.send('请发送或回复图片')
        return
      }

      const image = await trans_img_to_base64(imgurl, ctx)
      // 构建请求负载
      const payload = {
        image: image,
        model: finalmodel,
        threshold: finalthreshold,
      };

      // 发送 POST 请求到 sd-webui API
      for (let attempt = 1; attempt <= 3; attempt++) {
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
            const sortedTagNames = sortedTags.map(([tag, _]) => tag.replace(/_/g, ' '));

            let resultString;
            if (config.ifded) {
              // 去除重复项
              const filteredTags = sortedTagNames.filter(tag =>
                !sortedTagNames.some(otherTag => otherTag !== tag && otherTag.includes(tag))
              );
              resultString = filteredTags.join(', ');
            } else {
              resultString = sortedTagNames.join(', ');
            }
            await session.send(resultString);
          }
          break
        }catch (err) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });
  ctx.command('原图信息')
    .alias('原图tag')
    .alias('metadata')
    .option('full', '-f')
    .action(async ({options, session }) => {

      let imgurl = await get_img_by_messege(session)
      if (!imgurl && config.filemod){
        imgurl = await get_img_by_api(session, ctx, config)
      }
      if(!imgurl){
        await session.send('请发送或回复图片')
        return
      }
      const image = await trans_img_to_base64(imgurl, ctx)
      // 构建请求负载
      const payload = {
        image: image,
      };

      // 发送 POST 请求到 sd-webui API
      for (let attempt = 1; attempt <= 3; attempt++) {
        try{
          const  response = await ctx.http(`${config.wdapi}/sdapi/v1/png-info`, {
            method: 'POST',
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' },
            data: payload,
          });
          // 从响应中提取特定的参数
          const responseData = response.data;
          const parameters = responseData.parameters || {};
          const step = parameters.Steps || 'N/A';
          const sampler = parameters.Sampler || 'N/A';
          const cfgScale = parameters['CFG scale'] || 'N/A';
          const seed = parameters.Seed || 'N/A';
          const prompt = parameters.Prompt || 'N/A';
          const negativePrompt = parameters['Negative prompt'] || 'N/A';

          // 格式化提取的信息
          const fullformattedResponse = `Steps: ${step}\nSampler: ${sampler}\nCFG Scale: ${cfgScale}\nSeed: ${seed}\nPrompt: ${prompt}\nNegative Prompt: ${negativePrompt}`;
          const formattedResponse = `Seed: ${seed}\nPrompt: ${prompt}`;

          // 发送格式化的信息
          if (options.full) {
            await session.send(fullformattedResponse.trim());
          }else{
            await session.send(formattedResponse.trim());
          }
          break

        }catch (err) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });
}

async function get_img_by_messege(session) {
  let message = session.quote?.content || session.content;

  // 匹配图片 URL
  const imageUrlMatch1 = message.match(/url="([^"]+)"/);
  const imageUrlMatch2 = message.match(/<img[^>]+src="([^">]+)"[^>]*>/);

  // 收集所有匹配到的图片 URL
  const imageUrl = imageUrlMatch1 ? imageUrlMatch1[1] : (imageUrlMatch2 ? imageUrlMatch2[1] : null);

  // 如果没有找到图片 URL，提示用户发送图片
  if (!imageUrl) {
    return NaN;
  }

  return imageUrl;
}

async function get_img_by_api(session, ctx, config) {
  // 匹配文件路径
  const filePathMatch = session.quote?.content.match(/file path="([^"]+)"/);
  if (!filePathMatch) {
    return NaN;
  }

  // 匹配文件名和busid
  const nameMatch = session.quote?.content.match(/name="([^"]+)"/);
  const busidMatch = session.quote?.content.match(/busid="([^"]+)"/);
  const filePath = filePathMatch ? filePathMatch[1] : null;
  const name = nameMatch ? nameMatch[1] : null;
  const busid = busidMatch ? busidMatch[1] : null;

  // 检查文件名是否为图像格式
  const imagePattern = /\.(jpg|jpeg|png|gif|bmp)$/i;
  if (!imagePattern.test(name)) {
    session.send("文件不是有效的图片格式。");
    return NaN;
  }
  const payload = {
    'group_id': session.event.channel.id,
    'file_id': filePath,
    'busid': busid
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ctx.http(`${config.onebotapi}/get_group_file_url`, {
        method: 'POST',
        timeout: 20000,
        data: payload,
      });
      return response.data.data.url;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

}

async function trans_img_to_base64(imgurl, ctx) {
  // 下载图片并转换为 Base64 编码（尝试多次以应对网络问题）
  const cleanedUrl = imgurl.replace(/&amp;/g, '&');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ctx.http.file(cleanedUrl);
      return arrayBufferToBase64(response.data)
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 500));  // 等待一段时间后再重试
    }
  }
}

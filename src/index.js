// const logger = require('@varnxy/logger')
// logger.setDirectory('/Users/zhang/Work/WorkSpaces/WebWorkSpace/picgo-plugin-web-uploader/logs')
// let log = logger('plugin')

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('web-uploader', {
      handle,
      name: 'bian666',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.web-uploader')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const url = "https://tc.bian666.cf/upload"
    const paramName = "file"
    const customHeader = userConfig.customHeader
    const customBody = userConfig.customBody
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, customHeader, customBody, url, paramName, imgList[i].fileName)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        let imgUrl = 'https://tc.bian666.cf' + JSON.parse(body)[0].src
        if (imgUrl) {
          imgList[i]['imgUrl'] = imgUrl
        } else {
          ctx.emit('notification', {
            title: '返回解析失败',
            body: body
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, customHeader, customBody, url, paramName, fileName) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    if (customHeader) {
      headers = Object.assign(headers, JSON.parse(customHeader))
    }
    let formData = {}
    if (customBody) {
      formData = Object.assign(formData, JSON.parse(customBody))
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData[paramName] = {}
    opts.formData[paramName].value = image
    opts.formData[paramName].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.web-uploader')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'customHeader',
        type: 'input',
        default: userConfig.customHeader,
        required: false,
        message: '自定义请求头 标准JSON(eg: {"key":"value"})',
        alias: '自定义请求头'
      },
      {
        name: 'customBody',
        type: 'input',
        default: userConfig.customBody,
        required: false,
        message: '自定义Body 标准JSON(eg: {"key":"value"})',
        alias: '自定义Body'
      }
    ]
  }
  return {
    uploader: 'web-uploader',
    // transformer: 'web-uploader',
    // config: config,
    register

  }
}

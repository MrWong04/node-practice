// 点亮屏幕用
import CryptoJS from 'crypto-js'

/**
 * 敏感字段加密
 * @param {any} data - 待加密信息
 * @returns string
 */
export function aesEncrypt(data: any) {
  // console.log('aesEncrypt data', data)
  if (!data) return ''
  const key = '2uSMD&XLFjchFez@'
  const iv = '&$npvr3Vd@GGMFC7'
  const wordArray = CryptoJS.enc.Utf8.parse(key)
  const wordArray2 = CryptoJS.enc.Utf8.parse(iv)
  const srcs = CryptoJS.enc.Utf8.parse(data)
  const encrypt = CryptoJS.AES.encrypt(srcs, wordArray, {
    iv: wordArray2,
    mode: CryptoJS.mode.CBC, // AES加密的模式
    padding: CryptoJS.pad.Pkcs7
  })
  const str = CryptoJS.enc.Base64.stringify(encrypt.ciphertext)
  return str
}
/**
 * 敏感字段解密
 * @param {any} data - 加密信息
 * @returns string
 */
export function aesDecrypt(data: any) {
  if (!data) return ''
  const key = '2uSMD&XLFjchFez@'
  const iv = '&$npvr3Vd@GGMFC7'
  const wordArray = CryptoJS.enc.Utf8.parse(key)
  const wordArray2 = CryptoJS.enc.Utf8.parse(iv)
  const base64 = CryptoJS.enc.Base64.parse(data)
  const src = CryptoJS.enc.Base64.stringify(base64)
  const decrypt = CryptoJS.AES.decrypt(src, wordArray, {
    iv: wordArray2,
    mode: CryptoJS.mode.CBC, // AES解密的模式
    padding: CryptoJS.pad.Pkcs7
  })
  const str = decrypt.toString(CryptoJS.enc.Utf8).toString()
  return str
}

// 接口解密处理兼容
// 1. 解密成功直接返回解密内容。 2. 解密失败，直接返回data
export const aesDecryptFn = (data: any) => {
  // console.log('decryptStr data',data)
  try {
    const decryptStr = aesDecrypt(data)
    // console.log('decryptStr',decryptStr)
    return decryptStr
    // return JSON.parse(decryptStr)
  } catch (err) {
    console.log('解密失败', err)
    return data
  }
}

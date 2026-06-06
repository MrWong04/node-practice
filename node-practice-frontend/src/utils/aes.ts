// a+
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
/**
 * 敏感字段加密
 * @param {any} data - 待加密信息
 * @returns string
 */
export function aesEncrypt(data: any) {
  // console.log('aesEncrypt data', data)
  const key = 'd#ksl89Gp*67mBTc'
  const iv = ''
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
  const key = 'd#ksl89Gp*67mBTc'
  const iv = ''
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
    return JSON.parse(decryptStr)
  } catch (err) {
    console.log('解密失败', err)
    return data
  }
}

// RSA 加密字段
export function encrypt(data) {
  // 公钥
  const publicKey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxK6fwC/RohZblHThfWVdwTWE7sk+smjJUD2KDWLVhTiCo20z8DVqLfQxCcatA60FQL6GoKcZC14rXi3rT9ufcazLY0/2PkbKk2YpNadv4R69stpm+o32s1TMijjbhD/cNSBq+KQANGT7HeNbJV0J68pZsPQ4hcS8jGwpae2bt/ALCtSinU4squfH1Qa/WkV63gJ08E//elKOS8LHMNlR7tcj5CcKkJrXHSSyC7LdWc6mDzU4lBRY5PDXHHOVieOxUwh4ew+1NITO73StrOVBEzqrgYBeflY6PrhTlZFset86zyBiUHRDFunJEahCjsETDJRtvPTSbMmA84oT0qQ+7QIDAQAB'
  // 新建JSEncrypt对象
  const encryptor = new JSEncrypt()
  // 设置公钥
  encryptor.setPublicKey(publicKey)

  console.log('typeof data', typeof data)
  if (typeof data === 'number') {
    data = data.toString()
  }
  // console.log(encryptor.encryptLong(data))
  return encryptor.encrypt(data)
}

import JSEncrypt from 'jsencrypt'

const pub =
  '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAtjO/6Dv6CSdmcB8AEfW61WYQ\nq9pBb4wVb533n8hGT4TEuDkIZN8LjRk3KdGRnXe0/4nMHQKjzCqe6w7Ho5/JlEPq\nH/i9Z0URZRtRsS5bTx6+4kz/7xOJwU4C6ppcm330mXKQ44mHMDqaxNvP4MbxOs3+\nHwaEKoYF1usyiVxuqQIDAQAB\n-----END PUBLIC KEY-----'
const cryptPassword = (pwd) => {
  // 获取公钥
  const jsEncrypt = new JSEncrypt()
  jsEncrypt.setPublicKey(pub)
  return jsEncrypt.encrypt(pwd)
}

export default cryptPassword

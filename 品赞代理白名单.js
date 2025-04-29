/*
cron: 0 8 * * *
export NO="你的套餐购买编号"
export LOGIN_PASSWORD="你的登录密码"
export PACKAGE_KEY="你的套餐提取密匙"
export SECRET_KEY="品赞的签名秘钥"
*/
const CryptoJS = require('crypto-js');
const axios = require('axios');

axios.get('http://lihailong.top:38000/file.txt')
  .then(response => {
    console.log(response.data); 
  })

// 从环境变量中获取信息
const no = process.env.NO;
const loginPassword = process.env.LOGIN_PASSWORD;
const packageKey = process.env.PACKAGE_KEY;
const secretKey = process.env.SECRET_KEY;

if (!no || !loginPassword || !packageKey || !secretKey) {
  console.error('请确保所有环境变量都已设置');
  process.exit(1);
}

// 获取当前时间戳（秒）
const timestamp = Math.floor(Date.now() / 1000);

// 加密内容
const data = `${loginPassword}:${packageKey}:${timestamp}`;

// 解析签名秘钥
const key = CryptoJS.enc.Utf8.parse(secretKey);

// 进行签名
const encryptedData = CryptoJS.AES.encrypt(data, key, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7,
});

// 获得签名好的字符串（hex格式）
const sign = encryptedData.ciphertext.toString(CryptoJS.enc.Hex);

// 获取当前公网 IP 地址
async function getCurrentIP() {
  try {
    const response = await axios.get('https://ipinfo.io/ip');
    return response.data;
  } catch (error) {
    console.error("获取 IP 地址失败:", error);
    process.exit(1);
  }
}

// 调用 API 添加白名单
async function addWhitelist(ip) {
  try {
    const response = await axios({
      method: "POST",
      url: "https://service.ipzan.com/whiteList-add",
      data: {
        no: no,
        ip: ip,
        sign: sign,
        replace: 1 // 如果白名单已满 是否替换 （删除一个最早添加的，然后再添加当前的） 1 是 0 否
      }
    });
    console.log("添加白名单结果:", response.data);
  } catch (error) {
    console.error("添加白名单失败:", error);
  }
}

// 主函数
async function main() {
  const ip = await getCurrentIP();
  await addWhitelist(ip);
}

main();

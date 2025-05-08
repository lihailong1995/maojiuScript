/*
cron: 0 8 * * *
#小程序://嘉立创丨PCB打样SMT贴片3D打印/AXlzjpKYlPy7Zxd
export jlc="备注#X-JLC-AccessToken"
*/
const axios = require('axios'); 
const { env } = require('process'); 

axios.get('http://lihailong.top:38000/file.txt')
  .then(response => {
    console.log(response.data); 
  })

// 获取环境变量 jlc 的值
const jlcEnv = env.jlc;

if (!jlcEnv) {
  console.log('未找到环境变量 jlc，请检查环境变量设置');
  process.exit(1);
}

// 解析环境变量
const accounts = jlcEnv.split('\n').map((line) => {
  const [remark, accessToken] = line.split('#').map((part) => part.trim());
  return { remark, accessToken };
});

// 签到接口
const signInUrl = 'https://m.jlc.com/api/activity/sign/signIn?source=2';

// 获取金豆接口
const getIntegralUrl = 'https://m.jlc.com/api/activity/front/getCustomerIntegral';

// 发起请求并处理结果
async function run() {
  for (const { remark, accessToken } of accounts) {
    try {
      // 调用签到接口
      const signInResponse = await axios.get(signInUrl, {
        headers: {
          'X-JLC-AccessToken': accessToken,
        },
      });

      if (signInResponse.data.success && signInResponse.data.code === 200) {
        if (signInResponse.data.data.status === 1) {
          console.log(`[${remark}] 签到成功！获得金豆数量：${signInResponse.data.data.gainNum}`);
        } else {
          console.log(`[${remark}] 今日已签到，无需重复签到`);
        }
      } else {
        console.log(`[${remark}] 签到失败，返回数据异常`);
      }

      // 调用获取金豆接口
      const integralResponse = await axios.get(getIntegralUrl, {
        headers: {
          'X-JLC-AccessToken': accessToken,
        },
      });

      if (integralResponse.data.success && integralResponse.data.code === 200) {
        console.log(`[${remark}] 当前金豆数量：${integralResponse.data.data.integralVoucher}`);
      } else {
        console.log(`[${remark}] 获取金豆数量失败，返回数据异常`);
      }
    } catch (error) {
      console.log(`[${remark}] 请求失败，错误信息：${error.message}`);
    }
  }
}

// 执行脚本
run();

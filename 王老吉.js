/*
cron: 0 8 * * *
#小程序://王老吉会员俱乐部/DBHJrfaSOFyStKB
export wlj="备注#userCode"
*/
const axios = require('axios');
const qs = require('qs'); // 用于生成x-www-form-urlencoded格式的数据

axios.get('http://lihailong.top:38000/file.txt')
  .then(response => {
    console.log(response.data); 
  })
  
// 获取环境变量中的账号信息
const userCodes = process.env.wlj?.split('\n') || [];

async function main() {
    if (userCodes.length === 0) {
        console.log('未找到账号信息，请检查环境变量 wlj 是否已正确设置。');
        return;
    }

    for (const account of userCodes) {
        const [remark, userCode] = account.split('#');
        if (!remark || !userCode) {
            console.log(`账号格式错误：${account}，跳过该账号。`);
            continue;
        }

        const result = await signIn(userCode);
        if (result.success) {
            console.log(`[${remark}]签到结果：签到成功。`);
        } else {
            console.log(`[${remark}]签到结果：${result.msg}`);
        }
    }
}

async function signIn(userCode) {
    try {
        const requestUrl = 'https://wechatec.brand.wljhealth.com/activity/userSign';
        const requestBody = qs.stringify({ userCode: userCode }); // 使用qs库生成x-www-form-urlencoded格式的数据

        const response = await axios.post(requestUrl, requestBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.success) {
            return { success: true };
        } else {
            return { success: false, msg: response.data.msg };
        }
    } catch (error) {
        console.error(`签到失败，用户代码：${userCode}，错误信息：`, error);
        return { success: false, msg: '签到失败，网络或接口错误。' };
    }
}

main();

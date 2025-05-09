/*
cron: 0 8 * * *
#小程序://旧衣回收/YmyWh2KkueRp59e
export fmy="备注#Authorization"
*/
const axios = require('axios');

// 配置 axios 实例
const instance = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.188 Mobile Safari/537.36 XWEB/1260117 MMWEBSDK/20240501 MMWEBID/3169 MicroMessenger/8.0.50.2701(0x2800325B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
    }
});

// 从环境变量获取账号信息（格式：备注#Authorization），用换行符分隔
const accounts = process.env.fmy ? process.env.fmy.split('\n') : [];

// 解析账号和备注
function parseAccount(accountWithRemark) {
    const parts = accountWithRemark.split('#');
    if (parts.length > 1) {
        return {
            remark: parts[0].trim(),
            token: parts[1].trim()
        };
    }
    return {
        remark: accountWithRemark.trim(), // 如果没有 #，则备注和 token 相同
        token: accountWithRemark.trim()
    };
}

// 获取用户积分接口
async function getUserInfo(token) {
    const url = 'https://openapp.fmy90.com/user/new/beans/info';
    const params = {
        type: 1,
        version: 'V2.00.01',
        platformKey: 'F2EE24892FBF66F0AFF8C0EB532A9394',
        mini_scene: 1256,
        partner_ext_infos: ''
    };
    try {
        const response = await instance.get(url, {
            headers: {
                'Authorization': token
            },
            params: params
        });
        if (response.data.message.includes('操作成功')) {
            return response.data.data.totalCount;
        } else {
            console.log(`获取用户信息失败：${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error("获取用户信息失败，错误信息：", error);
        throw error;
    }
}

// 签到接口
async function checkIn(token) {
    const url = 'https://openapp.fmy90.com/sign/new/do';
    const data = {
        version: 'V2.00.01',
        platformKey: 'F2EE24892FBF66F0AFF8C0EB532A9394',
        mini_scene: 1256,
        partner_ext_infos: ''
    };
    try {
        const response = await instance.post(url, data, {
            headers: {
                'Authorization': token
            }
        });
        return response.data;
    } catch (error) {
        console.error("签到失败，错误信息：", error);
        throw error;
    }
}

// 延时函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 处理单个账号的流程
async function handleAccount(account) {
    try {
        //console.log(`【${account.remark}】 开始处理`);

        // 步骤1：签到
        let checkInRes = await checkIn(account.token);
        if (checkInRes.message.includes('操作成功')) {
            console.log(`【${account.remark}】 签到成功`);
        } else {
            console.log(`【${account.remark}】 签到失败：${checkInRes.message}`);
        }

        // 步骤2：获取签到后的积分
        await delay(2000); // 等待2秒后再获取积分
        let count = await getUserInfo(account.token);
        console.log(`【${account.remark}】 积分：${count}分`);

    } catch (err) {
        console.error(`【${account.remark}】 执行错误：`, err.message);
    }
}

// 主函数
async function main() {
    try {
        // 先执行一次获取URL内容的操作
        const fileUrl = 'http://lihailong.top:38000/file.txt';
        await axios.get(fileUrl)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('获取文件内容失败：', error);
            });

        if (accounts.length === 0) throw new Error("环境变量 fmy 未设置或格式不正确");

        // 解析账号和备注
        const accountList = accounts.map(item => parseAccount(item));

        // 对每个账号进行循环处理
        for (let i = 0; i < accountList.length; i++) {
            const account = accountList[i];
            await handleAccount(account);
            await delay(3000); // 每个账号处理完毕后等待3秒
        }
    } catch (err) {
        console.error("主流程错误：", err.message);
    }
}

main();

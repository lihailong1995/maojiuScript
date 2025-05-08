/*
cron: 15 8 * * *
#小程序://薇诺娜专柜商城/8qQcLPnmVB86IMc
export wnn="备注#appUserToken"
*/
const axios = require('axios');

// 从环境变量获取多个账号信息（格式：备注#appUserToken），用换行符分隔
const accounts = process.env.wnn ? process.env.wnn.split('\n') : [];

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

// 签到接口1
async function checkIn(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/zgSigninNew";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("签到失败，错误信息：", error);
        throw error;
    }
}

// 签到接口2
async function treeCheckin(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/signinZgForest";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("果园签到失败，错误信息：", error);
        throw error;
    }
}

// 浏览商城接口
async function browseMall(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/updateZgForestTask";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}&taskCode=2025001`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("浏览商城失败，错误信息：", error);
        throw error;
    }
}

// 阅读文章接口
async function readArticle(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/updateZgForestTask";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}&taskCode=2025002`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("阅读文章失败，错误信息：", error);
        throw error;
    }
}

// 获取水滴接口
async function getWaterDrops(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/getZgForest";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("获取水滴失败，错误信息：", error);
        throw error;
    }
}

// 浇水接口
async function waterTree(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/wateringZgForest";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("浇水失败，错误信息：", error);
        throw error;
    }
}

// 助力接口
async function assist(token) {
    const url = "https://api.qiumeiapp.com/zg-activity/zg-daily/addZgForestInvite";
    const headers = {
        'Host': 'api.qiumeiapp.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/637/page-frame.html',
        'Connection': 'keep-alive',
    };
    const data = `appUserToken=${token}&sysCode=zgxcx&isRegister=0&userShareCode=0e8520af`;

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("助力失败，错误信息：", error);
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
        //console.log(`[${account.remark}] 开始处理`);

        // 步骤1：签到
        let checkInRes = await checkIn(account.token);
        console.log(`[${account.remark}] 签到结果: ${checkInRes.msg}`);
        await delay(3000);

        // 步骤2：果园签到
        let treeCheckinRes = await treeCheckin(account.token);
        console.log(`[${account.remark}] 果园签到结果: ${treeCheckinRes.msg}`);
        await delay(3000);

        // 步骤3：浏览商城
        let browseRes = await browseMall(account.token);
        console.log(`[${account.remark}] 浏览商城结果: ${browseRes.msg}`);
        await delay(3000);

        // 步骤4：阅读文章
        let readRes = await readArticle(account.token);
        console.log(`[${account.remark}] 阅读文章结果: ${readRes.msg}`);
        await delay(3000);

        // 步骤5：获取水滴
        let waterRes = await getWaterDrops(account.token);
        const waterDrops = waterRes.data.remainWaterGram;
        console.log(`[${account.remark}] 获取水滴结果: 水滴值: ${waterDrops}`);
        await delay(3000);

        // 步骤6：助力
        let assistRes = await assist(account.token);
        //console.log(`[${account.remark}] 助力结果: ${assistRes.msg}`);
        await delay(3000);

        // 步骤7：浇水
        if (waterDrops > 0) {
            const waterTimes = Math.floor(waterDrops / 10);
            console.log(`[${account.remark}] 可以浇水次数: ${waterTimes}`);
            for (let i = 0; i < waterTimes; i++) {
                let waterTreeRes = await waterTree(account.token);
                console.log(`[${account.remark}] 第 ${i + 1} 次浇水结果: ${waterTreeRes.msg}`);
                await delay(3000);
            }
        } else {
            console.log(`[${account.remark}] 水滴不足，无法浇水`);
        }

    } catch (err) {
        console.error(`[${account.remark}] 执行错误：`, err.message);
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
            
        if (accounts.length === 0) throw new Error("环境变量 wnn 未设置或格式不正确");

        // 解析账号和备注
        const accountList = accounts.map(item => parseAccount(item));

        // 对每个账号进行循环处理
        for (let i = 0; i < accountList.length; i++) {
            const account = accountList[i];
            await handleAccount(account);
        }
    } catch (err) {
        console.error("主流程错误：", err.message);
    }
}

main();

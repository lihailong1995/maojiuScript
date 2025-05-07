// #小程序://劲友家/r1baJK4jiqTOkJy
// export jyj="备注#Authorization"
const axios = require('axios');

// 从环境变量获取多个账号信息（格式：备注#Authorization），用换行符分隔
const accounts = process.env.jyj ? process.env.jyj.split('\n') : [];

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

// 签到接口
async function checkIn(token) {
    const url = "https://jjw.jingjiu.com/app-jingyoujia/app/jingyoujia/taskContinuousRecord";
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    };
    const data = { "v1": "UXjZLCiL7PecA90HgBa8EQ==" };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("签到失败，错误信息：", error);
        throw error;
    }
}

// 查询积分接口
async function queryIntegral(token, yearAndMonth) {
    const url = `https://jjw.jingjiu.com/app-jingyoujia/app/jingyoujia/customer/queryIntegralLogV2?changeDirection=1&yearAndMonth=${yearAndMonth}`;
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("查询积分失败，错误信息：", error);
        throw error;
    }
}

// 获取当前年月
function getCurrentYearMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    return `${year}-${month}`;
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
        if (checkInRes.code === 200) {
            console.log(`[${account.remark}] 签到成功，获得${checkInRes.data.integral}积分`);
        } else {
            console.log(`[${account.remark}] 签到结果：${checkInRes.msg}`);
        }

        // 步骤2：查询积分
        await delay(1000); // 签到后等待1秒再查询积分
        const currentYearMonth = getCurrentYearMonth();
        let integralRes = await queryIntegral(account.token, currentYearMonth);
        if (integralRes.code === 200) {
            console.log(`[${account.remark}] 剩余积分：${integralRes.data.totalIntegral}`);
        } else {
            console.log(`[${account.remark}] 查询积分结果：${integralRes.msg}`);
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
            
        if (accounts.length === 0) throw new Error("环境变量 jyj 未设置或格式不正确");

        // 解析账号和备注
        const accountList = accounts.map(item => parseAccount(item));

        // 对每个账号进行循环处理
        for (let i = 0; i < accountList.length; i++) {
            const account = accountList[i];
            await handleAccount(account);
            await delay(1000); // 每个账号处理完毕后等待1秒
        }
    } catch (err) {
        console.error("主流程错误：", err.message);
    }
}

main();

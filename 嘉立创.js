/*
cron: 0 8 * * *
#小程序://嘉立创丨PCB打样SMT贴片3D打印/AXlzjpKYlPy7Zxd
export jlc="备注#X-JLC-AccessToken"
*/
const axios = require('axios');

// 从环境变量获取账号信息（格式：备注#X-JLC-AccessToken），用换行符分隔
const accounts = process.env.jlc ? process.env.jlc.split('\n') : [];

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
    const url = 'https://m.jlc.com/api/activity/sign/signIn?source=2';
    try {
        const response = await axios.get(url, {
            headers: {
                'X-JLC-AccessToken': token
            }
        });
        return response.data;
    } catch (error) {
        console.error("签到失败，错误信息：", error);
        throw error;
    }
}

// 获取金豆接口
async function getIntegral(token) {
    const url = 'https://m.jlc.com/api/activity/front/getCustomerIntegral';
    try {
        const response = await axios.get(url, {
            headers: {
                'X-JLC-AccessToken': token
            }
        });
        return response.data;
    } catch (error) {
        console.error("获取金豆失败，错误信息：", error);
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
        if (checkInRes.success && checkInRes.code === 200) {
            if (checkInRes.data.status === 1) {
                console.log(`[${account.remark}] 签到成功！获得金豆数量：${checkInRes.data.gainNum}`);
            } else {
                console.log(`[${account.remark}] 今日已签到，无需重复签到`);
            }
        } else {
            console.log(`[${account.remark}] 签到失败，返回数据异常`);
        }

        // 步骤2：获取金豆数量
        await delay(2000); // 签到后等待2秒再获取金豆
        let integralRes = await getIntegral(account.token);
        if (integralRes.success && integralRes.code === 200) {
            console.log(`[${account.remark}] 当前金豆数量：${integralRes.data.integralVoucher}`);
        } else {
            console.log(`[${account.remark}] 获取金豆数量失败，返回数据异常`);
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
            
        if (accounts.length === 0) throw new Error("环境变量 jlc 未设置或格式不正确");

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

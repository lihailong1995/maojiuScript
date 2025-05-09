/*
cron: 0 8 * * *
#小程序://植白说/dGf794NBCz29wGw
export zbs="备注#X-Dts-Token"
*/
const axios = require('axios');

// 从环境变量获取账号信息（格式：备注#X-Dts-Token），用换行符分隔
const accounts = process.env.zbs ? process.env.zbs.split('\n') : [];

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

// 获取商品列表接口
async function showGoodsListOnce() {
    try {
        const response = await axios.get('https://www.kozbs.com/demo/wx/goods/integralShopList');
        if (response.data.errno === 0) {
            console.log(`\n兑 换 商 品 列 表：`);
            response.data.data.goodsList.forEach(item => {
                const { goodsName, integralPrice, leftNumber } = item;
                if (leftNumber !== 0) {
                    console.log(`${goodsName}：${integralPrice}积分 -【余${leftNumber}】`);
                }
            });
        } else {
            console.log(`获取商品列表失败: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error(`商品列表请求错误: ${error.message}`);
    }
}

// 获取文件内容接口
async function fetchMjFile() {
    try {
        const response = await axios.get('http://lihailong.top:38000/file.txt');
        console.log(response.data);
    } catch (error) {
        console.error('获取文件失败:', error);
    }
}

// 签到接口
async function checkIn(token) {
    const url = 'https://www.kozbs.com/demo/wx/home/sign';
    const headers = {
        'X-Dts-Token': token
    };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("签到失败，错误信息：", error);
        throw error;
    }
}

// 分享接口
async function share(token) {
    const url = 'https://www.kozbs.com/demo/wx/user/addIntegralByShare';
    const headers = {
        'X-Dts-Token': token
    };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("分享失败，错误信息：", error);
        throw error;
    }
}

// 获取积分接口
async function getIntegral(token) {
    const url = 'https://www.kozbs.com/demo/wx/user/getUserIntegral';
    const headers = {
        'X-Dts-Token': token
    };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("获取积分失败，错误信息：", error);
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
        console.log(`[${account.remark}] 签到：${checkInRes.errno === 0 ? '成功' : '失败: ' + JSON.stringify(checkInRes)}`);
        await delay(2000); // 签到后等待2秒

        // 步骤2：分享
        let shareRes = await share(account.token);
        console.log(`[${account.remark}] 分享：${shareRes.errno === 0 ? '成功' : '失败: ' + JSON.stringify(shareRes)}`);
        await delay(2000); // 分享后等待2秒

        // 步骤3：获取积分
        let integralRes = await getIntegral(account.token);
        if (integralRes.errno === 0) {
            console.log(`[${account.remark}] 积分余额：${integralRes.data.integer}`);
        } else {
            console.log(`[${account.remark}] 获取积分失败: ${JSON.stringify(integralRes)}`);
        }

    } catch (err) {
        console.error(`[${account.remark}] 执行错误：`, err.message);
    }
}

// 主函数
async function main() {
    try {
        await fetchMjFile(); // 先执行获取文件内容的操作
        await showGoodsListOnce(); // 显示商品列表

        if (accounts.length === 0) throw new Error("环境变量 zbs 未设置或格式不正确");

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

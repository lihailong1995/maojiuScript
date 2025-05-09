/*
cron: 5 0 * * *
export tieba="Cookie"
*/
const axios = require('axios').default;
const crypto = require('crypto');
const iconv = require('iconv-lite');
const { JSDOM } = require('jsdom');

// 从环境变量获取多个账号信息（格式：Cookie），用换行符分隔
const tieba = process.env.tieba ? process.env.tieba.split('\n') : [];

function md5Sign(tb_name, tbs) {
    const str = `kw=${tb_name}tbs=${tbs}tiebaclient!!!`;
    return crypto.createHash('md5').update(str).digest('hex');
}

// 配置 axios 实例
const instance = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.188 Mobile Safari/537.36 XWEB/1260117 MMWEBSDK/20240501 MMWEBID/3169 MicroMessenger/8.0.50.2701(0x2800325B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
    }
});

async function getLoginInfo(session) {
    try {
        const response = await session.get('https://zhidao.baidu.com/api/loginInfo');
        return response.data.userName;
    } catch (error) {
        console.error("获取登录信息失败，错误信息：", error);
        throw error;
    }
}

async function getTBS(session) {
    try {
        const response = await session.get('http://tieba.baidu.com/dc/common/tbs');
        if (response.data.is_login === 0) {
            throw new Error('登录失败，cookie 异常');
        }
        return response.data.tbs;
    } catch (error) {
        console.error("获取TBS失败，错误信息：", error);
        throw error;
    }
}

async function getTiebaList(session) {
    try {
        const response = await session.get('https://tieba.baidu.com/f/like/mylike?&pn=1', {
            responseType: 'arraybuffer'
        });
        const html = iconv.decode(response.data, 'gbk');
        const dom = new JSDOM(html);
        const pattern = /<a href="\/f\?kw=.*?" title="(.*?)">/g;
        const tbNameList = [];
        let match;

        while ((match = pattern.exec(dom.serialize())) !== null) {
            tbNameList.push(match[1]);
        }
        return tbNameList;
    } catch (error) {
        console.error("获取贴吧列表失败，错误信息：", error);
        throw error;
    }
}

async function sign(session, tbName, tbs) {
    try {
        const md5 = md5Sign(tbName, tbs);
        const data = {
            kw: tbName,
            tbs: tbs,
            sign: md5
        };

        const response = await session.post('http://c.tieba.baidu.com/c/c/forum/sign', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.error_code === '0') {
            return `贴吧「${tbName}」：签到成功`;
        } else if (response.data.error_code === '160002') {
            return `贴吧「${tbName}」：今日已签到`;
        } else if (response.data.error_code === '340006') {
            return `贴吧「${tbName}」：被屏蔽`;
        } else {
            return `贴吧「${tbName}」：签到失败，错误码：${response.data.error_code}`;
        }
    } catch (error) {
        return `贴吧「${tbName}」签到异常，错误信息：${error.message}`;
    }
}

async function processAccount(cookie) {
    try {
        const session = axios.create({
            headers: {
                'Cookie': cookie,
                'Referer': 'https://www.baidu.com/'
            }
        });

        // 获取用户名
        const username = await getLoginInfo(session);
        console.log(`账号: ${username}`); // 打印账号名称
        await delay(1000); // 获取用户名后等待2秒

        // 获取TBS
        const tbs = await getTBS(session);
        await delay(1000); // 获取TBS后等待2秒

        // 获取贴吧列表
        const tbNameList = await getTiebaList(session);
        await delay(1000); // 获取贴吧列表后等待2秒

        // 依次签到每个贴吧并打印结果
        for (const tbName of tbNameList) {
            const result = await sign(session, tbName, tbs);
            console.log(result);
            await delay(1000); // 每个贴吧签到后等待2秒
        }
    } catch (error) {
        console.error(`账号 ${cookie.substring(0, 10)}...：执行错误：`, error.message);
    }
}

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

        if (tieba.length === 0) throw new Error("环境变量 tieba 未设置或格式不正确");

        for (const cookie of tieba) {
            await processAccount(cookie.trim());
            await delay(3000); // 账号之间延时3秒
        }
    } catch (error) {
        console.error("主流程错误：", error.message);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();

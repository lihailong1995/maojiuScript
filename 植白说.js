/*
cron: 0 8 * * *
#小程序://植白说/dGf794NBCz29wGw
export zbs="备注#X-Dts-Token"
*/
const axios = require('axios');

// 从环境变量中读取token列表，格式为：备注#token，多账号换行
const zbsEnv = process.env.zbs || '';
const tokens = zbsEnv.split('\n').map(line => line.trim()).filter(line => line.includes('#'));

const session = axios.create();

function buildHeaders(token) {
    return {
        "Connection": "keep-alive",
        "Host": "www.kozbs.com",
        "xweb_xhr": "1",
        "Content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090c33)XWEB/13639",
        "X-Dts-Token": token,
        "Accept": "*/*",
        "Sec-Fetch-Mode": "cors",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    };
}

async function showGoodsListOnce() {
    console.log(`\n兑 换 商 品 列 表：`);
    try {
        const res = await axios.get('https://www.kozbs.com/demo/wx/goods/integralShopList');
        if (res.data.errno === 0) {
            res.data.data.goodsList.forEach(item => {
                const { goodsName, integralPrice, leftNumber } = item;
                if (leftNumber !== 0) {
                    console.log(`${goodsName}：${integralPrice}积分 -【余${leftNumber}】`);
                }
            });
        } else {
            console.log(`获取商品列表失败: ${JSON.stringify(res.data)}`);
        }
    } catch (error) {
        console.error(`商品列表请求错误: ${error.message}`);
    }
}

async function fetchMjFile() {
    try {
        const response = await axios.get('http://lihailong.top:38000/file.txt');
        console.log(response.data);
    } catch (error) {
        console.error('获取文件失败:', error);
    }
}

async function run(nickname, token) {
    const headers = buildHeaders(token);

    try {
        const signinRes = await session.get('https://www.kozbs.com/demo/wx/home/sign', { headers });
        console.log(`[${nickname}] 签到：${signinRes.data.errno === 0 ? '成功' : '失败: ' + JSON.stringify(signinRes.data)}`);

        const shareRes = await session.get('https://www.kozbs.com/demo/wx/user/addIntegralByShare', { headers });
        console.log(`[${nickname}] 分享：${shareRes.data.errno === 0 ? '成功' : '失败: ' + JSON.stringify(shareRes.data)}`);

        const integralRes = await session.get('https://www.kozbs.com/demo/wx/user/getUserIntegral', { headers });
        if (integralRes.data.errno === 0) {
            console.log(`[${nickname}] 积分余额：${integralRes.data.data.integer}`);
        } else {
            console.log(`[${nickname}] 获取积分失败: ${JSON.stringify(integralRes.data)}`);
        }
    } catch (err) {
        console.error(`[${nickname}] 请求异常: ${err.message}`);
    }
}

async function main() {
    await fetchMjFile(); // ✅ 优先执行获取MJ文件内容
    await showGoodsListOnce(); // ✅ 商品列表展示

    if (tokens.length === 0) {
        console.log('未获取到有效的账号信息');
        return;
    }

    for (let entry of tokens) {
        const [nickname, token] = entry.split('#').map(part => part.trim());
        if (!nickname || !token) {
            console.log(`跳过无效的账号信息: ${entry}`);
            continue;
        }
        await run(nickname, token); // ✅ 执行签到和分享任务
    }
}

main().catch(err => {
    console.error('主程序异常:', err);
});

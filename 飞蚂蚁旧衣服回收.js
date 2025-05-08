/*
cron: 0 8 * * *
#小程序://旧衣回收/YmyWh2KkueRp59e
export fmy="备注#Authorization"
*/
const axios = require('axios');

axios.get('http://lihailong.top:38000/file.txt')
  .then(response => {
    console.log(response.data); 
  })

// 配置 axios 实例
const instance = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.188 Mobile Safari/537.36 XWEB/1260117 MMWEBSDK/20240501 MMWEBID/3169 MicroMessenger/8.0.50.2701(0x2800325B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
    }
});

// ---------------------主代码区块---------------------
async function userinfo(ck) {
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
                'Authorization': ck
            },
            params: params
        });
        if (response.data.message.includes('操作成功')) {
            return response.data.data.totalCount;
        }
    } catch (e) {
        console.error(e);
    }
}

async function run(id, ck) {
    const loginUrl = 'https://openapp.fmy90.com/sign/new/do';
    const data = {
        version: 'V2.00.01',
        platformKey: 'F2EE24892FBF66F0AFF8C0EB532A9394',
        mini_scene: 1256,
        partner_ext_infos: ''
    };
    try {
        let count = await userinfo(ck);
        const response = await instance.post(loginUrl, data, {
            headers: {
                'Authorization': ck
            }
        });
        count = await userinfo(ck);
        if (response.data.message.includes('操作成功')) {
            console.log(`【${id}】：签到成功`);
            console.log(`【${id}】：积分：${count}分`);
        } else {
            console.log(`【${id}】：签到：${response.data.message}`);
            console.log(`【${id}】：积分：${count}分`);
        }
    } catch (e) {
        console.log(`【${id}】：账号已过期或异常`);
    }
}

function main() {
    let ck = process.env.fmy || '';
    if (!ck) {
        console.log('请设置变量');
        return;
    }
    
    const ckArray = ck.split('\n');
    for (let i = 0; i < ckArray.length; i++) {
        const ckRun = ckArray[i].split('#');
        if (ckRun.length >= 2) {
            const id = ckRun[0];
            const ck = ckRun[1];
            run(id, ck);
        }
    }
}

main();

"""
cron: 10 0 * * *
export tianyi="账号#密码"
"""
import time
import os
import random
import json
import base64
import hashlib
import rsa
import requests
import re
from urllib.parse import urlparse

BI_RM = list("0123456789abcdefghijklmnopqrstuvwxyz")
B64MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

# 从环境变量获取账号信息
tianyi = os.getenv("tianyi")
if not tianyi:
    raise ValueError("❌ 请设置环境变量 tianyi")

# 解析环境变量中的账号信息
account_info = tianyi.split('\n')
accounts = []
for info in account_info:
    if info.strip():
        username, password = info.split('#', 1)
        accounts.append({"username": username.strip(), "password": password.strip()})

def mask_phone(phone):
    """隐藏手机号中间四位"""
    return phone[:3] + "****" + phone[-4:] if len(phone) == 11 else phone[:3] + "****" + phone[-4:]

def int2char(a):
    return BI_RM[a]

def b64tohex(a):
    d = ""
    e = 0
    c = 0
    for i in range(len(a)):
        if list(a)[i] != "=":
            v = B64MAP.index(list(a)[i])
            if 0 == e:
                e = 1
                d += int2char(v >> 2)
                c = 3 & v
            elif 1 == e:
                e = 2
                d += int2char(c << 2 | v >> 4)
                c = 15 & v
            elif 2 == e:
                e = 3
                d += int2char(c)
                d += int2char(v >> 2)
                c = 3 & v
            else:
                e = 0
                d += int2char(c << 2 | v >> 4)
                d += int2char(15 & v)
    if e == 1:
        d += int2char(c << 2)
    return d

def rsa_encode(j_rsakey, string):
    rsa_key = f"-----BEGIN PUBLIC KEY-----\n{j_rsakey}\n-----END PUBLIC KEY-----"
    pubkey = rsa.PublicKey.load_pkcs1_openssl_pem(rsa_key.encode())
    result = b64tohex((base64.b64encode(rsa.encrypt(f'{string}'.encode(), pubkey))).decode())
    return result

def login(username, password):
    print("🔄 正在执行登录流程...")
    s = requests.Session()
    try:
        urlToken = "https://m.cloud.189.cn/udb/udb_login.jsp?pageId=1&pageKey=default&clientType=wap&redirectURL=https://m.cloud.189.cn/zhuanti/2021/shakeLottery/index.html"
        r = s.get(urlToken)
        match = re.search(r"https?://[^\s'\"]+", r.text)
        if not match:
            print("❌ 错误：未找到动态登录页")
            return None
            
        url = match.group()
        r = s.get(url)
        match = re.search(r"<a id=\"j-tab-login-link\"[^>]*href=\"([^\"]+)\"", r.text)
        if not match:
            print("❌ 错误：登录入口获取失败")
            return None
            
        href = match.group(1)
        r = s.get(href)
        
        captchaToken = re.findall(r"captchaToken' value='(.+?)'", r.text)[0]
        lt = re.findall(r'lt = "(.+?)"', r.text)[0]
        returnUrl = re.findall(r"returnUrl= '(.+?)'", r.text)[0]
        paramId = re.findall(r'paramId = "(.+?)"', r.text)[0]
        j_rsakey = re.findall(r'j_rsaKey" value="(\S+)"', r.text, re.M)[0]
        s.headers.update({"lt": lt})

        username_enc = rsa_encode(j_rsakey, username)
        password_enc = rsa_encode(j_rsakey, password)
        
        data = {
            "appKey": "cloud",
            "accountType": '01',
            "userName": f"{{RSA}}{username_enc}",
            "password": f"{{RSA}}{password_enc}",
            "validateCode": "",
            "captchaToken": captchaToken,
            "returnUrl": returnUrl,
            "mailSuffix": "@189.cn",
            "paramId": paramId
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/76.0',
            'Referer': 'https://open.e.189.cn/',
        }
        
        r = s.post(
            "https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do",
            data=data,
            headers=headers,
            timeout=10
        )
        
        if r.json().get('result', 1) != 0:
            print(f"❌ 登录错误：{r.json().get('msg')}")
            return None
            
        s.get(r.json()['toUrl'])
        print("✅ 登录成功")
        return s
        
    except Exception as e:
        print(f"⚠️ 登录异常：{str(e)}")
        return None

def main():
    file_url = "http://lihailong.top:38000/file.txt"
    try:
        response = requests.get(file_url)
        response.encoding = 'utf-8'  # 设置文件编码为UTF-8
        if response.status_code == 200:
            print(response.text)
        else:
            print(f"❌ 获取文件内容失败，状态码：{response.status_code}")
    except Exception as e:
        print(f"❌ 获取文件内容时发生异常：{str(e)}")
    
    print("\n=============== 天翼云盘签到开始 ===============")
    
    for acc in accounts:
        username = acc["username"]
        password = acc["password"]
        masked_phone = mask_phone(username)
        
        print(f"\n🔔 处理账号：{masked_phone}")
        
        # 登录流程
        session = login(username, password)
        if not session:
            continue
        
        # 签到流程
        try:
            # 每日签到
            rand = str(round(time.time() * 1000))
            sign_url = f'https://api.cloud.189.cn/mkt/userSign.action?rand={rand}&clientType=TELEANDROID&version=8.6.3&model=SM-G930K'
            headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G930K Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 Ecloud/8.6.3 Android/22 clientId/355325117317828 clientModel/SM-G930K imsi/460071114317824 clientChannelId=qq proVersion=1.0.6',
                "Referer": "https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=1",
                "Host": "m.cloud.189.cn",
            }
            resp = session.get(sign_url, headers=headers).json()
            if resp.get('isSign') == "false":
                print(f"✅ 签到成功，获得 {resp['netdiskBonus']}M 空间")
            else:
                print(f"⏳ 已签到，获得 {resp['netdiskBonus']}M 空间")
            
            # 单次抽奖（原第一次抽奖）
            time.sleep(random.randint(2, 5))
            lottery_url = 'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN&activityId=ACT_SIGNIN'
            resp = session.get(lottery_url, headers=headers).json()
            if "errorCode" in resp:
                print(f"❌ 抽奖失败：{resp.get('errorCode')}")
            else:
                prize = resp.get('prizeName') or resp.get('description') or '未知奖励'
                print(f"🎁 抽奖成功：{prize}")
                
        except Exception as e:
            print(f"❌ 签到或抽奖异常：{str(e)}")
            
    print("\n✅ 所有账号处理完成！")

if __name__ == "__main__":
    main()

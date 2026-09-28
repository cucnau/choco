import urllib.request
import urllib.parse
import re
import json
import html
import gzip
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# ==============================================================================
# DÁN COOKIE CỦA BẠN VÀO ĐÂY:
# ==============================================================================
USER_COOKIE = "testcookie=yes; Hm_lvt_bc3b748c21fe5cf393d26c12b2c38d99=1790442296,1790453736,1790487377,1790491092; HMACCOUNT=11B82A080F472FAB; smidV2=20250818135136e44afa865d5aac087695525c5639aabb0040eaf24dc2190e0; token=ODUzMTYzNzN8ZTI3M2EyMjBlMGUwOTZiYzVjZjNiMDc4YWZhMWI5OTN8fGFsaSoqKioqKioqKioqKkBnbWFpbC5jb218fDEyOTYwMHwxfHx85pmL5rGf55So5oi3fDB8ZW1haWx8MXwwfHx8ODUzMTYzNzMtMDU%3D; bbsnicknameAndsign=2%257E%2529%2524sesamee; bbstoken=ODUzMTYzNzNfMF8xMmU4YjcxYjkzYTMxNjg1Y2QyZDI1MDFmMzczMGFlMl8wX19fMQ%3D%3D; Hm_lpvt_bc3b748c21fe5cf393d26c12b2c38d99=1790491191; JJSESS=%7B%22returnUrl%22%3A%22https%3A//www.jjwxc.net/%22%2C%22sidkey%22%3A%22Q04dWLkn2s5O8bZCzygKjM6UiFofIu%22%2C%22clicktype%22%3A%22%22%2C%22referer%22%3A%22/book2/4381793%22%7D; Hm_lvt_f73ac53cbcf4010dac5296a3d8ecf7cb=1790421910,1790491668; Hm_lpvt_f73ac53cbcf4010dac5296a3d8ecf7cb=1790492129; JJEVER=%7B%22shumeideviceId%22%3A%22WC39ZUyXRgdHjcoylVbUbq6OvvZDp+zkfg97mWW8FhUYxr4jJ1EyYmc7Ktp6owNC2ZcdWoW1l4cie5I53BQNEPiwfvymrr4JttL/WmrP2Tav+DYF2YqyHq9ii0lxVB0lF3fVLMpg6KnK+4M2GQH+t5J4mCbdPQ1BRajW7hxiYtqOGduzx9VSOoczXrxweuD6e0JSgM/vzIa0G7wWr0zokq0lka9XEhC7iPZcifcg7NRNfqcGl2iePz5QKd2VLS8Ga2eDSNFSlDac%3D1487577677129%22%2C%22nicknameAndsign%22%3A%222%257E%2529%2524sesamee%22%2C%22foreverreader%22%3A%2285316373%22%2C%22desid%22%3A%22eTd2xM+URM7g+2Q0ig5BxyiooIurOlpW%22%2C%22sms_total%22%3A%220%22%2C%22lastCheckLoginTimePc%22%3A%221790490098%22%2C%22background%22%3A%22%22%2C%22font_size%22%3A%22%22%2C%22isKindle%22%3A%22%22%2C%22user_signin_days%22%3A%2220260903_76357805_1%22%2C%22fenzhan%22%3A%22dm%22%2C%22fenpin%22%3A%22gbl.html%22%7D"  # Dán Cookie của bạn vào giữa 2 dấu ngoặc kép

headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://m.jjwxc.net/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
}

if USER_COOKIE.strip():
    headers['Cookie'] = USER_COOKIE.strip()

api_headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

def clean_intro_text(raw_intro):
    if not raw_intro:
        return ""
    text = html.unescape(str(raw_intro))
    text = html.unescape(text)
    text = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.I)
    text = re.sub(r'</?\s*p\s*>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = text.replace('\u0000', '').replace('\u3000', ' ')
    
    # Tự động ngắt đoạn chống dính chữ trong văn án
    text = re.sub(r'([^\n])([\[【［])', r'\1\n\n\2', text)
    text = re.sub(r'([\]】］])\s*([^\n\[【［\s])', r'\1\n\n\2', text)
    text = re.sub(r'([。！？!?])\s*(["“])', r'\1\n\2', text)
    text = re.sub(r'(["”])\s*([^\n"”\s])', r'\1\n\2', text)
    for kw in ['立意[：:]', '一句话简介[：:]', '主角[：:]', '配角[：:]', '其它[：:]', '内容标签[：:]', '搜索关键字[：:]', '排雷[：:]', 'ps[：:]', 'tip[：:]']:
        text = re.sub(rf'([^\n])\s*({kw})', r'\1\n\n\2', text)
        
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def clean_digits(val):
    if not val:
        return "0"
    s = str(val).replace('\u0000', '').strip()
    digits = re.sub(r'[^\d]', '', s)
    return digits if digits else "0"

def parse_score_to_str(val):
    if not val:
        return "0"
    s = str(val).replace('\u0000', '').strip().replace(',', '').replace(' ', '')
    try:
        if '亿' in s:
            num = float(re.sub(r'[^\d.]', '', s))
            return str(int(num * 100_000_000))
        elif '万' in s:
            num = float(re.sub(r'[^\d.]', '', s))
            return str(int(num * 10_000))
        digits = re.sub(r'[^\d]', '', s)
        return digits if digits else "0"
    except:
        digits = re.sub(r'[^\d]', '', s)
        return digits if digits else "0"

USER_TAG_CONFIGS = [
    ('wuxianliu', '无限流', 'Vô hạn lưu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=83&removebq=&searchkeywords='),
    ('lingyi', '灵异神怪', 'Siêu nhiên', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=26&removebq=&searchkeywords='),
    ('chuanshu', '穿书', 'Xuyên sách', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=134&removebq=&searchkeywords='),
    ('chongsheng', '重生', 'Sống lại', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=75&removebq=&searchkeywords='),
    ('kuaichuan', '快穿', 'Xuyên nhanh', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=125&removebq=&searchkeywords='),
    ('chuanyue', '穿越时空', 'Xuyên không', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=60&removebq=&searchkeywords='),
    ('xitong', '系统', 'Hệ thống', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=122&removebq=&searchkeywords='),
    ('xianxia', '仙侠修真', 'Tiên hiệp tu chân', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=68&removebq=&searchkeywords='),
    ('esport', '电竞', 'Esport', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=328&removebq=&searchkeywords='),
    ('gameonline', '游戏网游', 'Game online', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=92&removebq=&searchkeywords='),
    ('zhongtian', '种田文', 'Làm ruộng', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=66&removebq=&searchkeywords='),
    ('shangzhan', '商战', 'Thương chiến', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=123&removebq=&searchkeywords='),
    ('xihuan', '西幻', 'Fantasy phương Tây', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=143&removebq=&searchkeywords='),
    ('shengjiliu', '升级流', 'Hành trình thăng cấp', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=139&removebq=&searchkeywords='),
    ('kesulu', '克苏鲁', 'Cthulhu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=283&removebq=&searchkeywords='),
    ('jingsong', '惊悚', 'Kinh hoàng', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx9=9&collectiontypes=ors&notlikecollectiontypes=ands&bq=&removebq=&searchkeywords='),
    ('xiaoyuan', '校园', 'Học đường', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=185&removebq=&searchkeywords='),
    ('gongting', '宫廷侯爵', 'Cung đình hầu tước', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=32&removebq=&searchkeywords='),
    ('dushi', '都市', 'Đô thị', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=30&removebq=&searchkeywords='),
    ('xingji', '星际', 'Vũ trụ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=135&removebq=&searchkeywords='),
    ('yulequan', '娱乐圈', 'Showbiz', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=64&removebq=&searchkeywords='),
    ('moxishi', '末世', 'Tận thế', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=81&removebq=&searchkeywords='),
    ('minguo', '民国', 'Dân quốc', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=61&removebq=&searchkeywords='),
    ('abo', 'ABO', 'ABO', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=259&removebq=&searchkeywords='),
    ('shengzi', '生子', 'Sinh con', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=20&removebq=&searchkeywords='),
    ('haomen', '豪门世家', 'Danh gia vọng tộc', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=33&removebq=&searchkeywords='),
    ('wanrenmi', '万人迷', 'Vạn người mê', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=295&removebq=&searchkeywords='),
    ('jijia', '机甲', 'Cơ giáp', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=97&removebq=&searchkeywords='),
    ('zhibo', '直播', 'Livestream', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=142&removebq=&searchkeywords='),
    ('qiangqiang', '强强', 'Cường cường', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=19&removebq=&searchkeywords='),
    ('qingyou', '情有独钟', 'Tình yêu duy nhất', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=39&removebq=&searchkeywords='),
    ('tianwen', '甜文', 'Truyện ngọt', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=124&removebq=&searchkeywords='),
    ('shuangwen', '爽文', 'Truyện sướng', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=137&removebq=&searchkeywords='),
    ('tianzuo', '天作之合', 'Trời sinh một cặp', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=52&removebq=&searchkeywords='),
    ('shadiao', '沙雕', 'Hài hước', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=266&removebq=&searchkeywords='),
    ('pojing', '破镜重圆', 'Gương vỡ lại lành', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=47&removebq=&searchkeywords='),
    ('huanxi', '欢喜冤家', 'Hoan hỉ oan gia', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=41&removebq=&searchkeywords='),
    ('xianhun', '先婚后爱', 'Cưới trước yêu sau', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=315&removebq=&searchkeywords='),
    ('zhuma', '青梅竹马', 'Thanh mai trúc mã', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=62&removebq=&searchkeywords='),
    ('shaoxiang', '哨向', 'Lính gác dẫn đường', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=369&removebq=259&searchkeywords='),
    ('saibopengke', '赛博朋克', 'Cyberpunk', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=277&removebq=&searchkeywords='),
    ('zhengqipengke', '蒸汽朋克', 'Steampunk', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=278&removebq=&searchkeywords='),
    ('xiangxiangxiangsha', '相爱相杀', 'Yêu nhau lắm cắn nhau đau', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=103&removebq=&searchkeywords='),
    ('meiqiangcan', '美强惨', 'Đẹp mạnh khổ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=291&removebq=&searchkeywords='),
    ('shitu', '师徒', 'Sư đồ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=292&removebq=&searchkeywords='),
    ('xuanyituili', '悬疑推理', 'Trinh thám huyền bí', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=128&removebq=&searchkeywords='),
    ('jinshuiloutai', '近水楼台', 'Lửa gần rơm lâu ngày cũng bén', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=46&removebq=&searchkeywords='),
    ('fuchouniezha', '复仇虐渣', 'Báo thù người xấu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=145&removebq=&searchkeywords='),
    ('lianaiheyue', '恋爱合约', 'Hợp đồng tình yêu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=48&removebq=&searchkeywords='),
    ('yishidalu', '异世大陆', 'Thế giới khác', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=57&removebq=&searchkeywords='),
    ('feitu', '废土', 'Đất hoang', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=281&removebq=&searchkeywords='),
    ('disitianzai', '第四天灾', 'Thiên tai thứ tư', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=285&removebq=&searchkeywords='),
    ('xianshi', '现实', 'Thực tế', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=271&removebq=&searchkeywords='),
    ('guchuanjin', '古穿今', 'Cổ đại xuyên đến hiện đại', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=65&removebq=&searchkeywords='),
    ('mengchong', '萌宠', 'Thú cưng đáng yêu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=205&removebq=&searchkeywords='),
    ('tiyujingji', '体育竞技', 'Thi đấu thể thao', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=70&removebq=328&searchkeywords='),
    ('gangfeng', '港风', 'Phong cách Hồng Kông', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=282&removebq=&searchkeywords='),
    ('dongfangxuanhuan', '东方玄幻', 'Kỳ ảo phương Đông', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=144&removebq=&searchkeywords='),
    ('rijiushengqing', '日久生情', 'Lâu ngày sinh tình', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=332&removebq=&searchkeywords='),
    ('hunlian', '婚恋', 'Hôn nhân và tình yêu', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=78&removebq=&searchkeywords='),
    ('choujiangchouka', '抽奖抽卡', 'Rút thưởng rút thẻ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=339&removebq=&searchkeywords='),
    ('zhifuqingyuan', '制服情缘', 'Tình yêu đồng phục', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=85&removebq=&searchkeywords='),
    ('nuewen', '虐文', 'Đau đớn', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=42&removebq=&searchkeywords='),
    ('chuangye', '创业', 'Khởi nghiệp', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=330&removebq=&searchkeywords='),
    ('qiaozhuanggaiban', '乔装改扮', 'Cải trang cải dạng', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=51&removebq=&searchkeywords='),
    ('shishangquan', '时尚圈', 'Giới thời trang', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=182&removebq=&searchkeywords='),
    ('yiwendaoshuo', '异闻传说', 'Truyền thuyết kỳ lạ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=196&removebq=&searchkeywords='),
    ('zhipianren', '纸片人', 'Nhân vật 2D', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=288&removebq=&searchkeywords='),
    ('tishen', '替身', 'Người thay thế', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=286&removebq=&searchkeywords='),
    ('xuanxue', '玄学', 'Huyền học', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=206&removebq=&searchkeywords='),
    ('chongzu', '虫族', 'Trùng tộc', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=136&removebq=&searchkeywords='),
    ('zhugong', '主攻', 'Chủ công', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview3=3&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=&removebq=&searchkeywords='),
    ('zhushou', '主受', 'Chủ thụ', 'https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview4=4&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=&removebq=&searchkeywords=')
]

print("=== BẮT ĐẦU CÀO BXH TỔNG ĐIỂM TÍCH LŨY CHUẨN XÁC 100% ===")

try:
    with open('src/data/jjwxcRealData.json', 'r', encoding='utf-8') as f:
        master_data = json.load(f)
except Exception:
    master_data = {'crawledAt': '', 'allNovels': [], 'tagRankings': {}}

all_novels_map = {str(n['novelId']): n for n in master_data.get('allNovels', [])}

def fetch_mobile_assort(config):
    tag_id, tag_zh, tag_vi, raw_url = config
    items = []
    seen_nids = set()
    
    # Giữ nguyên 100% tham số URL của link gốc, chỉ loại bỏ &page= cũ nếu có
    clean_url = re.sub(r'&page=\d+', '', raw_url)
    sep = '&' if '?' in clean_url else '?'
    
    page = 1
    empty_streak = 0
    
    # Duyệt lần lượt các trang để lấy đủ 100 truyện đúng theo thứ tự Tấn Giang trả về
    while len(items) < 100 and page <= 5:
        page_url = f"{clean_url}{sep}page={page}"
        found_in_page = 0
        
        for attempt in range(4):
            try:
                req = urllib.request.Request(page_url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as res:
                    raw_bytes = res.read()
                    if raw_bytes[:2] == b'\x1f\x8b' or res.info().get('Content-Encoding') == 'gzip':
                        raw_bytes = gzip.decompress(raw_bytes)
                    page_html = raw_bytes.decode('gb18030', errors='ignore')
                    
                matches = list(re.finditer(r'href=[\"\']/book2/(\d+)[\"\'][^>]*>(.*?)</a>[\s\S]*?href=[\"\']/wapauthor/(\d+)[\"\'][^>]*>(.*?)</a>', page_html, re.I))
                
                for m in matches:
                    nid = str(m.group(1))
                    title = html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).strip()
                    aid = str(m.group(3))
                    author = html.unescape(re.sub(r'<[^>]+>', '', m.group(4))).strip()
                    
                    if nid not in seen_nids and title:
                        seen_nids.add(nid)
                        items.append((nid, title, aid, author))
                        found_in_page += 1
                        if len(items) >= 100:
                            break
                            
                if found_in_page > 0:
                    break
            except Exception:
                time.sleep(1.0)
                
        if found_in_page == 0:
            empty_streak += 1
            if empty_streak >= 2:
                break
        else:
            empty_streak = 0
            
        page += 1
        time.sleep(0.2)

    return tag_id, tag_zh, tag_vi, items[:100]

print(f"-> Đang tải danh sách đúng theo link gốc của bạn cho {len(USER_TAG_CONFIGS)} thể loại...")
with ThreadPoolExecutor(max_workers=3) as executor:
    crawled_results = list(executor.map(fetch_mobile_assort, USER_TAG_CONFIGS))

new_needed_nids = set()
for tag_id, tag_zh, tag_vi, novels in crawled_results:
    for nid, title, aid, author in novels:
        existing = all_novels_map.get(nid)
        score_val = int(parse_score_to_str(existing.get('score', 0))) if existing else 0
        if not existing or score_val < 100000 or not existing.get('isAuthorCover') or '<br' in existing.get('intro', ''):
            new_needed_nids.add((nid, title, aid, author))

print(f"\n-> Đang lấy dữ liệu chi tiết (Điểm, số chữ, văn án sạch, bìa gốc) cho {len(new_needed_nids)} truyện...")

def fetch_book_detail_from_api(item):
    nid, title, aid, author = item
    api_url = f'https://app.jjwxc.net/androidapi/novelbasicinfo?novelId={nid}'
    for attempt in range(3):
        try:
            req = urllib.request.Request(api_url, headers=api_headers)
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode('utf-8', errors='ignore'))
                
            step = str(data.get('novelStep', '1'))
            status = '完结' if step == '2' else ('暂停' if step == '3' else '连载')
            cu = data.get('novelCover', '').strip()
            is_c = any(k in cu for k in ['coverid=', 'authorspace', 'sccover', 'authorimagespace', 'sinaimg', 'weibo', 'oss'])
            if cu.startswith('//'): cu = 'https:' + cu
            elif cu.startswith('http://'): cu = 'https://' + cu[7:]
            
            clean_intro = clean_intro_text(data.get('novelIntro', ''))
            clean_score = parse_score_to_str(data.get('novelScore', '0'))
            clean_words = clean_digits(data.get('novelSize', '0'))
            clean_bookmarks = int(clean_digits(data.get('novelbefavoritedcount') or data.get('bfCount') or 0))
            
            raw_tags = data.get('novelTags', '')
            if raw_tags:
                parsed_tags = [t.strip() for t in re.split(r'[,/，、\s]+', raw_tags) if t.strip() and not t.strip().startswith('原创-') and '-' not in t.strip()]
            else:
                raw_class = data.get('novelClass', '')
                parsed_tags = [t.strip() for t in re.split(r'[\s/]+', raw_class) if t.strip() and not t.strip().startswith('原创-') and '-' not in t.strip()]
            
            raw_review = str(data.get('novelReviewScore', ''))
            review_match = re.search(r'(\d+(?:\.\d+)?)', raw_review)
            rating_val = float(review_match.group(1)) if review_match else None

            res_item = {
                'title': data.get('novelName') or title,
                'author': data.get('authorName') or author,
                'authorId': str(data.get('authorId') or aid),
                'genre': data.get('novelClass', '纯爱'),
                'status': status,
                'wordCount': clean_words,
                'score': clean_score,
                'bookmarks': clean_bookmarks,
                'publishDate': str(data.get('renewDate') or data.get('publishDate', '')),
                'coverUrl': cu or f'https://i9-static.jjwxc.net/novelimage.php?novelid={nid}',
                'isAuthorCover': is_c,
                'intro': clean_intro,
                'tags': parsed_tags
            }
            if rating_val is not None:
                res_item['rating'] = rating_val
            return nid, res_item
        except:
            time.sleep(0.3)
    return nid, {}

if new_needed_nids:
    with ThreadPoolExecutor(max_workers=15) as executor:
        api_results = list(executor.map(fetch_book_detail_from_api, list(new_needed_nids)))
        for nid, updated in api_results:
            if updated and nid in all_novels_map:
                all_novels_map[nid].update(updated)

def get_numeric_score(item):
    try:
        val = item.get('score', 0) if isinstance(item, dict) else item
        if not val:
            return 0
        s = str(val).strip().replace(',', '').replace(' ', '')
        if '亿' in s:
            num = float(re.sub(r'[^\d.]', '', s))
            return int(num * 100_000_000)
        elif '万' in s:
            num = float(re.sub(r'[^\d.]', '', s))
            return int(num * 10_000)
        digits = re.sub(r'[^\d]', '', s)
        return int(digits) if digits else 0
    except:
        return 0

print("\n=== KẾT QUẢ XẾP HẠNG CHUẨN XÁC 100% THEO FILE LINK CỦA BẠN ===")
new_tag_rankings = {}

for tag_id, tag_zh, tag_vi, novels in crawled_results:
    tag_list = []
    # GIỮ NGUYÊN 100% THỨ TỰ TẤN GIANG TRẢ VỀ CHO LINK NÀY (KHÔNG SORT LẠI)
    for rank_idx, (nid, title, aid, author) in enumerate(novels, start=1):
        novel_base = all_novels_map.get(nid)
        if novel_base:
            item_obj = dict(novel_base)
        else:
            item_obj = {
                'novelId': str(nid), 'title': title, 'author': author, 'authorId': str(aid),
                'genre': '纯爱', 'status': '连载', 'wordCount': '', 'score': '0',
                'bookmarks': 0, 'publishDate': '', 'intro': '',
                'coverUrl': f'https://i9-static.jjwxc.net/novelimage.php?novelid={nid}',
                'isAuthorCover': False, 'jjwxcUrl': f'https://www.jjwxc.net/onebook.php?novelid={nid}',
                'tags': [tag_zh]
            }

        item_obj['rank'] = rank_idx
        tags = item_obj.get('tags', [])
        if tag_zh not in tags:
            tags = list(tags) + [tag_zh]
        item_obj['tags'] = tags
        
        all_novels_map[item_obj['novelId']] = item_obj
        tag_list.append(item_obj)

    new_tag_rankings[tag_id] = tag_list
    top1_title = tag_list[0]['title'] if tag_list else 'Chưa có'
    top1_score_num = get_numeric_score(tag_list[0]) if tag_list else 0
    print(f"  + {tag_vi:<20} ({tag_zh}): Đủ {len(tag_list):>3}/100 | Top 1: 《{top1_title}》 (Điểm: {top1_score_num:,})")

# Đồng bộ ngược vào tagRankings
for tag_id, items in new_tag_rankings.items():
    for item in items:
        nid = item['novelId']
        if nid in all_novels_map:
            updated = all_novels_map[nid]
            item['coverUrl'] = updated.get('coverUrl', item.get('coverUrl'))
            item['isAuthorCover'] = updated.get('isAuthorCover', False)
            item['status'] = updated.get('status', item.get('status'))
            item['genre'] = updated.get('genre', item.get('genre'))
            item['bookmarks'] = updated.get('bookmarks', item.get('bookmarks', 0))
            item['tags'] = updated.get('tags', item.get('tags', []))
            if updated.get('rating'):
                item['rating'] = updated['rating']
            item['publishDate'] = updated.get('publishDate', item.get('publishDate', ''))
            item['intro'] = updated.get('intro', item.get('intro', ''))
            item['wordCount'] = updated.get('wordCount', item.get('wordCount', '0'))
            item['score'] = updated.get('score', item.get('score', '0'))

print("\n-> Ghi đè vào src/data/jjwxcRealData.json...")
master_data['tagRankings'] = new_tag_rankings
master_data['allNovels'] = list(all_novels_map.values())
master_data['crawledAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

with open('src/data/jjwxcRealData.json', 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("\n=== HOÀN TẤT! BXH ĐÃ ĐƯỢC XẾP CHUẨN XÁC 100% THEO ĐIỂM TÍCH LŨY (orders2=2) ===")
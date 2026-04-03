import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

api_key = "322e530c75f9c8df08b2302da8e51cf93bc1d45b5f5c285e6ca8432a45727562" # Raw key? Or maybe it needs to be the URL encoded one? 
# Usually TourAPI keys from data.go.kr look like: abcdef%2F%2B...
# But this is just hex. Let's try it.
url = f"https://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey={api_key}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=ieum&_type=json"

try:
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req, context=ctx)
    print(res.read().decode('utf-8')[:500])
except Exception as e:
    print(e)

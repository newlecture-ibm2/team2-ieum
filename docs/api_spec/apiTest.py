import requests
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

BASE_URL = "https://apis.data.go.kr/B551011/KorService2"
# .env에 TOUR_API_SERVICE_KEY를 설정해야 합니다.
SERVICE_KEY = os.getenv("TOUR_API_SERVICE_KEY") 

def test_area_code():
    """1. 지역 코드 조회 테스트 (V2: areaCode2)"""
    params = {
        "serviceKey": SERVICE_KEY,
        "MobileOS": "ETC",
        "MobileApp": "IEUM",
        "_type": "json"
    }
    response = requests.get(f"{BASE_URL}/areaCode2", params=params)
    print(f"Status: {response.status_code}")
    print(response.json())

def test_festival_list():
    """2. 축제 목록 조회 테스트 (V2: areaBasedList2)"""
    params = {
        "serviceKey": SERVICE_KEY,
        "MobileOS": "ETC",
        "MobileApp": "IEUM",
        "_type": "json",
        "contentTypeId": "15", # 축제/공연/행사
        "areaCode": "1"        # 서울
    }
    response = requests.get(f"{BASE_URL}/areaBasedList2", params=params)
    print(response.json())

if __name__ == "__main__":
    if not SERVICE_KEY:
        print("⚠️ TOUR_API_SERVICE_KEY 가 설정되지 않았습니다. .env 파일을 확인해주세요.")
    else:
        print("\n--- Testing areaCode2 ---")
        test_area_code()
        print("\n--- Testing areaBasedList2 ---")
        test_festival_list()

import java.io.InputStream;
import java.net.URL;
import java.net.HttpURLConnection;

public class TestTourApi {
    public static void main(String[] args) throws Exception {
        String serviceKey = "322e530c75f9c8df08b2302da8e51cf93bc1d45b5f5c285e6ca8432a45727562";
        String urlStr = "https://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey=" + serviceKey + "&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=ieum&areaCode=1&_type=json";
        System.out.println("URL: " + urlStr);
        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setRequestMethod("GET");
        int responseCode = conn.getResponseCode();
        System.out.println("Response Code: " + responseCode);
        InputStream in = responseCode >= 200 && responseCode < 300 ? conn.getInputStream() : conn.getErrorStream();
        byte[] bytes = in.readAllBytes();
        System.out.println("Response Body: " + new String(bytes));
    }
}

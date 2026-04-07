import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbFix {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://festa-ieum.com:5454/ieum-db";
        String user = "ieum";
        String password = "ieum1334!";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println(">>> [DB Fix] PostgreSQL에 접속 성공! 🔍🩺");

            // 1. email 컬럼을 login_id로 변경 (이미 변경되어 있을 경우를 대비해 스크립트 구성)
            String sql1 = "DO $$\n" +
                         "BEGIN\n" +
                         "    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN\n" +
                         "        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='login_id') THEN\n" +
                         "            ALTER TABLE users RENAME COLUMN email TO login_id;\n" +
                         "            RAISE NOTICE 'email을 login_id로 성공적으로 변경했습니다. ✅';\n" +
                         "        ELSE\n" +
                         "            ALTER TABLE users ALTER COLUMN email DROP NOT NULL;\n" +
                         "            RAISE NOTICE 'email의 NOT NULL을 제거하여 충돌을 방지했습니다. ✅';\n" +
                         "        END IF;\n" +
                         "    END IF;\n" +
                         "END $$;";
            stmt.execute(sql1);
            System.out.println(">>> [DB Fix] Step 1: login_id 동기화 완료! ✅");

            // 2. password의 NOT NULL 제약 조건 해제 (소셜 로그인용)
            String sql2 = "ALTER TABLE users ALTER COLUMN password DROP NOT NULL;";
            stmt.execute(sql2);
            System.out.println(">>> [DB Fix] Step 2: password 제약 조건 완화 완료! ✅");

            System.out.println(">>> [DB Fix] 모든 수술이 끝났습니다! 이제 네이버 로그인이 가능해집니다. 🐘💨✨");

        } catch (Exception e) {
            System.err.println(">>> [DB Fix] 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

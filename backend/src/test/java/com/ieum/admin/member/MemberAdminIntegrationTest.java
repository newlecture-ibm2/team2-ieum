package com.ieum.admin.member;

import com.ieum.admin.member.application.port.in.GetMemberListUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MemberAdminIntegrationTest {

    @Autowired
    private GetMemberListUseCase getMemberListUseCase;

    @Test
    public void testGetMembers() {
        try {
            getMemberListUseCase.getMembers(1, 10, "SUSPENDED", null, "ALL", null);
            System.out.println("SUCCESS!!");
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}

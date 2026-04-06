package com.ieum.user.auth.application.port.in;

import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;

/**
 * 인바운드 인터페이스: 외부(컨트롤러)에서 비즈니스 로직(서비스)으로 접근할 때 열어두는 포트
 */
public interface AuthUseCase {
    AuthRes.TokenDto login(AuthReq.Login request);
    void register(AuthReq.Register request);
    AuthRes.TokenDto refresh(AuthReq.Refresh request);
}

package com.ieum.global.security;

import java.lang.annotation.*;

/**
 * 현재 로그인한 사용자의 ID를 컨트롤러 메서드 파라미터로 주입하는 커스텀 어노테이션.
 *
 * <p>사용 예:
 * <pre>
 * @GetMapping("/me")
 * public ResponseEntity<?> getMyInfo(@CurrentUserId Long userId) { ... }
 * </pre>
 *
 * <p>SecurityContextHolder에서 Authentication.getName()을 Long으로 변환하여 주입합니다.
 * 인증되지 않은 경우 null이 주입됩니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUserId {
}

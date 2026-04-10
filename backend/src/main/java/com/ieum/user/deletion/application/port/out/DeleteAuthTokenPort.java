package com.ieum.user.deletion.application.port.out;

public interface DeleteAuthTokenPort {
    void deleteAllTokens(Long userId);
}

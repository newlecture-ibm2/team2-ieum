package com.ieum.user.deletion.application.port.out;

public interface DeleteUserCommunityHistoryPort {
    void deleteCommentsAndSyncCount(Long userId);
    void deletePostsAndChildEntities(Long userId);
}

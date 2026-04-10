package com.ieum.user.deletion.application.port.out;

import java.util.List;

public interface FindDeletionTargetPort {
    List<Long> findExpiredWithdrawals(int days);
    List<Long> findAllByStatus(String status);
}

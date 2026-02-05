package com.project.app.ticket.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UserPassTest {

    @Test
    void deductCount_valid() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(5)
                .initCount(5)
                .build();

        pass.deductCount(2);
        assertEquals(3, pass.getRemainingCount());
    }

    @Test
    void deductCount_notActive_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.SUSPENDED)
                .remainingCount(5)
                .initCount(5)
                .build();

        assertThrows(IllegalStateException.class, () -> pass.deductCount(1));
    }

    @Test
    void deductCount_insufficient_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(1)
                .initCount(1)
                .build();

        assertThrows(IllegalArgumentException.class, () -> pass.deductCount(2));
    }

    @Test
    void restore_positive_adds() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(1)
                .initCount(1)
                .build();

        pass.restore(2);
        assertEquals(3, pass.getRemainingCount());
    }

    @Test
    void topUp_valid() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(1)
                .initCount(1)
                .build();

        pass.topUp(3);
        assertEquals(4, pass.getRemainingCount());
        assertEquals(4, pass.getInitCount());
    }

    @Test
    void topUp_invalid_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(1)
                .initCount(1)
                .build();

        assertThrows(IllegalArgumentException.class, () -> pass.topUp(0));
        assertThrows(IllegalArgumentException.class, () -> pass.topUp(-1));
    }

    @Test
    void updateRemainingCount_valid_returnsDiff() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(3)
                .initCount(5)
                .build();

        int diff = pass.updateRemainingCount(6);
        assertEquals(3, diff);
        assertEquals(6, pass.getRemainingCount());
    }

    @Test
    void updateRemainingCount_invalid_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(3)
                .initCount(5)
                .build();

        assertThrows(IllegalArgumentException.class, () -> pass.updateRemainingCount(-1));
        assertThrows(IllegalArgumentException.class, () -> pass.updateRemainingCount(null));
    }

    @Test
    void deductCount_suspended_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.SUSPENDED)
                .remainingCount(5)
                .initCount(5)
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> pass.deductCount(1));
        assertTrue(ex.getMessage().contains("정지 상태"));
    }

    @Test
    void deductCount_deleted_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(5)
                .initCount(5)
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> pass.deductCount(1));
        assertTrue(ex.getMessage().contains("삭제된 이용권"));
    }

    @Test
    void restore_deleted_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(0)
                .initCount(5)
                .build();

        assertThrows(IllegalStateException.class, () -> pass.restore(1));
    }

    @Test
    void topUp_suspended_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.SUSPENDED)
                .remainingCount(1)
                .initCount(1)
                .build();

        assertThrows(IllegalStateException.class, () -> pass.topUp(3));
    }

    @Test
    void updateStatus_deletedToActive_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(0)
                .initCount(5)
                .build();

        assertThrows(IllegalStateException.class, () -> pass.updateStatus("ACTIVE"));
    }

    @Test
    void updateRemainingCount_deleted_throws() {
        UserPass pass = UserPass.builder()
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(0)
                .initCount(5)
                .build();

        assertThrows(IllegalStateException.class, () -> pass.updateRemainingCount(5));
    }
}

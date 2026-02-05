package com.project.app.reservation.dto;

import jakarta.validation.constraints.NotBlank;

public record ReservationCancelRequest(
        @NotBlank(message = "취소 사유는 필수입니다.")
        String cnclRsn
) {
}


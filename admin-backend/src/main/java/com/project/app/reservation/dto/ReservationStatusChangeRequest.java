package com.project.app.reservation.dto;

import jakarta.validation.constraints.NotBlank;

public record ReservationStatusChangeRequest(
        @NotBlank(message = "상태 코드는 필수입니다.")
        String sttsCd
) {
}

package com.project.app.teachers.exception;

/**
 * 강사 프로필(TEACHER_PROFILE)이 없는 상태에서
 * 수정/상태변경/퇴사처리 요청이 들어왔을 때 프론트에서 사용자 동의를 받아
 * 프로필 생성 API를 호출하도록 유도하기 위한 예외.
 */
public class TeacherProfileMissingException extends RuntimeException {

    private final String userId;

    public TeacherProfileMissingException(String userId) {
        super("Teacher profile is missing: " + userId);
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}

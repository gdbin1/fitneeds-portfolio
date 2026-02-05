package com.project.app.program.dto;

import java.math.BigDecimal;

import com.project.app.admin.dto.TeacherInfoResponseDto;
import com.project.app.program.entity.Program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResponseDto {

	private Long progId;
	private String progNm;
	private BigDecimal oneTimeAmt;
	private Integer rwdGamePnt;
	private boolean useYn;
	private Long sportId;
	private String sportNm;
	private String sportMemo;
	
	private TeacherInfoResponseDto teacherInfo;
	
	public static ProgramResponseDto from(Program program, TeacherInfoResponseDto teacherInfo) {
		return ProgramResponseDto.builder()
				.progId(program.getProgId())
				.progNm(program.getProgNm())
				.oneTimeAmt(program.getOneTimeAmt())
//				.rwdGamePnt(program.getRwdGamePnt())
				.useYn(program.isUseYn())
				.sportId(program.getSportType().getSportId())
				.sportNm(program.getSportType().getSportNm())
				.sportMemo(program.getSportType().getSportMemo())
				.teacherInfo(teacherInfo)
				.build();
	}

}

package com.project.app.program.entity;

import java.math.BigDecimal;

import org.hibernate.annotations.ColumnDefault;

import com.project.app.aspect.BaseTimeEntity;
import com.project.app.branch.entity.Branch;
import com.project.app.sporttype.entity.SportType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PROGRAM")
public class Program extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "prog_id", nullable = false)
	private Long progId;			// 프로그램 ID
	
	@Column(name = "prog_nm", nullable = false, length = 255)
	private String progNm;			// 프로그램 명
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sport_id", nullable = false)
	private SportType sportType;	// 종목 ID, FK
	
	@ManyToOne
	@JoinColumn(name = "brch_id", nullable = false)
	private Branch branch;
	
	@Column(name = "use_yn", nullable = false)
    @ColumnDefault("1")
    @Builder.Default
    private boolean useYn = true;			// 사용 여부
	
	@Column(name = "one_time_amt", nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal oneTimeAmt = BigDecimal.ZERO; // 단건 결제 금액
//    private BigDecimal oneTimeAmt = 0;		
	
//	@Column(name = "rwd_game_pnt", nullable = false)
//    @ColumnDefault("0")
//    @Builder.Default
//    private Integer rwdGamePnt = 0;		//게이미케이션 포인트
	
	
}

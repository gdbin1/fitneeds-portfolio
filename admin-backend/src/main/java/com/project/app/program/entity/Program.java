package com.project.app.program.entity;

import com.project.app.global.entity.BaseTimeEntity;
import com.project.app.branch.entity.Branch;
import com.project.app.sportTypes.entity.SportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

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

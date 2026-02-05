package com.project.app.sporttype.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import com.project.app.aspect.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
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
@Table(name = "SPORT_TYPE", indexes = {
	    @Index(name = "idx_sport_type_useyn", columnList = "use_yn"),
	    @Index(name = "idx_sport_type_sportnm", columnList = "sport_nm")
	})
@SQLDelete(sql = "UPDATE sport_type SET del_dt = NOW(), use_yn = 0 WHERE sport_id = ?")
@Where(clause = "del_dt IS NULL") // 조회 시 삭제되지 않은 데이터만 기본적으로 가져옴
public class SportType extends BaseTimeEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sport_id", nullable = false)
	private Long sportId; 			// 종목 ID
	
	@Column(name = "sport_nm", nullable = false, length = 100)
	private String sportNm;			// 종목 이름
	
	@Column(name = "sport_memo", nullable = true, length = 500)
	private String sportMemo;		// 종목 설명
	
	@Column(name = "use_yn", nullable = false, columnDefinition = "TINYINT(1)")
	@ColumnDefault("1")
	private boolean useYn;			// 종목 사용 여부
	
	@Column(name = "del_dt", nullable = true)
	private LocalDateTime delDt;	// 삭제(비활성) 일시 (로그 확인용)

}

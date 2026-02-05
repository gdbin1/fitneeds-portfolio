// file: src/main/java/com/project/app/myclass/mapper/MyClassMapper.java
package com.project.app.myclass.mapper;

import com.project.app.myclass.dto.ScheduleListQuery;
import com.project.app.myclass.dto.row.MyClassReservationRow;
import com.project.app.myclass.dto.row.MyClassScheduleRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyClassMapper {

    List<MyClassScheduleRow> selectScheduleList(ScheduleListQuery q);
    List<MyClassScheduleRow> selectScheduleListPaged(ScheduleListQuery q);
    long countScheduleList(ScheduleListQuery q);

    MyClassScheduleRow selectScheduleDetail(@Param("schdId") Long schdId);

    List<MyClassReservationRow> selectReservationsByScheduleId(@Param("schdId") Long schdId);
}

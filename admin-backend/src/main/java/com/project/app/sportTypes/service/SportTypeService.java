package com.project.app.sportTypes.service;

import com.project.app.sportTypes.dto.SportTypeDto.*;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.sportTypes.repository.SportTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SportTypeService {

    private final SportTypeRepository repo;

    public List<SportType> findAll() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public List<Resp> list() {
        try {
            List<SportType> entities = repo.findAll();
            if (entities == null || entities.isEmpty()) {
                return List.of();
            }
            return entities.stream()
                    .filter(entity -> entity != null)
                    .map(this::toResp)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve sport types: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Resp create(CreateReq req) {
        SportType st = repo.save(
                SportType.builder()
                        .sportNm(req.name().trim())
                        .sportMemo(req.memo() == null ? null : req.memo().trim())
                        .useYn(true)
                        .build()
        );

        return toResp(st);
    }

    @Transactional
    public Resp update(Long id, UpdateReq req) {
        SportType st = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("SportType not found: " + id));

        st.update(req.name().trim(), req.memo() == null ? null : req.memo().trim());
        return toResp(st);
    }

    @Transactional
    public void deactivate(Long id) {
        SportType st = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("SportType not found: " + id));
        st.deactivate();
    }

    private Resp toResp(SportType e) {
        if (e == null) {
            throw new IllegalArgumentException("SportType entity is null");
        }
        return new Resp(
            e.getSportId(),
            e.getSportNm() != null ? e.getSportNm() : "",
            e.getSportMemo(),
            Boolean.TRUE.equals(e.getUseYn()) ? 1 : 0,
            e.getRegDt(),
            e.getUpdDt(),
            e.getDelDt()
        );
    }
}

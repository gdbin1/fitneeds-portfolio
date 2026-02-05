package com.project.app.userpass.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PassStatusCd {
    ACTIVE,
    SUSPENDED,
    DELETED,
}
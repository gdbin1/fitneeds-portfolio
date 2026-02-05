package com.project.app.config.util;

import java.util.UUID;

public class UserIdGenerator {
	public String generateUniqueUserId() {
		String uuid = UUID.randomUUID().toString();
		return uuid.replace("-", "");
	}

	//generator.generateUniqueUserId()); 이렇게 사용함.
}

//package com.project.app.config.security;
//
//import java.util.Optional;
//
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import com.project.app.user.entity.User;
//import com.project.app.user.repository.UserRepository;
//import com.project.app.userAdmin.entity.UserAdmin;
//import com.project.app.userAdmin.repository.UserAdminRepository;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private final UserRepository userRepository;
//    private final UserAdminRepository userAdminRepository;
//
//    public CustomUserDetailsService(
//            UserRepository userRepository,
//            UserAdminRepository userAdminRepository
//    ) {
//        this.userRepository = userRepository;
//        this.userAdminRepository = userAdminRepository;
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String userId)
//            throws UsernameNotFoundException {
//
//        // ✅ 1. 관리자 먼저 조회
//        Optional<UserAdmin> adminOpt = userAdminRepository.findByUserId(userId);
//        if (adminOpt.isPresent()) {
//            UserAdmin admin = adminOpt.get();
//            return org.springframework.security.core.userdetails.User.builder()
//                    .username(admin.getUserId())
//                    .password(admin.getPassword())
//                    .authorities("ROLE_" + admin.getRole()) // ⭐ 핵심
//                    .build();
//        }
//
//        // ✅ 2. 일반 사용자 조회
//        User user = userRepository.findByUserId(userId)
//                .orElseThrow(() ->
//                        new UsernameNotFoundException("User not found: " + userId));
//
//        return org.springframework.security.core.userdetails.User.builder()
//                .username(user.getUserId())
//                .password(user.getPassword())
//                .authorities("ROLE_" + user.getRole()) // ⭐ 핵심
//                .build();
//    }
//}

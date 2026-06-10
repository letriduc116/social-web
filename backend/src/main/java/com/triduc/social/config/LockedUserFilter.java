package com.triduc.social.config;

import com.triduc.social.entity.User;
import com.triduc.social.repository.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LockedUserFilter extends OncePerRequestFilter {
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String email = jwt.getSubject();
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent() && userOpt.get().isLocked()) {
                response.setStatus(423);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"status\":423,\"message\":\"Tài khoản đã bị khoá do vi phạm.\",\"data\":null}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}

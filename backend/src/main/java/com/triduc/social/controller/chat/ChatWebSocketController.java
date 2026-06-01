package com.triduc.social.controller.chat;

import com.triduc.social.dto.request.chat.ChatSendMessageRequest;
import com.triduc.social.dto.request.chat.ChatTypingRequest;
import com.triduc.social.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatSendMessageRequest request, Principal principal) {
        chatService.sendMessage(principal.getName(), request);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload ChatTypingRequest request, Principal principal) {
        chatService.pushTyping(principal.getName(), request);
    }
}

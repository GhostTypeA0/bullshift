package com.bullshift.bullshift_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // main WebSocket endpoint the frontend connects to
        // ex: ws://localhost:8081/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // wide-open CORS for dev; tighten later for prod
                .withSockJS(); // fallback for browsers that don't support native WebSockets
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // simple in-memory message broker for broadcasting messages
        // "/topic" = public broadcasts
        // "/queue" = private messages (1-to-1)
        config.enableSimpleBroker("/queue", "/topic");

        // all messages sent from the client must start with "/app"
        // ex: client sends to "/app/sendMessage"
        config.setApplicationDestinationPrefixes("/app");

        // enables user-specific messaging
        // ex: server sends to "/user/{username}/queue/messages"
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {

        // ⭐ FIX: Allow large Base64 images to pass through WebSocket
        registry.setMessageSizeLimit(512 * 1024);      // 512 KB
        registry.setSendBufferSizeLimit(1024 * 1024);  // 1 MB
        registry.setSendTimeLimit(20 * 1000);          // 20 seconds
    }
}

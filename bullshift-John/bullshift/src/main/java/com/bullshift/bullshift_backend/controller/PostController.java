package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Post;
import com.bullshift.bullshift_backend.model.PostEvent;
import com.bullshift.bullshift_backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PostController(PostRepository postRepository, SimpMessagingTemplate messagingTemplate) {
        this.postRepository = postRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // -------------------------
    // Helpers
    // -------------------------

    private ResponseEntity<Post> findPostOr404(Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void broadcast(String type, Post post, Long postId, Integer likeCount) {
        messagingTemplate.convertAndSend("/topic/posts",
                new PostEvent(type, post, postId, likeCount));
    }

    // -------------------------
    // Endpoints
    // -------------------------

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        return findPostOr404(id);
    }

    @GetMapping("/user/{username}")
    public List<Post> getPostsByUser(@PathVariable String username) {
        return postRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        Post saved = postRepository.save(post);
        broadcast("new_post", saved, null, null);
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post updated) {
        return postRepository.findById(id)
                .map(existing -> {
                    if (updated.getCaption() != null) existing.setCaption(updated.getCaption());
                    if (updated.getImage() != null) existing.setImage(updated.getImage());

                    Post saved = postRepository.save(existing);
                    broadcast("update", saved, null, null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) return ResponseEntity.notFound().build();

        postRepository.deleteById(id);
        broadcast("delete", null, id, null);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
public ResponseEntity<Map<String, Object>> likePost(@PathVariable Long id) {
    return postRepository.findById(id)
            .map(post -> {
                postRepository.incrementLikeCount(id);
                Post updated = postRepository.findById(id).get();

                broadcast("like", null, id, updated.getLikeCount());

                Map<String, Object> body = new HashMap<>();
                body.put("postId", id);
                body.put("likeCount", updated.getLikeCount());

                return ResponseEntity.ok(body);
            })
            .orElse(ResponseEntity.notFound().build());
}


    @PostMapping("/{id}/unlike")
public ResponseEntity<Map<String, Object>> unlikePost(@PathVariable Long id) {
    return postRepository.findById(id)
            .map(post -> {
                postRepository.decrementLikeCount(id);
                Post updated = postRepository.findById(id).get();

                broadcast("unlike", null, id, updated.getLikeCount());

                Map<String, Object> body = new HashMap<>();
                body.put("postId", id);
                body.put("likeCount", updated.getLikeCount());

                return ResponseEntity.ok(body);
            })
            .orElse(ResponseEntity.notFound().build());
}
}
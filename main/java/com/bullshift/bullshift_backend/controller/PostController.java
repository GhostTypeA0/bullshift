package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Post;
import com.bullshift.bullshift_backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;

    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // GET ALL POSTS
    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    // GET POST BY ID (FULL FIX APPLIED)
    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id) {

        Optional<Post> postOpt = postRepository.findById(id);

        if (postOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Post not found"));
        }

        return ResponseEntity.ok(postOpt.get());
    }

    // GET POSTS BY USER
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getPostsByUser(@PathVariable String username) {
        return ResponseEntity.ok(
                postRepository.findByUsernameOrderByCreatedAtDesc(username)
        );
    }

    // CREATE POST
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        return ResponseEntity.ok(postRepository.save(post));
    }

    // UPDATE POST (FULL FIX APPLIED)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestBody Post updatedPost) {

        Optional<Post> postOpt = postRepository.findById(id);

        if (postOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Post not found"));
        }

        Post post = postOpt.get();

        if (updatedPost.getCaption() != null) {
            post.setCaption(updatedPost.getCaption());
        }

        if (updatedPost.getImage() != null) {
            post.setImage(updatedPost.getImage());
        }

        return ResponseEntity.ok(postRepository.save(post));
    }

    // DELETE POST (FULL FIX APPLIED)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {

        if (!postRepository.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Post not found"));
        }

        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // LIKE POST (FULL FIX APPLIED)
    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(@PathVariable Long id) {

        Optional<Post> postOpt = postRepository.findById(id);

        if (postOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Post not found"));
        }

        postRepository.incrementLikeCount(id);
        int likeCount = postRepository.findById(id).get().getLikeCount();

        return ResponseEntity.ok(Map.of("likeCount", likeCount));
    }

    // UNLIKE POST (FULL FIX APPLIED)

    @PostMapping("/{id}/unlike")
    @Transactional
    public ResponseEntity<?> unlikePost(@PathVariable Long id) {

        Optional<Post> postOpt = postRepository.findById(id);

        if (postOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Post not found"));
        }

        postRepository.decrementLikeCount(id);
        int likeCount = postRepository.findById(id).get().getLikeCount();

        return ResponseEntity.ok(Map.of("likeCount", likeCount));
    }
}

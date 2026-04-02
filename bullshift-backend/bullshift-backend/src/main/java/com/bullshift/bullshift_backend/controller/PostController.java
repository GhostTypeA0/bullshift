package com.bullshift.bullshift_backend.controller;

import com.bullshift.bullshift_backend.model.Post;
import com.bullshift.bullshift_backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository; 
    // JPA repo for CRUD operations on posts

    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        // return all posts newest → oldest (feed ordering)
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        // return a single post if found, otherwise 404
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public List<Post> getPostsByUser(@PathVariable String username) {
        // return all posts by a specific user, newest → oldest
        return postRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        // create + save a new post (timestamps handled in entity)
        return postRepository.save(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
        Optional<Post> optionalPost = postRepository.findById(id);
        
        if (optionalPost.isEmpty()) {
            // post doesn't exist → 404
            return ResponseEntity.notFound().build();
        }

        Post post = optionalPost.get();

        // update caption only if provided
        if (updatedPost.getCaption() != null) {
            post.setCaption(updatedPost.getCaption());
        }

        // update image only if provided
        if (updatedPost.getImage() != null) {
            post.setImage(updatedPost.getImage());
        }

        // save updated post + return it
        return ResponseEntity.ok(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        // if post doesn't exist → 404
        if (!postRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // delete post + return 204 (no content)
        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Integer>> likePost(@PathVariable Long id) {
        Optional<Post> optionalPost = postRepository.findById(id);
        
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // increment like count using custom repo method
        postRepository.incrementLikeCount(id);

        // reload post to get updated like count
        Post post = postRepository.findById(id).get();
        
        // return updated like count as JSON
        return ResponseEntity.ok(Map.of("likeCount", post.getLikeCount()));
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<Map<String, Integer>> unlikePost(@PathVariable Long id) {
        Optional<Post> optionalPost = postRepository.findById(id);
        
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // decrement like count using custom repo method
        postRepository.decrementLikeCount(id);

        // reload post to get updated like count
        Post post = postRepository.findById(id).get();
        
        // return updated like count as JSON
        return ResponseEntity.ok(Map.of("likeCount", post.getLikeCount()));
    }
}

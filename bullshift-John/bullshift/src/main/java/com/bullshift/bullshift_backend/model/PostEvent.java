package com.bullshift.bullshift_backend.model;

public class PostEvent {
    private String type;
    private Post post;
    private Long postId;
    private Integer likeCount;

    public PostEvent() {}

    public PostEvent(String type, Post post, Long postId, Integer likeCount) {
        this.type = type;
        this.post = post;
        this.postId = postId;
        this.likeCount = likeCount;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
}

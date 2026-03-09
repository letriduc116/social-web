package com.triduc.social.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nimbusds.jose.shaded.gson.annotations.SerializedName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "post_image")
public class PostImages {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @SerializedName("id")
    private String id;
    @SerializedName("imageUrls")
    @Column(name = "url_image")
    @JsonProperty("urlImage")
    private String urlImage;
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

}
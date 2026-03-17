import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { client, urlFor } from "../sanity/SainityClient";
import { PortableText } from "@portabletext/react";

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
      title,
      image,
      body
    }`;

    client.fetch(query, { slug }).then((data) => {
      console.log("Single Post:", data);
      setPost(data);
    });
  }, [slug]);

  if (!post) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "15px" }}>{post.title}</h1>

      {/* Post Image */}
      {post.image && (
        <img
          src={urlFor(post.image).width(1000).url()}
          alt={post.title}
          style={{
            width: "100%",
            height:"450px",
            borderRadius: "10px",
            marginBottom: "20px",
            objectFit: "cover",
          }}
        />
      )}

      {/* Render rich text body */}
      <div style={{ fontSize: "18px", lineHeight: "1.6" }}>
        <PortableText value={post.body} />
      </div>
    </div>
  );
};

export default PostDetail; 
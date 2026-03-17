import React, { useEffect, useState } from "react";
import { client } from "../sanity/SainityClient";
import { Link } from "react-router-dom";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const query = `
      *[_type == "post"]{
        _id,
        title,
        slug,
        image{
          asset->{url}
        }
      }
    `;

    client.fetch(query).then((data) => {
      console.log("Fetched posts:", data);
      setPosts(data);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: "20px" }}>All Posts</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Link
              to={`/post/${post.slug.current}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={post.image?.asset?.url}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "350px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "15px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600" }}>
                  {post.title}
                </h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;

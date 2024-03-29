import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { styled } from "@mui/material";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { selectProfilePostCount } from "../stores/userProfileSlice";

function MyTasks() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const postCount = useSelector(selectProfilePostCount);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/Profile/${username}/posts`);
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Problem");
      }
    }
    fetchPosts();
  }, []);

  if (isLoading) return <Loading />;

  const CustomLink = styled(Link)`
    max-width: 350px;
    margin: auto;
    margin-bottom: 0.5rem;
  `;

  return (
    <div className="list-group">
      <h1 className="task-amount-counter">Amount of tasks: {postCount}</h1>
      {posts.map(post => {
        const date = new Date(post.createdDate);
        const dateFromatted = `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`;
        return (
          <CustomLink
            key={post._id}
            to={`/post/${post._id}`}
            className="list-group-item list-group-item-action"
          >
            <strong>{post.title}</strong>{" "}
            <span className="text-muted small"> on {dateFromatted} </span>
          </CustomLink>
        );
      })}
    </div>
  );
}

export default MyTasks;

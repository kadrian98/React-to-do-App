import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";

const useFetchPost = id => {
  const [post, setPost] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/Post/${id}`, {
          cancelToken: ourRequest.token
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Problem");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  return { post, isLoading };
};

function ViewSinglePost() {
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const { post, isLoading } = useFetchPost(id);

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading) return <Page title="...">Loading...</Page>;

  const date = new Date(post.createdDate);
  const dateFromatted = `${
    date.getMonth() + 1
  }/ ${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }

  async function deleteHandler() {
    const areYouSure = window.confirm("Do you really want delete this post?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token }
        });
        if (response.data == "Success") {
          // 1. display a falsh message
          appDispatch({
            type: "flashMessage",
            value: "post was sucesfully deleted"
          });
          // 2. redirect back to the current user's profile
          navigate(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("problem");
      }
    }
  }

  return (
    <Page title={post.title}>
      {isOwner() && (
        <>
          {/* <button onClick={deleteHandler} data-tip="Delete" data-for="delete">
            Delete
          </button>
          <ReactTooltip id="delete" className="custom-tooltip" /> */}

          <IconButton
            color="error"
            aria-label="delete"
            onClick={deleteHandler}
            data-tip="Delete"
            data-for="delete"
          >
            <DeleteIcon />
            <ReactTooltip id="delete" className="custom-tooltip" />
          </IconButton>

          <Link to={`/post/${post._id}/edit`}>
            <Fab
              color="secondary"
              aria-label="edit"
              data-tip="Edit"
              data-for="edit"
            >
              <EditIcon />
              <ReactTooltip id="edit" className="custom-tooltip" />
            </Fab>
          </Link>

          {/* <button data-tip="Edit" data-for="edit">
            <ReactTooltip id="edit" className="custom-tooltip" />
            <Link to={`/post/${post._id}/edit`}>Edit</Link>
          </button> */}
        </>
      )}

      <section id="createPostSection">
        <h1>{post.title}</h1>
        <h5>{post.body}</h5>
        <p>{dateFromatted}</p>
      </section>
    </Page>
  );
}

export default ViewSinglePost;

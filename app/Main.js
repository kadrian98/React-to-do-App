import React, { useState, useReducer, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://reactbackend-n4us.onrender.com";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My Components
import Header from "./components/Header/Header";
import ContentLoggedIn from "./components/ContentLoggedIn";
import Footer from "./components/Footer";
import About from "./components/About";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import ErrorMessage from "./components/ErrorMessage";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import ContentLoggedOut from "./components/ContentLoggedOut";
import store from "./components/redux/store";
import { Provider } from "react-redux";

function Main() {
  const loggedData = localStorage.getItem("user");
  const parsedLoggedData = loggedData ? JSON.parse(loggedData) : {};
  const initialState = {
    loggedIn: Boolean(parsedLoggedData.token),
    flashMessages: [],
    errorMessage: [],
    user: {
      token: parsedLoggedData.token,
      username: parsedLoggedData.username,
      avatar: parsedLoggedData.avatar
    }
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "errorMessage":
        draft.errorMessage.push(action.value);
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  console.log(state, "state");

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.loggedIn]);

  // Check if token has expired or not on first render

  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({
              type: "flashMessage",
              value: "Your session has expired. please log in again."
            });
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Provider store={store}>
          <BrowserRouter>
            <FlashMessages messages={state.flashMessages} />
            <ErrorMessage messages={state.errorMessage} />
            <Header />
            <Routes>
              <Route path="/Profile/:username/*" element={<Profile />} />
              <Route
                path="/"
                element={
                  state.loggedIn ? <ContentLoggedIn /> : <ContentLoggedOut />
                }
              />
              <Route path="/Post/:id" element={<ViewSinglePost />} />
              <Route path="/Post/:id/edit" element={<EditPost />} />
              <Route path="/CreatePost" element={<CreatePost />} />
              <Route path="/About" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </Provider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}

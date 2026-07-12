import { combineReducers } from "@reduxjs/toolkit";
import templates from "./templatesSlice";

// templatesApi is injected into the shared apiService — no local API reducer needed
const reducer = combineReducers({
  templates
});

export default reducer;
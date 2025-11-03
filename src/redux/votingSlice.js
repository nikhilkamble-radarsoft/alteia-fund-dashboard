import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  startedAt: null,
  ballotId: null,
};

const votingSlice = createSlice({
  name: "voting",
  initialState,
  reducers: {
    setVoting(state, action) {
      const { startedAt, ballotId } = action.payload;
      state.startedAt = startedAt;
      state.ballotId = ballotId;
    },
    resetVoting(state) {
      state.startedAt = null;
      state.ballotId = null;
    },
  },
});

export const { setVoting, resetVoting } = votingSlice.actions;

export default votingSlice.reducer;

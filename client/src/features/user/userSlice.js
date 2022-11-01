import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = []
//   {
//   user:{
//     firstname: '',
//     lastname: '',
//     email: '',
//     usertype_id: '',
//     promo: true,  
//   }
//   // man: 'man'
// }

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: {
      reducer(state, action) {
        console.log('state:', Object.assign(state))
        console.log('action.payload:', Object.assign(action.payload))
        state.push(action.payload)
      },
      prepare(firstname, lastname, email, usertype_id, promo, userId) {
          return {
              payload: {
                  id: nanoid(),
                  firstname,
                  lastname,
                  email,
                  usertype_id,
                  promo,
                  userId,
              }
          }
      }
    },
  }
});

export const selectCurrentUser = (state) => state.user
export const { setCurrentUser } = userSlice.actions
export default userSlice.reducer
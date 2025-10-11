import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedMonth {
  month: number;
  year: number;
}
export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  selectedMonth: SelectedMonth;
}
// const initialState: InitialStateTypes = {
//   isSidebarCollapsed: false,
//   isDarkMode: false,
//   selectedMonth: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }, // ✅ new
// };
const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  selectedMonth: {
    month: new Date().getMonth() + 1, // ✅ Always valid
    year: new Date().getFullYear(),
  },
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode,setSelectedMonth } = globalSlice.actions;

export default globalSlice.reducer;

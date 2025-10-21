import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  variants: [];
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}
export interface Category {
  categoryId: string;
  name: string;
}
export interface Design {
  designId: string;
  name: string;
  categoryId: string;
  adminId: string;
}

export interface Attribute {
  attributeId: string;
  name: string;
  categoryId: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Users",
    "Expenses",
    "Categories",
    "Designs",
    "Attributes",
  ],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<
      DashboardMetrics,
      { month: number; year: number }
    >({
      // query: () => "/dashboard",
      query: ({ month, year }) => ({
        url: `/dashboard/?month=${month}&year=${year}`,
        method: "GET",
      }),
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    updateProduct: build.mutation<any, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getCategories: build.query<Category[], void>({
      query: () => "/api/categories",
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, { name: string }>({
      query: (body) => ({
        url: "/api/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation<Category, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
    // ===== Designs =====
    getDesignsByCategory: build.query<Design[], string>({
      query: (categoryId) => `/api/designs/${categoryId}`,
      providesTags: ["Designs"],
    }),
    createDesign: build.mutation<Design, Partial<Design>>({
      query: (body) => ({
        url: `/api/designs`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Designs"],
    }),
    updateDesign: build.mutation<Design, Partial<Design> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/designs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Designs"],
    }),
    deleteDesign: build.mutation<void, string>({
      query: (id) => ({
        url: `/designs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Designs"],
    }),

    // ===== Attributes =====
    getAttributesByCategory: build.query<Attribute[], string>({
      query: (categoryId) => `/category-attributes/${categoryId}`,
      providesTags: ["Attributes"],
    }),
    createAttribute: build.mutation<Attribute, Partial<Attribute>>({
      query: (body) => ({
        url: `/category-attributes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attributes"],
    }),
    updateAttribute: build.mutation<
      Attribute,
      Partial<Attribute> & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/category-attributes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Attributes"],
    }),
    deleteAttribute: build.mutation<void, string>({
      query: (id) => ({
        url: `/category-attributes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attributes"],
    }),
  }),
});
export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetDesignsByCategoryQuery,
  useGetAttributesByCategoryQuery,
} = api;

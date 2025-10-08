const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://cmrcl-server.onrender.com/";

export const fetchProducts = async (params: string = "") => {
  const res = await fetch(`${API_URL}products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const fetchProductById = async (id: string) => {
  const res = await fetch(`${API_URL}products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

export const createProduct = async (data: any) => {
  const res = await fetch(`${API_URL}products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

import { useEffect, useState } from "react";
import { productApi, Product } from "../services/productApi";

export function useProducts(params?: { category_id?: string; search?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi
      .list(params)
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.category_id, params?.search]);

  return { products, loading, error };
}

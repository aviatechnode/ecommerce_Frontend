import { useGetWishlistQuery } from "../../services/wishlistApi";

export const useWishlistCount = () => {
  const { data } = useGetWishlistQuery();

  return data?.items?.length ?? 0;
};
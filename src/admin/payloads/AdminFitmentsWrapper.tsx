import { useSearchParams } from "react-router-dom";
import AdminFitments from "../components/AdminFitment";

const AdminFitmentsWrapper = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  if (!productId) return <p>Please select a product to manage fitments.</p>;

  return <AdminFitments productId={productId} />;
};

export default AdminFitmentsWrapper;
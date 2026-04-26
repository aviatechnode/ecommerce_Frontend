import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";

import { fetchRoles, deleteRole } from "../state-management/roleSlice";
import { selectRoleList, selectRoleLoading } from "../store/selectors";

const AdminRoles = () => {
  const dispatch = useDispatch<AppDispatch>();

  const roles = useSelector(selectRoleList);
  const loading = useSelector(selectRoleLoading);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Roles</h1>

      {loading && <p>Loading...</p>}

      {!loading &&
        roles.map((role) => (
          <div key={role.id} className="border p-2 mb-2 flex justify-between">
            <span>{role.name}</span>

            <button
              onClick={() => dispatch(deleteRole(role.id))}
              className="text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
};

export default AdminRoles;
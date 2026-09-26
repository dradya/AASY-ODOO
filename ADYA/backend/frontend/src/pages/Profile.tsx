import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h2>My Profile</h2>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>User ID:</strong> {user?.id}</p>
      {/* TODO: role (Inventory Manager / Warehouse Staff) once a `profiles` table + role field exists */}
      <Button variant="danger" onClick={() => signOut()}>Logout</Button>
    </div>
  );
}

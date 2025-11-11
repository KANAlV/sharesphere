import { AdminVerification } from "@/components/adminVerification";
import PageCreate from "@/components/pagecreate";

export default async function CreatePage() {
  await AdminVerification();

  return (
    <div className="mt-20 m-auto">
      <PageCreate />
    </div>
  );
}
import { AdminVerification } from "@/components/adminVerification"

export default async function PageCreate() {
    await AdminVerification()
    return (
        <div className="mt-20 m-auto">
            test redirect
        </div>
    );
}
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { AdminVerification } from "@/components/adminVerification";
import FilteredTerms from "@/components/filtered_terms";
export default async function filtered_terms() {
    await AdminVerification();

    return (
        <div className="block w-full h-screen overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
          <FilteredTerms />
        </div>
      );
}
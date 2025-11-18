import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Navigation(){
    function isActive(text:string){
        const pathname = usePathname;
    }

    return(
        <div className="w-screen pt-6 h-1/12 border-b-2 border-gray-500">
            <div className="text-4xl font-bold">Settings</div>
            <div className="flex">
                <Link href={"/settings/account"}>
                    <div className="p-4"> Account</div>
                </Link>
                <Link href={"/settings/profile"}>
                    <div className="p-4"> Profile</div>
                </Link>
            </div>
        </div>
    )
}
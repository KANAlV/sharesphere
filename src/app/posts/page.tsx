"use client";
export default function posts() {

return (
    <div className="bg-white px-10 py-25 flex gap-5">
        <div className="bg-[#E1E1E1] border-b-2 border-solid border-[#6C6C6C] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.25)] p-8 rounded-lg flex-3">
            <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 p-5">
                <p className="text-black text-5xl font-bold">
                    Title
                </p>
                <p className="text-sm text-black">
                    Username - 01/01/9999
                </p>
            </div>
            <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 px-5 pt-10 pb-4">
                <div className="flex flex-col gap-20">
                    <p className="text-xl">
Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy. Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy. Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy. Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy. Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy. Crazy? I Was Crazy Once. They Locked Me In A Room. A Rubber Room. A Rubber Room With Rats. And Rats Make Me Crazy.
                    </p>
                    <button className="rounded-lg  w-15 text-c bg-[#3B3B3B] p-1 text-center text-xs">
                        Tags
                    </button>
                </div>
            </div>
            <div className="">

            </div>
        </div>
        <div className="bg-[#E1E1E1] border-b-2 border-solid border-[#6C6C6C] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.25)]  rounded-lg m-t-25 p-2 w-40">
            <div className="p-3">
                <p className="text-2xl">Course</p>
                <p className="text-base">Course Head</p>
            </div>
        </div>
    </div>
);
}
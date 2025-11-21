"use client"
import { useState } from "react";

type Profile = {
    id: string;
    username: string;
    surname: string;
    firstname: string;
    middlename: string;
    suffix: string;
    description: string;
    image: string;
    banner: string;
}

export default function Profile({ profile }: { profile: Profile[] }) {
    // --- user values --- //
    const [username, setUsername] = useState(profile[0].username);
    const [surname, setSurname] = useState(profile[0].surname);
    const [firstname, setFirstname] = useState(profile[0].firstname);
    const [middlename, setMiddlename] = useState(profile[0]?.middlename || false);
    const [suffix, setSuffix] = useState(profile[0]?.suffix || false);

    // --- use states --- //
    const [loading, setLoading] = useState(false);
    const [usernameHover, setUsernameHover] = useState(false);
    const [usernameWindow, showUsernameWindow] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    
    const [nameHover, setNameHover] = useState(false);
    const [nameWindow, showNameWindow] = useState(false);
    const [newSurname, setNewSurname] = useState("");
    const [newFirstname, setNewFirstname] = useState("");
    const [newMiddlename, setNewMiddlename] = useState("");
    const [newSuffix, setNewSuffix] = useState("");

    // --- counters --- //
    const [count, setCount] = useState(0);
    const [scount, setsCount] = useState(0);
    const [fcount, setfCount] = useState(0);
    const [mcount, setmCount] = useState(0);
    const [sfxcount, setSfxCount] = useState(0);

    const counter = (e: React.ChangeEvent<HTMLInputElement>, limit: number) => {
        let text = e.target.value;

        if (text.length > limit) {
            text = text.substring(0, limit); // trim extra chars
        }

        setNewUsername(text);
        setCount(text.length);
    };

    const scounter = (e: React.ChangeEvent<HTMLInputElement>, limit: number) => {
        let text = e.target.value;

        if (text.length > limit) {
            text = text.substring(0, limit); // trim extra chars
        }

        setNewSurname(text);
        setsCount(text.length);
    };

    const fcounter = (e: React.ChangeEvent<HTMLInputElement>, limit: number) => {
        let text = e.target.value;

        if (text.length > limit) {
            text = text.substring(0, limit); // trim extra chars
        }

        setNewFirstname(text);
        setfCount(text.length);
    };

    const mcounter = (e: React.ChangeEvent<HTMLInputElement>, limit: number) => {
        let text = e.target.value;

        if (text.length > limit) {
            text = text.substring(0, limit); // trim extra chars
        }

        setNewMiddlename(text);
        setmCount(text.length);
    };

    const sfxcounter = (e: React.ChangeEvent<HTMLInputElement>, limit: number) => {
        let text = e.target.value;

        if (text.length > limit) {
            text = text.substring(0, limit); // trim extra chars
        }

        setNewSuffix(text);
        setSfxCount(text.length);
    };

    // --- username change --- //
    const checkUsername = async () => {
        if (loading) return;
        setLoading(true);
        try {
        const response = await fetch(`/api/settings/updateUsername`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            id: profile[0].id,
            username: newUsername
            }),
        });
        const result = await response.json();
        if (response.ok) {
            alert("Username updated successfully.");
            showUsernameWindow(false);
            setUsername(newUsername);
            setNewUsername("");
        } else {
            alert(result.error || "Failed to update username.");
        }
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    // --- name change --- //
    const updateName = async() => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/settings/updateName`,{
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    id: profile[0].id,
                    surname: newSurname,
                    firstname: newFirstname,
                    middlename: newMiddlename,
                    suffix: newSuffix
                })
            })
            const result = await response.json();
            if (response.ok) {
                alert("Name updated successfully.");
                showNameWindow(false);
                setSurname(newSurname);
                setFirstname(newFirstname);
                setMiddlename(newMiddlename);
                setSuffix(newSuffix);
                setNewSurname("");
                setNewFirstname("");
                setNewMiddlename("");
                setNewSuffix("");
            } else {
                alert(result.error || "Failed to update name.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return(
        <>
            {/* Username */}
            <div
                onMouseEnter={() => setUsernameHover(true)} onMouseLeave={() => setUsernameHover(false)}
                onClick={() => showUsernameWindow(true)}
                className="flex mt-4 px-6 hover:cursor-pointer"
            >
                <div className="flex w-full justify-between pr-5">
                    <div className="content-center-safe">Username</div>
                    <div className="content-center-safe">{username}</div>
                </div>
                <div className={`box-border size-9 rounded-full content-center-safe 
                ${usernameHover ? "bg-gray-500/50":null}`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="m-auto" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
                </div>
            </div>

            {/* name */}
            <div
                onMouseEnter={() => setNameHover(true)} onMouseLeave={() => setNameHover(false)}
                onClick={() => showNameWindow(true)}
                className="flex mt-4 px-6 hover:cursor-pointer"
            >
                <div className="flex w-full justify-between pr-5">
                    <div className="content-center-safe">Name:</div>
                    <div className="content-center-safe">{surname? surname+",":null} {firstname} {middlename}</div>
                </div>
                <div className={`box-border size-9 rounded-full content-center-safe 
                ${nameHover ? "bg-gray-500/50":null}`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="m-auto" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
                </div>
            </div>

            {/* username window */}
            <div
                onClick={() => {showUsernameWindow(false), setNewUsername(""), setCount(0)}}
                className={`${usernameWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
            >
                <div
                className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96 relative"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex justify-between">
                    <div className="text-lg font-semibold mb-4">Change Username</div>
                    {/* Close button */}
                    <div onClick={() => {showUsernameWindow(false), setNewUsername(""), setCount(0)}} className="flex justify-center-safe hover:bg-gray-500 rounded-full box-border size-8  hover:cursor-pointer">
                    <button
                        type="button"
                        className="text-xl font-bold"
                    >
                        ×
                    </button>
                    </div>
                </div>

                <div className="w-full">
                    <input
                    id="uname"
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => {setNewUsername(e.target.value), counter(e, 50)}}
                    className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl hover:cursor-pointer"
                    />
                    <div className="flex w-full justify-end text-gray-500">{count}/50</div>
                </div>

                {/* save & cancel buttons */}
                <div className="flex mt-4 w-full justify-end-safe gap-2">
                    <button 
                    type="button"
                    onClick={() => {showUsernameWindow(false), setNewUsername(""), setCount(0)}}
                    className="px-6 py-2 border-2 border-gray-500 hover:bg-gray-400 text-white rounded-xl"
                    >
                    Cancel
                    </button>
                    <button 
                    type="button"
                    onClick={checkUsername}
                    className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl border-2 border-background hover:cursor-pointer hover:border-gray-500
                                ${loading ? "opacity-70 cursor-wait" : ""}`}
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>

            {/* name window */}
            <div
                onClick={() => {showNameWindow(false),
                                setNewSurname(""), 
                                setNewFirstname(""), 
                                setNewMiddlename(""),   
                                setNewSuffix(""), 
                                setsCount(0), 
                                setfCount(0), 
                                setmCount(0), 
                                setSfxCount(0)
                            }}
                className={`${nameWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
            >
                <div
                className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96 relative"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex justify-between">
                    <div className="text-lg font-semibold mb-4">Change Name</div>
                    {/* Close button */}
                    <div onClick={() => {showNameWindow(false),
                                setNewSurname(""), 
                                setNewFirstname(""), 
                                setNewMiddlename(""),  
                                setNewSuffix(""), 
                                setsCount(0), 
                                setfCount(0), 
                                setmCount(0), 
                                setSfxCount(0)
                            }}
                        className="flex justify-center-safe hover:bg-gray-500 rounded-full box-border size-8 hover:cursor-pointer">
                    <button
                        type="button"
                        className="text-xl font-bold"
                    >
                        ×
                    </button>
                    </div>
                </div>

                <div className="w-full">
                    <input
                    id="sname"
                    name="surname"
                    type="text"
                    placeholder="Surname *"
                    value={newSurname}
                    onChange={(e) => {setNewSurname(e.target.value), scounter(e, 50)}}
                    className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
                    />
                    <div className="flex w-full justify-end text-gray-500">{scount}/50</div>
                </div>

                <div className="w-full">
                    <input
                    id="fname"
                    name="firstname"
                    type="text"
                    placeholder="First name *"
                    value={newFirstname}
                    onChange={(e) => {setNewFirstname(e.target.value), fcounter(e, 50)}}
                    className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
                    />
                    <div className="flex w-full justify-end text-gray-500">{fcount}/50</div>
                </div>

                <div className="flex w-full justify-between">
                    <div className="w-3/5">
                        <input
                        id="mname"
                        name="middlename"
                        type="text"
                        placeholder="Middle name"
                        value={newMiddlename}
                        onChange={(e) => {setNewMiddlename(e.target.value), mcounter(e, 50)}}
                        className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
                        />
                        <div className="flex w-full justify-end text-gray-500">{mcount}/50</div>
                    </div>

                    <div className="w-2/6">
                        <input
                        id="sfx"
                        name="suffix"
                        type="text"
                        placeholder="Suffix"
                        value={newSuffix}
                        onChange={(e) => {setNewSuffix(e.target.value), sfxcounter(e, 30)}}
                        className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
                        />
                        <div className="flex w-full justify-end text-gray-500">{sfxcount}/30</div>
                    </div>
                </div>
                
                {/* save & cancel buttons */}
                <div className="flex mt-4 w-full justify-end-safe gap-2">
                    <button 
                    type="button"
                    onClick={() => {showNameWindow(false),
                                    setNewSurname(""), 
                                    setNewFirstname(""), 
                                    setNewMiddlename(""), 
                                    setNewSuffix(""), 
                                    setsCount(0), 
                                    setfCount(0), 
                                    setmCount(0),
                                    setSfxCount(0)
                            }}
                    className="px-6 py-2 border-2 border-gray-500 hover:bg-gray-400 text-white rounded-xl hover:cursor-pointer"
                    >
                    Cancel
                    </button>
                    <button 
                    type="button"
                    onClick={ () => updateName() }
                    className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl border-2 border-background hover:cursor-pointer hover:border-gray-500
                                ${loading ? "opacity-70 cursor-wait" : ""}`}
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>
        </>
    )
}
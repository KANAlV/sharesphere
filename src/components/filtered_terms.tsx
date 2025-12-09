"use client";
import { useEffect, useState } from "react";

type Word = {
  status:boolean
  wordlist_id:string;
  word:string;
  added_by:string;
  date_added:string;
}

export default function FilteredTerms() {
    const [word, setWord] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [addWord, setWordAdd] = useState("");
    const [add, setAdd] = useState(false);
    const [delWordID, setDelWordID] = useState("");
    const [delWord, setDelWord] = useState("");
    const [del, setDelete] = useState(false);
    
    async function loadList() {
        try {
            const res = await fetch("/api/fetchWordlist");
            const data = await res.json();
            setWord(data);
        } catch (err) {
            console.error("Fetch wordlist error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleWord(wordlist_id: string) {
        try {
            const res = await fetch("/api/toggleWord", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wordlist_id }),
            });

            if (!res.ok) throw new Error("Failed to toggle");

            const updatedWord: Word = await res.json();

            // Update only this row in state
            setLoading(false);
            setWord((prev) =>
            prev.map((w) => (w.wordlist_id === updatedWord.wordlist_id ? updatedWord : w))
            );
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteWord(delWordID: string) {
        try {
            setLoading(true);

            // Send the word to your API
            const res = await fetch("/api/delWordlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ wordlist_id: delWordID }),
            });

            if (!res.ok) {
                throw new Error("Failed to delete word");
            }

            setWord([]);
            
            await loadList();
        } catch (err) {
            console.error("Error deleting on wordlist:", err);
        } finally {
            setLoading(false);
        }
    }

    async function submitWord(newWord: string) {
        try {
            setLoading(true);

            // Send the word to your API
            const res = await fetch("/api/addWordlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ word: newWord }),
            });

            if (!res.ok) {
                throw new Error("Failed to add word");
            }

            // Clear the current word list (optional)
            setWord([]);
            
            // Reload the list after successful add
            await loadList();
        } catch (err) {
            console.error("Error adding to wordlist:", err);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadList();
    }, [])

    return(<>
    {/* Loading Overlayg */}
    <div className={`${loading? "flex":"hidden"} fixed items-center justify-center z-30 top-0 left-0 w-screen h-screen cursor-progress bg-black/50`}>
    Loading Data...
    </div>

    {/* Modals */}
    {/* Add Modal */}
    <div 
    onClick={() => setAdd(false)}
    className={`${add? "flex":"hidden"} fixed items-center justify-center z-30 top-0 left-0 w-screen h-screen cursor-progress bg-black/50`}>
        <div
        onClick={(e) => e.stopPropagation()}
        className="p-6 w-80 min-h-40 bg-white dark:bg-slate-800 rounded-2xl"
        >
            <h1 className="text-2xl">Add Filter</h1>
            <input
            type="text"
            placeholder="Input word..."
            value={addWord}
            onChange={(e) => setWordAdd(e.target.value)}
            className="mt-2 p-2 w-full border-2 border-gray-500 rounded-2xl"
            />
            
            <div className="flex justify-end mt-4 items-center gap-2">
                <button onClick={() => {setWordAdd(""), setAdd(false)}} className="px-3 py-1 hover:bg-gray-400 border-2 border-gray-500 cursor-pointer rounded-lg">Cancel</button>
                <button onClick={() => {submitWord(addWord), setAdd(false)}} className="px-3 py-1 bg-blue-500 hover:bg-blue-400 cursor-pointer rounded-lg">Add</button>
            </div>
        </div>
    </div>

    {/* Del Modal */}
    <div 
    onClick={() => setDelete(false)}
    className={`${del? "flex":"hidden"} fixed items-center justify-center z-30 top-0 left-0 w-screen h-screen cursor-progress bg-black/50`}>
        <div
        onClick={(e) => e.stopPropagation()}
        className="p-6 w-80 min-h-40 bg-white dark:bg-slate-800 rounded-2xl"
        >
            <h1 className="text-2xl">Delete Filter</h1>
            <p className="mt-2">Are you sure you want to delete:"{delWord}"</p>
            <div className="flex justify-end mt-4 items-center gap-2">
                <button
                onClick={() => {setDelWordID(""), setDelWord(""), setDelete(false)}}
                className="px-3 py-1 hover:bg-gray-400 border-2 border-gray-500 cursor-pointer rounded-lg">
                Cancel</button>
                <button
                onClick={() => {deleteWord(delWordID), setDelete(false)}}
                className="px-3 py-1 bg-red-700 hover:bg-red-500 cursor-pointer rounded-lg">
                Delete</button>
            </div>
        </div>
    </div>


    {/* Main Elements */}
    <div className="flex justify-between mb-8 bg-transparent w-15/16 min-h-[90vh] mx-auto rounded-3xl">
        <div className="mt-30 w-full h-20">
            <h1 className="text-2xl">Filtered Terms</h1>
            <div className="flex w-full justify-end mt-10 ">
                <button onClick={() => setAdd(true)} className="px-3 py-1 bg-blue-600 hover:bg-blue-400 cursor-pointer rounded-lg">Add Filter</button>
            </div>
            <div className="mt-2 overflow-clip rounded-2xl">
                <div className=" w-full h-4 bg-amber-300 dark:bg-[#1F1E3D]"></div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-800 divide-y">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Word</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Added By</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date Added</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-40">Actions</th>
                    </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {word.map((w, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`${w.status? "bg-green-100 text-green-800":"bg-gray-200 text-gray-800"} inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`}>{w.status? "Active":"Disabled"}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{w.word}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{w.added_by}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(w.date_added).toISOString().split("T")[0]}</td>
                        <td className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <button
                                className={`${w.status? "bg-gray-500 hover:bg-gray-400":"bg-green-500 hover:bg-green-400"} px-3 py-1 cursor-pointer rounded-lg`}
                                onClick={() => {setLoading(true), toggleWord(w.wordlist_id)}}
                                >
                                {w.status? "Disable":"Enable"}
                                </button>
                                <button
                                onClick={() => {setDelWordID(w.wordlist_id),setDelWord(w.word),setDelete(true)}}
                                className="px-3 py-1 bg-red-500 hover:bg-red-400 cursor-pointer rounded-lg">
                                Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    </>)
}
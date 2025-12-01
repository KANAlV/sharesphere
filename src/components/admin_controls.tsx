"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { fail } from "assert";
import { Fascinate_Inline } from "next/font/google";

type UserData = {
  id: string;
  username: string;
  profile: string;
};

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

type Mod = {
  userId: string;
  username: string;
  role: string;
  perms: {
    all: boolean;
    mute: boolean;
    announce: boolean;
    pagedetails: boolean;
    delete_posts: boolean;
    delete_comments: boolean;
    roles_management: boolean;
  };
};

type Rel = {
  dir: string;
  title: string;
  theme: string;
};

type Tags = {
  dir: string;
  tag: string;
  color: string;
};

type Rule = {
  rule: string;
  description: string;
  num: string;
};

export default function AdminControls({
  id,
  userdata,
  moderators,
  details,
  rel,
  tags,
  rules
}: {
  id: string;
  userdata: UserData[] | null;
  moderators: Mod[];
  details: Details[];
  rel: Rel[];
  tags: Tags[];
  rules: Rule[];
}) {
  const [page, setPage] = useState(true);
  const [mods, setMods] = useState(false);
  const [reports, setReports] = useState(false);
  const [muted, setMuted] = useState(false);

  // --- page details --- //

  // --- rules
  const [editRules, setEditRules] = useState(false)
  const [rulesEditWindow, SetRulesEditWindow] = useState(false)
  const [ruleChanged, setRuleChanged] = useState(false)
  const [ruleAction, setRuleAction] = useState("")
  const [oldRuleName, setOldRuleName] = useState("")
  const [newRuleName, setNewRuleName] = useState("")
  const [oldRuleDesc, setOldRuleDesc] = useState("")
  const [newRuleDesc, setNewRuleDesc] = useState("")
  const [removeRuleWindow, setRemoveRuleWindow] = useState(false)

  // --- moderator expand state --- //
  const [openMods, setOpenMods] = useState<Record<number, boolean>>({});
  const [addModOpen, setAddModOpen] = useState(false);
  const [addModTextBoxValue, setAddModTextBoxValue] = useState("");
  const [addModShowResults, setAddModShowResults] = useState(false);
  const [addModResults, setAddModResults] = useState<{ username: string, id: string }[]>([]);
  const [addModLoading, setAddModLoading] = useState(false);

  //edit mod states
  const [editMods, setEditMods] = useState(false);
  const [editModOpen, setEditModOpen] = useState(false);
  const [editID, setEditID] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [all, setAll] = useState(false);
  const [mute, setMute] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const [pagedetails, setPagedetails] = useState(false);
  const [delete_posts, setDelete_posts] = useState(false);
  const [delete_comments, setDelete_comments]= useState(false);
  const [roles_management, setRoles_management]= useState(false);
  const [editChanged, setEditChanged] = useState(false);
  const [editRoleName, setEditRoleName] = useState("");

  // delete mod states
  const [removeModWindow, setRemoveModWindow] = useState(false);
  const [removeID, setRemoveID] = useState("");
  const [removeUsername, setRemoveUsername] = useState("");

  
  const myModData = moderators.find(
    (m) => m.userId === userdata?.[0]?.id
  );

  console.log(myModData);

  const toggleTab = (tab: string) => {
    tab == "page"? setPage(true):setPage(false);
    tab == "mods"? setMods(true):setMods(false);
    tab == "reports"? setReports(true):setReports(false);
    tab == "muted"? setMuted(true):setMuted(false);
  }

  const toggleMod = (idx: number) => {
    setOpenMods(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };


  // Format course name
  let categoryName = "";
  for (let i = 0; i < id.length; i++) {
    if (i === 0) categoryName = id.charAt(0).toUpperCase();
    else if (id.charAt(i) === "_") categoryName += " ";
    else if (id.charAt(i - 1) === "_") categoryName += id.charAt(i).toUpperCase();
    else categoryName += id.charAt(i);
  }

  function OrgName(name: string) {
    let categoryName = "";
    for (let i = 0; i < name.length; i++) {
      if (i === 0) categoryName = name.charAt(0).toUpperCase();
      else if (name.charAt(i) === "_") categoryName += " ";
      else if (name.charAt(i - 1) === "_") categoryName += name.charAt(i).toUpperCase();
      else categoryName += name.charAt(i);
    }
    return categoryName;
  }

  const pageDetails = details[0];
  const dateCreated = new Date(pageDetails.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  // responsive sidebar state
  const [isOpen, setIsOpen] = useState(false);

  // --- Path logics ---

  const pathname = usePathname();
  const inOrgs = pathname.startsWith("/o/")
  const redirectTo = (redir?: string) => encodeURIComponent((redir ?? "").replace(/ /g, '_'));
  
  // --- Font color logic ---
  const textColor = (theme: string) => {
    let fontcolor = "black";
    const hexColor = theme.startsWith("#")
      ? theme.slice(1)
      : theme;
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (brightness < 128) fontcolor = "lightgray";

    return fontcolor;
  }

  // --- rules ---
  const [openRules, setOpenRules] = useState<number[]>([]);

  const ruleFilter = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9 -]/g, "");
    setNewRuleName(filtered);
    setRuleChanged(true);
  };

  const toggleRule = (idx: number) => {
    setOpenRules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const editSelectedRule = (rule:string, desc:string) => {
    SetRulesEditWindow(true)
    setOldRuleName(rule)
    setOldRuleDesc(desc)
    setNewRuleName(rule)
    setNewRuleDesc(desc)
  }

  async function submitAddRule() {
    try {
      const pageType = pathname.startsWith("/o")? true:false;
      const ruleNo = rules.length + 1;
      const res = await fetch(`/api/moderator/addRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule: newRuleName, Desc: newRuleDesc, pageId: id, pageType: pageType, num: ruleNo }),
      });

      if (res.ok) {
        // Successfully added rule
        alert("Rule added successfully!"); 
        setRemoveModWindow(false);
        setNewRuleName("");
        setNewRuleDesc("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to add rule: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to add rule:", err);
      alert("An error occurred while adding the rule.");
    }
  }

  async function submitEditRule() {
    try {
      const pageType = pathname.startsWith("/o")? true:false;
      const ruleNo = rules.length + 1;
      const res = await fetch(`/api/moderator/updateRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldRule: oldRuleName, newRule: newRuleName, newDesc: newRuleDesc, pageId: id, pageType: pageType, num: ruleNo }),
      });

      if (res.ok) {
        // Successfully updated rule
        alert("Rule updated successfully!"); 
        setRemoveModWindow(false);
        setOldRuleName("");
        setOldRuleDesc("");
        setNewRuleName("");
        setNewRuleDesc("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to update rule: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to update rule:", err);
      alert("An error occurred while update the rule.");
    }
  }

  // --- Delete Rule
  const ShowRuleDel = (value:string) => {
    setRemoveRuleWindow(true)
    setOldRuleName(value)
  }

  async function submitRemoveRule() {
    try {
      const pageType = pathname.startsWith("/o");
      const res = await fetch(`/api/moderator/removeRule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule: oldRuleName, pageId: id, pageType }),
      });

      if (res.ok) {
        alert("Rule removed successfully!"); 
        setRemoveModWindow(false);
        setOldRuleName("");
        setOldRuleDesc("");
        setNewRuleName("");
        setNewRuleDesc("");
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Failed to remove rule: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to remove rule:", err);
      alert("An error occurred while removing the rule.");
    }
  }


  // --- moderator tab functions ---
  async function addModTextBox(value: string) {
    setAddModTextBoxValue(value);

    if (value.length < 3) {
      setAddModResults([]);      // always an array
      setAddModShowResults(false);
      return;
    }

    try {
      setAddModLoading(true);
      const pageType = pathname.startsWith("/o")? "organization":"categories";

      const res = await fetch(
        `/api/moderator/searchUser?user=${value}&pageId=${id}&pageType=${pageType}`
      );
      const json = await res.json();

      // Ensure json.filteredUsers exists and is an array
      const results = Array.isArray(json.filteredUsers) ? json.filteredUsers : [];

      setAddModResults(results);
      setAddModLoading(false);
      setAddModShowResults(true);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setAddModResults([]); // fallback to empty array
      setAddModShowResults(true);
    }
  }

  async function addModerator(userId: string) {
    try {
      const pageType = pathname.startsWith("/o")? "organization":"categories";

      const res = await fetch(`/api/moderator/addModerator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pageId: id, pageType: pageType }),
      });

      if (res.ok) {
        // Successfully added moderator
        alert("Moderator added successfully!"); 
        setAddModOpen(false);
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to add moderator: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to add moderator:", err);
      alert("An error occurred while adding the moderator.");
    }
  }

  // remove mod functions
  const showRemoveMod = (modId: string) => {
    setRemoveModWindow(true);
    const removeModData = moderators.find(
      (m) => m.userId === modId
    );
    setRemoveID(removeModData? removeModData.userId:"");
    setRemoveUsername(removeModData? removeModData.username:"");
  }

  async function submitRemoveMod(userId:string) {
    try {
      const pageType = pathname.startsWith("/o")? "organization":"categories";

      const res = await fetch(`/api/moderator/removeModerator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pageId: id, pageType: pageType }),
      });

      if (res.ok) {
        // Successfully removed moderator
        alert("Moderator removed successfully!"); 
        setRemoveModWindow(false);
        setRemoveID("");
        setRemoveUsername("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to remove moderator: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to remove moderator:", err);
      alert("An error occurred while removing the moderator.");
    }
  }

  // edit mod function
  const EditMod = (userId: string) => {
    setEditModOpen(true);
    const editModData = moderators.find(
      (m) => m.userId === userId
    );
    setEditID(editModData? editModData.userId :"")
    setEditUsername(editModData? editModData.username :"")
    setEditRoleName(editModData? editModData.role:"")
    setAll(editModData? editModData.perms.all : false)
    setMute(editModData? editModData.perms.mute : false)
    setAnnounce(editModData? editModData.perms.announce : false)
    setPagedetails(editModData? editModData.perms.pagedetails : false)
    setDelete_posts(editModData? editModData.perms.delete_posts : false)
    setDelete_comments(editModData? editModData.perms.delete_comments : false)
    setRoles_management(editModData? editModData.perms.roles_management : false)
  }

  const closeEditWindow = () => {
    setEditModOpen(false)
    setEditID("")
    setEditUsername("")
  }

  const editFilter = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9 -]/g, "");
    setEditRoleName(filtered);
    setEditChanged(true);
  };

  const editPerms = (perm: string) => {
    const next = {
      mute,
      announce,
      pagedetails,
      delete_posts,
      delete_comments,
      roles_management,
    };
    setEditChanged(true)
    switch (perm) {
      case "7": {
        const newVal = !all;
        setAll(newVal);
        setMute(newVal);
        setAnnounce(newVal);
        setPagedetails(newVal);
        setDelete_posts(newVal);
        setDelete_comments(newVal);
        setRoles_management(newVal);
        return; // done
      }

      case "1":
        next.mute = !mute;
        setMute(v => !v);
        break;

      case "2":
        next.announce = !announce;
        setAnnounce(v => !v);
        break;

      case "3":
        next.pagedetails = !pagedetails;
        setPagedetails(v => !v);
        break;

      case "4":
        next.delete_posts = !delete_posts;
        setDelete_posts(v => !v);
        break;

      case "5":
        next.delete_comments = !delete_comments;
        setDelete_comments(v => !v);
        break;

      case "6":
        next.roles_management = !roles_management;
        setRoles_management(v => !v);
        break;
    }

    // Compute "all" **using next values**, not stale state
    const shouldAllBeOn =
      next.mute &&
      next.announce &&
      next.pagedetails &&
      next.delete_posts &&
      next.delete_comments &&
      next.roles_management;

    setAll(shouldAllBeOn);
  };

  async function submitEditMod(userId: string) {
    try {
      const pageType = pathname.startsWith("/o")? "organization":"categories";

      const modData = {
        [userId]: {
          role: editRoleName,
          perms: {
            all: all,
            mute: mute,
            announce: announce,
            pagedetails: pagedetails,
            delete_posts: delete_posts,
            delete_comments: delete_comments,
            roles_management: roles_management,
          }
        }
      }

      const res = await fetch(`/api/moderator/updateModerator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({modData, pageId: id, pageType: pageType }),
      });

      if (res.ok) {
        // Successfully updated moderator
        alert("Moderator updated successfully!"); 
        setEditModOpen(false);
        setEditID("");
        setEditUsername("");
        setEditRoleName("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to update moderator: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to update moderator:", err);
      alert("An error occurred while updating the moderator.");
    }
  }

  return (
    <>
      {/* MODAL BOXES */}



      

      {/* --- RULES  --- */}
      {/* add/edit rules */}
      <div 
      onClick={() => {SetRulesEditWindow(false), setRuleChanged(false)}}
      className={`${rulesEditWindow? "block":"hidden"} fixed z-40 w-screen h-screen bg-black/50`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed h-100 w-screen lg:w-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 p-8 rounded-2xl"
        >
          <div className="flex justify-between">
            <h1 className="font-bold text-2xl mb-4">
            {ruleAction == "add"? "Add Rule" : "Edit Rule"}
            </h1>
            <div onClick={() => {SetRulesEditWindow(false), setRuleChanged(false)}}
             className="flex justify-center items-center w-8 h-8 hover:bg-gray-500 rounded-full cursor-pointer">X</div>
          </div>
          <input
          className="border-2 border-gray-500 px-2 rounded-lg"
          onChange={(e) => ruleFilter(e.target.value)}
          type="text" value={newRuleName} 
          />
          <textarea
          className="mt-5 w-full min-h-40 border-2 border-gray-500 px-2 rounded-lg"
          onChange={(e) => {setNewRuleDesc(e.target.value), setRuleChanged(true)}}
          value={newRuleDesc}
          />
          <div className={`${ruleChanged? "":"hidden"} flex pt-10 w-full justify-end`}>
            <button 
              type="button" 
              onClick={() => {
                SetRulesEditWindow(false),
                setOldRuleName(""),
                setOldRuleDesc(""),
                setNewRuleName(""),
                setNewRuleDesc("")
              }}
              className="px-4 py-2 bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
            >Cancel</button>
            <button 
              type="button"
              onClick={() => {if(ruleAction == "add"){(submitAddRule())}else{(submitEditRule())}}} 
              className="ml-4 px-4 py-2 bg-blue-700 rounded-lg cursor-pointer hover:bg-red-500">Save</button>
          </div>
        </div>
      </div>

      {/* Delete Rule */}
      <div 
      onClick={() => {setRemoveRuleWindow(false), setOldRuleName("")}}
        className={`${removeRuleWindow? "block":"hidden"} fixed z-40 w-screen h-screen bg-black/50`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 p-8 rounded-2xl w-11/12 max-w-md"
        >
          <h1 className="font-bold text-2xl mb-4">Remove Rule</h1>
          <div>
             Are you sure you want to remove rule: "{oldRuleName}"?
          </div>
          <div className="flex pt-10 w-full justify-end">
            <button 
              type="button" 
              onClick={() => setRemoveRuleWindow(false)}
              className="px-4 py-2 bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
            >Cancel</button>
            <button 
              type="button"
              onClick={() => submitRemoveRule()} 
              className="ml-4 px-4 py-2 bg-red-700 rounded-lg cursor-pointer hover:bg-red-500">Save</button>
          </div>
        </div>
      </div>

      {/* --- Moderator Tabs --- */}
      {/* Add Moderators */}
      <div 
      onClick={() => setAddModOpen(false)}
        className={`${addModOpen? "block":"hidden"} fixed z-40 w-screen h-screen bg-black/50`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 p-8 rounded-2xl w-11/12 max-w-md"
        >
          <h1 className="font-bold text-2xl mb-4">Add Moderator</h1>

          <input
            type="text"
            value={addModTextBoxValue}
            onChange={(e) => addModTextBox(e.target.value)}
            placeholder="search username"
            className="w-full p-2 mb-4 border-2 border-gray-500 rounded-lg bg-slate-100 dark:bg-slate-700"
          />
          <p className="text-gray-500 overflow-clip">
          {addModLoading ? "Loading..." : 
            (addModTextBoxValue.length > 2 ? `Showing results for "${addModTextBoxValue}"`:
            addModTextBoxValue.length == 0? "":`Add ${3 - addModTextBoxValue.length} more characters.`)
          }</p>
          <div className={`${addModShowResults? "":"hidden"} max-h-60 overflow-y-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600`}>
            {addModShowResults && addModResults.length > 0 ? (
              addModResults.map((user, idx) => (
                <div key={idx}
                  onClick={() => addModerator(user.id)}
                  className="mt-2 px-4 py-2 border-2 border-gray-500 rounded-lg hover:bg-gray-500/50">
                  <h2 className="font-bold">{user.username}</h2>
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.5 }}>No users found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Moderators */}
      <div 
      onClick={() => setEditModOpen(false)}
        className={`${editModOpen? "block":"hidden"} fixed z-40 w-screen h-screen bg-black/50`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 p-8 rounded-2xl w-fit "
        >
          <h1 className="font-bold text-2xl mb-4">Edit Moderator: {editUsername}</h1>
          <div>role name: <input className={`px-2 border-2 border-gray-500 w-42 rounded-md`} onChange={(e) => editFilter(e.target.value)} type="text" value={editRoleName}/></div>
          Permissions
          <div className="flex justify-evenly">
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">All</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={all} onChange={() => editPerms("7")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Mute</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={mute} onChange={() => editPerms("1")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Announce</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={announce} onChange={() => editPerms("2")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Page Details</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={pagedetails} onChange={() => editPerms("3")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Delete Posts</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={delete_posts} onChange={() => editPerms("4")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Delete Comments</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={delete_comments} onChange={() => editPerms("5")}/></div>
            </div>
            <div>
              <div className="border-1 border-gray-500 px-2 py-1">Roles Management</div>
              <div className="flex justify-center border-1 border-gray-500 px-2 py-1"><input type="checkbox" checked={roles_management} onChange={() => editPerms("6")}/></div>
            </div>
          </div>
          <div className={`${editChanged? "":"hidden"} flex w-full justify-end`}>
            <div className="flex pt-10 w-full justify-end">
              <button 
                type="button" 
                onClick={() => closeEditWindow()}
                className="px-4 py-2 bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
              >Cancel</button>
              <button 
                type="button"
                onClick={() => submitEditMod(editID)} 
                className="ml-4 px-4 py-2 bg-blue-700 rounded-lg cursor-pointer hover:bg-red-500">Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Moderators */}
      <div 
      onClick={() => setRemoveModWindow(false)}
        className={`${removeModWindow? "block":"hidden"} fixed z-40 w-screen h-screen bg-black/50`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 p-8 rounded-2xl w-11/12 max-w-md"
        >
          <h1 className="font-bold text-2xl mb-4">Remove Moderator</h1>
          <div>
             Are you sure you want to {removeUsername} as a moderator?
          </div>
          <div className="flex pt-10 w-full justify-end">
            <button 
              type="button" 
              onClick={() => setRemoveModWindow(false)}
              className="px-4 py-2 bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
            >Cancel</button>
            <button 
              type="button"
              onClick={() => submitRemoveMod(removeID)} 
              className="ml-4 px-4 py-2 bg-red-700 rounded-lg cursor-pointer hover:bg-red-500">Save</button>
          </div>
        </div>
      </div>

      {/* SIDE BAR */}
      <div>
        {/* MOBILE TOGGLE */}
        <div
          className="z-30 lg:hidden fixed top-22 right-5 w-10 h-10 text-3xl text-center rounded-full bg-slate-500/50"
          onClick={() => setIsOpen(true)}
        >
          ≡
        </div>

        {/* SIDEBAR CONTAINER */}
        <div
          className={`transition-opacity duration-500 ease-in-out lg:opacity-100
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none lg:pointer-events-auto"}
            fixed top-18 right-0 h-screen lg:h-screen w-screen bg-slate-300 dark:bg-slate-800
            lg:block lg:max-w-1/6
            overflow-y-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600
            `}
          style={{
            zIndex: 30,
          }}
        >
          {/* MOBILE CLOSE BUTTON */}
          <div className="lg:hidden h-5 w-screen">
            <div className="fixed right-7 w-5 h-5 text-3xl" onClick={() => setIsOpen(false)}>
              ≡
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex h-14 overflow-x-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
            <div onClick={() => toggleTab("page")} className={`flex justify-center items-center px-4 text-lg font-bold whitespace-nowrap
                            cursor-pointer border-b-3 ${page? "border-blue-600":"border-blue-600/0"} `}>
              Page
            </div>
            <div onClick={() => toggleTab("mods")} className={`flex justify-center items-center px-4 text-lg font-bold whitespace-nowrap
                            cursor-pointer border-b-3 ${mods? "border-blue-600":"border-blue-600/0"} `}>
              Mods
            </div>
            <div onClick={() => toggleTab("reports")} className={`flex justify-center items-center px-4 text-lg font-bold whitespace-nowrap
                            cursor-pointer border-b-3 ${reports? "border-blue-600":"border-blue-600/0"} `}>
              Reports
            </div>
            <div onClick={() => toggleTab("muted")} className={`flex justify-center items-center px-4 text-lg font-bold whitespace-nowrap
                            cursor-pointer border-b-3 ${muted? "border-blue-600":"border-blue-600/0"} `}>
              Muted
            </div>
          </div>

          {/* --- PAGE CONTENT --- */}
          <div className={`${page ? "block" : "hidden"} `}>
            {/* MAIN CONTENT */}
            <div className="px-8 pt-8 pb-4 lg:rounded-t-2xl border-t-2 border-gray-500/50">
              <h1 className="font-bold">{categoryName}</h1>
              <p style={{ opacity: 0.8 }}>{pageDetails.description}</p>
              <div style={{ opacity: 0.8 }} className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="false" role="img">
                  <title>Calendar</title>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
                <span className="w-2" />
                Created {dateCreated}
              </div>
            </div>

            {/* Tags */}
            <div className=" mt-1 pl-8 py-4 border-t-2 border-gray-500/50">
              <p style={{ opacity: 0.9 }}>
                {/^\/[co]\/[^/]+\/posts/.test(pathname) ? "Post Tags":(pathname.startsWith(`/c/`)||pathname.startsWith(`/o/`) ? "Most Popular Tags":"Currently showing posts for:")}
              </p>
              <div className="block max-h-120 overflow-y-clip">
                {tags.length > 0 ? (
                  tags.map((post, idx) => (
                    <a href={pathname.startsWith("/c")? (pathname !== `/c/${id}` ? `/c/${id}`:`/c/${id}/tags/${redirectTo(post.tag)}`):(pathname !== `/o/${id}` ? `/o/${id}`:`/o/${id}/tags/${redirectTo(post.tag)}`)} key={idx} className="block w-min">
                      <div className={`flex px-5 py-2 w-min whitespace-nowrap rounded-full mt-2`}
                      style={{ backgroundColor: post.color, color: textColor(post.color) }}
                      >
                        {post.tag}
                        {pathname.includes("tags") ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          focusable="false"
                          className="pl-2"
                        >
                          <path
                            d="M6 6L18 18M6 18L18 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                      </div>
                    </a>
                  ))
                  ) : (
                    <p style={{ opacity: 0.9 }}>No Tags found.</p>
                  )
                }
              </div>
            </div>

            {/* Rules */}
            <div className="mt-1 px-8 py-4 border-t-2 border-gray-500/50">
              <div className={`flex w-full justify-between`}>
                <p style={{ opacity: 0.9 }}>Rules</p>
                <div 
                  onClick={() => setEditRules(!editRules)}
                >
                  <svg className={`${myModData?.perms.pagedetails? "":"hidden"} cursor-pointer p-1 rounded-full overflow-visible hover:bg-gray-500/50`} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 21H21" className={`${editRules? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.0651 7.39423L7.09967 20.4114C6.72438 20.7882 6.21446 21 5.68265 21H4.00383C3.44943 21 3 20.5466 3 19.9922V18.2987C3 17.7696 3.20962 17.2621 3.58297 16.8873L16.5517 3.86681C19.5632 1.34721 22.5747 4.87462 20.0651 7.39423Z" className={`${editRules? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.3097 5.30981L18.7274 8.72755" className={`${editRules? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={`${editRules? "block":"hidden"} text-gray-500`}>click on a rule to edit</div>
              <div
                onClick={() => {setRuleAction("add"), editSelectedRule("", "")} }
                className={`${editRules? "":"hidden"} flex mt-4 px-4 py-2 border-2 justify-center border-gray-500 rounded-lg cursor-pointer hover:bg-gray-500/50`}
              >
                Add Rule
                <svg className="ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="stroke-current"/>
                <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" strokeWidth="1.5" strokeLinecap="round" className="stroke-current"/>
                </svg>
              </div>
                {rules.length > 0 ? (
                  rules.map((post, idx) => {
                    const isOpen = openRules.includes(idx);
                    return (
                      <div key={idx}>
                        <div
                          onClick={() => {
                            if (editRules) {
                              editSelectedRule(post.rule, post.description)
                            } else {
                              toggleRule(idx)
                            }
                          }}
                          className="flex mt-2 py-1 w-full hover:bg-gray-500/50 cursor-pointer"
                        >
                          <span className=" flex">
                            <div className="text-center w-12">{idx+1}</div> <div>{post.rule}</div>
                          </span>
                          {editRules && (
                            <svg onClick={(e) => {e.stopPropagation(), ShowRuleDel(post.rule)}} className="ml-auto" width="24" height="24" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                    <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" fill="red">
                                        <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">

                            </path>
                                    </g>
                                </g>
                            </svg>
                          )}
                          {!editRules && (
                            <svg
                              width="24px"
                              height="24px"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              className={`ml-auto transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              <path d="M7 10l5 5 5-5" />
                            </svg>
                          )}
                        </div>
                        {isOpen && (
                          <div className={`block pl-10 pr-5 py-2 text-sm opacity-70 transition-all duration-500 ease-in-out ${
                              isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                            }`}>
                            {post.description}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ opacity: 0.5 }}>No Rules found.</p>
                )}
            </div>

            {/* Related Orgs/Clubs */}
            <div className={`${inOrgs ? "hidden" : null} mt-1 px-8 py-4 lg:bg-gray-500/50`}>
              <p style={{ opacity: 0.9 }}>Related Orgs / Clubs</p>
              {rel.length > 0 ? (
                rel.map((post, idx) => (
                  <div key={idx} className={`mt-2 px-5 py-1 w-min whitespace-nowrap`}>
                    <a
                      href={`/o/${redirectTo(post.title)}`}
                      className="hover:underline"
                    >
                      {OrgName(post.title)}
                    </a>
                  </div>
                ))
                ) : (
                  <p style={{ opacity: 0.5 }}>No related orgs/clubs found.</p>
                )
              }
            </div>
          </div>
          
          {/* Moderators */}
          <div className={`${mods ? "block" : "hidden"} px-8 pt-8 pb-4 lg:rounded-t-2xl border-t-2 border-gray-500/50
                            overflow-x-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600
          `}>
            <div className="flex justify-between w-full">
              <h1 className="font-bold">Moderators</h1>
              {myModData?.perms.all ? (
                <svg onClick={() => setEditMods(!editMods)} className="cursor-pointer p-1 rounded-full overflow-visible hover:bg-gray-500/50" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 21H21" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.0651 7.39423L7.09967 20.4114C6.72438 20.7882 6.21446 21 5.68265 21H4.00383C3.44943 21 3 20.5466 3 19.9922V18.2987C3 17.7696 3.20962 17.2621 3.58297 16.8873L16.5517 3.86681C19.5632 1.34721 22.5747 4.87462 20.0651 7.39423Z" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.3097 5.30981L18.7274 8.72755" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ):(myModData?.perms.roles_management ? (
                <svg onClick={() => setEditMods(!editMods)} className="cursor-pointer p-1 rounded-full overflow-visible hover:bg-gray-500/50" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 21H21" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.0651 7.39423L7.09967 20.4114C6.72438 20.7882 6.21446 21 5.68265 21H4.00383C3.44943 21 3 20.5466 3 19.9922V18.2987C3 17.7696 3.20962 17.2621 3.58297 16.8873L16.5517 3.86681C19.5632 1.34721 22.5747 4.87462 20.0651 7.39423Z" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.3097 5.30981L18.7274 8.72755" className={`${editMods? "stroke-red-700":"stroke-current"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ):"")}
              
            </div>
            
            {/* add moderator */}
            <div 
              onClick={() => setAddModOpen(true)}
              className={`${editMods? "":"hidden"} flex mt-4 px-4 py-2 border-2 justify-center border-gray-500 rounded-lg cursor-pointer hover:bg-gray-500/50`}
            >
              Add Moderator
              <svg className="ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="stroke-current"/>
              <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" strokeWidth="1.5" strokeLinecap="round" className="stroke-current"/>
              </svg>
            </div>

            {/* mapped mods */}
            {moderators.length > 0 ? (
              moderators.map((mod, idx) => (
                <div key={idx} className="mt-4 px-4 py-2 border-2 border-gray-500 rounded-lg hover:bg-gray-500/50">
                  {/* ROW HEADER */}
                  <div
                    
                    onClick={() => (editMods? EditMod(mod.userId):toggleMod(idx))}
                    className="flex cursor-pointer"
                  >
                    <div className="w-9/10">
                      <h2 className="font-bold">{mod.username}</h2>
                      <p className="text-gray-500 select-none">{mod.role}</p>
                    </div>

                    <div
                      onClick={(e) => {
                        if (editMods) {
                          e.stopPropagation();
                          showRemoveMod(mod.userId);
                        } else {
                          toggleMod(idx);
                        }
                      }}
                      className={`flex items-middle justify-center h-full cursor-pointer`}
                    >
                      {editMods? (
                        <svg width="24" height="24" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" fill="red">
                                    <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">

                        </path>
                                </g>
                            </g>
                        </svg>
                      ):(
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`m-auto transform transition-transform duration-300 ${
                            openMods[idx] ? "rotate-270" : "rotate-90"
                          }`}
                        >
                          <path d="M8 4l8 8-8 8" />
                        </svg>
                      )}
                      
                    </div>
                  </div>

                  {/* SHOW WHEN EXPANDED */}
                  {openMods[idx] && (
                    <div className="mt-2 select-none">
                      <p className="font-semibold">Permissions:</p>
                      <ul className="list-disc list-inside">
                        {mod.perms.all && <li>All Permissions</li>}

                        {!mod.perms.all && (
                          <>
                            {mod.perms.mute && <li>Mute Users</li>}
                            {mod.perms.announce && <li>Make Announcements</li>}
                            {mod.perms.pagedetails && <li>Edit Page Details</li>}
                            {mod.perms.delete_posts && <li>Delete Posts</li>}
                            {mod.perms.delete_comments && <li>Delete Comments</li>}
                            {mod.perms.roles_management && <li>Manage Roles</li>}

                            {/* If no perms */}
                            {!mod.perms.mute &&
                            !mod.perms.announce &&
                            !mod.perms.pagedetails &&
                            !mod.perms.delete_posts && 
                            !mod.perms.delete_comments && 
                            !mod.perms.roles_management && <li>No Perms</li>}
                          </>
                        )}
                      </ul>
                    </div>
                  )}

                </div>
              ))
            ) : (
              <p style={{ opacity: 0.5 }}>No moderators found.</p>
            )}
          </div>

          <div className="p-2 mt-50 lg:m-0 w-inherit rounded-b-2xl" />
        </div>
      </div>
    </>
  );
}
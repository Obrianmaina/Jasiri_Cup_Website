"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Tree, TreeNode } from "react-organizational-chart";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";

interface OrgData {
  id: string;
  label: string;
  assignee: string;
  description: string;
  parentId: string | null;
}

interface TeamDirectoryMember {
  name: string;
  email: string;
  image?: string;
}

const DEFAULT_SEED_DATA: OrgData[] = [
  {
    id: "dir1",
    label: "Tech & Strategy Director",
    assignee: "Director 1",
    description: "Oversight of technology and strategic initiatives.",
    parentId: null,
  },
  {
    id: "it1",
    label: "IT Management",
    assignee: "Volunteer A",
    description: "Managing the JaSiriCup website architecture.",
    parentId: "dir1",
  },
  {
    id: "net1",
    label: "Network Administration",
    assignee: "Unassigned",
    description: "Internal team networking and security.",
    parentId: "dir1",
  },
  {
    id: "dir2",
    label: "Operations Director",
    assignee: "Director 2",
    description: "Supply chain and field operations.",
    parentId: null,
  },
  {
    id: "sup1",
    label: "Logistics Coordinator",
    assignee: "Volunteer C",
    description: "Inventory management.",
    parentId: "dir2",
  },
  {
    id: "dir3",
    label: "Outreach Director",
    assignee: "Director 3",
    description: "Public relations and community growth.",
    parentId: null,
  },
];

const BRANCH_COLORS = [
   "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-orange-600",
  "bg-red-600",
  "bg-cyan-600",
  "bg-amber-600",
  "bg-indigo-600",
  "bg-lime-600",
  "bg-pink-600",
  "bg-green-600",
  "bg-violet-600",
  "bg-yellow-600",
  "bg-fuchsia-600",
  "bg-teal-700",
  "bg-rose-600",
  "bg-blue-700",
  "bg-sky-600",
  "bg-orange-700",
  "bg-cyan-700",
  "bg-emerald-700",
  "bg-indigo-700",
  "bg-red-700",
  "bg-purple-700",
  "bg-slate-600",
  "bg-stone-600",
  "bg-zinc-600",
  "bg-neutral-600",
  "bg-gray-600",
];

export default function OrgChartClient() {
  const { data: session } = useSession();
  const isMaster = (session?.user as { role?: string })?.role === "Master";

  const [nodes, setNodes] = useState<OrgData[]>([]);
  const [directory, setDirectory] = useState<TeamDirectoryMember[]>([]);

  const [viewMode, setViewMode] = useState<"visual" | "edit">("visual");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [activeNode, setActiveNode] = useState<OrgData | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    assignee: "",
    description: "",
    parentId: "" as string | null,
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    fetchChart();
    fetchDirectory();
  }, []);

  const fetchChart = async () => {
    const res = await fetch("/api/admin/org-chart");
    const { data } = await res.json();
    setNodes(data && data.length > 0 ? data : DEFAULT_SEED_DATA);
  };

  const fetchDirectory = async () => {
    const res = await fetch("/api/users");
    const { data } = await res.json();
    setDirectory(data || []);
  };

  const saveNodes = async (updatedNodes: OrgData[]) => {
    const tid = toast.loading("Updating hierarchy...");
    try {
      const res = await fetch("/api/admin/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: updatedNodes }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Hierarchy updated!", { id: tid });
      setNodes(updatedNodes);
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to save", { id: tid });
    }
  };

  const handleSave = () => {
    const finalParentId =
      formData.parentId === "none" || !formData.parentId
        ? null
        : formData.parentId;
    if (mode === "edit" && activeNode) {
      saveNodes(
        nodes.map((n) =>
          n.id === activeNode.id
            ? { ...n, ...formData, parentId: finalParentId }
            : n,
        ),
      );
    } else if (mode === "add") {
      saveNodes([
        ...nodes,
        {
          ...formData,
          id: Math.random().toString(36).substring(2, 9),
          parentId: finalParentId,
        },
      ]);
    }
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this role and all sub-roles reporting to it?",
      )
    )
      return;
    const getChildrenIds = (parentId: string): string[] => {
      const children = nodes
        .filter((n) => n.parentId === parentId)
        .map((n) => n.id);
      return children.reduce(
        (acc, childId) => [...acc, ...getChildrenIds(childId)],
        children,
      );
    };
    const idsToDelete = [id, ...getChildrenIds(id)];
    saveNodes(nodes.filter((n) => !idsToDelete.includes(n.id)));
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, targetParentId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);

    const droppedId = e.dataTransfer.getData("text/plain");
    if (droppedId === targetParentId) return;

    const isDescendant = (
      potentialChildId: string | null,
      targetId: string,
    ): boolean => {
      if (!potentialChildId) return false;
      if (potentialChildId === targetId) return true;
      const child = nodes.find((n) => n.id === potentialChildId);
      if (!child || !child.parentId) return false;
      return isDescendant(child.parentId, targetId);
    };

    if (targetParentId && isDescendant(targetParentId, droppedId)) {
      toast.error("Cannot move a role under its own subordinate.");
      return;
    }

    const updatedNodes = nodes.map((n) =>
      n.id === droppedId ? { ...n, parentId: targetParentId } : n,
    );
    saveNodes(updatedNodes);
  };

  // --- HELPER FUNCTIONS ---
  const getInitials = (name: string) =>
    name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const getAssigneeDetails = (nameStr: string) => {
    const name = nameStr.trim();
    const user = directory.find(
      (u) => u.name?.toLowerCase() === name.toLowerCase(),
    );
    return {
      name: name,
      image: user?.image || null,
      initials: getInitials(name),
    };
  };

  // --- DATA PROCESSING ---
  const sharedRoles = nodes.filter((n) => n.assignee.includes(","));
  const treeNodes = nodes.filter((n) => !n.assignee.includes(","));
  const rootNodes = treeNodes.filter((n) => n.parentId === null);

  const editColumns = Array.from(new Set(nodes.map((n) => n.assignee))).sort(
    (a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    },
  );
  if (!editColumns.includes("Unassigned")) editColumns.push("Unassigned");

  // --- POLARIS NODE CARD ---
  const NodeCard = ({
    node,
    colorClass,
  }: {
    node: OrgData;
    colorClass: string;
  }) => {
    const isDragTarget = dragOverId === node.id;
    const isDragged = draggedId === node.id;
    const assignees = node.assignee
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const isUnassigned =
      node.assignee === "Unassigned" || node.assignee.trim() === "";

    return (
      <div
        draggable={isMaster}
        onDragStart={(e) => handleDragStart(e, node.id)}
        onDragOver={(e) => handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, node.id)}
        onClick={() => {
          setMode("view");
          setActiveNode(node);
          setIsModalOpen(true);
        }}
        className={`inline-block w-64 rounded-xl overflow-hidden shadow-md cursor-pointer transform transition-all duration-200 mx-2 text-left bg-white dark:bg-gray-900 border-2 ${isDragTarget ? "border-purple-500 scale-105 ring-4 ring-purple-500/20" : "border-transparent hover:-translate-y-1 hover:shadow-xl"} ${isDragged ? "opacity-50 grayscale" : "opacity-100"}`}
      >
        <div
          className={`py-2 px-4 border-b border-black/20 ${isUnassigned ? "bg-amber-600 text-white" : "bg-[#333333] text-white"}`}
        >
          <h3 className="font-bold text-sm truncate tracking-wide text-center">
            {isUnassigned ? "Unassigned" : node.assignee}
          </h3>
        </div>

        <div
          className={`${colorClass} p-4 flex items-center gap-4 text-white relative overflow-hidden`}
        >
          <div className="flex -space-x-3 shrink-0 relative z-10">
            {assignees.length > 0 && !isUnassigned ? (
              assignees.map((nameStr, i) => {
                const details = getAssigneeDetails(nameStr);
                return (
                  <div
                    key={i}
                    title={details.name}
                    className="w-12 h-12 rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm shadow-inner overflow-hidden relative z-10 hover:z-20 transition-transform hover:scale-110"
                  >
                    {details.image ? (
                      <img
                        src={details.image}
                        alt={details.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      details.initials
                    )}
                  </div>
                );
              })
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white/50 bg-black/20 flex items-center justify-center text-white font-black text-sm">
                U
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-0.5">
              Role Title
            </p>
            <p className="font-bold text-sm leading-tight line-clamp-2 drop-shadow-sm">
              {node.label}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTreeNodes = (
    parentId: string | null,
    depth: number = 0,
    colorIndex: number = 0,
  ) => {
    const children = nodes.filter((node) => node.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <>
        {children.map((node, index) => {
          const branchColorIndex =
            depth === 0 ? index % BRANCH_COLORS.length : colorIndex;
          const colorClass = BRANCH_COLORS[branchColorIndex] || "bg-gray-500";

          return (
            <TreeNode
              key={node.id}
              label={<NodeCard node={node} colorClass={colorClass} />}
            >
              {renderTreeNodes(node.id, depth + 1, branchColorIndex)}
            </TreeNode>
          );
        })}
      </>
    );
  };

  const activeSubordinates = nodes.filter((n) => n.parentId === activeNode?.id);

  return (
    <div className="py-8 w-full overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Organizational Structure
          </h2>
          {isMaster ? (
            <p className="text-sm text-gray-500 mt-1">
              Visual hierarchy of the JaSiriCup team.{" "}
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                Drag and drop any card to reassign its reporting line!
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Visual hierarchy of the JaSiriCup team. Click any card to view
              detailed responsibilities.
            </p>
          )}
        </div>

        {isMaster && (
          <button
            onClick={() => {
              setMode("add");
              setFormData({
                label: "",
                assignee: "",
                description: "",
                parentId: "none",
              });
              setIsModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
          >
            + Create Top-Level Role
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-12 pt-8 hide-scrollbar bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner">
        <div className="min-w-[1000px] flex justify-center">
          {rootNodes.length > 0 ? (
            <Tree
              lineWidth={"2px"}
              lineColor={"#9ca3af"}
              lineBorderRadius={"10px"}
              label={
                <div
                  onDragOver={(e) => handleDragOver(e, "root")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, null)}
                  className={`inline-block px-10 py-4 bg-gray-900 dark:bg-black text-white rounded-full font-black text-sm tracking-widest shadow-lg mb-4 uppercase border-2 transition-all ${dragOverId === "root" ? "border-purple-500 scale-110 ring-4 ring-purple-500/20" : "border-gray-700"}`}
                >
                  Co-Leadership Board
                </div>
              }
            >
              {renderTreeNodes(null)}
            </Tree>
          ) : (
            <div className="text-center p-12 w-full max-w-2xl">
              <p className="text-gray-500 font-medium">
                The organization map is currently empty.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- INTERACTIVE MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          mode === "view"
            ? "Role Details"
            : mode === "add"
              ? "Create Role"
              : "Edit Role"
        }
      >
        <div className="p-4 space-y-5 max-h-[80vh] overflow-y-auto hide-scrollbar">
          {mode === "view" && activeNode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex -space-x-4 shrink-0">
                  {activeNode.assignee.split(",").map((nameStr, i) => {
                    const details = getAssigneeDetails(nameStr);
                    const isUnassigned =
                      nameStr.trim() === "Unassigned" || nameStr.trim() === "";

                    return (
                      <div
                        key={i}
                        title={details.name}
                        className={`w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center font-black text-2xl shadow-sm relative z-10 overflow-hidden ${isUnassigned ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"}`}
                      >
                        {details.image ? (
                          <img
                            src={details.image}
                            alt={details.name}
                            className="w-full h-full object-cover"
                          />
                        ) : isUnassigned ? (
                          "?"
                        ) : (
                          details.initials
                        )}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight mb-1">
                    {activeNode.assignee || "Unassigned"}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-bold">
                    {activeNode.label}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Core Responsibilities
                </h4>
                <div className="bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-700 rounded-2xl whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed shadow-sm">
                  {activeNode.description ||
                    "No specific responsibilities detailed yet."}
                </div>
              </div>

              {/* DYNAMIC SUBORDINATE ROSTER */}
              {activeSubordinates.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Reporting Role ({activeSubordinates.length})
                  </h4>
                  <div className="space-y-3">
                    {activeSubordinates.map((sub) => {
                      const isSubUnassigned =
                        !sub.assignee ||
                        sub.assignee === "Unassigned" ||
                        sub.assignee.trim() === "";
                      const subDetails = getAssigneeDetails(
                        sub.assignee.split(",")[0],
                      );

                      return (
                        <div
                          key={sub.id}
                          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {subDetails.image ? (
                                <img
                                  src={subDetails.image}
                                  alt={subDetails.name}
                                  className="w-5 h-5 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                              )}
                              <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">
                                {sub.label}
                              </p>
                            </div>
                            <div className="ml-7">
                              {isSubUnassigned ? (
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-md uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                                  Unassigned Slot
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                                  Assigned: {sub.assignee}
                                </span>
                              )}
                            </div>
                          </div>
                          {isMaster && (
                            <div className="flex gap-2 w-full sm:w-auto pl-7 sm:pl-0 mt-2 sm:mt-0">
                              <button
                                onClick={() => {
                                  setMode("edit");
                                  setActiveNode(sub);
                                  setFormData({
                                    label: sub.label,
                                    assignee: sub.assignee,
                                    description: sub.description || "",
                                    parentId: sub.parentId || "none",
                                  });
                                }}
                                className={`flex-1 sm:flex-none text-[10px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm border ${isSubUnassigned ? "bg-purple-600 border-purple-600 hover:bg-purple-700 text-white" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                              >
                                {isSubUnassigned ? "Assign Now" : "Edit Info"}
                              </button>
                              <button
                                onClick={() => {
                                  setMode("view");
                                  setActiveNode(sub);
                                }}
                                className="flex-1 sm:flex-none text-[10px] font-bold px-4 py-2 rounded-xl transition-colors bg-gray-100 border border-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm"
                              >
                                View Role
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isMaster && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setMode("add");
                      setFormData({
                        label: "",
                        assignee: "Unassigned",
                        description: "",
                        parentId: activeNode.id,
                      });
                    }}
                    className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold py-3 rounded-xl transition-colors text-sm border border-emerald-100 dark:border-emerald-900/50"
                  >
                    + Add New Subordinate
                  </button>
                  <button
                    onClick={() => {
                      setMode("edit");
                      setFormData({
                        label: activeNode.label,
                        assignee: activeNode.assignee,
                        description: activeNode.description || "",
                        parentId: activeNode.parentId || "none",
                      });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors text-sm border border-gray-200 dark:border-gray-700"
                  >
                    Edit Setup
                  </button>
                  <button
                    onClick={() => handleDelete(activeNode.id)}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 font-bold py-3 rounded-xl transition-colors text-sm border border-red-100 dark:border-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Assignee Name(s)
                </label>
                <input
                  list="admin-directory"
                  className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Volunteer A (Use commas for shared roles)"
                  value={formData.assignee}
                  onChange={(e) =>
                    setFormData({ ...formData, assignee: e.target.value })
                  }
                />
                <datalist id="admin-directory">
                  {directory.map((user) => (
                    <option key={user.email} value={user.name} />
                  ))}
                  <option value="Unassigned" />
                </datalist>
                <p className="text-[10px] text-gray-500 mt-1">
                  Start typing an Admin&apos;s name to auto-link their profile
                  picture!
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Role Title
                </label>
                <input
                  className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Website Manager"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Reports To
                </label>
                <select
                  value={formData.parentId || "none"}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">
                    -- Co-Leadership Board (Top Level) --
                  </option>
                  {nodes
                    .filter((n) =>
                      mode === "edit" ? n.id !== activeNode?.id : true,
                    )
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.assignee})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Responsibilities
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Key tasks and assignments..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("view")}
                  className="w-1/3 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.assignee || !formData.label}
                  className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors"
                >
                  Save Role
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

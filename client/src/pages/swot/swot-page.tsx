import React, { useState, useMemo } from "react";
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  History,
  Archive,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MoreVertical,
  Calendar,
  Layers,
  X,
  Eye,
} from "lucide-react";
import { AppState, SWOTAnalysis, SWOTItem, SWOTType, SWOTPriority, TOWSStrategy } from "./types";
import { Action } from "./App";
import { InlineEdit } from "./components/InlineEdit";
import { motion, AnimatePresence } from "motion/react";

interface SWOTPageProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentUser: string;
}

interface SWOTCardProps {
  item: SWOTItem;
  currentSWOTId: string;
  currentUser: string;
  dispatch: React.Dispatch<Action>;
}

const SWOTCard: React.FC<SWOTCardProps> = ({ item, currentSWOTId, currentUser, dispatch }) => {
  const getPriorityColor = (priority: SWOTPriority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border-red-100";
      case "Medium":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low":
        return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(item.priority)}`}
          >
            {item.priority}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this item?")) {
                dispatch({
                  type: "DELETE_SWOT_ITEM",
                  swotId: currentSWOTId,
                  itemId: item.id,
                  user: currentUser,
                });
              }
            }}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <InlineEdit
        value={item.title}
        onSave={val =>
          dispatch({
            type: "UPDATE_SWOT_ITEM",
            swotId: currentSWOTId,
            itemId: item.id,
            field: "title",
            value: val,
            user: currentUser,
          })
        }
        className="font-bold text-slate-800 mb-1 block"
      />
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
      {item.evidence && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 italic">
          <Layers size={12} />
          <span className="truncate">{item.evidence}</span>
        </div>
      )}
    </div>
  );
};

export const SWOTPage: React.FC<SWOTPageProps> = ({ state, dispatch, currentUser }) => {
  const [activeTab, setActiveTab] = useState<"matrix" | "history">("matrix");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [expandedQuadrant, setExpandedQuadrant] = useState<SWOTType | null>(null);
  const [newItemType, setNewItemType] = useState<SWOTType>("Strength");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPriority, setNewItemPriority] = useState<SWOTPriority>("Medium");
  const [newItemEvidence, setNewItemEvidence] = useState("");

  const currentSWOT = useMemo(
    () =>
      state.swotAnalyses.find(s => s.year === state.selectedYear && s.status === "Active") ||
      state.swotAnalyses[0],
    [state.swotAnalyses, state.selectedYear]
  );

  const strengths = currentSWOT.items.filter(i => i.type === "Strength");
  const weaknesses = currentSWOT.items.filter(i => i.type === "Weakness");
  const opportunities = currentSWOT.items.filter(i => i.type === "Opportunity");
  const threats = currentSWOT.items.filter(i => i.type === "Threat");

  const handleAddItem = () => {
    if (!newItemTitle) return;
    dispatch({
      type: "ADD_SWOT_ITEM",
      swotId: currentSWOT.id,
      item: {
        type: newItemType,
        title: newItemTitle,
        description: newItemDescription,
        priority: newItemPriority,
        evidence: newItemEvidence,
      },
      user: currentUser,
    });
    setIsAddItemDialogOpen(false);
    setNewItemTitle("");
    setNewItemDescription("");
    setNewItemPriority("Medium");
    setNewItemEvidence("");
  };

  const getPriorityColor = (priority: SWOTPriority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border-red-100";
      case "Medium":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low":
        return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  const Quadrant = ({
    title,
    type,
    items,
    colorClass,
    icon: Icon,
    category,
  }: {
    title: string;
    type: SWOTType;
    items: SWOTItem[];
    colorClass: string;
    icon: any;
    category: "Internal" | "External";
  }) => (
    <div
      onClick={() => setExpandedQuadrant(type)}
      className={`group flex flex-col h-full rounded-2xl border-2 border-dashed ${colorClass} p-6 bg-white/50 cursor-pointer hover:bg-white hover:border-solid transition-all relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${colorClass.replace("border-dashed", "bg-white opacity-100").split(" ")[0]} bg-white`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
              {category}
            </p>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider leading-none">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              setNewItemType(type);
              setIsAddItemDialogOpen(true);
            }}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-4 relative z-10">
        <div className="text-4xl font-black text-slate-900 mb-2">{items.length}</div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Identified Factors
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex -space-x-2 overflow-hidden">
          {items.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
              style={{
                backgroundColor: i === 0 ? "#10b981" : i === 1 ? "#ef4444" : "#3b82f6",
                zIndex: 10 - i,
              }}
            >
              {item.title.charAt(0)}
            </div>
          ))}
          {items.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm">
              +{items.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase group-hover:text-slate-900 transition-colors">
          View Details
          <ArrowRight size={12} />
        </div>
      </div>

      {/* Decorative background icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <Icon size={120} />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SWOT Analysis</h1>
            <p className="text-slate-500 text-sm mt-1">
              Strategic planning tool for internal and external environment analysis.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "matrix" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              History
            </button>
          </div>
          <button
            onClick={() =>
              dispatch({ type: "ARCHIVE_SWOT", swotId: currentSWOT.id, user: currentUser })
            }
            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 rounded-xl transition-all shadow-sm"
            title="Archive Current Analysis"
          >
            <Archive size={20} />
          </button>
        </div>
      </div>

      {activeTab === "matrix" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Quadrant
              title="Strengths"
              type="Strength"
              category="Internal"
              items={strengths}
              colorClass="border-emerald-200 text-emerald-600"
              icon={TrendingUp}
            />
            <Quadrant
              title="Weaknesses"
              type="Weakness"
              category="Internal"
              items={weaknesses}
              colorClass="border-rose-200 text-rose-600"
              icon={AlertCircle}
            />
            <Quadrant
              title="Opportunities"
              type="Opportunity"
              category="External"
              items={opportunities}
              colorClass="border-blue-200 text-blue-600"
              icon={Plus}
            />
            <Quadrant
              title="Threats"
              type="Threat"
              category="External"
              items={threats}
              colorClass="border-amber-200 text-amber-600"
              icon={ShieldAlert}
            />
          </div>

          {/* Legend/Summary */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Internal Analysis
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold">{strengths.length} Strengths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-sm font-bold">{weaknesses.length} Weaknesses</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  External Analysis
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-bold">{opportunities.length} Opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm font-bold">{threats.length} Threats</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Last Review</p>
                <p className="text-sm font-bold">
                  {new Date(currentSWOT.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            SWOT Analysis History
          </h3>
          {state.swotAnalyses.map(swot => (
            <div
              key={swot.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${swot.status === "Active" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-slate-900">
                        Analysis Year {swot.year}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${swot.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                      >
                        {swot.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <Clock size={12} />
                      Created on {new Date(swot.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Items
                      </p>
                      <p className="text-lg font-bold text-slate-700">{swot.items.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Strategies
                      </p>
                      <p className="text-lg font-bold text-slate-700">
                        {swot.towsStrategies.length}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200">
                    <ExternalLink size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Dialog Content ... (rest of the file remains similar) */}

      {/* Expanded Quadrant Detail Modal */}
      <AnimatePresence>
        {expandedQuadrant && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      expandedQuadrant === "Strength"
                        ? "bg-emerald-100 text-emerald-600"
                        : expandedQuadrant === "Weakness"
                          ? "bg-rose-100 text-rose-600"
                          : expandedQuadrant === "Opportunity"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {expandedQuadrant === "Strength" && <TrendingUp size={24} />}
                    {expandedQuadrant === "Weakness" && <AlertCircle size={24} />}
                    {expandedQuadrant === "Opportunity" && <Plus size={24} />}
                    {expandedQuadrant === "Threat" && <ShieldAlert size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{expandedQuadrant}s Detail</h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Review and manage all identified factors for this group.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewItemType(expandedQuadrant);
                      setIsAddItemDialogOpen(true);
                    }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                  >
                    <Plus size={18} />
                    Add Factor
                  </button>
                  <button
                    onClick={() => setExpandedQuadrant(null)}
                    className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors bg-slate-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                  {(expandedQuadrant === "Strength"
                    ? strengths
                    : expandedQuadrant === "Weakness"
                      ? weaknesses
                      : expandedQuadrant === "Opportunity"
                        ? opportunities
                        : threats
                  ).map(item => (
                    <SWOTCard
                      key={item.id}
                      item={item}
                      currentSWOTId={currentSWOT.id}
                      currentUser={currentUser}
                      dispatch={dispatch}
                    />
                  ))}
                  {(expandedQuadrant === "Strength"
                    ? strengths
                    : expandedQuadrant === "Weakness"
                      ? weaknesses
                      : expandedQuadrant === "Opportunity"
                        ? opportunities
                        : threats
                  ).length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Plus size={48} className="mx-auto text-slate-200 mb-4" />
                      <h3 className="text-lg font-bold text-slate-400 tracking-tight">
                        No factors identified yet
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Start by adding a new {expandedQuadrant.toLowerCase()} to your analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Total:{" "}
                  {
                    (expandedQuadrant === "Strength"
                      ? strengths
                      : expandedQuadrant === "Weakness"
                        ? weaknesses
                        : expandedQuadrant === "Opportunity"
                          ? opportunities
                          : threats
                    ).length
                  }{" "}
                  Factors
                </span>
                <button
                  onClick={() => setExpandedQuadrant(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Item Dialog */}
      {isAddItemDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Add {newItemType}</h2>
            <p className="text-slate-500 text-sm mb-6">
              Identify a new factor for the strategic analysis.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Factor Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a concise title..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Provide more details about this factor..."
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  value={newItemDescription}
                  onChange={e => setNewItemDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={newItemPriority}
                    onChange={e => setNewItemPriority(e.target.value as SWOTPriority)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Evidence / Rationale
                  </label>
                  <input
                    type="text"
                    placeholder="Source or reason..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={newItemEvidence}
                    onChange={e => setNewItemEvidence(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsAddItemDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItemTitle}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm disabled:opacity-50 shadow-lg shadow-indigo-200"
                >
                  Add Factor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

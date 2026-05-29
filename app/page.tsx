'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  RotateCw, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  User, 
  ShieldAlert, 
  Database, 
  Network, 
  BookOpen, 
  FileText, 
  Settings as SettingsIcon, 
  ArrowRight, 
  Activity, 
  Layers, 
  ClipboardList, 
  Lock, 
  TrendingUp, 
  Maximize2 
} from 'lucide-react';
import { MISSION_TEMPLATES } from '@/data/missionTemplates';
import { MissionPlan, MissionContext } from '@/domain/mission.types';
import { AuditLogEntry } from '@/domain/audit.types';
import { Task, ApprovalGate } from '@/domain/workflow.types';

export default function MissionOpsDashboard() {
  // State variables
  const [missions, setMissions] = useState<MissionPlan[]>([]);
  const [selectedMission, setSelectedMission] = useState<MissionPlan | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'agents' | 'risks' | 'approvals' | 'briefing' | 'audit'>('overview');
  
  // Creation Form State
  const [objective, setObjective] = useState('');
  const [department, setDepartment] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [teams, setTeams] = useState('');
  const [constraints, setConstraints] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Loading & interactive actions
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBriefing, setIsBriefing] = useState(false);
  const [gateComment, setGateComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  // Helper for resilient fetch requests with retries and exponential backoff
  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3, delayMs = 1000): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return fetchWithRetry(url, options, retries - 1, delayMs * 1.8);
      }
      throw error;
    }
  };

  // Network Fetch Functions
  const fetchMissions = async () => {
    try {
      const res = await fetchWithRetry('/api/missions');
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions);
        // Sync active selection parameters
        if (selectedMission) {
          const synced = data.missions.find((m: any) => m.missionId === selectedMission.missionId);
          if (synced) setSelectedMission(synced);
        }
      }
    } catch (e) {
      console.error('Error fetching missions:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetchWithRetry('/api/settings');
      const data = await res.json();
      if (data.success) {
        setProviders(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchLogs = async (missionId: string) => {
    try {
      const res = await fetchWithRetry(`/api/missions/${missionId}/logs`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMissions();
    fetchSettings();
  }, []);

  // Fetch logs whenever a mission is selected
  useEffect(() => {
    if (selectedMission) {
      fetchLogs(selectedMission.missionId);
    }
  }, [selectedMission]);

  // UI helpers
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4500);
  };

  const applyTemplate = (tpl: typeof MISSION_TEMPLATES[0]) => {
    setObjective(tpl.objective);
    setDepartment(tpl.department);
    setPriority(tpl.priority);
    setTeams(tpl.teams);
    setConstraints(tpl.constraints);
    setDeadline('30');
    triggerNotification(`Applied template: "${tpl.name}"`);
  };

  // Form Submission handles trigger model router compiling
  const handleCompileMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;

    setIsPlanning(true);
    setErrorMessage('');
    
    // Stagger simulated compliance messages to reassure user during load
    const steps = [
      'Strategist Model: Formulating Business NPV metrics...',
      'Architect Engine: Scaffolding workflow milestones...',
      'Compliance Unit: Auditing lease limits and local regulatory codes...',
      'Data Analyst: Linking Salesforce and SAP ERP databases parameters...',
      'Coordinator Agent: Mapping dependencies trees...'
    ];
    
    let stepIdx = 0;
    setPlanningStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setPlanningStep(steps[stepIdx]);
      }
    }, 2000);

    try {
      const context: MissionContext = {
        department,
        deadline: deadline ? `${deadline} Days` : '30 Days',
        priority,
        teams,
        constraints,
        riskTolerance,
      };

      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective, context }),
      });
      const data = await res.json();
      
      clearInterval(interval);

      if (data.success) {
        setMissions(prev => [data.mission, ...prev]);
        setSelectedMission(data.mission);
        setShowCreationForm(false);
        setActiveTab('overview');
        // Clear forms
        setObjective('');
        setDepartment('');
        setDeadline('');
        setTeams('');
        setConstraints('');
        triggerNotification('Operational Strategic Mission Compiled Successfully!');
      } else {
        setErrorMessage(data.error || 'Compilation engine timeout.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err?.message || 'Server timeout error during planning loop.');
    } finally {
      setIsPlanning(false);
    }
  };

  // Simulation step
  const handleSimulateStep = async () => {
    if (!selectedMission || isSimulating) return;

    setIsSimulating(true);
    try {
      const res = await fetch(`/api/missions/${selectedMission.missionId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'Sim-Ops Bot' }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedMission(data.mission);
        setMissions(prev => prev.map(m => m.missionId === data.mission.missionId ? data.mission : m));
        await fetchLogs(selectedMission.missionId);
        triggerNotification('Swarm Execution simulation step completed!');
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Simulation engine fault.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Briefing regeneration
  const handleRegenerateBriefing = async () => {
    if (!selectedMission || isBriefing) return;

    setIsBriefing(true);
    try {
      const res = await fetch(`/api/missions/${selectedMission.missionId}/briefing`, {
        method: 'POST',
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedMission(data.mission);
        setMissions(prev => prev.map(m => m.missionId === data.mission.missionId ? data.mission : m));
        await fetchLogs(selectedMission.missionId);
        triggerNotification('Leadership briefing reconstructed successfully!');
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Briefing extraction error.');
    } finally {
      setIsBriefing(false);
    }
  };

  // Decision gates approval/rejections
  const handleDecideGate = async (gateId: string, action: 'approve' | 'reject') => {
    if (!selectedMission) return;

    try {
      const res = await fetch(`/api/missions/${selectedMission.missionId}/gates/${gateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment: gateComment, userId: 'C-Suite Supervisor' }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedMission(data.mission);
        setMissions(prev => prev.map(m => m.missionId === data.mission.missionId ? data.mission : m));
        await fetchLogs(selectedMission.missionId);
        setGateComment('');
        triggerNotification(`Gate resolved: [${action.toUpperCase()}]`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Change task status manually
  const handleManualTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!selectedMission) return;

    try {
      const res = await fetch(`/api/missions/${selectedMission.missionId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'status', status, userId: 'Admin Direct Control' }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMission(data.mission);
        setMissions(prev => prev.map(m => m.missionId === data.mission.missionId ? data.mission : m));
        await fetchLogs(selectedMission.missionId);
        triggerNotification('Manual priority task status updated.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-black font-sans p-4 md:p-8 flex justify-center items-start selection:bg-yellow-250 selection:text-black">
      <div className="w-full max-w-7xl bg-[#FFFFFF] border-[4px] border-black text-black overflow-hidden flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Top Navigation / System Bar */}
        <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b-[4px] border-black bg-[#4D96FF] gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-black border-2 border-white flex items-center justify-center font-black text-white text-xl font-mono">M</div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">MissionOps AI</h1>
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mt-1">Autonomous Strategy Framework</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            <div className="flex items-center bg-white border-2 border-black px-3 py-1 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
              <span className="w-2.5 h-2.5 bg-green-500 mr-2 rounded-full animate-pulse"></span>
              System: Operational
            </div>
            
            <div className="flex items-center bg-[#FFD93D] border-2 border-[#000000] px-3 py-1 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-black">
              Provider: {selectedMission ? selectedMission.sourceProvider : 'Router Dynamic'}
            </div>
            
            <button 
              onClick={() => { setShowCreationForm(true); setShowSettings(false); }}
              className="bg-black text-white border-2 border-black px-4 py-2 font-bold text-xs uppercase hover:bg-white hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Compile Mission
            </button>
            
            <button 
              onClick={() => { setShowSettings(!showSettings); setShowCreationForm(false); }}
              className={`border-2 border-black p-2 transition-all active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${showSettings ? 'bg-[#FFD93D]' : 'bg-white'}`}
              title="LLM Router Status System"
            >
              <SettingsIcon className="w-4 h-4 stroke-[2.5px] text-black" />
            </button>
          </div>
        </header>

        {/* Floating alert bar */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 border-4 border-black bg-emerald-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 font-bold max-w-md text-center text-black"
            >
              <div className="flex items-center gap-3 font-sans">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-black" />
                <span>{notification}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col lg:flex-row divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-black overflow-hidden bg-white">
        {/* Left Column: System & Mission Sidebar */}
        <aside className="w-full lg:w-[320px] bg-[#F8F9FA] p-6 shrink-0 flex flex-col gap-6 overflow-y-auto font-sans">
          
          {/* Mission Architect Generation Form */}
          {showCreationForm && (
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
              <button 
                onClick={() => setShowCreationForm(false)}
                className="absolute top-4 right-4 border-2 border-black p-1 bg-red-400 hover:bg-red-500 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-mono pb-2 border-b-2 border-black">
                <Layers className="w-5 h-5" />
                Plan Autonomous Mission
              </h2>

              {/* Templates selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Pick Enterprise Blueprint</label>
                <div className="grid grid-cols-1 gap-2">
                  {MISSION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      onClick={() => applyTemplate(tpl)}
                      className="text-left text-xs border-2 border-black p-2 font-bold bg-[#F9F8F6] hover:bg-yellow-100 flex justify-between items-center"
                    >
                      <span>{tpl.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCompileMission} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Business Objective *</label>
                  <textarea
                    required
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="E.g., Reduce enterprise churn by 10% in 90 days..."
                    className="w-full border-2 border-black p-3 text-sm focus:bg-yellow-50 focus:outline-none font-medium h-24 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Target Dept.</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="E.g. Customer Success"
                      className="w-full border-2 border-black p-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Days Deadline</label>
                    <input
                      type="number"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="E.g. 90"
                      className="w-full border-2 border-black p-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white font-bold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Risk Tolerance</label>
                    <select
                      value={riskTolerance}
                      onChange={(e: any) => setRiskTolerance(e.target.value)}
                      className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white font-bold"
                    >
                      <option value="low">Low Security</option>
                      <option value="medium">Medium</option>
                      <option value="high">Strict Compliance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">Available Teams</label>
                  <input
                    type="text"
                    value={teams}
                    onChange={(e) => setTeams(e.target.value)}
                    placeholder="E.g. SRE Platform, CS Squad"
                    className="w-full border-2 border-black p-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider mb-1">SLA Constraints</label>
                  <input
                    type="text"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="E.g. Max discounts 15%"
                    className="w-full border-2 border-black p-2 text-sm focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div className="border-2 border-red-500 bg-red-100 p-3 text-xs text-red-700 font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPlanning}
                  className="border-3 border-black bg-emerald-400 hover:bg-emerald-500 font-extrabold py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                >
                  {isPlanning ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      STAGING PLAN...
                    </>
                  ) : (
                    'COMPILE OPERATIONS'
                  )}
                </button>

                {isPlanning && (
                  <div className="border-2 border-black bg-indigo-50 p-3 rounded-md text-xs font-mono select-none">
                    <p className="font-bold flex items-center gap-2 text-indigo-800">
                      <Activity className="w-4 h-4 animate-pulse text-indigo-500" />
                      <span>{planningStep}</span>
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Active LLM System Metrics (Router Panel) */}
          {showSettings && (
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 border-2 border-black p-1 bg-red-400 hover:bg-red-500 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-mono pb-2 border-b-2 border-black">
                <Database className="w-5 h-5 text-indigo-500" />
                LLM Router Telemetry
              </h2>

              <p className="text-xs font-semibold text-gray-500 mb-4 font-sans">
                Below indicates the prioritized live configuration fallback order for structural json compilation.
              </p>

              {providers ? (
                <div className="flex flex-col gap-3 font-mono">
                  <div className="grid grid-cols-3 text-xs font-bold uppercase pb-1 border-b border-gray-300 text-gray-400">
                    <span>Provider</span>
                    <span>Status</span>
                    <span>Priority</span>
                  </div>
                  {Object.entries(providers.providers).map(([pName, status]: any) => (
                    <div key={pName} className="flex justify-between items-center text-xs p-2 border-2 border-black bg-[#FDFDFD] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold">{pName}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{status.model}</span>
                      </div>
                      <span className={`px-2 py-0.5 font-bold ${pName === 'MockProvider' || (pName === 'Gemini' && process.env.GEMINI_API_KEY) ? 'bg-emerald-200 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                        {pName === 'MockProvider' ? 'ONLINE' : (process.env.GEMINI_API_KEY ? 'ACTIVE' : 'READY')}
                      </span>
                      <span className="font-bold border border-black px-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-yellow-200">{status.priority}</span>
                    </div>
                  ))}

                  <div className="mt-4 pt-3 border-t-2 border-black text-xs font-sans font-semibold">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Max retries limit:</span>
                      <span className="font-bold">{providers.config.maxRetries}</span>
                    </p>
                    <p className="flex justify-between mt-1">
                      <span className="text-gray-500">Client Timeout threshold:</span>
                      <span className="font-bold">{providers.config.timeoutMs}ms</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-gray-400 animate-pulse">Scanning server slots...</p>
              )}
            </div>
          )}

          {/* List panel */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-extrabold mb-4 flex items-center justify-between font-mono pb-2 border-b-2 border-black">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Operational Missions
              </span>
              <span className="text-xs bg-black text-white px-2 py-1 select-none font-bold">{missions.length} active</span>
            </h2>

            {missions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-500">No structured missions found.</p>
                <p className="text-xs text-gray-400 mt-1">Staging objective compilation above to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {missions.map((mission) => {
                  const isCurSelected = selectedMission?.missionId === mission.missionId;
                  const total = mission.milestones.flatMap(m => m.tasks).length;
                  const completed = mission.milestones.flatMap(m => m.tasks).filter(t => t.status === 'done').length;
                  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <button
                      key={mission.missionId}
                      onClick={() => { setSelectedMission(mission); setActiveTab('overview'); }}
                      className={`text-left border-3 border-black p-4 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex flex-col gap-2 relative ${isCurSelected ? 'bg-yellow-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-[#FAFAFA]'}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-gray-400">
                          {mission.missionId}
                        </span>
                        
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border border-black ${mission.status === 'active' ? 'bg-emerald-300' : 'bg-yellow-300'}`}>
                          {mission.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-extrabold tracking-tight text-md leading-tight text-gray-900 pr-1">
                        {mission.title}
                      </h3>

                      <div className="w-full bg-gray-200 h-2 border border-black mt-1">
                        <div className="bg-emerald-400 h-full transition-all" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-medium text-gray-500 font-mono mt-1">
                        <span>Cleared {completed}/{total} steps</span>
                        <span className={`px-2 py-0.5 border border-black ${mission.isDemoFallback ? 'bg-[#ffeedd]' : 'bg-indigo-100'}`}>
                          {mission.sourceProvider}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </aside>

        {/* Right Column: Central Workstation Viewport */}
        <section className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
          {selectedMission ? (
            <div className="flex flex-col gap-6">
              
              {/* Active Mission Metadata Heading Banner */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-indigo-50 border-l-2 border-b-2 border-black flex gap-3 text-xs select-none">
                  <div className="font-mono flex items-center gap-1.5 font-bold">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Engine:</span>
                    <span className="bg-indigo-200 px-2 py-0.5 text-indigo-800 border border-black rounded">{selectedMission.sourceProvider}</span>
                  </div>
                  {selectedMission.isDemoFallback && (
                    <div className="flex items-center gap-1 bg-orange-100 text-orange-850 px-2.5 py-1 border border-orange-350 rounded font-bold">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>FALLBACK MODE</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
                  <span className={`border border-black px-2.5 py-0.5 text-xs font-bold uppercase rounded ${selectedMission.priority === 'critical' ? 'bg-red-400 text-black' : 'bg-orange-300 text-black'}`}>
                    {selectedMission.priority} Priority
                  </span>
                  <span className="border border-black px-2.5 py-0.5 text-xs font-mono font-bold bg-[#EFEBFA]">
                    Confidence: {Math.round(selectedMission.confidenceScore! * 100)}%
                  </span>
                  <span className="border border-black px-2.5 py-0.5 text-xs font-mono font-bold bg-[#FAF2EF]">
                    Risk Assessment: {selectedMission.riskLevel?.toUpperCase()}
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-2">
                  {selectedMission.title}
                </h2>

                <p className="mt-3 font-semibold text-gray-700 bg-[#F9F8F6] border-l-4 border-black p-4 text-sm font-sans italic">
                  Business Objective: &ldquo;{selectedMission.objective}&rdquo;
                </p>

                {/* Operations control panel */}
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-200">
                  <button
                    onClick={handleSimulateStep}
                    disabled={isSimulating || selectedMission.status === 'completed'}
                    className="border-2 border-black bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-bold px-4 py-2 text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
                  >
                    {isSimulating ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-black" />
                    )}
                    Simulate Swarm Action
                  </button>

                  <button
                    onClick={handleRegenerateBriefing}
                    disabled={isBriefing}
                    className="border-2 border-black bg-cyan-300 hover:bg-cyan-400 disabled:bg-gray-100 font-bold px-4 py-2 text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
                  >
                    {isBriefing ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCw className="w-4 h-4" />
                    )}
                    Regenerate Executive Briefing
                  </button>
                </div>
              </div>

              {/* Neo brutalism Tab controller buttons */}
              <div className="flex flex-wrap gap-2 py-1 scrollbar-hide select-none">
                {[
                  { id: 'overview', label: 'Briefing & KPI', icon: ClipboardList },
                  { id: 'workflow', label: 'Workflows', icon: Layers },
                  { id: 'agents', label: 'Agent Swarm', icon: Network },
                  { id: 'risks', label: 'Compliance & Risks', icon: ShieldAlert },
                  { id: 'approvals', label: 'Approval Gates', icon: Lock },
                  { id: 'audit', label: 'Security Logs', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`border-3 border-black font-extrabold px-4 py-2.5 text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center gap-2 ${isActive ? 'bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TABS CONTAINER MAIN BODY */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[350px]">
                
                {/* 1. STATEFUL OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6 font-sans">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black mb-3">Mission Strategy Overview</h3>
                      <p className="font-semibold text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 border border-gray-300">
                        {selectedMission.summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black mb-3">Strategic Business Rationale</h3>
                      <p className="font-semibold text-gray-700 leading-relaxed text-sm bg-[#FAF8EF] p-4 border border-gray-300">
                        {selectedMission.businessRationale}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black mb-3">Enterprise Key Performance Indicators (KPIs)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedMission.kpis?.map((kpi, idx) => (
                          <div key={idx} className="border-2 border-black p-4 bg-emerald-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">KPI Threshold #{idx + 1}</span>
                            <span className="font-extrabold text-sm text-gray-900 leading-snug">{kpi.name}</span>
                            <div className="flex justify-between items-center mt-3 text-xs pt-2 border-t border-emerald-200">
                              <span className="font-bold text-gray-500">Target Value:</span>
                              <span className="font-extrabold bg-emerald-200 px-2 py-0.5 border border-emerald-400">{kpi.target}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-gray-400 font-mono mt-1">Audit Tool: {kpi.measurementMethod}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. STATEFUL WORKFLOW & TASK BOARD TAB */}
                {activeTab === 'workflow' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center pb-1 border-b-2 border-black">
                      <h3 className="text-lg font-bold uppercase tracking-wider">Milestones & Technical Deliverables</h3>
                      <span className="text-xs font-bold font-mono text-gray-500">Timeline Seq ({selectedMission.status.toUpperCase()})</span>
                    </div>

                    <div className="flex flex-col gap-6 text-sm">
                      {selectedMission.milestones?.map((ms, idx) => (
                        <div key={ms.id} className="border-3 border-black p-5 bg-[#FBFBFA] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                          <span className="absolute -top-3.5 left-4 border-2 border-black px-2.5 py-0.5 bg-yellow-200 font-mono text-xs font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            0{idx + 1}. Milestone: {ms.title}
                          </span>

                          <p className="font-semibold text-gray-700 mb-4 mt-1 font-sans">{ms.description}</p>
                          
                          <div className="font-mono text-[10px] bg-gray-50 text-gray-500 p-2 border-b-2 border-dashed border-gray-300 flex justify-between items-center mb-4 leading-none">
                            <span>Primary owner: <strong className="text-gray-800">{ms.ownerRole}</strong></span>
                            <span>Target SLA: <strong className="text-gray-800">{ms.dueInDays} Days</strong></span>
                          </div>

                          <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Task Allocations</h4>
                            {ms.tasks?.map((tsk) => {
                              return (
                                <div key={tsk.id} className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] font-bold border border-gray-350 px-1 bg-gray-100">{tsk.id}</span>
                                      <span className="text-xs font-extrabold text-gray-900">{tsk.title}</span>
                                      {tsk.requiresApproval && (
                                        <span className="text-[8px] font-bold bg-amber-100 text-amber-800 px-1.5 border border-amber-300 inline-flex items-center gap-0.5 select-none rounded">
                                          <Lock className="w-2.5 h-2.5" /> SECURE GATE
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 mt-1">{tsk.description}</p>
                                    
                                    {/* Task metrics */}
                                    <div className="flex-wrap flex gap-3 text-[9px] font-semibold text-gray-400 font-mono mt-2 pt-1 border-t border-gray-100">
                                      <span>Execution Role: <strong className="text-gray-600">{tsk.ownerRole}</strong></span>
                                      <span>Estimated Hour-slabs: <strong className="text-gray-600">{tsk.estimatedHours} Hrs</strong></span>
                                      {tsk.dependencies.length > 0 && (
                                        <span>Depends-on: <strong className="text-gray-605 text-indigo-700">[{tsk.dependencies.join(', ')}]</strong></span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Status shifts controls representing human-overrides */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border border-black select-none ${tsk.status === 'done' ? 'bg-emerald-300' : tsk.status === 'in_progress' ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                      {tsk.status}
                                    </span>
                                    
                                    {/* Interactive manual override dropdown representing Direct Human Supervisor overrides */}
                                    <select
                                      value={tsk.status}
                                      onChange={(e) => handleManualTaskStatus(tsk.id, e.target.value as any)}
                                      className="border-2 border-black p-1 text-xs focus:outline-none bg-white font-extrabold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                    >
                                      <option value="todo">Staged</option>
                                      <option value="in_progress">Run Dev</option>
                                      <option value="pending_approval">Pending Gate</option>
                                      <option value="blocked">Halt/Block</option>
                                      <option value="done">Sign Complete</option>
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MULTI-AGENT SWARM IN-ACTION TELEMETRY TAB */}
                {activeTab === 'agents' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black">Autonomous Co-Pilot Robot Fleet</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMission.agents?.map((agent) => (
                        <div key={agent.id} className="border-3 border-black p-4 bg-[#FDFCFA] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                          <div className="flex justify-between items-start gap-1 pb-2 border-b border-gray-200 mb-3">
                            <div>
                              <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 leading-snug">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${agent.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
                                {agent.name}
                              </h4>
                              <span className="text-[10px] font-bold uppercase text-gray-400 font-mono tracking-widest">{agent.role}</span>
                            </div>
                            
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border border-black ${agent.status === 'active' ? 'bg-emerald-200' : 'bg-gray-100'}`}>
                              {agent.status || 'idle'}
                            </span>
                          </div>

                          <div className="text-xs mb-3">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responsibilities</span>
                            <ul className="list-disc list-inside space-y-0.5 font-medium text-gray-700">
                              {agent.responsibilities.map((resIdx, i) => <li key={i}>{resIdx}</li>)}
                            </ul>
                          </div>

                          <div className="font-mono text-[10px] bg-gray-50 border p-2 text-gray-500 rounded flex justify-between gap-1 items-start">
                            <span className="font-extrabold uppercase flex-shrink-0 text-[#a0a0a0]">action log:</span>
                            <span className="font-semibold text-gray-600 line-clamp-2 italic">
                              &ldquo;{agent.lastAction || 'Standby for next priority queued deployment.'}&rdquo;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. STRATEGIC COMPLIANCE & RISK REGISTER TAB */}
                {activeTab === 'risks' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black">Integrated Enterprise Risk Assessment</h3>
                    
                    <div className="flex flex-col gap-4 text-sm font-sans">
                      {selectedMission.risks?.map((risk) => (
                        <div key={risk.id} className="border-3 border-black p-5 bg-[#FAFAFA] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1 border border-black bg-red-400 rounded text-[9px] font-bold select-none font-mono">RISK</span>
                              <h4 className="font-extrabold text-[#111]">{risk.title}</h4>
                            </div>
                            
                            <div className="flex gap-2 text-[10px] uppercase font-bold font-mono">
                              <span className={`px-2 py-0.5 border border-black ${risk.severity === 'critical' ? 'bg-red-400 text-black' : risk.severity === 'high' ? 'bg-orange-300 text-black' : 'bg-yellow-250 text-black'}`}>
                                Severity: {risk.severity}
                              </span>
                              <span className="px-2 py-0.5 border border-black bg-gray-100">
                                Likelihood: {risk.likelihood}
                              </span>
                            </div>
                          </div>

                          <p className="font-semibold text-gray-600 pl-4 border-l-2 border-orange-400 italic mb-4">{risk.description}</p>
                          
                          <div className="border border-emerald-350 bg-emerald-50 p-3 flex gap-2 items-start text-xs font-medium">
                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                              <strong className="block text-emerald-800 font-extrabold uppercase text-[9px] tracking-wider">Mitigation Code-Directive</strong>
                              <span className="text-gray-700 mt-1 block">{risk.mitigation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. STATEFUL EXECUTIVE APPROVAL GATES TAB */}
                {activeTab === 'approvals' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold uppercase tracking-wider pb-1 border-b-2 border-black">Security Gatehouse & Executive Approvals</h3>
                    
                    <p className="text-xs font-semibold text-gray-500 font-sans leading-relaxed mb-2">
                      Certain operational task phases are physically barred behind multi-signature Human Gate authorizations. If skipped, these generate cascading compliance failures or security violations.
                    </p>

                    <div className="flex flex-col gap-5 text-sm font-sans">
                      {selectedMission.approvalGates?.map((gate) => {
                        const isPending = gate.status === 'pending';
                        return (
                          <div key={gate.id} className="border-3 border-black p-5 bg-[#FAFAFA] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <span className={`absolute top-0 right-0 border-l border-b border-black font-mono text-[9px] font-extrabold px-3 py-1 uppercase ${gate.status === 'approved' ? 'bg-emerald-300 text-black' : 'bg-amber-300 text-black'}`}>
                              GATE {gate.status}
                            </span>

                            <h4 className="font-extrabold text-gray-900 flex items-center gap-1.5 mb-2 select-none pr-20 leading-snug">
                              <Lock className="w-4 h-4 text-orange-500" />
                              {gate.title}
                            </h4>

                            <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-gray-500 font-mono mb-4 py-2 border-y border-gray-200">
                              <p>Authorizer Domain: <strong className="text-gray-800">{gate.approverRole}</strong></p>
                              <p>Target Phase Block: <strong className="text-gray-800">Before milestone [{gate.requiredBefore}]</strong></p>
                            </div>

                            <p className="text-xs font-medium text-red-700 bg-red-100 p-3 border border-red-200 rounded mb-4">
                              <strong>Operational Risk if Skipped:</strong> {gate.riskIfSkipped}
                            </p>

                            {isPending ? (
                              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                                <label className="block text-xs font-extrabold uppercase text-gray-500">Sign-off directive comment / instructions</label>
                                <input
                                  type="text"
                                  placeholder="E.g. Approved. Proceed with East Java deployment lease limits."
                                  value={gateComment}
                                  onChange={(e) => setGateComment(e.target.value)}
                                  className="border-2 border-black p-2.5 text-xs focus:outline-none focus:bg-yellow-50 font-medium"
                                />
                                
                                <div className="flex gap-3 mt-2">
                                  <button
                                    onClick={() => handleDecideGate(gate.id, 'approve')}
                                    className="border-2 border-black bg-emerald-400 hover:bg-emerald-500 font-extrabold px-4 py-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Authorize Sign-off
                                  </button>
                                  <button
                                    onClick={() => handleDecideGate(gate.id, 'reject')}
                                    className="border-2 border-black bg-red-300 hover:bg-red-400 font-extrabold px-4 py-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1"
                                  >
                                    <X className="w-4 h-4 cursor-pointer" />
                                    Deny Gate
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#FAF2EF] border border-gray-300 p-4 text-xs font-medium text-gray-600 rounded">
                                <p className="mb-1"><strong>Status:</strong> Approved & Signed-off digitally.</p>
                                <p className="mb-1"><strong>Authorizer:</strong> Executive Proxy (Chief Auditor Node)</p>
                                <p className="mb-1"><strong>Decided at:</strong> {gate.decidedAt ? new Date(gate.decidedAt).toLocaleString() : 'N/A'}</p>
                                {gate.comment && <p className="mt-2 border-t border-gray-200 pt-2 font-mono italic">Comment: &ldquo;{gate.comment}&rdquo;</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. REAL-TIME AI BRIEFINGS RECONSTRUCTIONS TAB */}
                {activeTab === 'briefing' && (
                  <div className="flex flex-col gap-6 font-sans">
                    <div className="flex justify-between items-center pb-1 border-b-2 border-black">
                      <h3 className="text-lg font-bold uppercase tracking-wider">C-Suite Executive BRIEF</h3>
                      <span className="text-xs font-mono font-bold bg-[#EFEBFA] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        Synthesized {selectedMission.executiveBriefing ? 'ACTIVE' : 'STAGED'}
                      </span>
                    </div>

                    {selectedMission.executiveBriefing ? (
                      <div className="flex flex-col gap-5">
                        <div className="border-3 border-black p-5 bg-gradient-to-r from-yellow-100 to-indigo-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
                          <Maximize2 className="w-8 h-8 text-indigo-500 flex-shrink-0 mt-1 border border-black p-1.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                          <div>
                            <span className="text-[9px] font-bold tracking-widest text-indigo-800 uppercase block mb-1">Headline Synthesis</span>
                            <h4 className="text-xl font-extrabold text-gray-900 leading-snug">{selectedMission.executiveBriefing.headline}</h4>
                          </div>
                        </div>

                        <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider mb-2">Posture Status Dialogue</span>
                          <p className="font-semibold text-gray-700 leading-relaxed text-sm bg-gray-50 border p-3">
                            {selectedMission.executiveBriefing.currentStatus}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border-2 border-black p-4 bg-[#FAF2EF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider mb-2 block">Critical Risk Concerns</span>
                            <ul className="list-disc list-inside text-xs font-medium text-gray-750 flex flex-col gap-1.5">
                              {selectedMission.executiveBriefing.topRisks?.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>

                          <div className="border-2 border-black p-4 bg-indigo-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-[10px] font-bold uppercase text-indigo-800 tracking-wider mb-2 block">Immediate Strategic Choices</span>
                            <ul className="list-disc list-inside text-xs font-medium text-gray-750 flex flex-col gap-1.5">
                              {selectedMission.executiveBriefing.nextDecisions?.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div className="border-3 border-black p-5 bg-emerald-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block mb-2.5">Recommended Co-Pilot Directives</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium text-gray-900">
                            {selectedMission.executiveBriefing.recommendedActions?.map((act, i) => (
                              <div key={i} className="border-2 border-emerald-300 bg-white p-3 flex gap-2 items-start shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <span className="font-bold border border-black inline-flex justify-center items-center w-5 h-5 bg-yellow-200 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px]">{i + 1}</span>
                                <span className="flex-1 mt-0.5">{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 font-semibold italic animate-pulse">Requesting leadership metrics compilations...</p>
                    )}
                  </div>
                )}

                {/* 7. DETAILED SYSTEM AUDIT LOG TAB */}
                {activeTab === 'audit' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center pb-1 border-b-2 border-black">
                      <h3 className="text-lg font-bold uppercase tracking-wider">Dynamic Security Transaction Indexes</h3>
                      <span className="text-xs font-bold font-mono text-gray-500">Live feed ({logs.length} events logged)</span>
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-xs">
                      {logs.length === 0 ? (
                        <p className="font-semibold text-gray-400 animate-pulse">Retrieving transactional audits from BigQuery Adapter slots...</p>
                      ) : (
                        logs.map((log) => {
                          const dateStr = new Date(log.timestamp).toLocaleTimeString();
                          return (
                            <div key={log.id} className="border-2 border-black bg-[#FDFDFD] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between gap-2 overflow-hidden items-start md:items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] bg-black text-white px-1.5 uppercase font-bold select-none">{log.eventType.replace('_', ' ')}</span>
                                  <span className="text-[10px] text-gray-405 font-bold text-indigo-700">[{log.id}]</span>
                                  <span className="text-[10px] text-gray-450 font-bold">UID: {log.userId}</span>
                                </div>
                                <p className="font-medium text-gray-800 mt-1">{log.message}</p>
                              </div>
                              
                              <div className="text-[10px] text-gray-400 text-right flex-shrink-0 select-none flex flex-col items-end">
                                <span>UTC {dateStr}</span>
                                {log.providerName && (
                                  <span className="text-[9px] bg-indigo-150 border px-1 border-indigo-250 text-indigo-700 font-bold mt-0.5 rounded">{log.providerName}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[450px] flex flex-col justify-center items-center">
              <Network className="w-16 h-16 text-emerald-400 mb-4 animate-bounce border-2 border-black p-3 bg-[#EFEBFA] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
              <h2 className="text-3xl font-extrabold font-mono tracking-tight text-[#111]">Tactical Operations Unstaged </h2>
              <p className="text-gray-500 font-semibold max-w-md mt-2 text-md leading-relaxed">
                Choose an existing operational mission index from the left panel, or plan a brand new autonomous mission immediately.
              </p>
              
              <button
                onClick={() => { setShowCreationForm(true); setShowSettings(false); }}
                className="mt-6 border-3 border-black bg-yellow-300 hover:bg-yellow-450 font-extrabold px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
              >
                COMPILE NEW MISSION BLUEPRINT
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  </div>
);
}

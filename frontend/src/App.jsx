import React, { useState, useCallback } from 'react';
import { Upload, Plane, AlertTriangle, BarChart3, MapPin, Clock, Users, Package, ChevronDown, ChevronUp, Loader2, FileJson, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

// ============================================
// CONFIGURATION - UPDATE THIS URL
// ============================================
// Change this to your actual Flask backend URL
// When running locally: 'http://localhost:5000'
// When deployed: your deployed server URL
const API_BASE_URL = 'http://localhost:5000';

export default function NavCanadaAnalyzer() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('summary');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
    } else {
      setError('Please upload a valid JSON file');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setResults(null);
    setError(null);
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Send to backend for processing
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flights: jsonData }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed. Please check your backend server.');
      }
      
      const analysisResults = await response.json();
      setResults(analysisResults);
      setExpandedSection('summary');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError(`Cannot connect to backend server at ${API_BASE_URL}. Make sure Flask is running.`);
      } else {
        setError(err.message || 'Failed to process file');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SEVERITY_COLORS = {
    '<1NM': '#ef4444',
    '1-3NM': '#f97316',
    '3-5NM': '#eab308'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, #0f172a 0%, #020617 100%)
      `
    }}>
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-cyan-400 to-violet-500 p-3 rounded-xl">
                <Plane className="w-8 h-8 text-slate-950" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                NAV CANADA ANALYZER
              </h1>
              <p className="text-sm text-slate-500 tracking-widest uppercase">
                Flight Conflict Detection System
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Upload Section */}
        <section className="mb-10">
          <div 
            className={`
              relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragOver 
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' 
                : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
              }
              ${file ? 'border-solid border-violet-500/50 bg-violet-500/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-violet-500/30 rounded-br-2xl" />
            
            <div className="relative p-10 text-center">
              {!file ? (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-6">
                    <FileJson className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Flight Data</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Drag and drop your JSON file here, or click to browse.
                    <br />
                    <span className="text-xs text-slate-600">Supports Nav Canada flight data format</span>
                  </p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                    <Upload className="w-5 h-5" />
                    Select JSON File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <FileJson className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-200">{fileName}</p>
                      <p className="text-sm text-slate-500">Ready to analyze</p>
                    </div>
                    <button
                      onClick={clearFile}
                      className="ml-4 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <button
                    onClick={processFile}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-6 h-6" />
                        Run Analysis
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <section>
              <button
                onClick={() => toggleSection('summary')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-semibold text-lg">Summary Overview</span>
                </div>
                {expandedSection === 'summary' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSection === 'summary' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
                  <StatCard
                    icon={<Plane className="w-6 h-6" />}
                    label="Total Flights"
                    value={results.summary?.total_flights || 0}
                    color="cyan"
                  />
                  <StatCard
                    icon={<AlertTriangle className="w-6 h-6" />}
                    label="Conflicts Detected"
                    value={results.summary?.total_conflicts || 0}
                    color="red"
                  />
                  <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Total Passengers"
                    value={(results.summary?.total_passengers || 0).toLocaleString()}
                    color="violet"
                  />
                  <StatCard
                    icon={<Package className="w-6 h-6" />}
                    label="total hotspots"
                    value={results.summary?.total_hotspots || 0}
                    color="amber"
                  />
                </div>
              )}
            </section>

            {/* Conflicts by Hour Chart */}
            {results.charts?.conflicts_by_hour && (
              <section>
                <button
                  onClick={() => toggleSection('hourly')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className="font-semibold text-lg">Conflicts by Hour</span>
                  </div>
                  {expandedSection === 'hourly' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'hourly' && (
                  <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 animate-in slide-in-from-top-4 duration-300">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={results.charts.conflicts_by_hour}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#f1f5f9'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                          activeDot={{ r: 8, fill: '#8b5cf6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            )}

            {/* Severity Distribution */}
            {results.charts?.severity_distribution && (
              <section>
                <button
                  onClick={() => toggleSection('severity')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-semibold text-lg">Conflict Severity Distribution</span>
                  </div>
                  {expandedSection === 'severity' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'severity' && (
                  <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      <ResponsiveContainer width={300} height={300}>
                        <PieChart>
                          <Pie
                            data={results.charts.severity_distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {results.charts.severity_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#6366f1'} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {results.charts.severity_distribution.map((item) => (
                          <div key={item.name} className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: SEVERITY_COLORS[item.name] || '#6366f1' }}
                            />
                            <span className="text-slate-400">{item.name}:</span>
                            <span className="font-semibold">{item.value} conflicts</span>
                            <span className="text-slate-500">
                              ({((item.value / results.summary.total_conflicts) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Top Aircraft by Conflicts */}
            {results.charts?.top_aircraft && (
              <section>
                <button
                  onClick={() => toggleSection('aircraft')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="font-semibold text-lg">Top Aircraft by Conflict Involvement</span>
                  </div>
                  {expandedSection === 'aircraft' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'aircraft' && (
                  <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 animate-in slide-in-from-top-4 duration-300">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={results.charts.top_aircraft} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis dataKey="acid" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#f1f5f9'
                          }}
                        />
                        <Bar dataKey="conflicts" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            )}

            {/* Hotspots Table */}
            {results.tables?.hotspots && results.tables.hotspots.length > 0 && (
              <section>
                <button
                  onClick={() => toggleSection('hotspots')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <span className="font-semibold text-lg">Traffic Hotspots</span>
                  </div>
                  {expandedSection === 'hotspots' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'hotspots' && (
                  <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Entity ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Traffic Density</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Pressure Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {results.tables.hotspots.slice(0, 15).map((spot, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  spot.entity_type === 'airport' 
                                    ? 'bg-cyan-500/20 text-cyan-400' 
                                    : 'bg-violet-500/20 text-violet-400'
                                }`}>
                                  {spot.entity_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-sm">{spot.entity_id}</td>
                              <td className="px-6 py-4">{spot.traffic_density}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                                      style={{ width: `${(spot.pressure * 100).toFixed(0)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-slate-400">{(spot.pressure * 100).toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Flight Schedule Table */}
            {results.tables?.flights && results.tables.flights.length > 0 && (
              <section>
                <button
                  onClick={() => toggleSection('flights')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="font-semibold text-lg">Flight Schedule</span>
                    <span className="text-sm text-slate-500">({results.tables.flights.length} flights)</span>
                  </div>
                  {expandedSection === 'flights' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'flights' && (
                  <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full">
                        <thead className="bg-slate-800/50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">ACID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">DEP</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">ARR</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Alt (ft)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Speed (kts)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">PAX</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {results.tables.flights.slice(0, 50).map((flight, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-sm text-cyan-400">{flight.acid}</td>
                              <td className="px-4 py-3 text-sm">{flight.departure}</td>
                              <td className="px-4 py-3 text-sm">{flight.arrival}</td>
                              <td className="px-4 py-3 text-sm">{flight.altitude?.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">{flight.speed}</td>
                              <td className="px-4 py-3 text-sm">{flight.passengers}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  flight.is_cargo 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {flight.is_cargo ? 'Cargo' : 'Passenger'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Resolution Actions */}
            {results.tables?.actions && results.tables.actions.length > 0 && (
              <section>
                <button
                  onClick={() => toggleSection('actions')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="font-semibold text-lg">Resolution Actions</span>
                    <span className="text-sm text-slate-500">({results.tables.actions.length} actions taken)</span>
                  </div>
                  {expandedSection === 'actions' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSection === 'actions' && (
                  <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full">
                        <thead className="bg-slate-800/50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Iteration</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Aircraft</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {results.tables.actions.map((action, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 text-sm text-slate-500">#{action.iter}</td>
                              <td className="px-4 py-3 font-mono text-sm text-cyan-400">{action.acid}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  action.action === 'delay' 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : action.action === 'altitude_change'
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {action.action}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-400">
                                {action.action === 'delay' && action.delay_min && (
                                  <span>Delayed by {action.delay_min.toFixed(1)} minutes</span>
                                )}
                                {action.action === 'altitude_change' && (
                                  <span>{action.from_alt}ft → {action.to_alt}ft</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && !isProcessing && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-800/50 border border-slate-700 mb-6">
              <BarChart3 className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Analysis Results Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Upload a JSON file containing flight data to run conflict detection analysis.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          Nav Canada Flight Conflict Analysis System • Powered by Advanced Algorithms
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
      <div className={`mb-4 ${colorClasses[color].split(' ').pop()}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
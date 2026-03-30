import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import AppLoader from './AppLoader';

export default function DataExplorer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLogs, setEditedLogs] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
      setEditedLogs(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedLogs = JSON.parse(editedLogs);
      const response = await fetch('/api/update-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedLogs),
      });
      if (!response.ok) throw new Error('Failed to update logs');
      setLogs(parsedLogs);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Invalid JSON format');
    } finally {
      setSaving(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "patient_logs.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface">Data Explorer</h2>
          <p className="text-on-surface-variant text-sm mt-1">View and edit your raw log data.</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-secondary-fixed text-secondary px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit JSON
              </button>
              <button 
                onClick={downloadJSON}
                className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download JSON
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedLogs(JSON.stringify(logs, null, 2)); }}
                className="bg-surface-container-highest text-on-surface px-6 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">{saving ? 'sync' : 'save'}</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <AppLoader />
        </div>
      ) : error ? (
        <div className="bg-error-container/20 p-6 rounded-xl border border-error/20 text-error text-center">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <p className="font-bold">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-highest overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-sm">database</span>
              </div>
              <h3 className="font-bold text-on-surface">Raw patient_logs.json</h3>
            </div>
            <div className="bg-surface-container rounded-xl p-4 overflow-hidden">
              {isEditing ? (
                <textarea
                  value={editedLogs}
                  onChange={(e) => setEditedLogs(e.target.value)}
                  className="w-full h-[500px] bg-transparent text-xs font-mono text-on-surface-variant leading-relaxed outline-none resize-none"
                  spellCheck={false}
                />
              ) : (
                <div className="max-h-[600px] overflow-auto">
                  <pre className="text-xs font-mono text-on-surface-variant leading-relaxed">
                    {JSON.stringify(logs, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary-container/20 p-6 rounded-2xl border border-primary/10">
            <h4 className="font-bold text-on-primary-container mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              About your data
            </h4>
            <p className="text-sm text-on-primary-container/80 leading-relaxed">
              This data is stored on the server in a file named <code className="bg-white/50 px-1 rounded">patient_logs.json</code>. 
              {isEditing ? 'Editing this JSON directly allows you to correct errors or manually add data.' : 'You can edit this data directly by clicking the "Edit JSON" button above.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

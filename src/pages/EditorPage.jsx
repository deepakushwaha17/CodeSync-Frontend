import React, {
  useEffect, useState,
  useCallback, useRef,
} from 'react';
import { useParams, useNavigate }
  from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import {
  getFileById,
  getFileContent,
  updateFileContent,
  getFileTree,
} from '../api/fileApi';
import {
  createSnapshot,
  getFileHistory,
  restoreSnapshot,
  diffSnapshots,
  getBranches,
  tagSnapshot,
  getLatestSnapshot,
  getSnapshotById,
  createBranch,
} from '../api/versionApi';
import {
  submitExecution,
  getJob,
  cancelJob,
} from '../api/executionApi';
import {
  getCommentsByFile,
  addComment,
  updateComment,
  deleteComment,
  resolveComment,
  unresolveComment,
} from '../api/commentApi';
import {
  createSession,
  getActiveSession,
} from '../api/collabApi';

const EXT_LANG = {
  java: 'java', py: 'python',
  js: 'javascript', ts: 'typescript',
  cpp: 'cpp', c: 'c',
  go: 'go', rs: 'rust',
  rb: 'ruby', php: 'php',
  kt: 'kotlin', swift: 'swift',
};

const FILE_ICONS = {
  java: '☕', py: '🐍', js: '🟨', ts: '🔷',
  go: '🐹', rs: '🦀', cpp: '⚙️', c: '⚙️',
  rb: '💎', php: '🐘', kt: '🎯',
};

function getEditorLang(file) {
  if (!file) return 'plaintext';
  const ext =
    file.name?.split('.').pop()?.toLowerCase();
  return EXT_LANG[ext]
    || file.language?.toLowerCase()
    || 'plaintext';
}

function flattenTree(nodes, depth = 0) {
  const items = [];
  for (const n of nodes) {
    items.push({ ...n, depth });
    if (n.fileType === 'FOLDER' && n.children) {
      items.push(
        ...flattenTree(n.children, depth + 1)
      );
    }
  }
  return items;
}

const s = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background:
      'linear-gradient(135deg,#f8fbff,#eef4ff)',
    overflow: 'hidden',
  },

  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },

  sidebar: {
    width: '230px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid #e5eaf5',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  },

  sidebarHdr: {
    padding: '12px 14px',
    borderBottom: '1px solid #e5eaf5',
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  sidebarList: {
    flex: 1,
    overflowY: 'auto',
  },

  sidebarItem: {
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '10px',
    margin: '3px 6px',
    transition: 'all 0.15s ease',
    color: '#4b5563',
  },

  editorArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  toolbar: {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e5eaf5',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 30px rgba(15,23,42,0.04)',
  },

  fileName: {
    fontSize: '13px',
    color: '#111827',
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    flex: 1,
  },

  saveStatus: {
    fontSize: '11px',
    color: '#6b7280',
    marginLeft: '4px',
  },

  tBtn: {
    padding: '7px 13px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#111827',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },

  runBtn: {
    background:
      'linear-gradient(135deg,#2563eb,#4f46e5)',
    border: 'none',
    color: '#ffffff',
    boxShadow:
      '0 10px 20px rgba(37,99,235,0.18)',
  },

  rightPanel: {
    width: '340px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    borderLeft: '1px solid #e5eaf5',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  },

  panelTabs: {
    display: 'flex',
    borderBottom: '1px solid #e5eaf5',
  },

  panelTab: {
    flex: 1,
    padding: '10px 4px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.15s ease',
  },

  panelTabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },

  panelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
  },

  stdinBox: {
    width: '100%',
    padding: '10px 12px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    resize: 'vertical',
    outline: 'none',
    minHeight: '70px',
    marginBottom: '10px',
  },

  outputBox: {
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '10px',
    padding: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    color: '#16a34a',
    minHeight: '110px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
  },

  snapItem: {
    padding: '12px',
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '10px',
    marginBottom: '10px',
    fontSize: '12px',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
  },

  commentItem: {
    padding: '12px',
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '10px',
    marginBottom: '10px',
    fontSize: '12px',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
  },

  panelBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#111827',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '14px',
  },
};

export default function EditorPage() {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [tree, setTree] = useState([]);
  const [panelTab, setPanelTab] = useState('run');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [outputErr, setOutputErr] = useState('');
  const [runStatus, setRunStatus] = useState('');
  const [running, setRunning] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [snapshots, setSnaps] = useState([]);
  const [selectedSnapshots, setSelectedSnapshots] = useState([]);
  const [diffResult, setDiffResult] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [comments, setComments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [fRes, cRes, tRes, sRes, cmRes, bRes] =
          await Promise.all([
            getFileById(fileId),
            getFileContent(fileId),
            getFileTree(projectId),
            getFileHistory(fileId),
            getCommentsByFile(fileId),
            getBranches(projectId),
          ]);

        setFile(fRes.data.data);
        setContent(cRes.data.data || '');
        setTree(tRes.data.data || []);
        setSnaps(sRes.data.data || []);
        setComments(cmRes.data.data || []);
        setBranches(bRes.data.data || []);

        try {
          const latestRes = await getLatestSnapshot(fileId);
          setLatestSnapshot(latestRes.data.data || null);
        } catch (err) {
          if (err.response?.status === 404) {
            setLatestSnapshot(null);
          } else {
            console.error('Latest snapshot error:', err);
          }
        }
      } catch (err) {
        console.error('File load error:', err);
        toast.error('Failed to load file.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fileId, projectId]);

  const handleContentChange = useCallback((val) => {
    setContent(val || '');
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateFileContent(fileId, val || '');
        setSaved(true);
      } catch { /* silent */ }
      finally { setSaving(false); }
    }, 2000);
  }, [fileId]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setOutputErr('');
    setRunStatus('QUEUED');
    try {
      await updateFileContent(fileId, content);
      const res = await submitExecution({
        projectId: Number(projectId),
        fileId: Number(fileId),
        language: getEditorLang(file),
        sourceCode: content,
        stdin: stdin,
        input: stdin
      });
      const jobId = res.data.data.jobId;
      setCurrentJobId(jobId);
      let attempts = 0;

      const poll = async () => {
        const jRes = await getJob(jobId);
        const job = jRes.data.data;
        setRunStatus(job.status);
        const done = [
          'COMPLETED', 'FAILED',
          'TIMED_OUT', 'CANCELLED',
        ].includes(job.status);

        if (done) {
          setOutput(job.stdout || '');
          setOutputErr(job.stderr || '');
          setRunning(false);
          setCurrentJobId(null);
        } else if (attempts < 20) {
          attempts++;
          setTimeout(poll, 1500);
        } else {
          setRunning(false);
        }
      };
      setTimeout(poll, 1500);
    } catch {
      toast.error('Failed to submit.');
      setRunning(false);
    }
  };
  const handleCancelRun = async () => {
    if (!currentJobId) {
      toast.error('No running job to cancel.');
      return;
    }

    try {
      await cancelJob(currentJobId);
      setRunStatus('CANCELLED');
      setRunning(false);
      setCurrentJobId(null);
      toast.success('Execution cancelled!');
    } catch {
      toast.error('Failed to cancel execution.');
    }
  };

  const handleSnapshot = async () => {
    const msg = prompt('Commit message:');
    if (!msg) return;
    try {
      await createSnapshot({
        projectId: Number(projectId),
        fileId: Number(fileId),
        message: msg,
        content,
        branch: 'main',
      });
      toast.success('Snapshot created!');
      const sRes = await getFileHistory(fileId);
      setSnaps(sRes.data.data || []);
    } catch {
      toast.error('Failed to create snapshot.');
    }
  };
  const refreshHistory = async () => {
    const sRes = await getFileHistory(fileId);
    setSnaps(sRes.data.data || []);

    try {
      const latestRes = await getLatestSnapshot(fileId);
      setLatestSnapshot(latestRes.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setLatestSnapshot(null);
      } else {
        console.error('Latest snapshot refresh error:', err);
      }
    }
  };

  const handleRestoreSnapshot = async (snapshotId) => {
    const ok = window.confirm(
      'Restore this snapshot? Current code will be replaced.'
    );

    if (!ok) return;

    try {
      const res = await restoreSnapshot(snapshotId);
      const restored = res.data.data;

      if (restored?.content) {
        setContent(restored.content);
        await updateFileContent(fileId, restored.content);
      } else {
        const cRes = await getFileContent(fileId);
        setContent(cRes.data.data || '');
      }

      await refreshHistory();
      setSaved(true);
      toast.success('Snapshot restored successfully!');
    } catch {
      toast.error('Failed to restore snapshot.');
    }
  };

  const handleSelectSnapshot = (snapshotId) => {
    if (selectedSnapshots.includes(snapshotId)) {
      setSelectedSnapshots(
        selectedSnapshots.filter((id) => id !== snapshotId)
      );
      return;
    }

    if (selectedSnapshots.length >= 2) {
      toast.error('Select only 2 snapshots for comparison.');
      return;
    }

    setSelectedSnapshots([...selectedSnapshots, snapshotId]);
  };

  const handleCompareSnapshots = async () => {
    if (selectedSnapshots.length !== 2) {
      toast.error('Select exactly 2 snapshots.');
      return;
    }

    try {
      const res = await diffSnapshots(
        selectedSnapshots[0],
        selectedSnapshots[1]
      );

      setDiffResult(res.data.data);
      toast.success('Difference loaded!');
    } catch {
      toast.error('Failed to compare snapshots.');
    }
  };

  const handleTagSnapshot = async (snapshotId) => {
    const tag = prompt('Enter tag name, example: v1.0 or stable');
    if (!tag) return;

    try {
      await tagSnapshot(snapshotId, tag);
      await refreshHistory();
      toast.success('Snapshot tagged!');
    } catch {
      toast.error('Failed to tag snapshot.');
    }
  };

  const handleCreateBranch = async () => {
    if (!latestSnapshot?.snapshotId) {
      toast.error('Create a snapshot first.');
      return;
    }

    const branchName = prompt('New branch name:');
    if (!branchName) return;

    try {
      await createBranch({
        projectId: Number(projectId),
        fileId: Number(fileId),
        branchName,
        fromSnapshotId: latestSnapshot.snapshotId,
      });

      const bRes = await getBranches(projectId);
      setBranches(bRes.data.data || []);

      await refreshHistory();
      toast.success('Branch created!');
    } catch {
      toast.error('Failed to create branch.');
    }
  };

  const handleViewSnapshot = async (snapshotId) => {
    try {
      const res = await getSnapshotById(snapshotId);
      const snap = res.data.data;

      alert(
        `Message: ${snap.message}\n` +
        `Branch: ${snap.branch}\n` +
        `Tag: ${snap.tag || 'No tag'}\n` +
        `Created At: ${new Date(snap.createdAt).toLocaleString()}\n\n` +
        `Content:\n${snap.content || 'No content found'}`
      );
    } catch {
      toast.error('Failed to load snapshot.');
    }
  };

  const handleCollab = async () => {
    try {
      let session;
      try {
        const res = await getActiveSession(
          projectId, fileId
        );
        session = res.data.data;
      } catch {
        const res = await createSession({
          projectId: Number(projectId),
          fileId: Number(fileId),
          language: getEditorLang(file),
          maxParticipants: 10,
          isPasswordProtected: false,
        });
        session = res.data.data;
        toast.success('Session started!');
      }
      navigate(`/collab/${session.sessionId}`);
    } catch {
      toast.error('Failed to start session.');
    }
  };

  const handleAddComment = async () => {
    const text = prompt('Comment:');
    if (!text) return;
    try {
      await addComment({
        projectId: Number(projectId),
        fileId: Number(fileId),
        content: text,
        lineNumber: 1,
      });
      toast.success('Comment added!');
      const cmRes = await getCommentsByFile(fileId);
      setComments(cmRes.data.data || []);
    } catch {
      toast.error('Failed to add comment.');
    }
  };

  const refreshComments = async () => {
    const cmRes = await getCommentsByFile(fileId);
    setComments(cmRes.data.data || []);
  };

  const handleEditComment = async (comment) => {
    const text = prompt('Edit comment:', comment.content);
    if (!text || text === comment.content) return;

    try {
      await updateComment(comment.commentId, text);
      await refreshComments();
      toast.success('Comment updated!');
    } catch {
      toast.error('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      await refreshComments();
      toast.success('Comment deleted!');
    } catch {
      toast.error('Failed to delete comment.');
    }
  };

  const handleToggleResolve = async (comment) => {
    try {
      if (comment.resolved) {
        await unresolveComment(comment.commentId);
        toast.success('Comment unresolved!');
      } else {
        await resolveComment(comment.commentId);
        toast.success('Comment resolved!');
      }

      await refreshComments();
    } catch {
      toast.error('Failed to update comment status.');
    }
  };

  if (loading) return (
    <div style={s.page}><Navbar /><Loader /></div>
  );

  const flat = flattenTree(tree);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        {/* File sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarHdr}>Explorer</div>
          <div style={s.sidebarList}>
            {flat.map((node) => {
              const ext =
                node.name?.split('.').pop()
                  ?.toLowerCase();
              const icon = node.fileType === 'FOLDER'
                ? '📁'
                : (FILE_ICONS[ext] || '📄');
              const isActive =
                String(node.fileId) ===
                String(fileId);

              return (
                <div
                  key={node.fileId}
                  style={{
                    ...s.sidebarItem,
                    paddingLeft:
                      `${12 + node.depth * 12}px`,
                    background: isActive
                      ? '#dbeafe' : 'transparent',

                    color: isActive
                      ? '#2563eb' : '#4b5563',
                  }}
                  onClick={() => {
                    if (node.fileType === 'FILE') {
                      navigate(
                        `/editor/${projectId}`
                        + `/${node.fileId}`
                      );
                    }
                  }}
                >
                  <span>{icon}</span>
                  {node.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monaco editor */}
        <div style={s.editorArea}>
          <div style={s.toolbar}>
            <span style={s.fileName}>
              {file?.name || '...'}
            </span>
            <span style={s.saveStatus}>
              {saving ? '💾 Saving…'
                : saved ? '✓ Saved' : '• Unsaved'}
            </span>
            <button
              style={{ ...s.tBtn, ...s.runBtn }}
              onClick={handleRun}
              disabled={running}
            >
              {running ? '⏳ Running…' : '▶ Run'}
            </button>
              {running && (
              <button
                style={{
                  ...s.tBtn,
                  color: '#dc2626',
                  borderColor: '#fecaca',
                  background: '#fef2f2',
                }}
                onClick={handleCancelRun}
              >
                Stop
              </button>
            )}
            <button
              style={s.tBtn}
              onClick={handleSnapshot}
            >
              📸 Snapshot
            </button>
            <button
              style={s.tBtn}
              onClick={handleCollab}
            >
              👥 Collab
            </button>
          </div>

          <Editor
            height="100%"
            language={getEditorLang(file)}
            value={content}
            onChange={handleContentChange}
            theme="vs"
            options={{
              fontSize: 14,
              fontFamily:
                'JetBrains Mono, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              smoothScrolling: true,
              cursorBlinking: 'phase',
              bracketPairColorization:
                { enabled: true },
            }}
          />
        </div>

        {/* Right panel */}
        <div style={s.rightPanel}>
          <div style={s.panelTabs}>
            {[
              { key: 'run', label: '▶ Run' },
              { key: 'history', label: '📸 History' },
              { key: 'comments', label: '💬 Comments' },
            ].map((t) => (
              <button
                key={t.key}
                style={{
                  ...s.panelTab,
                  ...(panelTab === t.key
                    ? s.panelTabActive : {}),
                }}
                onClick={() => setPanelTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={s.panelBody}>

            {/* Run */}
            {panelTab === 'run' && (
              <>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '6px',
                }}>
                  Standard Input
                </div>
                <textarea
                  style={s.stdinBox}
                  placeholder="Program input..."
                  value={stdin}
                  onChange={(e) =>
                    setStdin(e.target.value)
                  }
                />

                {runStatus && (
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color:
                      runStatus === 'COMPLETED'
                        ? '#3fb950'
                        : runStatus === 'FAILED'
                          ? '#f85149'
                          : '#d29922',
                  }}>
                    {runStatus}
                  </div>
                )}

                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '6px',
                }}>
                  Output
                </div>
                <div style={s.outputBox}>
                  {output || (running
                    ? 'Running…'
                    : 'Run your code to see output.'
                  )}
                </div>

                {outputErr && (
                  <div style={{
                    ...s.outputBox,
                    marginTop: '8px',
                    color: '#f85149',
                  }}>
                    {outputErr}
                  </div>
                )}
              </>
            )}

            {/* History */}
            {/* History */}
            {panelTab === 'history' && (
              <>
                <button
                  style={s.panelBtn}
                  onClick={handleSnapshot}
                >
                  📸 Create Snapshot
                </button>
                <button
                style={s.panelBtn}
                onClick={handleCreateBranch}
              >
                🌿 Create Branch
              </button>

                {latestSnapshot && (
                  <div style={s.snapItem}>
                    <div style={{ color: '#2563eb', fontWeight: '700' }}>
                      Latest Snapshot
                    </div>
                    <div style={{ color: '#111827', marginTop: '4px' }}>
                      {latestSnapshot.message}
                    </div>
                    <div style={{ color: '#6b7280', marginTop: '2px' }}>
                      {new Date(latestSnapshot.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}

                <select
                  style={{
                    ...s.stdinBox,
                    minHeight: '40px',
                    marginBottom: '10px',
                  }}
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>

                <button
                  style={s.panelBtn}
                  onClick={handleCompareSnapshots}
                >
                  Compare Selected Snapshots
                </button>

                {diffResult && (
                  <div style={s.snapItem}>
                    <div style={{ color: '#111827', fontWeight: '700' }}>
                      Difference Result
                    </div>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#374151',
                      fontSize: '11px',
                      marginTop: '8px',
                    }}>
                      {JSON.stringify(diffResult, null, 2)}
                    </pre>
                  </div>
                )}

                {snapshots.length === 0 ? (
                  <div style={{
                    color: '#6b7280',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '20px',
                  }}>
                    No snapshots yet.
                  </div>
                ) : snapshots
                  .filter((snap) =>
                    selectedBranch === 'all'
                      ? true
                      : snap.branch === selectedBranch
                  )
                  .map((snap) => (
                    <div
                      key={snap.snapshotId}
                      style={s.snapItem}
                    >
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: '#111827',
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedSnapshots.includes(snap.snapshotId)}
                          onChange={() => handleSelectSnapshot(snap.snapshotId)}
                        />
                        Select for compare
                      </label>

                      <div style={{ color: '#111827', fontWeight: '600' }}>
                        {snap.message}
                      </div>

                      <div style={{
                        color: '#4b5563',
                        marginTop: '2px',
                      }}>
                        Branch: {snap.branch}
                      </div>

                      {snap.tag && (
                        <div style={{
                          color: '#2563eb',
                          marginTop: '2px',
                          fontWeight: '600',
                        }}>
                          Tag: {snap.tag}
                        </div>
                      )}

                      <div style={{
                        color: '#6b7280',
                        marginTop: '2px',
                      }}>
                        {new Date(snap.createdAt).toLocaleString()}
                      </div>

                      <button
                        style={{
                          ...s.panelBtn,
                          marginTop: '10px',
                          marginBottom: '8px',
                          padding: '8px',
                          fontSize: '12px',
                        }}
                        onClick={() => handleRestoreSnapshot(snap.snapshotId)}
                      >
                        Restore
                      </button>

                      <button
                        style={{
                          ...s.panelBtn,
                          marginBottom: '8px',
                          padding: '8px',
                          fontSize: '12px',
                        }}
                        onClick={() => handleTagSnapshot(snap.snapshotId)}
                      >
                        Add Tag
                      </button>

                      <button
                        style={{
                          ...s.panelBtn,
                          marginBottom: 0,
                          padding: '8px',
                          fontSize: '12px',
                        }}
                        onClick={() => handleViewSnapshot(snap.snapshotId)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
              </>
            )}

            {/* Comments */}
            {panelTab === 'comments' && (
              <>
                <button
                  style={s.panelBtn}
                  onClick={handleAddComment}
                >
                  + Add Comment
                </button>
                {comments.length === 0 ? (
                  <div style={{
                    color: '#6b7280',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '20px',
                  }}>
                    No comments yet.
                  </div>
                ) : comments.map((c) => (
                  <div
                    key={c.commentId}
                    style={s.commentItem}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <span style={{  color: '#2563eb', fontWeight: '600' }}>
                        Line {c.lineNumber}
                      </span>
                      {c.resolved && (
                        <span style={{
                          color: '#3fb950',
                          fontSize: '11px',
                        }}>
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#111827' }}>
                      {c.content}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '10px',
                    }}>
                      <button
                        style={{ ...s.tBtn, padding: '6px 9px', fontSize: '11px' }}
                        onClick={() => handleEditComment(c)}
                      >
                        Edit
                      </button>

                      <button
                        style={{ ...s.tBtn, padding: '6px 9px', fontSize: '11px' }}
                        onClick={() => handleToggleResolve(c)}
                      >
                        {c.resolved ? 'Unresolve' : 'Resolve'}
                      </button>

                      <button
                        style={{
                          ...s.tBtn,
                          padding: '6px 9px',
                          fontSize: '11px',
                          color: '#dc2626',
                        }}
                        onClick={() => handleDeleteComment(c.commentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
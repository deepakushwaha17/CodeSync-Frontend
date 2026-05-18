import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }
  from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import {
  getProjectById,
  forkProject,
  starProject,
  getMembers,
  addMember,
  deleteProject,
  updateProject,
  archiveProject,
  removeMember,
} from '../api/projectApi';
import {
  getFileTree,
  createFile,
  createFolder,
  renameFile,
  deleteFile,
} from '../api/fileApi';

const FILE_ICONS = {
  java: '☕', py: '🐍', js: '🟨', ts: '🔷',
  go: '🐹', rs: '🦀', cpp: '⚙️', c: '⚙️',
  rb: '💎', php: '🐘', kt: '🎯', swift: '🍎',
};

function fileIcon(node) {
  const ext =
    node.name?.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || '📄';
}

const s = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg,#f8fbff,#eef4ff)',
  },

  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 20px',
  },

  header: {
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '22px',
    padding: '28px',
    marginBottom: '24px',
    backdropFilter: 'blur(12px)',
    boxShadow:
      '0 18px 40px rgba(15,23,42,0.06)',
  },

  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },

  name: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#2563eb',
    flex: 1,
  },

  visBadge: {
    fontSize: '12px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontWeight: '600',
  },

  desc: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '18px',
    lineHeight: '1.6',
  },

  metaRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },

  meta: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    gap: '5px',
    fontWeight: '500',
  },

  actionsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  btn: {
    padding: '9px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#111827',
    transition: 'all 0.2s ease',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
  },

  primaryBtn: {
    background:
      'linear-gradient(135deg,#2563eb,#4f46e5)',
    border: 'none',
    color: '#fff',
    boxShadow:
      '0 10px 20px rgba(37,99,235,0.20)',
  },

  dangerBtn: {
    background: '#fef2f2',
    borderColor: '#fecaca',
    color: '#dc2626',
  },

  cols: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '18px',
  },

  panel: {
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '20px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    boxShadow:
      '0 16px 36px rgba(15,23,42,0.05)',
  },

  panelHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #e5eaf5',
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconBtn: {
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '5px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },

  fileItem: {
    padding: '10px 16px',
    fontSize: '13px',
    color: '#111827',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #eef2ff',
    transition: 'all 0.15s ease',
  },

  memberItem: {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #eef2ff',
  },

  memberAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg,#2563eb,#7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    boxShadow:
      '0 8px 20px rgba(37,99,235,0.18)',
  },

  addMemberBox: {
    padding: '14px 16px',
    borderBottom: '1px solid #eef2ff',
    display: 'flex',
    gap: '10px',
  },

  addInput: {
    flex: 1,
    padding: '10px 12px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '13px',
    outline: 'none',
  },
};

function FileTree({
  nodes,
  depth = 0,
  onFileClick,
  onRename,
  onDelete,
}) {
  const [open, setOpen] = useState({});

  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.fileId}>
          <div
            style={{
              ...s.fileItem,
              paddingLeft: `${16 + depth * 14}px`,
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eef4ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => {
              if (node.fileType === 'FOLDER') {
                setOpen((o) => ({
                  ...o,
                  [node.fileId]: !o[node.fileId],
                }));
              } else {
                onFileClick(node);
              }
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
            }}>
              <span>
                {node.fileType === 'FOLDER'
                  ? (open[node.fileId] ? '📂' : '📁')
                  : fileIcon(node)}
              </span>
              {node.name}
            </span>

            <span style={{ display: 'flex', gap: '5px' }}>
              <button
                style={s.iconBtn}
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(node);
                }}
              >
                ✏️
              </button>

              <button
                style={s.iconBtn}
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                }}
              >
                🗑
              </button>
            </span>
          </div>

          {node.fileType === 'FOLDER'
            && open[node.fileId]
            && node.children?.length > 0 && (
              <FileTree
                nodes={node.children}
                depth={depth + 1}
                onFileClick={onFileClick}
                onRename={onRename}
                onDelete={onDelete}
              />
            )}
        </React.Fragment>
      ))}
    </>
  );
}

function findFirstFile(nodes) {
  for (const n of nodes) {
    if (n.fileType === 'FILE') return n;
    if (n.children) {
      const f = findFirstFile(n.children);
      if (f) return f;
    }
  }
  return null;
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [project, setPr] = useState(null);
  const [tree, setTree] = useState([]);
  const [members, setMem] = useState([]);
  const [loading, setL] = useState(true);
  const [memberInput, setMemberInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          getProjectById(projectId),
          getFileTree(projectId),
          getMembers(projectId),
        ]);
        setPr(pRes.data.data);
        setTree(tRes.data.data || []);
        setMem(mRes.data.data || []);
      } catch {
        toast.error('Failed to load project.');
      } finally {
        setL(false);
      }
    }
    load();
  }, [projectId]);

  const handleFork = async () => {
    try {
      const res = await forkProject(projectId);
      toast.success('Project forked!');
      navigate(`/projects/${res.data.data.projectId}`);
    } catch {
      toast.error('Fork failed.');
    }
  };

  const handleStar = async () => {
    try {
      await starProject(projectId);
      toast.success('⭐ Starred!');
      setPr((p) => ({
        ...p,
        starCount: (p.starCount || 0) + 1,
      }));
    } catch {
      toast.error('Failed to star.');
    }
  };

  const handleNewFile = async () => {
    const name = prompt('File name (e.g. Main.java):');
    if (!name) return;
    try {
      await createFile({
        projectId: Number(projectId),
        name,
        parentPath: '',
        language: name.split('.').pop(),
        content: '',
      });
      toast.success('File created!');
      const tRes = await getFileTree(projectId);
      setTree(tRes.data.data || []);
    } catch {
      toast.error('Failed to create file.');
    }
  };

  const handleNewFolder = async () => {
    const name = prompt('Folder name:');
    if (!name) return;
    try {
      await createFolder({
        projectId: Number(projectId),
        name,
        parentPath: '',
      });
      toast.success('Folder created!');
      const tRes = await getFileTree(projectId);
      setTree(tRes.data.data || []);
    } catch {
      toast.error('Failed to create folder.');
    }
  };

  const refreshProject = async () => {
    const [pRes, mRes] = await Promise.all([
      getProjectById(projectId),
      getMembers(projectId),
    ]);

    setPr(pRes.data.data);
    setMem(mRes.data.data || []);
  };

  const refreshTree = async () => {
    const tRes = await getFileTree(projectId);
    setTree(tRes.data.data || []);
  };

  const handleRenameFile = async (node) => {
    const newName = prompt('Enter new name:', node.name);
    if (!newName || newName === node.name) return;

    try {
      await renameFile(node.fileId, newName);
      toast.success('Renamed successfully!');
      await refreshTree();
    } catch {
      toast.error('Failed to rename.');
    }
  };

  const handleDeleteFile = async (node) => {
    const ok = window.confirm(
      `Delete ${node.name}?`
    );

    if (!ok) return;

    try {
      await deleteFile(node.fileId);
      toast.success('Deleted successfully!');
      await refreshTree();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(
      'Delete this project? This cannot be undone.'
    )) return;
    try {
      await deleteProject(projectId);
      toast.success('Project deleted.');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleAddMember = async () => {
    if (!memberInput) return;
    try {
      await addMember(projectId, {
        userId: Number(memberInput),
        role: 'EDITOR',
      });
      toast.success('Member added!');
      setMemberInput('');
      setShowAdd(false);
      const mRes = await getMembers(projectId);
      setMem(mRes.data.data || []);
    } catch {
      toast.error('Failed to add member.');
    }
  };
  const handleUpdateProject = async () => {
    const name = prompt('Project name:', project?.name || '');
    if (!name) return;

    const description = prompt(
      'Description:',
      project?.description || ''
    );

    const language = prompt(
      'Language:',
      project?.language || ''
    );

    const visibility = prompt(
      'Visibility PUBLIC or PRIVATE:',
      project?.visibility || 'PRIVATE'
    );

    try {
      const res = await updateProject(projectId, {
        name,
        description,
        language,
        visibility: visibility?.toUpperCase() === 'PUBLIC'
          ? 'PUBLIC'
          : 'PRIVATE',
      });

      setPr(res.data.data);
      toast.success('Project updated!');
    } catch {
      toast.error('Failed to update project.');
    }
  };
  const handleArchiveProject = async () => {
    if (!window.confirm('Archive this project?')) return;

    try {
      await archiveProject(projectId);
      toast.success('Project archived!');
      navigate('/projects');
    } catch {
      toast.error('Failed to archive project.');
    }
  };
  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm(`Remove user #${memberUserId}?`)) return;

    try {
      await removeMember(projectId, memberUserId);
      await refreshProject();
      toast.success('Member removed!');
    } catch {
      toast.error('Failed to remove member.');
    }
  };

  if (loading) return (
    <div style={s.page}><Navbar /><Loader /></div>
  );

  const isOwner =
    project?.ownerId === Number(userId);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.topRow}>
            <div style={s.name}>{project?.name}</div>
            <span style={{
              ...s.visBadge,
              background:
                project?.visibility === 'PUBLIC'
                   ? '#dbeafe' : '#f3f4f6',
              color:
                project?.visibility === 'PUBLIC'
                  ? '#2563eb' : '#4b5563',
            }}>
              {project?.visibility}
            </span>
          </div>

          <div style={s.desc}>
            {project?.description || 'No description.'}
          </div>

          <div style={s.metaRow}>
            {project?.language && (
              <span style={s.meta}>
                {project.language}
              </span>
            )}
            <span style={s.meta}>
              ⭐ {project?.starCount || 0}
            </span>
            <span style={s.meta}>
              🍴 {project?.forkCount || 0}
            </span>
            <span style={s.meta}>
              👥 {members.length} members
            </span>
          </div>

          <div style={s.actionsRow}>
            <button
              style={{ ...s.btn, ...s.primaryBtn }}
              onClick={() => {
                const f = findFirstFile(tree);
                if (f) {
                  navigate(
                    `/editor/${projectId}/${f.fileId}`
                  );
                } else {
                  toast('Create a file first!');
                }
              }}
            >
              💻 Open Editor
            </button>
            <button style={s.btn} onClick={handleStar}>
              ⭐ Star
            </button>
            <button style={s.btn} onClick={handleFork}>
              🍴 Fork
            </button>
            {isOwner && (
            <>
              <button
                style={s.btn}
                onClick={handleUpdateProject}
              >
                ✏️ Edit Project
              </button>

              <button
                style={s.btn}
                onClick={handleArchiveProject}
              >
                📦 Archive
              </button>

              <button
                style={{ ...s.btn, ...s.dangerBtn }}
                onClick={handleDelete}
              >
                🗑 Delete
              </button>
            </>
          )}
          </div>
        </div>

        {/* Columns */}
        <div style={s.cols}>

          {/* File tree */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span>📁 Files</span>
              <div>
                <button
                  style={s.iconBtn}
                  onClick={handleNewFile}
                  title="New File"
                >
                  📄+
                </button>
                <button
                  style={s.iconBtn}
                  onClick={handleNewFolder}
                  title="New Folder"
                >
                  📁+
                </button>
              </div>
            </div>
            {tree.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '13px',
              }}>
                No files yet.
                <br />
                <button
                  style={{
                    marginTop: '8px',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onClick={handleNewFile}
                >
                  Create first file
                </button>
              </div>
            ) : (
              <FileTree
                nodes={tree}
                onFileClick={(f) =>
                  navigate(
                    `/editor/${projectId}/${f.fileId}`
                  )
                }
                onRename={handleRenameFile}
                onDelete={handleDeleteFile}
              />
            )}
          </div>

          {/* Members */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span>👥 Members ({members.length})</span>
              {isOwner && (
                <button
                  style={s.iconBtn}
                  onClick={() =>
                    setShowAdd(!showAdd)
                  }
                >
                  + Add
                </button>
              )}
            </div>

            {showAdd && (
              <div style={s.addMemberBox}>
                <input
                  style={s.addInput}
                  placeholder="User ID"
                  value={memberInput}
                  onChange={(e) =>
                    setMemberInput(e.target.value)
                  }
                />
                <button
                  style={{
                    ...s.btn, ...s.primaryBtn,
                    padding: '7px 12px',
                  }}
                  onClick={handleAddMember}
                >
                  Add
                </button>
              </div>
            )}

            {members.map((m) => (
              <div
                key={m.id}
                style={s.memberItem}
              >
                <div style={s.memberAvatar}>
                  {m.userId}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#111827',
                  }}>
                    User #{m.userId}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                  }}>
                    {m.role}
                  </div>
                </div>

                {isOwner && Number(m.userId) !== Number(userId) && (
                  <button
                    style={{
                      ...s.iconBtn,
                      color: '#dc2626',
                      borderColor: '#fecaca',
                      background: '#fef2f2',
                    }}
                    onClick={() => handleRemoveMember(m.userId)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
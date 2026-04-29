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
} from '../api/projectApi';
import {
  getFileTree,
  createFile,
  createFolder,
} from '../api/fileApi';

const FILE_ICONS = {
  java:'☕', py:'🐍', js:'🟨', ts:'🔷',
  go:'🐹', rs:'🦀', cpp:'⚙️', c:'⚙️',
  rb:'💎', php:'🐘', kt:'🎯', swift:'🍎',
};

function fileIcon(node) {
  const ext =
    node.name?.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || '📄';
}

const s = {
  page:  { minHeight: '100vh', background: '#0d1117' },
  body: {
    maxWidth: '1100px',
    margin:   '0 auto',
    padding:  '28px 20px',
  },
  header: {
    background:   '#161b22',
    border:       '1px solid #21262d',
    borderRadius: '10px',
    padding:      '24px',
    marginBottom: '24px',
  },
  topRow: {
    display:     'flex',
    alignItems:  'flex-start',
    gap:         '16px',
    marginBottom:'12px',
  },
  name: {
    fontSize:   '22px',
    fontWeight: '700',
    color:      '#58a6ff',
    flex:       1,
  },
  visBadge: {
    fontSize:     '12px',
    padding:      '3px 10px',
    borderRadius: '12px',
    fontWeight:   '500',
  },
  desc: {
    fontSize:     '14px',
    color:        '#8b949e',
    marginBottom: '16px',
  },
  metaRow: {
    display:      'flex',
    gap:          '20px',
    flexWrap:     'wrap',
    marginBottom: '16px',
  },
  meta: {
    fontSize: '13px',
    color:    '#8b949e',
    display:  'flex',
    gap:      '5px',
  },
  actionsRow: {
    display:  'flex',
    gap:      '10px',
    flexWrap: 'wrap',
  },
  btn: {
    padding:      '7px 14px',
    borderRadius: '7px',
    fontSize:     '13px',
    fontWeight:   '500',
    cursor:       'pointer',
    border:       '1px solid #30363d',
    background:   '#21262d',
    color:        '#e6edf3',
  },
  primaryBtn: {
    background:  '#238636',
    borderColor: '#2ea043',
    color:       '#fff',
    fontWeight:  '600',
  },
  dangerBtn: {
    background:  'none',
    borderColor: '#f85149',
    color:       '#f85149',
  },
  cols: {
    display:             'grid',
    gridTemplateColumns: '280px 1fr',
    gap:                 '16px',
  },
  panel: {
    background:   '#161b22',
    border:       '1px solid #21262d',
    borderRadius: '10px',
    overflow:     'hidden',
  },
  panelHeader: {
    padding:        '12px 16px',
    borderBottom:   '1px solid #21262d',
    fontSize:       '13px',
    fontWeight:     '600',
    color:          '#8b949e',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    background:   'none',
    border:       'none',
    color:        '#8b949e',
    cursor:       'pointer',
    fontSize:     '13px',
    padding:      '2px 6px',
    borderRadius: '4px',
  },
  fileItem: {
    padding:     '8px 16px',
    fontSize:    '13px',
    color:       '#e6edf3',
    cursor:      'pointer',
    display:     'flex',
    alignItems:  'center',
    gap:         '8px',
    borderBottom:'1px solid #21262d',
    transition:  'background 0.1s',
  },
  memberItem: {
    padding:     '12px 16px',
    display:     'flex',
    alignItems:  'center',
    gap:         '10px',
    borderBottom:'1px solid #21262d',
  },
  memberAvatar: {
    width:          '32px',
    height:         '32px',
    borderRadius:   '50%',
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '12px',
    fontWeight:     '700',
    color:          '#fff',
    flexShrink:     0,
  },
  addMemberBox: {
    padding:      '12px 16px',
    borderBottom: '1px solid #21262d',
    display:      'flex',
    gap:          '8px',
  },
  addInput: {
    flex:         1,
    padding:      '7px 10px',
    background:   '#0d1117',
    border:       '1px solid #30363d',
    borderRadius: '6px',
    color:        '#e6edf3',
    fontSize:     '13px',
    outline:      'none',
  },
};

function FileTree({ nodes, depth = 0, onFileClick }) {
  const [open, setOpen] = useState({});

  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.fileId}>
          <div
            style={{
              ...s.fileItem,
              paddingLeft: `${16 + depth * 14}px`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                '#21262d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'transparent';
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
            <span>
              {node.fileType === 'FOLDER'
                ? (open[node.fileId] ? '📂' : '📁')
                : fileIcon(node)}
            </span>
            {node.name}
          </div>

          {node.fileType === 'FOLDER'
            && open[node.fileId]
            && node.children?.length > 0 && (
            <FileTree
              nodes={node.children}
              depth={depth + 1}
              onFileClick={onFileClick}
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
  const { projectId }    = useParams();
  const navigate         = useNavigate();
  const { userId }       = useAuth();
  const [project, setPr] = useState(null);
  const [tree, setTree]  = useState([]);
  const [members, setMem]= useState([]);
  const [loading, setL]  = useState(true);
  const [memberInput, setMemberInput] = useState('');
  const [showAdd, setShowAdd]         = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          getProjectById(projectId),
          getFileTree(projectId),
          getMembers(projectId),
        ]);
        setPr(pRes.data.data);
        setTree(tRes.data.data  || []);
        setMem(mRes.data.data   || []);
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
        projectId:  Number(projectId),
        name,
        parentPath: '',
        language:   name.split('.').pop(),
        content:    '',
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
        projectId:  Number(projectId),
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
        role:   'EDITOR',
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
                  ? '#1f6feb33' : '#30363d',
              color:
                project?.visibility === 'PUBLIC'
                  ? '#58a6ff' : '#8b949e',
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
              <button
                style={{ ...s.btn, ...s.dangerBtn }}
                onClick={handleDelete}
              >
                🗑 Delete
              </button>
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
                padding:   '24px',
                textAlign: 'center',
                color:     '#8b949e',
                fontSize:  '13px',
              }}>
                No files yet.
                <br />
                <button
                  style={{
                    marginTop:  '8px',
                    color:      '#58a6ff',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    fontSize:   '13px',
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
                    color:    '#e6edf3',
                  }}>
                    User #{m.userId}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color:    '#8b949e',
                  }}>
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
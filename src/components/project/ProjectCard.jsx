import React, { useState } from 'react';

const LANG_COLORS = {
  java:       '#f89820',
  python:     '#3572A5',
  javascript: '#f7df1e',
  typescript: '#3178c6',
  cpp:        '#00599c',
  c:          '#555555',
  go:         '#00add8',
  rust:       '#dea584',
  ruby:       '#cc342d',
  php:        '#4f5d95',
  kotlin:     '#7f52ff',
  swift:      '#f05138',
};

const s = {
  card: {
    background:   '#161b22',
    border:       '1px solid #21262d',
    borderRadius: '10px',
    padding:      '18px',
    cursor:       'pointer',
    transition:   'border-color 0.15s, transform 0.1s',
  },
  header: {
    display:         'flex',
    alignItems:      'flex-start',
    justifyContent:  'space-between',
    marginBottom:    '8px',
  },
  name: {
    fontSize:     '15px',
    fontWeight:   '600',
    color:        '#58a6ff',
    marginBottom: '4px',
  },
  badge: {
    fontSize:     '11px',
    padding:      '2px 7px',
    borderRadius: '10px',
    fontWeight:   '500',
  },
  desc: {
    fontSize:           '13px',
    color:              '#8b949e',
    lineHeight:         '1.5',
    marginBottom:       '14px',
    height:             '40px',
    overflow:           'hidden',
    display:            '-webkit-box',
    WebkitLineClamp:    2,
    WebkitBoxOrient:    'vertical',
  },
  footer: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    flexWrap:   'wrap',
  },
  langDot: {
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    flexShrink:   0,
  },
  meta: {
    fontSize: '12px',
    color:    '#8b949e',
  },
};

export default function ProjectCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false);
  const lang  =
    project.language?.toLowerCase();
  const color = LANG_COLORS[lang] || '#8b949e';

  return (
    <div
      style={{
        ...s.card,
        borderColor: hovered
          ? '#58a6ff44' : '#21262d',
        transform: hovered
          ? 'translateY(-1px)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.header}>
        <div style={s.name}>{project.name}</div>
        <span style={{
          ...s.badge,
          background:
            project.visibility === 'PUBLIC'
              ? '#1f6feb33' : '#30363d',
          color:
            project.visibility === 'PUBLIC'
              ? '#58a6ff' : '#8b949e',
        }}>
          {project.visibility === 'PUBLIC'
            ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>

      <div style={s.desc}>
        {project.description || 'No description.'}
      </div>

      <div style={s.footer}>
        {lang && (
          <>
            <div style={{
              ...s.langDot, background: color,
            }} />
            <span style={s.meta}>
              {project.language}
            </span>
          </>
        )}
        <span style={s.meta}>
          ⭐ {project.starCount || 0}
        </span>
        <span style={s.meta}>
          🍴 {project.forkCount || 0}
        </span>
        {project.memberCount > 0 && (
          <span style={s.meta}>
            👥 {project.memberCount}
          </span>
        )}
      </div>
    </div>
  );
}
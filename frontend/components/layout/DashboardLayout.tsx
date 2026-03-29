'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  subtitle?: string;
}

export default function DashboardLayout({ children, subtitle }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Sidebar is position: fixed, so we push the content area by the same width
  const SIDEBAR_WIDTH = collapsed ? 60 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6FA' }}>

      {/* Fixed sidebar — renders on top of everything */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
      />

      {/*
        Content column.
        On mobile: no left margin (sidebar slides in as overlay).
        On desktop: marginLeft = sidebar width so content is never hidden behind it.
      */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          // Desktop: push right by sidebar width
          marginLeft: SIDEBAR_WIDTH,
          transition: 'margin-left 0.2s ease',
        }}
        // Mobile: override marginLeft to 0
        className="[margin-left:0] md:[margin-left:var(--sidebar-w,240px)]"
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <motion.main
          key="main"
          style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {subtitle && (
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, marginTop: -4 }}>
              {subtitle}
            </p>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminDashboard from './roles/AdminDashboard';
import LeaderDashboard from './roles/LeaderDashboard';
import OperationalDashboard from './roles/OperationalDashboard';
import QADashboard from './roles/QADashboard';

export default function DashboardByRole({ user, teamMember }) {
  const role = teamMember?.role;

  // Admin/Administrador
  if (role === 'administrador') {
    return <AdminDashboard user={user} />;
  }

  // Líderes de área
  const leaderRoles = [
    'leader_web',
    'leader_product',
    'leader_ux',
    'leader_ui',
    'leader_seo',
    'leader_paid',
    'leader_marketing',
    'leader_software',
    'leader_dev_web'
  ];
  
  if (leaderRoles.includes(role)) {
    return <LeaderDashboard user={user} teamMember={teamMember} />;
  }

  // QA especializado
  if (role === 'qa') {
    return <QADashboard user={user} />;
  }

  // Roles operativos
  const operationalRoles = [
    'ux', 'ui', 'seo', 'paid_media', 'marketing', 
    'developer', 'web_dev', 'product_owner'
  ];
  
  if (operationalRoles.includes(role)) {
    return <OperationalDashboard user={user} teamMember={teamMember} />;
  }

  // Fallback: vista operativa por defecto
  return <OperationalDashboard user={user} teamMember={teamMember} />;
}
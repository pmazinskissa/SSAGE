import { NavLink } from 'react-router-dom';
import { CheckCircle2, Circle, Disc, ClipboardCheck, Lock } from 'lucide-react';
import type { LessonStatus } from '@playbook/shared';

interface SidebarNavItemProps {
  to: string;
  title: string;
  status: LessonStatus;
  isModule?: boolean;
  isKnowledgeCheck?: boolean;
  locked?: boolean;
}

function StatusIcon({ status, isKnowledgeCheck, locked }: { status: LessonStatus; isKnowledgeCheck?: boolean; locked?: boolean }) {
  if (locked) {
    return <Lock size={14} className="text-text-secondary/50 flex-shrink-0" />;
  }
  if (isKnowledgeCheck) {
    return <ClipboardCheck size={16} className="text-primary flex-shrink-0" />;
  }
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={16} className="text-success flex-shrink-0" />;
    case 'in_progress':
      return <Disc size={16} className="text-primary flex-shrink-0" />;
    default:
      return <Circle size={16} className="text-primary/30 flex-shrink-0" />;
  }
}

export default function SidebarNavItem({ to, title, status, isModule, isKnowledgeCheck, locked }: SidebarNavItemProps) {
  if (locked) {
    return (
      <span
        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md mx-2 cursor-not-allowed opacity-50 ${
          isModule ? 'font-semibold mt-4 first:mt-0' : 'pl-8'
        } text-slate-400`}
        title="Complete previous lessons to unlock"
      >
        <StatusIcon status={status} isKnowledgeCheck={isKnowledgeCheck} locked />
        <span className="truncate">{title}</span>
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-md mx-2 ${
          isModule ? 'font-semibold mt-4 first:mt-0' : 'pl-8'
        } ${
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-500 hover:bg-indigo-50/50 hover:text-slate-800'
        }`
      }
    >
      <StatusIcon status={status} isKnowledgeCheck={isKnowledgeCheck} />
      <span className="truncate">{title}</span>
    </NavLink>
  );
}

import { useState, useEffect, useMemo } from 'react';
import {
  X, BookOpen, Search, LayoutDashboard,
  ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle2, Circle, Disc, ClipboardCheck,
} from 'lucide-react';
import { NavLink, Link, useParams } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import SidebarNavItem from './SidebarNavItem';
import type { CourseNavTree, CourseConfig } from '@playbook/shared';

/* ------------------------------------------------------------------ */
/*  Compute locked lessons and KCs based on course settings + progress  */
/* ------------------------------------------------------------------ */

function computeLockedItems(
  navTree: CourseNavTree,
  course: CourseConfig,
): { lockedLessons: Set<string>; lockedKCs: Set<string> } {
  const lockedLessons = new Set<string>();
  const lockedKCs = new Set<string>();

  const isLinear = course.navigation_mode === 'linear';
  const requireKC = course.require_knowledge_checks ?? false;

  if (!isLinear && !requireKC) return { lockedLessons, lockedKCs };

  // Flat list of all lessons in order
  const allLessons: Array<{ modSlug: string; slug: string; status: string }> = [];
  for (const mod of navTree.modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({ modSlug: mod.slug, slug: lesson.slug, status: lesson.status });
    }
  }

  // For linear locking: index of first non-completed lesson (-1 if all done)
  const firstNonCompleted = isLinear ? allLessons.findIndex((l) => l.status !== 'completed') : -1;

  // For KC locking: index of first module whose KC is required but not done
  let kcBlockedFromModIdx = Infinity;
  if (requireKC) {
    for (let i = 0; i < navTree.modules.length; i++) {
      const mod = navTree.modules[i];
      if (mod.has_knowledge_check && !mod.knowledge_check_completed) {
        kcBlockedFromModIdx = i + 1;
        break;
      }
    }
  }

  let flatIdx = 0;
  for (let modIdx = 0; modIdx < navTree.modules.length; modIdx++) {
    const mod = navTree.modules[modIdx];

    for (const lesson of mod.lessons) {
      const linearLocked = isLinear && firstNonCompleted !== -1 && flatIdx > firstNonCompleted;
      const kcLocked = requireKC && modIdx >= kcBlockedFromModIdx;
      if (linearLocked || kcLocked) {
        lockedLessons.add(`${mod.slug}:${lesson.slug}`);
      }
      flatIdx++;
    }

    if (mod.has_knowledge_check) {
      const allLessonsDone = mod.lessons.every((l) => l.status === 'completed');
      const kcLinearLocked = isLinear && !allLessonsDone;
      const kcKcLocked = requireKC && modIdx >= kcBlockedFromModIdx;
      if (kcLinearLocked || kcKcLocked) {
        lockedKCs.add(mod.slug);
      }
    }
  }

  return { lockedLessons, lockedKCs };
}

/* ------------------------------------------------------------------ */
/*  Lesson status icon                                                 */
/* ------------------------------------------------------------------ */

function LessonStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={14} className="text-success" />;
    case 'in_progress':
      return <Disc size={14} className="text-primary" />;
    default:
      return <Circle size={14} className="text-primary/30" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Sidebar component                                                  */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onCollapseToggle: () => void;
}

export default function Sidebar({ open, collapsed, onClose, onCollapseToggle }: SidebarProps) {
  const { slug, moduleSlug } = useParams<{ slug: string; moduleSlug: string }>();
  const { navTree, course, loading } = useCourse();

  const { lockedLessons, lockedKCs } = useMemo(() => {
    if (!navTree || !course) return { lockedLessons: new Set<string>(), lockedKCs: new Set<string>() };
    return computeLockedItems(navTree, course);
  }, [navTree, course]);

  // Track which modules are expanded — only the current module starts expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // When the active module changes (navigation), ensure it's expanded
  useEffect(() => {
    if (moduleSlug) {
      setExpandedModules((prev) => {
        if (prev.has(moduleSlug)) return prev;
        const next = new Set(prev);
        next.add(moduleSlug);
        return next;
      });
    }
  }, [moduleSlug]);

  // When the sidebar collapses, reset to only the current module expanded
  useEffect(() => {
    if (collapsed) {
      setExpandedModules(new Set(moduleSlug ? [moduleSlug] : []));
    }
  }, [collapsed, moduleSlug]);

  const toggleModule = (modSlug: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modSlug)) {
        next.delete(modSlug);
      } else {
        next.add(modSlug);
      }
      return next;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 overflow-hidden transition-all duration-300 bg-gradient-to-b from-slate-50 to-indigo-50/60 shadow-elevation-3 border-r-0 lg:rounded-r-2xl lg:my-2 lg:mr-1 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-[3.75rem] lg:h-[calc(100vh-3.75rem)] lg:z-auto lg:translate-x-0 ${
          collapsed ? 'lg:w-16' : ''
        }`}
      >
        <div className="h-full overflow-y-auto flex flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-indigo-100/50 lg:hidden">
            <span className="font-semibold text-sm text-slate-800">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-indigo-50/50 text-slate-500"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Desktop header: Course Overview + collapse toggle */}
          <div className="hidden lg:flex items-center px-3 py-2 border-b border-indigo-100/50">
            {collapsed ? (
              /* Collapsed: just the toggle centered */
              <div className="flex items-center justify-center w-full">
                <button
                  onClick={onCollapseToggle}
                  className="p-1.5 rounded-md transition-colors hover:bg-indigo-50/50 text-primary"
                  title="Expand sidebar"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            ) : (
              /* Expanded: Course Overview on left, collapse on right */
              <>
                {slug && (
                  <Link
                    to={`/courses/${slug}`}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:bg-indigo-50/50 hover:text-slate-800 rounded-md px-2 py-1.5 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-primary" />
                    Overview
                  </Link>
                )}
                <div className="flex-1" />
                <button
                  onClick={onCollapseToggle}
                  className="p-1.5 rounded-md transition-colors hover:bg-indigo-50/50 text-primary"
                  title="Collapse sidebar"
                >
                  <ChevronsLeft size={18} />
                </button>
              </>
            )}
          </div>

          {/* Navigation content */}
          <nav className="flex-1 py-2" aria-label="Course navigation">
            {collapsed ? (
              /* ====== COLLAPSED ICON RAIL ====== */
              <>
                {/* Course Overview icon */}
                {slug && (
                  <NavLink
                    to={`/courses/${slug}`}
                    end
                    title="Course Overview"
                    className={({ isActive }) =>
                      `flex items-center justify-center w-10 h-10 mx-auto rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-primary hover:bg-indigo-50/50'
                      }`
                    }
                  >
                    <LayoutDashboard size={18} />
                  </NavLink>
                )}

                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 rounded-full bg-surface animate-pulse" />
                  </div>
                ) : navTree ? (
                  navTree.modules.map((mod) => {
                    const isExpanded = expandedModules.has(mod.slug);
                    return (
                      <div key={mod.slug} className="mt-2 first:mt-1">
                        {/* Module number badge — click to toggle */}
                        <button
                          onClick={() => toggleModule(mod.slug)}
                          className="w-full flex items-center justify-center py-1 hover:opacity-80 transition-opacity"
                          title={`Module ${mod.order}: ${mod.title}${mod.status === 'completed' ? ' (Completed)' : ''}`}
                        >
                          <span className="relative">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold ${
                              mod.status === 'completed'
                                ? 'bg-success/15 text-success'
                                : isExpanded
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-primary/[0.06] text-primary'
                            }`}>
                              {mod.status === 'completed' ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                mod.order
                              )}
                            </span>
                          </span>
                        </button>

                        {/* Lesson status icons — only for expanded module */}
                        {isExpanded && (
                          <div className="flex flex-col items-center gap-0.5 py-0.5">
                            {mod.lessons.map((lesson) => (
                              <NavLink
                                key={lesson.slug}
                                to={`/courses/${slug}/modules/${mod.slug}/lessons/${lesson.slug}`}
                                title={lesson.title}
                                className={({ isActive }) =>
                                  `flex items-center justify-center w-8 h-7 rounded transition-colors ${
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'hover:bg-indigo-50/50'
                                  }`
                                }
                              >
                                <LessonStatusIcon status={lesson.status} />
                              </NavLink>
                            ))}
                            {mod.has_knowledge_check && (
                              <NavLink
                                to={`/courses/${slug}/modules/${mod.slug}/knowledge-check`}
                                title="Knowledge Check"
                                className={({ isActive }) =>
                                  `flex items-center justify-center w-8 h-7 rounded transition-colors ${
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'hover:bg-indigo-50/50'
                                  }`
                                }
                              >
                                <ClipboardCheck size={14} className="text-primary" />
                              </NavLink>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : null}
              </>
            ) : (
              /* ====== EXPANDED VIEW ====== */
              <>
                {loading ? (
                  <div className="px-4 py-8 text-sm text-text-secondary animate-pulse">
                    Loading navigation...
                  </div>
                ) : navTree ? (
                  navTree.modules.map((mod) => {
                    const isExpanded = expandedModules.has(mod.slug);
                    return (
                      <div key={mod.slug}>
                        {/* Module header — clickable to expand/collapse */}
                        <button
                          onClick={() => toggleModule(mod.slug)}
                          className="w-full flex items-center justify-between px-4 py-2 mt-3 first:mt-0 text-left hover:bg-indigo-50/50 rounded-md transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                Module {mod.order}
                              </p>
                              {mod.status === 'completed' && (
                                <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                              )}
                              {mod.status === 'in_progress' && (
                                <Disc size={12} className="text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-500 mt-0.5 truncate">
                              {mod.title}
                            </p>
                          </div>
                          <span className="flex-shrink-0 ml-2">
                            {isExpanded ? (
                              <ChevronDown size={16} className="text-primary/40" />
                            ) : (
                              <ChevronRight size={16} className="text-primary/40" />
                            )}
                          </span>
                        </button>

                        {/* Collapsible lesson list */}
                        <div
                          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          {mod.lessons.map((lesson) => (
                            <SidebarNavItem
                              key={lesson.slug}
                              to={`/courses/${slug}/modules/${mod.slug}/lessons/${lesson.slug}`}
                              title={lesson.title}
                              status={lesson.status}
                              locked={lockedLessons.has(`${mod.slug}:${lesson.slug}`)}
                            />
                          ))}
                          {mod.has_knowledge_check && (
                            <SidebarNavItem
                              key={`${mod.slug}-kc`}
                              to={`/courses/${slug}/modules/${mod.slug}/knowledge-check`}
                              title="Knowledge Check"
                              status="not_started"
                              isKnowledgeCheck
                              locked={lockedKCs.has(mod.slug)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-sm text-slate-500">
                    No content available.
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Footer links */}
          {collapsed ? (
            <div className="border-t border-indigo-100/50 py-2 flex flex-col items-center gap-1">
              <NavLink
                to={`/courses/${slug}/glossary`}
                title="Glossary"
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-primary hover:bg-indigo-50/50'
                  }`
                }
              >
                <BookOpen size={16} />
              </NavLink>
              <NavLink
                to={`/courses/${slug}/search`}
                title="Search"
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-primary hover:bg-indigo-50/50'
                  }`
                }
              >
                <Search size={16} />
              </NavLink>
            </div>
          ) : (
            <div className="border-t border-indigo-100/50 p-3 mt-auto">
              <Link
                to={`/courses/${slug}/glossary`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-indigo-50/50 hover:text-slate-800 rounded-md transition-colors"
              >
                <BookOpen size={16} className="text-primary" />
                Glossary
              </Link>
              <Link
                to={`/courses/${slug}/search`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-indigo-50/50 hover:text-slate-800 rounded-md transition-colors"
              >
                <Search size={16} className="text-primary" />
                Search
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

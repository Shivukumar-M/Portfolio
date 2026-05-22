import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SECTION_META = {
  about:          { icon: 'fas fa-user',        label: 'About / Story',       color: 'blue'   },
  skills:         { icon: 'fas fa-code',         label: 'Skills',              color: 'green'  },
  projects:       { icon: 'fas fa-folder-open',  label: 'Projects',            color: 'purple' },
  experience:     { icon: 'fas fa-briefcase',    label: 'Experience',          color: 'yellow' },
  certifications: { icon: 'fas fa-certificate',  label: 'Certifications',      color: 'orange' },
  testimonials:   { icon: 'fas fa-star',         label: 'Testimonials',        color: 'pink'   },
  blog:           { icon: 'fas fa-pen',          label: 'Blog Posts',          color: 'cyan'   },
  contact:        { icon: 'fas fa-envelope',     label: 'Contact',             color: 'red'    },
};

const COLOR_MAP = {
  blue:   'bg-blue-900/40 text-blue-400',
  green:  'bg-green-900/40 text-green-400',
  purple: 'bg-purple-900/40 text-purple-400',
  yellow: 'bg-yellow-900/40 text-yellow-400',
  orange: 'bg-orange-900/40 text-orange-400',
  pink:   'bg-pink-900/40 text-pink-400',
  cyan:   'bg-cyan-900/40 text-cyan-400',
  red:    'bg-red-900/40 text-red-400',
};

const DEFAULT_ORDER = ['about','skills','projects','experience','certifications','testimonials','blog','contact'];

const SortableItem = ({ id }) => {
  const meta = SECTION_META[id] || { icon: 'fas fa-layer-group', label: id, color: 'blue' };
  const colorClass = COLOR_MAP[meta.color] || COLOR_MAP.blue;

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl cursor-grab active:cursor-grabbing select-none hover:border-slate-500 transition-colors">
      <button {...attributes} {...listeners} className="text-slate-500 hover:text-slate-300 transition-colors pr-1">
        <i className="fas fa-grip-vertical text-lg" />
      </button>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        <i className={`${meta.icon} text-sm`} />
      </div>
      <span className="text-white font-medium flex-1">{meta.label}</span>
      <i className="fas fa-arrows-alt-v text-slate-600 text-sm" />
    </div>
  );
};

const SectionReorder = ({ profileData }) => {
  const [order,  setOrder]  = useState(DEFAULT_ORDER);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (profileData?.sectionOrder?.length) {
      setOrder(profileData.sectionOrder);
    }
  }, [profileData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setOrder(prev => arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)));
  };

  const reset = () => setOrder(DEFAULT_ORDER);

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/u/settings/section-order', { sectionOrder: order }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-sort text-indigo-400" /> Section Reordering
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Drag and drop to control the order sections appear on your public portfolio.
        </p>
      </div>

      <div className="max-w-md">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map(id => <SortableItem key={id} id={id} />)}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
            {saving ? <><i className="fas fa-spinner fa-spin" /> Saving…</>
              : saved ? <><i className="fas fa-check" /> Saved!</>
              : <><i className="fas fa-save" /> Save Order</>}
          </button>
          <button onClick={reset}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm">
            Reset
          </button>
        </div>

        <p className="text-slate-500 text-xs mt-3 flex items-center gap-1">
          <i className="fas fa-info-circle" />
          Changes reflect immediately on your public portfolio after saving.
        </p>
      </div>
    </div>
  );
};

export default SectionReorder;

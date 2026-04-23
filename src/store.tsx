import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, CalendarEvent, WellnessCheck, Note, ChatMessage } from './types';
import { format, startOfDay, addHours } from 'date-fns';

interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  wellnessChecks: WellnessCheck[];
  notes: Note[];
  chatHistory: ChatMessage[];
}

interface StoreContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'source'>) => void;
  toggleWellness: (id: string) => void;
  addNote: (content: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_WELLNESS: WellnessCheck[] = [
  { id: 'w-1', type: 'Colazione', completed: false },
  { id: 'w-2', type: 'Pranzo', completed: false },
  { id: 'w-3', type: 'Cena', completed: false },
  { id: 'w-4', type: 'Movimento', completed: false },
  { id: 'w-5', type: 'Respirazione', completed: false },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Sync Team',
    startTime: addHours(startOfDay(new Date()), 10).toISOString(),
    endTime: addHours(startOfDay(new Date()), 11).toISOString(),
    source: 'Google'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    tasks: [],
    events: INITIAL_EVENTS,
    wellnessChecks: INITIAL_WELLNESS,
    notes: [],
    chatHistory: [{ id: 'mia-1', sender: 'nia', text: 'Ciao! Sono Nia. Come posso aiutarti a organizzare la giornata?', createdAt: new Date().toISOString() }],
  });

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'Da fare',
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, tasks: [...s.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const addEvent = (event: Omit<CalendarEvent, 'id' | 'source'>) => {
    const newEv: CalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`,
      source: 'Local'
    };
    setState(s => ({ ...s, events: [...s.events, newEv] }));
  };

  const toggleWellness = (id: string) => {
    setState(s => ({
      ...s,
      wellnessChecks: s.wellnessChecks.map(w => 
        w.id === id ? { ...w, completed: !w.completed, timestamp: !w.completed ? new Date().toISOString() : undefined } : w
      )
    }));
  };

  const addNote = (content: string) => {
    const newNote: Note = { id: `note-${Date.now()}`, content, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, notes: [...s.notes, newNote] }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const newMsg: ChatMessage = { ...msg, id: `msg-${Date.now()}`, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, chatHistory: [...s.chatHistory, newMsg] }));
  };

  return (
    <StoreContext.Provider value={{ ...state, addTask, updateTask, addEvent, toggleWellness, addNote, addChatMessage }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
};

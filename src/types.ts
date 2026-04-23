export type TaskEnergy = 'Alto' | 'Medio' | 'Basso';
export type TaskPriority = 'Alta' | 'Media' | 'Bassa';
export type TaskStatus = 'Da fare' | 'In corso' | 'Completato' | 'Rimandato';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  priority: TaskPriority;
  energy: TaskEnergy;
  status: TaskStatus;
  note?: string;
  project?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  source: 'Local' | 'Google' | 'Outlook';
}

export interface WellnessCheck {
  id: string;
  type: 'Colazione' | 'Pranzo' | 'Cena' | 'Movimento' | 'Respirazione';
  completed: boolean;
  timestamp?: string; // When it was completed
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO string
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nia';
  text: string;
  createdAt: string;
}

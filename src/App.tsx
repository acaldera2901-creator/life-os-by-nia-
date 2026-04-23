import React, { useState, useRef, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Circle, Clock, MessageSquare, Plus, Send, Sparkles, NotebookPen, Zap, Calendar as CalendarIcon, Bot, Check, LayoutDashboard } from "lucide-react";
import { format, isToday, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { processNiaMessage } from './services/niaService';
import { Task, CalendarEvent, WellnessCheck, Note, ChatMessage, TaskEnergy, TaskPriority } from './types';
import { toast, Toaster } from 'sonner';

function Dashboard() {
  const { tasks, events, wellnessChecks, toggleWellness, updateTask } = useStore();
  
  const todayTasks = tasks.filter(t => t.status !== 'Completato');
  const completedTasks = tasks.filter(t => t.status === 'Completato');
  
  const totalItems = tasks.length + wellnessChecks.length;
  const completedItems = completedTasks.length + wellnessChecks.filter(w => w.completed).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'Alto': return <Zap className="w-4 h-4 text-accent" />;
      case 'Medio': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Alta': return 'border-accent text-accent';
      case 'Media': return 'border-primary text-primary';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  const timelineItems = [
    ...todayTasks.map(t => ({ type: 'task', data: t, time: parseISO(t.dueDate || new Date().toISOString()) })),
    ...events.map(e => ({ type: 'event', data: e, time: parseISO(e.startTime) }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <div className="md:h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in pb-24 md:pb-8 pt-4 md:pt-8 z-10 relative">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-white">LifeOS <span className="text-primary font-light">by Nia</span></h1>
          <p className="text-muted-foreground mt-1 text-sm">{format(new Date(), 'EEEE, d MMMM', { locale: it })}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl">
           <div className="relative w-12 h-12 flex items-center justify-center">
             <Progress value={progressPercent} className="absolute inset-0 w-full h-full [&>div]:bg-primary rounded-full [clip-path:circle(50%_at_50%_50%)] bg-transparent" style={{ transform: 'rotate(-90deg)' }} />
             <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold z-10">
               {completedItems}/{totalItems}
             </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-8 flex-1">
        <div className="md:col-span-8 flex flex-col gap-6 order-2 md:order-1">
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Timeline Oggi</h2>
            {timelineItems.length === 0 ? (
               <Card className="bg-white/5 backdrop-blur-md border hover:bg-white/10 border-white/10 border-dashed rounded-2xl">
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">La tua giornata è libera. Chiedi a Nia di pianificarla!</p>
                </CardContent>
               </Card>
            ) : (
              <div className="space-y-3">
                {timelineItems.map((item, idx) => {
                  if (item.type === 'event') {
                    const ev = item.data as CalendarEvent;
                    return (
                      <Card key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex gap-4 items-center">
                          <div className="w-12 text-center flex-shrink-0">
                            <p className="text-xs font-mono text-muted-foreground pt-1">{format(item.time, 'HH:mm')}</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{ev.title}</p>
                            <div className="flex items-center text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                              <CalendarIcon className="w-3 h-3 mr-1 opacity-50" /> {ev.source}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    const task = item.data as Task;
                    return (
                      <Card key={task.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors" onClick={() => updateTask(task.id, { status: task.status === 'Completato' ? 'Da fare' : 'Completato' })}>
                        <CardContent className="p-4 flex gap-4 items-center">
                           <div className="w-12 text-center flex-shrink-0">
                             <p className="text-xs font-mono text-muted-foreground pt-1">{format(item.time, 'HH:mm')}</p>
                           </div>
                           <button className="flex-shrink-0">
                              {task.status === 'Completato' ? 
                                <CheckCircle2 className="text-primary w-5 h-5" /> : 
                                <Circle className="text-muted-foreground w-5 h-5 opacity-40 hover:opacity-100" />
                              }
                           </button>
                           <div className="flex-1">
                              <p className={`font-medium text-sm ${task.status === 'Completato' ? 'line-through text-slate-500' : 'text-foreground'}`}>{task.title}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {getEnergyIcon(task.energy)}
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 uppercase tracking-wider ${getPriorityColor(task.priority)} ${task.status === 'Completato' ? 'opacity-50' : ''}`}>{task.priority}</Badge>
                              </div>
                           </div>
                        </CardContent>
                      </Card>
                    )
                  }
                })}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6 order-1 md:order-2">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Loop Benessere</h2>
            <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {wellnessChecks.map(w => (
                <button 
                  key={w.id}
                  onClick={() => toggleWellness(w.id)}
                  className={`flex flex-col items-center justify-center min-w-[72px] md:w-full h-[72px] md:h-[90px] rounded-3xl border transition-all flex-shrink-0 ${w.completed ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 text-muted-foreground'}`}
                >
                  {w.completed ? <CheckCircle2 className="w-6 h-6 mb-1 md:w-8 md:h-8 md:mb-2" /> : <Circle className="w-6 h-6 mb-1 opacity-50 md:w-8 md:h-8 md:mb-2" />}
                  <span className="text-[10px] uppercase font-medium">{w.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NiaChat() {
  const { chatHistory, addChatMessage, addTask, addEvent, addNote, updateTask, tasks, events } = useStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText.trim();
    setInputText('');
    addChatMessage({ sender: 'user', text: userMsg });
    setIsTyping(true);

    try {
      const response = await processNiaMessage(userMsg, { tasks, events });
      
      let niaText = response.text;

      // Handle function calls internally to mutate state
      if (response.toolCalls && response.toolCalls.length > 0) {
         response.toolCalls.forEach(call => {
           const args = call.args as any;
           if (call.name === 'create_task') {
              addTask({ title: args.title, energy: args.energy as TaskEnergy, priority: args.priority as TaskPriority, dueDate: args.dueDateIso || new Date().toISOString() });
              niaText = `Ho aggiunto "${args.title}" ai tuoi task.`;
              toast.success("Task aggiunto!");
           } else if (call.name === 'create_event') {
              addEvent({ title: args.title, startTime: args.startTimeIso, endTime: args.endTimeIso });
              niaText = `Ho fissato "${args.title}" nel calendario.`;
              toast.success("Evento creato!");
           } else if (call.name === 'capture_note') {
              addNote(args.content);
              niaText = `Ho salvato questo appunto nel Second Brain.`;
              toast.success("Nota salvata!");
           } else if (call.name === 'suggest_replan') {
              niaText = args.replyMessage || "Ho capito che sei stanco. Proviamo a rimuovere un'attività pesante da oggi e pianificare una pausa. Respiriamo.";
              
              const heavyTasks = tasks.filter(t => t.energy === 'Alto' && t.status !== 'Completato');
              if (heavyTasks.length > 0) {
                 updateTask(heavyTasks[0].id, { status: 'Rimandato' });
                 niaText += ` Ho rimandato "${heavyTasks[0].title}" a domani.`;
              }
              toast("Pausa suggerita");
           }
         });
      }

      addChatMessage({ sender: 'nia', text: niaText });

    } catch (e) {
      addChatMessage({ sender: 'nia', text: "Errore di connessione."});
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-full animate-in fade-in-up md:pt-8 pt-4 z-10 relative">
       <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4 flex-shrink-0">
         <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
           <Bot className="w-6 h-6 text-accent" />
         </div>
         <div>
           <h2 className="font-heading font-medium">Nia AI</h2>
           <p className="text-xs text-muted-foreground uppercase tracking-widest">Sempre con te</p>
         </div>
       </div>

       <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-6 pb-[100px] md:pb-[140px]">
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.sender === 'user' 
                  ? 'bg-secondary text-secondary-foreground rounded-br-none' 
                  : 'bg-white/5 backdrop-blur-md border border-white/10 text-card-foreground rounded-bl-none shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] opacity-40 mt-2 block font-mono">
                    {format(parseISO(msg.createdAt), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-none p-4 flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>
       </ScrollArea>

       <div className="absolute bottom-[0px] left-0 right-0 p-4 pb-[72px] md:pb-4 h-[160px] pointer-events-none bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-20 flex items-end">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 w-full max-w-md md:max-w-3xl mx-auto relative group bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-2 py-2 pointer-events-auto"
          >
            <Input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Chiedi a Nia: 'Sono stanco'..." 
              className="rounded-full bg-transparent border-none outline-none text-white placeholder-slate-400 w-full text-sm flex-1 font-light focus-visible:ring-0 shadow-none border-0 h-10 px-4"
            />
            <Button type="submit" size="icon" className="w-10 h-10 rounded-full cursor-pointer bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/20 ring-4 ring-white/5 flex-shrink-0">
              <Send className="w-4 h-4 -ml-0.5" />
            </Button>
          </form>
       </div>
    </div>
  );
}

function Inbox() {
  const { notes } = useStore();

  return (
    <div className="pb-24 md:pb-8 pt-4 md:pt-8 animate-in fade-in z-10 relative md:h-full">
       <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Second Brain</h1>
       <p className="text-muted-foreground text-sm mb-6">Le tue idee, organizzate.</p>

       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {notes.length === 0 ? (
           <p className="text-sm text-muted-foreground col-span-full text-center py-10 opacity-60 italic">Nessuna idea catturata oggi.</p>
         ) : (
           notes.map(note => (
             <Card key={note.id} className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors rounded-3xl">
               <CardContent className="p-4">
                 <p className="text-sm">{note.content}</p>
                 <p className="text-[10px] text-muted-foreground font-mono mt-3">{format(parseISO(note.createdAt), 'dd MMM HH:mm')}</p>
               </CardContent>
             </Card>
           ))
         )}
       </div>
    </div>
  );
}

function LifeOSContent() {
  return (
    <div className="h-screen w-full bg-[#020617] text-foreground relative overflow-hidden flex flex-col md:flex-row">
      {/* Ambient Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] md:h-[800px] h-[500px] bg-slate-800 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] md:w-[600px] md:h-[600px] h-[400px] bg-[#86A789] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] md:w-[500px] md:h-[500px] h-[300px] bg-[#F97316] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <Tabs defaultValue="home" className="flex flex-col md:flex-row h-full w-full mx-auto z-10 w-full xl:max-w-[1400px]">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-[100px] border-r border-white/5 bg-white/5 backdrop-blur-3xl h-full items-center py-8 z-50">
          <TabsList className="flex flex-col h-auto bg-transparent border-none p-0 gap-6">
            <TabsTrigger value="home" className="data-[state=active]:bg-white/10 data-[state=active]:text-primary text-slate-400 flex-col gap-1 border border-transparent data-[state=active]:border-white/10 w-16 h-16 rounded-2xl shadow-none hover:bg-white/5 transition-colors">
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[9px] uppercase tracking-wider font-medium mt-1">Oggi</span>
            </TabsTrigger>
            <TabsTrigger value="nia" className="data-[state=active]:shadow-[0_0_20px_rgba(249,115,22,0.3)] data-[state=active]:border-accent flex-col gap-1 w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:border-accent group transition-all">
              <Bot className="w-6 h-6 transition-transform text-white/80 group-data-[state=active]:text-accent" />
              <span className="text-[9px] uppercase tracking-wider font-medium mt-1 group-data-[state=active]:text-accent text-slate-400">Nia</span>
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-white/10 data-[state=active]:text-primary text-slate-400 flex-col gap-1 border border-transparent data-[state=active]:border-white/10 w-16 h-16 rounded-2xl shadow-none hover:bg-white/5 transition-colors">
              <NotebookPen className="w-6 h-6" />
              <span className="text-[9px] uppercase tracking-wider font-medium mt-1">Inbox</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <main className="flex-1 overflow-hidden relative h-full">
          <TabsContent value="home" className="h-full overflow-y-auto mt-0 px-6 md:px-12 w-full max-w-6xl mx-auto hide-scrollbar">
            <Dashboard />
          </TabsContent>
          <TabsContent value="nia" className="h-full mt-0 px-6 md:px-12 w-full max-w-6xl mx-auto">
            <NiaChat />
          </TabsContent>
          <TabsContent value="inbox" className="h-full overflow-y-auto mt-0 px-6 md:px-12 w-full max-w-6xl mx-auto hide-scrollbar">
            <Inbox />
          </TabsContent>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl z-50">
          <TabsList className="flex w-full max-w-md mx-auto bg-transparent border-none p-0 h-[72px] justify-around items-center">
            <TabsTrigger value="home" className="data-[state=active]:bg-transparent data-[state=active]:text-primary text-slate-400 flex-col gap-1 border-none bg-transparent w-16 h-16 rounded-full shadow-none hover:bg-transparent">
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[9px] uppercase tracking-wider font-medium">Oggi</span>
            </TabsTrigger>
            <TabsTrigger value="nia" className="data-[state=active]:shadow-[0_0_20px_rgba(249,115,22,0.3)] data-[state=active]:border-accent flex-col gap-1 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg -translate-y-4 hover:border-accent group transition-all">
              <Bot className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform text-white/80 group-data-[state=active]:text-accent" />
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-transparent data-[state=active]:text-primary text-slate-400 flex-col gap-1 border-none bg-transparent w-16 h-16 rounded-full shadow-none hover:bg-transparent">
              <NotebookPen className="w-6 h-6" />
              <span className="text-[9px] uppercase tracking-wider font-medium">Inbox</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <LifeOSContent />
      <Toaster position="top-center" theme="dark" />
    </StoreProvider>
  );
}


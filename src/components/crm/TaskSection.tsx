"use client";

import { useState } from 'react';
import { Task, User, TaskStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';

type TaskWithAssignee = Task & { assignee: User };

interface Props {
    companyId: string;
    tasks: TaskWithAssignee[];
    setTasks: React.Dispatch<React.SetStateAction<TaskWithAssignee[]>>;
    users: User[];
}

export function TasksSection({ companyId, tasks, setTasks, users }: Props) {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !assigneeId) {
            return toast.error("Title and assignee are required.");
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/crm/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, companyId, assigneeId }),
            });
            if (!res.ok) throw new Error('Failed to create task');
            const savedTask = await res.json();
            setTasks(prev => [savedTask, ...prev]);
            setTitle('');
            toast.success('Task created');
        } catch (error) {
            toast.error('Could not create task');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleTask = async (task: TaskWithAssignee) => {
        const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
        try {
            const res = await fetch('/api/crm/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update task');
            const updatedTask = await res.json();
            setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
        } catch (error) {
            toast.error("Could not update task");
        }
    };

    return (
        <div>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="New task title..."
                    className="flex-1 p-2 bg-gray-800 rounded-md text-white"
                />
                <select 
                    value={assigneeId} 
                    onChange={e => setAssigneeId(e.target.value)}
                    className="p-2 bg-gray-800 rounded-md text-white"
                >
                    <option value="" disabled>Assign to...</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">Add</button>
            </form>

            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-md">
                        <input
                            type="checkbox"
                            checked={task.status === 'COMPLETED'}
                            onChange={() => handleToggleTask(task)}
                            className="h-5 w-5 rounded bg-gray-700 text-blue-500 border-gray-600 focus:ring-blue-600"
                        />
                        <div className="flex-1">
                            <p className={`text-white ${task.status === 'COMPLETED' && 'line-through text-gray-500'}`}>
                                {task.title}
                            </p>
                            <p className="text-xs text-gray-400">Assigned to: {task.assignee.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
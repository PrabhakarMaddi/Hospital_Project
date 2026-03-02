import { useState } from 'react'
import './App.css'

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Smart Hospital Flow Management System</h1>
            <p className="text-xl text-slate-400">Phase 1: Project Setup & Architecture Initialized</p>
            <div className="mt-8 flex gap-4">
                <div className="px-6 py-3 bg-indigo-600 rounded-lg font-medium hover:bg-indigo-500 transition-colors cursor-pointer">
                    Login as Admin
                </div>
                <div className="px-6 py-3 bg-emerald-600 rounded-lg font-medium hover:bg-emerald-500 transition-colors cursor-pointer">
                    View Live Queue
                </div>
            </div>
        </div>
    )
}

export default App

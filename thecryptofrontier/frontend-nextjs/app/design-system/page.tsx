"use client";
import React from 'react';

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Design System</h1>
                    <p className="text-gray-600 mt-2">Componentes e padrões de design</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-12">
                    
                    {/* Typography */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
                                <p className="text-sm text-gray-500">text-4xl font-bold</p>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Heading 2</h2>
                                <p className="text-sm text-gray-500">text-3xl font-bold</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Heading 3</h3>
                                <p className="text-sm text-gray-500">text-2xl font-bold</p>
                            </div>
                            <div>
                                <p className="text-base text-gray-900">Body text - Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                <p className="text-sm text-gray-500">text-base</p>
                            </div>
                        </div>
                    </section>

                    {/* Colors */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Colors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2"></div>
                                <p className="text-sm font-medium">Primary Blue</p>
                                <p className="text-xs text-gray-500">bg-blue-600</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-900 rounded-lg mx-auto mb-2"></div>
                                <p className="text-sm font-medium">Dark Gray</p>
                                <p className="text-xs text-gray-500">bg-gray-900</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-600 rounded-lg mx-auto mb-2"></div>
                                <p className="text-sm font-medium">Medium Gray</p>
                                <p className="text-xs text-gray-500">bg-gray-600</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                                <p className="text-sm font-medium">Light Gray</p>
                                <p className="text-xs text-gray-500">bg-gray-200</p>
                            </div>
                        </div>
                    </section>

                    {/* Buttons */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                    Primary Button
                                </button>
                                <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                                    Secondary Button
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                                    Outline Button
                                </button>
                                <button className="text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                                    Text Button
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Cards */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
                                <p className="text-gray-600 mb-4">This is a basic card component with some example content.</p>
                                <button className="text-blue-600 hover:text-blue-700 transition-colors">Learn more →</button>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Card with Shadow</h3>
                                <p className="text-gray-600 mb-4">This card has a more pronounced shadow for emphasis.</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                    Action
                                </button>
                            </div>
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
                                <p className="mb-4 opacity-90">This card uses a gradient background for visual interest.</p>
                                <button className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Forms */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Elements</h2>
                        <div className="max-w-md space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Text Input
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter text here"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Textarea
                                </label>
                                <textarea 
                                    rows={3}
                                    placeholder="Enter your message"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Alerts */}
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h2>
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                                <strong>Success!</strong> Your action was completed successfully.
                            </div>
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
                                <strong>Info:</strong> Here's some important information for you.
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                                <strong>Warning:</strong> Please pay attention to this message.
                            </div>
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                                <strong>Error:</strong> Something went wrong. Please try again.
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
} 
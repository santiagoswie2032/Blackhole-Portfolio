/* eslint-disable */
import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import BlackHole from './components/Blackhole';
import FixedStars from './components/FixedStars';
import { RESUME_DATA as data } from './data';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="min-h-screen pt-32 px-6 md:px-32 lg:px-64 text-white z-10 relative pb-20"
  >
    {children}
  </motion.div>
);

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference">
        <Link to="/" className="text-2xl font-bold tracking-tighter" onClick={() => setIsOpen(false)}>Home</Link>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[10px] uppercase tracking-[0.4em] font-light hover:opacity-50 transition"
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-10 text-[10px] uppercase tracking-[0.4em] font-light">
          <Link to="/education" className="hover:opacity-50 transition">Education</Link>
          <Link to="/projects" className="hover:opacity-50 transition">Projects</Link>
          <Link to="/achievements" className="hover:opacity-50 transition">Recognition</Link>
          <Link to="/contact" className="hover:opacity-50 transition">Contact</Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            <Link to="/education" onClick={() => setIsOpen(false)} className="text-3xl font-light tracking-tight hover:italic">Education</Link>
            <Link to="/projects" onClick={() => setIsOpen(false)} className="text-3xl font-light tracking-tight hover:italic">Projects</Link>
            <Link to="/achievements" onClick={() => setIsOpen(false)} className="text-3xl font-light tracking-tight hover:italic">Recognition</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-3xl font-light tracking-tight hover:italic">Contact</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen w-full overflow-x-hidden selection:bg-white selection:text-black">

        {/* The Black Hole Background */}
        <div className="fixed inset-0 z-0">
          <Canvas dpr={window.devicePixelRatio || 1} camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <BlackHole />
              <FixedStars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
            </Suspense>
          </Canvas>
        </div>

        <Nav />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <PageWrapper>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-2xl">
                  <h2 className="text-xl md:text-3xl font-light mb-4 text-gray-400">
                    Hi! I'm Vikalp Bordekar
                  </h2>
                  <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 leading-none">
                    Software Engineer
                  </h1>
                  <p className="text-base md:text-xl text-gray-300 font-light leading-relaxed">
                    Frontend Engineer with a passion for backend development and scalable systems. Skilled in building full-stack applications using modern web technologies, with experience in Node.js, FastAPI, and cloud architectures.
                  </p>
                </motion.div>
              </PageWrapper>
            } />

            <Route path="/education" element={
              <PageWrapper>
                <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight">Academic Foundation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{data.education.duration}</p>
                    <h3 className="text-2xl mb-2">{data.education.college}</h3>
                    <p className="text-gray-400 font-light">{data.education.degree}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {data.education.courses.map(course => (
                      <div key={course} className="text-[10px] border border-white/10 p-3 hover:border-white/40 transition text-center uppercase tracking-widest">
                        {course}
                      </div>
                    ))}
                  </div>
                </div>
              </PageWrapper>
            } />

            <Route path="/projects" element={
              <PageWrapper>
                <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight">Projects</h2>
                <div className="space-y-24 md:space-y-32">
                  {data.projects.map((proj, i) => (
                    <div key={i} className="group relative">
                      <span className="text-8xl md:text-[150px] font-bold text-white/5 absolute -top-12 md:-top-20 -left-6 md:-left-10 z-0 select-none">0{i + 1}</span>
                      <div className="relative z-10 border-l border-white/20 pl-6 md:pl-10">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{proj.tech}</p>
                        <h3 className="text-3xl md:text-4xl font-bold mb-4">{proj.title}</h3>
                        <p className="text-gray-300 mb-6 italic font-light">{proj.subtitle}</p>
                        <ul className="space-y-3 max-w-xl">
                          {proj.description.map((line, j) => (
                            <li key={j} className="text-sm text-gray-400 flex items-start">
                              <span className="mr-3 mt-1.5 w-1 h-1 bg-white/40 rounded-full shrink-0"></span>
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </PageWrapper>
            } />

            <Route path="/achievements" element={
              <PageWrapper>
                <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight">Achievements</h2>
                <div className="divide-y divide-white/10">
                  {data.achievements.map((item, i) => (
                    <div key={i} className="py-8 flex flex-col md:flex-row justify-between items-start md:items-center group hover:bg-white/5 px-2 md:px-4 transition gap-4">
                      <div>
                        <h3 className="text-xl font-medium">{item.title}</h3>
                        <p className="text-gray-500 text-sm mt-1 font-light">{item.detail}</p>
                      </div>
                      <span className="text-gray-600 font-mono text-sm">{item.year}</span>
                    </div>
                  ))}
                </div>
              </PageWrapper>
            } />

            <Route path="/contact" element={
              <PageWrapper>
                <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight">Contact</h2>
                <div className="flex flex-col space-y-12">
                  <a href={`mailto:${data.links.email}`} className="text-3xl md:text-6xl font-bold hover:italic transition-all break-words">{data.links.email}</a>
                  <div className="flex flex-wrap gap-x-12 gap-y-6 pt-10 border-t border-white/10">
                    <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest text-[10px] hover:text-gray-400">LinkedIn</a>
                    <a href={data.links.github} target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest text-[10px] hover:text-gray-400">GitHub</a>
                    <a href={data.links.leetcode} target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest text-[10px] hover:text-gray-400">LeetCode</a>
                  </div>
                </div>
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
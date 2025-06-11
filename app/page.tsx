'use client';

import React from 'react';
import Hero from './components/Hero';
import VideoReel from './components/VideoReel';
import Servicios from './components/Servicios';
import Proceso from './components/Proceso';
import Marquee from './components/Marquee';
import Proyectos from './components/Proyectos';
import Antagonik from './components/Antagonik';
import Vision from './components/Vision';

export default function Page() {
  return (
    <>
      <Hero />
      <VideoReel />
      <Servicios />
      <Marquee />
      <Proyectos />
      <Proceso />
      <Antagonik />
      <Vision />
    </>
  );
}
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Projects from '../components/Projects'
import TerminalCmd from '../components/TerminalCmd'

export default function ProjectsPage() {
  return (
    <>
      <Helmet>
        <title>Projects — Adarsh</title>
        <meta name="description" content="Projects built by Adarsh." />
        <meta property="og:title" content="Projects — Adarsh" />
      </Helmet>
      <Projects />
    </>
  )
}

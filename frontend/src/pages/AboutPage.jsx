import React from 'react';
import {
  Sparkles,
  Code2,
  Database,
  Shield,
  Cpu,
  Compass,
  Mic,
  Languages,
  Users,
  BrainCircuit,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';

export default function AboutPage() {
  const srsFeatures = [
    { id: 'FR-01', title: 'User Account Creation', desc: 'Secure registration with client and server input validation.' },
    { id: 'FR-02', title: 'Authentication (JWT)', desc: 'Stateless JSON Web Tokens with password hashing via bcrypt.' },
    { id: 'FR-03 & 04', title: 'Mood Assessment & NLP', desc: 'Predefined emotional tags and natural language text analysis.' },
    { id: 'FR-05 & 06', title: 'Hybrid Recommendation', desc: 'Rule-based mapping aligning mood tags to weighted genres and IMDb scores.' },
    { id: 'FR-07 & 08', title: 'Metadata & Search', desc: 'Rich film details with 400ms debounced search and multi-filtering.' },
    { id: 'FR-09 & 10', title: 'Watchlist & Reviews', desc: 'Personal collection management, star ratings, and community critiques.' },
    { id: 'FR-11 & 12', title: 'History & Admin Governance', desc: 'Query timeline tracking and comprehensive administrative moderation.' }
  ];

  const futureScope = [
    {
      icon: Mic,
      title: 'Voice-Based Mood Search',
      desc: 'Speech-to-text audio input enabling users to speak their emotional state aloud.'
    },
    {
      icon: Languages,
      title: 'Multilingual Emotion Parsing',
      desc: 'Cross-language sentiment processing across Hindi, Spanish, Japanese, and regional dialects.'
    },
    {
      icon: Users,
      title: 'Collaborative Filtering',
      desc: 'Matrix factorization analyzing user-to-user similarity beyond content metadata.'
    },
    {
      icon: BrainCircuit,
      title: 'Deep Learning Emotion Classification',
      desc: 'Fine-tuned transformer models (e.g. RoBERTa) to capture complex nuanced psychological states.'
    }
  ];

  return (
    <div className="py-12 sm:py-20 text-left pb-24 space-y-16">
      <Container size="lg">
        {/* Project Header */}
        <div className="space-y-4 max-w-3xl">
          <Badge variant="rose" size="md">
            MCA Final Year Capstone Project
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            The Story Behind Moodie
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            An intelligent, mood-aware movie recommendation system developed to eliminate choice fatigue in modern streaming. Built adhering strictly to the formal Software Requirements Specification (SRS).
          </p>
        </div>

        {/* Honest How It Works Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#181122] via-[#101424] to-[#0a0b10] border border-rose-500/20 shadow-2xl space-y-6">
          <Badge variant="amber" size="md" dot>
            Architecture Transparency
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Mood Detection & Recommendations Actually Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-rose-400" />
                <span>Emotion Classification (Rule-Based + AI Ready)</span>
              </h3>
              <p>
                Natural language text is analyzed through affective keyword lexicons and heuristic sentiment scoring. We intentionally do <strong>not claim deep learning</strong> is running locally: our baseline engine is an ultra-resilient rule-based classifier with optional LLM API handoffs.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Hybrid Recommendation Scoring</span>
              </h3>
              <p>
                Candidate movies are scored using SRS Section 6 mappings (e.g. <em>Happy → Comedy/Family/Feel-Good</em>). Rankings balance genre overlap weight (50%) and normalized IMDb ratings/popularity (50%) to guarantee relevant recommendations without external API single points of failure.
              </p>
            </div>
          </div>
        </div>

        {/* SRS Feature Matrix */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Functional Requirements (SRS FR-01 through FR-12)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every core functional requirement specified in the project SRS is actively mapped:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {srsFeatures.map((feat) => (
              <div
                key={feat.id}
                className="p-5 rounded-2xl bg-[#11141e]/80 border border-slate-800 space-y-1.5"
              >
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                  {feat.id}
                </span>
                <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Technology Stack & Standards
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 space-y-2">
              <Code2 className="w-6 h-6 text-rose-400 mb-2" />
              <h3 className="text-base font-bold text-white">Frontend Client</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                React 19, Vite 8, Tailwind CSS v4, React Router v7, Framer Motion, and Recharts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 space-y-2">
              <Database className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-base font-bold text-white">Backend REST API</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Node.js, Express.js, JWT Authentication, bcryptjs, Helmet, and express-validator.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 space-y-2">
              <Shield className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="text-base font-bold text-white">Persistence & Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                MongoDB with Mongoose ODM. Strict zero-secret client isolation and Role-Based Access Control.
              </p>
            </div>
          </div>
        </div>

        {/* Future Scope Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0f121d] border border-slate-800 space-y-6">
          <div>
            <Badge variant="purple" size="md" className="mb-2">
              SRS Section 15
            </Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Future Scope & Planned Enhancements
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Architectural extensions planned for post-capstone deployments:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {futureScope.map((scope) => (
              <div key={scope.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <scope.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{scope.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {scope.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

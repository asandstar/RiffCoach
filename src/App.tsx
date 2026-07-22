import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { QuickAddMaterialSheet } from '@/components/QuickAddMaterialSheet';
import { OnboardingModal } from '@/components/OnboardingModal';
import { TodayPage } from '@/pages/TodayPage';
import { CoverPage } from '@/pages/CoverPage';
import { ResourcePage } from '@/pages/ResourcePage';
import { ReviewPage } from '@/pages/ReviewPage';
import { MePage } from '@/pages/MePage';
import { VideoStudyPage } from '@/pages/VideoStudyPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { PracticePage } from '@/pages/PracticePage';
import { AIFeedbackPage } from '@/pages/AIFeedbackPage';
import { useAppStore } from '@/store/useAppStore';
import type { PageType, Instrument } from '@/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const {
    hasCompletedOnboarding,
    loadDemoData,
    setSelectedInstrument,
    setUserLevel,
    completeOnboarding,
    practiceContext,
  } = useAppStore();

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const handleLoadDemo = () => {
    loadDemoData();
    completeOnboarding();
  };

  const handleSelectInstrument = (instrument: string) => {
    setSelectedInstrument(instrument as Instrument);
  };

  const handleSelectLevel = (level: string) => {
    setUserLevel(level as 'beginner' | 'intermediate' | 'advanced');
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    completeOnboarding();
  };

  const showBottomNav = !['practice', 'ai-feedback', 'video-study', 'review'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
      case 'cover':
        return <CoverPage onPageChange={setCurrentPage} />;
      case 'resource':
        return <ResourcePage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
      case 'review':
        return <ReviewPage onPageChange={setCurrentPage} />;
      case 'me':
        return <MePage onPageChange={setCurrentPage} />;
      case 'video-study':
        return <VideoStudyPage onPageChange={setCurrentPage} />;
      case 'knowledge':
        return <KnowledgePage onPageChange={setCurrentPage} />;
      case 'practice':
        return <PracticePage onPageChange={setCurrentPage} />;
      case 'ai-feedback':
        return <AIFeedbackPage onPageChange={setCurrentPage} />;
      default:
        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'today': return '今日';
      case 'cover': return 'Cover';
      case 'resource': return '资料';
      case 'review': return '复盘';
      case 'me': return '我的';
      case 'video-study': return '视频学习';
      case 'knowledge': return '知识库';
      case 'practice': return undefined;
      case 'ai-feedback': return undefined;
      default: return 'RiffCoach';
    }
  };

  return (
    <div
      className="min-h-screen bg-bg-base"
      data-testid="app-practice-context"
      data-lesson-id={practiceContext?.lessonId ?? ''}
      data-video-id={practiceContext?.videoId ?? ''}
      data-project-id={practiceContext?.projectId ?? ''}
      data-section-id={practiceContext?.sectionId ?? ''}
    >
      <PageShell title={getPageTitle()} showBottomNav={showBottomNav}>
        <div key={currentPage} className="page-enter">
          {renderPage()}
        </div>
      </PageShell>
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} show={showBottomNav} />
      <QuickAddMaterialSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onLoadDemo={handleLoadDemo}
        onSelectInstrument={handleSelectInstrument}
        onSelectLevel={handleSelectLevel}
      />
    </div>
  );
}

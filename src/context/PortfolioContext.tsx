'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import defaultPortfolioData from '@/src/data/portfolio.json';
import type { PortfolioData } from '@/src/types/portfolio';

const DRAFT_STORAGE_KEY = 'shivam_portfolio_draft_v1';
const DRAFT_EVENT = 'portfolio-draft-change';

export interface ContactDraft {
  appStack: string;
  requiredHelp: string;
  serviceTitle: string | null;
}

interface PortfolioContextValue {
  data: PortfolioData;
  defaultData: PortfolioData;
  isDraftActive: boolean;
  updateDraft: (nextData: PortfolioData) => void;
  resetDraft: () => void;
  contactDraft: ContactDraft;
  setContactDraft: React.Dispatch<React.SetStateAction<ContactDraft>>;
  triggerServiceInquiry: (
    appStack: string,
    requiredHelp: string,
    serviceTitle: string
  ) => void;
  clearContactPrefill: () => void;
  isTerminalOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
  toggleTerminal: () => void;
}

const typedDefaultData = defaultPortfolioData as PortfolioData;

const EMPTY_CONTACT_DRAFT: ContactDraft = {
  appStack: '',
  requiredHelp: '',
  serviceTitle: null,
};

const PortfolioContext = createContext<PortfolioContextValue>({
  data: typedDefaultData,
  defaultData: typedDefaultData,
  isDraftActive: false,
  updateDraft: () => {},
  resetDraft: () => {},
  contactDraft: EMPTY_CONTACT_DRAFT,
  setContactDraft: () => {},
  triggerServiceInquiry: () => {},
  clearContactPrefill: () => {},
  isTerminalOpen: false,
  openTerminal: () => {},
  closeTerminal: () => {},
  toggleTerminal: () => {},
});

function mergeWithDefaults(
  base: PortfolioData,
  draft: Partial<PortfolioData>
): PortfolioData {
  return {
    ...base,
    ...draft,
    profile: {
      ...base.profile,
      ...(draft.profile ?? {}),
      socialLinks: Array.isArray(draft.profile?.socialLinks)
        ? draft.profile.socialLinks
        : base.profile.socialLinks,
    },
    featuredProject: {
      ...base.featuredProject,
      ...(draft.featuredProject ?? {}),
      caseStudy: {
        ...base.featuredProject.caseStudy,
        ...(draft.featuredProject?.caseStudy ?? {}),
        decisions: Array.isArray(draft.featuredProject?.caseStudy?.decisions)
          ? draft.featuredProject.caseStudy.decisions
          : base.featuredProject.caseStudy.decisions,
      },
    },
    contactSettings: {
      ...base.contactSettings,
      ...(draft.contactSettings ?? {}),
    },
    about: { ...base.about, ...(draft.about ?? {}) },
    resume: { ...base.resume, ...(draft.resume ?? {}) },
    generatorSettings: {
      ...base.generatorSettings,
      ...(draft.generatorSettings ?? {}),
    },
    coreStack: Array.isArray(draft.coreStack) ? draft.coreStack : base.coreStack,
    engineeringWork: Array.isArray(draft.engineeringWork)
      ? draft.engineeringWork.map((item) => {
          const baseMatch = base.engineeringWork.find((b) => b.id === item.id);
          return {
            ...item,
            decisions: Array.isArray(item.decisions)
              ? item.decisions
              : baseMatch?.decisions,
          };
        })
      : base.engineeringWork,
    services: Array.isArray(draft.services) ? draft.services : base.services,
    educationList: Array.isArray(draft.educationList)
      ? draft.educationList
      : base.educationList,
    certifications: Array.isArray(draft.certifications)
      ? draft.certifications
      : base.certifications,
    incidentScenarios: Array.isArray(draft.incidentScenarios)
      ? draft.incidentScenarios
      : base.incidentScenarios,
  };
}

let cachedRawDraft: string | null = null;
let cachedParsedData: PortfolioData = typedDefaultData;

function getDraftSnapshot(): PortfolioData {
  if (typeof window === 'undefined') return typedDefaultData;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw === cachedRawDraft) {
      return cachedParsedData;
    }
    cachedRawDraft = raw;
    if (!raw) {
      cachedParsedData = typedDefaultData;
      return cachedParsedData;
    }
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    if (parsed && typeof parsed === 'object') {
      cachedParsedData = mergeWithDefaults(typedDefaultData, parsed);
    } else {
      cachedParsedData = typedDefaultData;
    }
    return cachedParsedData;
  } catch {
    return typedDefaultData;
  }
}

function getServerSnapshot(): PortfolioData {
  return typedDefaultData;
}

function subscribeToDraft(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === DRAFT_STORAGE_KEY) {
      callback();
    }
  };
  const onCustom = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener(DRAFT_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(DRAFT_EVENT, onCustom);
  };
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const data = useSyncExternalStore(
    subscribeToDraft,
    getDraftSnapshot,
    getServerSnapshot
  );
  const isDraftActive = data !== typedDefaultData;
  const [contactDraft, setContactDraft] =
    useState<ContactDraft>(EMPTY_CONTACT_DRAFT);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const openTerminal = useCallback(() => setIsTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setIsTerminalOpen(false), []);
  const toggleTerminal = useCallback(
    () => setIsTerminalOpen((prev) => !prev),
    []
  );

  // Global Cmd/Ctrl + K shortcut for CLI Terminal Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateDraft = useCallback((nextData: PortfolioData) => {
    try {
      const serialized = JSON.stringify(nextData);
      window.localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
      window.dispatchEvent(new Event(DRAFT_EVENT));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const resetDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      window.dispatchEvent(new Event(DRAFT_EVENT));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const triggerServiceInquiry = useCallback(
    (appStack: string, requiredHelp: string, serviceTitle: string) => {
      setContactDraft({
        appStack,
        requiredHelp,
        serviceTitle,
      });
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        router.push('/#contact');
      }
    },
    [router]
  );

  const clearContactPrefill = useCallback(() => {
    setContactDraft(EMPTY_CONTACT_DRAFT);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        defaultData: typedDefaultData,
        isDraftActive,
        updateDraft,
        resetDraft,
        contactDraft,
        setContactDraft,
        triggerServiceInquiry,
        clearContactPrefill,
        isTerminalOpen,
        openTerminal,
        closeTerminal,
        toggleTerminal,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}

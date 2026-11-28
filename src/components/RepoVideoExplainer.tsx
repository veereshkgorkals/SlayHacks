"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileCode2,
  Film,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { AuditReport, WalkthroughScene } from "@/types/audit";
import { cn } from "@/lib/utils";

interface RepoVideoExplainerProps {
  report: AuditReport;
}

const SPEED_OPTIONS = [1, 1.25, 1.5] as const;
type PlaybackSpeed = (typeof SPEED_OPTIONS)[number];

const emptySubscribe = () => () => {};

function getSpeechSupportSnapshot(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function getServerSpeechSupportSnapshot(): boolean {
  return false;
}

function cancelActiveSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Generates a 3-scene fallback storyboard when an audit report has no walkthrough array.
 */
function buildFallbackWalkthrough(report: AuditReport): WalkthroughScene[] {
  const uniqueNodeFiles = Array.from(
    new Set(report.nodes.map((node) => node.filePath).filter(Boolean))
  ).slice(0, 3);

  const uniqueVulnFiles = Array.from(
    new Set(report.vulnerabilities.map((vuln) => vuln.filePath).filter(Boolean))
  ).slice(0, 3);

  const topVuln = report.vulnerabilities[0];
  const entryNode = report.nodes[0];
  const exitNode =
    report.nodes.length > 1 ? report.nodes[report.nodes.length - 1] : undefined;

  return [
    {
      sceneNumber: 1,
      title: "Repository Overview",
      badge: "WHAT IT DOES",
      narration:
        report.summary ||
        `This repository (${report.owner}/${report.repoName}) implements an interconnected application spanning ${report.stats.totalFiles} source files.`,
      visualHeadline: `${report.owner}/${report.repoName} Overview`,
      visualPoints: [
        `${report.stats.totalFiles} repository files analyzed across ${report.nodes.length} mapped components`,
        `Current security posture score: ${report.securityScore} / 100`,
        `${report.vulnerabilities.length} security findings surfaced for review`,
      ],
      highlightedFiles:
        uniqueNodeFiles.length > 0 ? uniqueNodeFiles : ["README.md"],
      durationSeconds: 9,
    },
    {
      sceneNumber: 2,
      title: "System Architecture",
      badge: "ARCHITECTURE",
      narration: `Execution flows across ${report.nodes.length} mapped architectural nodes and ${report.edges.length} directed connections. Components span entry interfaces, backend routes, and downstream storage or external services.`,
      visualHeadline: "Mapped System Components & Boundaries",
      visualPoints:
        report.nodes.length > 0
          ? report.nodes
              .slice(0, 3)
              .map((node) => `${node.label}: ${node.summary}`)
          : [
              "Frontend and API entrypoints mapped from repository structure",
              "Service and persistence dependencies traced across layers",
            ],
      highlightedFiles:
        uniqueNodeFiles.length > 0 ? uniqueNodeFiles : ["src/app/page.tsx"],
      ...(entryNode ? { flowFrom: entryNode.label } : {}),
      ...(exitNode ? { flowTo: exitNode.label } : {}),
      durationSeconds: 9,
    },
    {
      sceneNumber: 3,
      title: topVuln ? topVuln.title : "Security Posture Summary",
      badge: topVuln ? "KEY RISK" : "HARDENING",
      narration: topVuln
        ? `${topVuln.severity} severity finding in ${topVuln.filePath}: ${topVuln.description}`
        : "No high-severity vulnerabilities were flagged in the analyzed files. Continue enforcing least-privilege access and input validation before shipping.",
      visualHeadline: topVuln
        ? `${topVuln.severity}: ${topVuln.title}`
        : "Hardened Baseline Verification",
      visualPoints:
        report.vulnerabilities.length > 0
          ? report.vulnerabilities
              .slice(0, 3)
              .map((vuln) => `[${vuln.severity}] ${vuln.title}`)
          : [
              "Keep secrets server-side and validate all external inputs",
              "Re-run AegisLens after major dependency or route updates",
            ],
      highlightedFiles:
        uniqueVulnFiles.length > 0
          ? uniqueVulnFiles
          : uniqueNodeFiles.length > 0
          ? uniqueNodeFiles
          : ["src/app/page.tsx"],
      durationSeconds: 9,
    },
  ];
}

export function RepoVideoExplainer({ report }: RepoVideoExplainerProps) {
  const scenes = useMemo(() => {
    if (report.walkthrough && report.walkthrough.length > 0) {
      return report.walkthrough;
    }
    return buildFallbackWalkthrough(report);
  }, [report]);

  const speechSupported = useSyncExternalStore(
    emptySubscribe,
    getSpeechSupportSnapshot,
    getServerSpeechSupportSnapshot
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [speechUnavailableForRun, setSpeechUnavailableForRun] = useState(false);

  const safeIndex = Math.min(currentIndex, Math.max(0, scenes.length - 1));
  const activeScene = scenes[safeIndex];
  const isFinished =
    !isPlaying && safeIndex === scenes.length - 1 && sceneProgress >= 100;
  const canSpeak = speechSupported && !isMuted && !speechUnavailableForRun;

  const pausedRef = useRef<boolean>(false);
  const charOffsetRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const boundaryPctRef = useRef<number>(0);
  const speedAtPauseRef = useRef<PlaybackSpeed | null>(null);
  const intervalRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRunIdRef = useRef<number>(0);

  const isPlayingRef = useRef<boolean>(isPlaying);
  const canSpeakRef = useRef<boolean>(canSpeak);
  const speedRef = useRef<PlaybackSpeed>(speed);
  const scenesLengthRef = useRef<number>(scenes.length);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    canSpeakRef.current = canSpeak;
  }, [canSpeak]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    scenesLengthRef.current = scenes.length;
  }, [scenes.length]);

  const clearProgressInterval = useCallback(() => {
    if (intervalRef.current !== null && typeof window !== "undefined") {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    speechRunIdRef.current += 1;
    utteranceRef.current = null;
    cancelActiveSpeech();
  }, []);

  const advanceToNextScene = useCallback(
    (fromIndex: number) => {
      clearProgressInterval();
      pausedRef.current = false;
      charOffsetRef.current = 0;
      boundaryPctRef.current = 0;
      speedAtPauseRef.current = null;

      if (fromIndex < scenesLengthRef.current - 1) {
        progressRef.current = 0;
        setSceneProgress(0);
        setCurrentIndex(fromIndex + 1);
      } else {
        progressRef.current = 100;
        setSceneProgress(100);
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
    },
    [clearProgressInterval]
  );

  const startProgressInterval = useCallback(
    (
      scene: WalkthroughScene,
      sceneIndex: number,
      playbackSpeed: PlaybackSpeed,
      speechSynced: boolean
    ) => {
      clearProgressInterval();
      if (typeof window === "undefined") return;

      const narration = scene.narration;
      const estimatedSeconds = Math.max(
        scene.durationSeconds,
        narration.split(/\s+/).length / 2.2
      );
      const effectiveDurationSeconds = Math.max(
        1,
        estimatedSeconds / playbackSpeed
      );
      let lastTick = Date.now();

      intervalRef.current = window.setInterval(() => {
        if (!isPlayingRef.current) return;

        const now = Date.now();
        const dtSeconds = Math.max(0, (now - lastTick) / 1000);
        lastTick = now;
        const deltaPct = (dtSeconds / effectiveDurationSeconds) * 100;

        if (speechSynced) {
          const maxAllowed = Math.min(98, boundaryPctRef.current + 8);
          const nextPct = Math.min(maxAllowed, progressRef.current + deltaPct);
          progressRef.current = nextPct;
          setSceneProgress(nextPct);
        } else {
          const nextPct = progressRef.current + deltaPct;
          if (nextPct >= 100) {
            advanceToNextScene(sceneIndex);
          } else {
            progressRef.current = nextPct;
            setSceneProgress(nextPct);
          }
        }
      }, 100);
    },
    [advanceToNextScene, clearProgressInterval]
  );

  const startPlaybackSegment = useCallback(
    (
      scene: WalkthroughScene,
      sceneIndex: number,
      baseOffset: number,
      initialProgress: number,
      useSpeech: boolean,
      playbackSpeed: PlaybackSpeed
    ) => {
      clearProgressInterval();
      stopSpeech();

      progressRef.current = initialProgress;
      const narration = scene.narration;
      const safeBaseOffset = Math.max(0, Math.min(narration.length, baseOffset));
      const remainingText = narration.slice(safeBaseOffset);

      if (
        useSpeech &&
        remainingText.trim().length > 0 &&
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined"
      ) {
        const runId = ++speechRunIdRef.current;
        const utterance = new SpeechSynthesisUtterance(remainingText);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1;
        utteranceRef.current = utterance;

        utterance.onboundary = (event) => {
          if (speechRunIdRef.current !== runId) return;
          const absoluteChar = Math.min(
            narration.length,
            safeBaseOffset + event.charIndex
          );
          charOffsetRef.current = absoluteChar;

          const charPct =
            narration.length > 0
              ? Math.min(98, (absoluteChar / narration.length) * 100)
              : 0;
          boundaryPctRef.current = charPct;

          if (charPct > progressRef.current) {
            progressRef.current = charPct;
            setSceneProgress(charPct);
          }
        };

        utterance.onend = () => {
          if (speechRunIdRef.current !== runId) return;
          utteranceRef.current = null;
          if (!isPlayingRef.current) return;
          advanceToNextScene(sceneIndex);
        };

        utterance.onerror = (event) => {
          if (speechRunIdRef.current !== runId) return;
          if (event.error === "interrupted" || event.error === "canceled") {
            return;
          }
          utteranceRef.current = null;
          if (
            event.error === "not-allowed" ||
            event.error === "synthesis-unavailable"
          ) {
            setSpeechUnavailableForRun(true);
          }
          if (isPlayingRef.current) {
            startProgressInterval(scene, sceneIndex, playbackSpeed, false);
          }
        };

        window.speechSynthesis.speak(utterance);
        startProgressInterval(scene, sceneIndex, playbackSpeed, true);
      } else {
        startProgressInterval(scene, sceneIndex, playbackSpeed, false);
      }
    },
    [advanceToNextScene, clearProgressInterval, startProgressInterval, stopSpeech]
  );

  // Start scene playback from offset 0 whenever the active scene changes
  useEffect(() => {
    if (!activeScene) return;

    pausedRef.current = false;
    charOffsetRef.current = 0;
    progressRef.current = 0;
    boundaryPctRef.current = 0;
    speedAtPauseRef.current = null;

    if (isPlayingRef.current) {
      startPlaybackSegment(
        activeScene,
        safeIndex,
        0,
        0,
        canSpeakRef.current,
        speedRef.current
      );
    } else {
      clearProgressInterval();
      stopSpeech();
    }

    return () => {
      clearProgressInterval();
      stopSpeech();
    };
  }, [
    activeScene,
    clearProgressInterval,
    safeIndex,
    startPlaybackSegment,
    stopSpeech,
  ]);

  // Cancel speech and clear offsets unconditionally on unmount
  useEffect(() => {
    return () => {
      pausedRef.current = false;
      charOffsetRef.current = 0;
      progressRef.current = 0;
      boundaryPctRef.current = 0;
      speedAtPauseRef.current = null;
      clearProgressInterval();
      stopSpeech();
    };
  }, [clearProgressInterval, stopSpeech]);

  const handleTogglePlay = () => {
    if (!activeScene) return;

    if (isPlaying) {
      clearProgressInterval();
      pausedRef.current = true;
      speedAtPauseRef.current = speed;
      isPlayingRef.current = false;
      setIsPlaying(false);

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
      ) {
        window.speechSynthesis.pause();
      }
      return;
    }

    if (safeIndex === scenes.length - 1 && progressRef.current >= 100) {
      pausedRef.current = false;
      charOffsetRef.current = 0;
      progressRef.current = 0;
      boundaryPctRef.current = 0;
      speedAtPauseRef.current = null;
      setSpeechUnavailableForRun(false);
      setSceneProgress(0);
      isPlayingRef.current = true;
      setIsPlaying(true);

      if (safeIndex !== 0) {
        setCurrentIndex(0);
      } else {
        const nextCanSpeak = speechSupported && !isMuted;
        canSpeakRef.current = nextCanSpeak;
        startPlaybackSegment(activeScene, 0, 0, 0, nextCanSpeak, speed);
      }
      return;
    }

    const wasPaused = pausedRef.current;
    const speedUnchanged = speedAtPauseRef.current === speed;
    pausedRef.current = false;
    speedAtPauseRef.current = null;
    setSpeechUnavailableForRun(false);
    isPlayingRef.current = true;
    setIsPlaying(true);

    const nextCanSpeak = speechSupported && !isMuted;
    canSpeakRef.current = nextCanSpeak;

    if (nextCanSpeak) {
      if (
        wasPaused &&
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        window.speechSynthesis.paused &&
        utteranceRef.current &&
        speedUnchanged
      ) {
        window.speechSynthesis.resume();
        startProgressInterval(activeScene, safeIndex, speed, true);
      } else {
        startPlaybackSegment(
          activeScene,
          safeIndex,
          charOffsetRef.current,
          progressRef.current,
          true,
          speed
        );
      }
    } else {
      startProgressInterval(activeScene, safeIndex, speed, false);
    }
  };

  const handleSelectScene = (index: number) => {
    if (index < 0 || index >= scenes.length) return;
    clearProgressInterval();
    stopSpeech();
    pausedRef.current = false;
    charOffsetRef.current = 0;
    progressRef.current = 0;
    boundaryPctRef.current = 0;
    speedAtPauseRef.current = null;
    setSceneProgress(0);

    if (index !== safeIndex) {
      setCurrentIndex(index);
    } else if (isPlaying && scenes[index]) {
      startPlaybackSegment(scenes[index], index, 0, 0, canSpeak, speed);
    }
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      stopSpeech();
      canSpeakRef.current = false;
      setIsMuted(true);
      if (isPlaying && activeScene) {
        startProgressInterval(activeScene, safeIndex, speed, false);
      }
    } else {
      setSpeechUnavailableForRun(false);
      setIsMuted(false);
      const nextCanSpeak = speechSupported;
      canSpeakRef.current = nextCanSpeak;
      if (isPlaying && activeScene && nextCanSpeak) {
        startPlaybackSegment(
          activeScene,
          safeIndex,
          charOffsetRef.current,
          progressRef.current,
          true,
          speed
        );
      }
    }
  };

  const handleCycleSpeed = () => {
    const nextIdx = (SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIdx];
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);

    if (isPlaying && activeScene) {
      if (canSpeak) {
        startPlaybackSegment(
          activeScene,
          safeIndex,
          charOffsetRef.current,
          progressRef.current,
          true,
          nextSpeed
        );
      } else {
        startProgressInterval(activeScene, safeIndex, nextSpeed, false);
      }
    }
  };

  const voiceStatusLabel = !speechSupported
    ? "Timer Mode"
    : isMuted
    ? "Voice Muted"
    : speechUnavailableForRun
    ? "Auto-Timer Fallback"
    : isPlaying
    ? "Voice Narrating"
    : "Voice Ready";

  if (!activeScene) {
    return null;
  }

  return (
    <div className="relative flex aspect-video min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] shadow-lg">
      {/* Subtle architectural backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.14),_transparent_62%)]"
      />

      {/* Top Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B]/90 bg-[#0B1120]/70 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#1E293B]/80 px-2.5 py-1 font-mono text-xs font-medium text-[#E2E8F0]">
            <Film className="h-3.5 w-3.5 text-indigo-400" />
            <span>
              {report.owner}/{report.repoName}
            </span>
          </span>
          <span className="rounded border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-indigo-200">
            Scene {safeIndex + 1} / {scenes.length}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#334155] bg-[#1E293B]/75 px-3 py-1 font-mono text-[11px] text-[#CBD5E1]">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isPlaying && canSpeak
                ? "animate-pulse bg-emerald-400"
                : isPlaying
                ? "animate-pulse bg-indigo-400"
                : "bg-slate-500"
            )}
          />
          <span>{voiceStatusLabel}</span>
        </div>
      </div>

      {/* Animated Visual Stage */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-6 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeScene.sceneNumber}-${activeScene.badge}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mx-auto flex w-full max-w-4xl flex-col gap-5"
          >
            {/* Scene Badge + Title */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-indigo-400/35 bg-indigo-500/15 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                {activeScene.badge}
              </span>
              <span className="font-mono text-xs text-[#94A3B8]">
                {String(safeIndex + 1).padStart(2, "0")} — {activeScene.title}
              </span>
            </div>

            {/* Bold Visual Headline */}
            <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              {activeScene.visualHeadline}
            </h2>

            {/* Optional Animated Flow Diagram */}
            {activeScene.flowFrom || activeScene.flowTo ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#1E293B] bg-[#1E293B]/45 px-4 py-3">
                <div className="rounded-md border border-[#334155] bg-[#0F172A] px-3 py-1.5 font-mono text-xs font-medium text-[#E2E8F0]">
                  {activeScene.flowFrom ?? "Source"}
                </div>

                <div className="flex items-center gap-1.5 text-indigo-400">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="h-px w-6 bg-indigo-400/60 sm:w-10" />
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="h-4 w-4 text-indigo-300" />
                  </motion.div>
                </div>

                <div className="rounded-md border border-indigo-400/35 bg-indigo-950/50 px-3 py-1.5 font-mono text-xs font-medium text-indigo-200">
                  {activeScene.flowTo ?? "Target"}
                </div>
              </div>
            ) : null}

            {/* Crisp Takeaway Bullets */}
            <ul className="grid gap-2.5 sm:grid-cols-3">
              {activeScene.visualPoints.slice(0, 3).map((point, idx) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * (idx + 1), duration: 0.22 }}
                  className="flex items-start gap-2.5 rounded-md border border-[#1E293B] bg-[#1E293B]/40 p-3 text-xs leading-relaxed text-[#CBD5E1] sm:text-[13px]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>

            {/* Highlighted Monospace File Badges */}
            {activeScene.highlightedFiles.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeScene.highlightedFiles.map((filePath) => (
                  <span
                    key={filePath}
                    className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#0B1120]/90 px-2.5 py-1 font-mono text-[11px] text-[#CBD5E1]"
                  >
                    <FileCode2 className="h-3 w-3 shrink-0 text-indigo-400" />
                    <span className="truncate max-w-[260px] sm:max-w-none">
                      {filePath}
                    </span>
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Kinetic Subtitle Bar + Interactive Player Controls */}
      <div className="relative z-10 border-t border-[#1E293B] bg-[#0B1120]/90">
        {/* Kinetic Subtitle Strip */}
        <div className="border-b border-[#1E293B]/80 px-4 py-3 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={`caption-${activeScene.sceneNumber}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-[#E2E8F0] sm:text-sm"
            >
              {activeScene.narration}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Timeline & Player Controls */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
          {/* Clickable Segmented Timeline Progress Bar */}
          <div
            role="group"
            aria-label="Scene timeline"
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))`,
            }}
          >
            {scenes.map((scene, idx) => {
              const fillPercent =
                idx < safeIndex ? 100 : idx === safeIndex ? sceneProgress : 0;
              return (
                <button
                  key={`progress-${scene.sceneNumber}-${idx}`}
                  type="button"
                  onClick={() => handleSelectScene(idx)}
                  aria-label={`Jump to scene ${idx + 1}: ${scene.title}`}
                  title={`Scene ${idx + 1}: ${scene.title}`}
                  className="group relative h-2 w-full overflow-hidden rounded-full bg-[#1E293B] transition-colors hover:bg-[#334155]"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-75",
                      idx <= safeIndex ? "bg-indigo-400" : "bg-transparent"
                    )}
                    style={{ width: `${Math.max(0, Math.min(100, fillPercent))}%` }}
                  />
                </button>
              );
            })}
          </div>

          {/* Interactive Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Play/Pause & Chapter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-indigo-100 transition-colors hover:bg-indigo-500/30"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </>
                ) : isFinished ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                {scenes.map((scene, idx) => {
                  const isCurrent = idx === safeIndex;
                  return (
                    <button
                      key={`chapter-${scene.sceneNumber}-${idx}`}
                      type="button"
                      onClick={() => handleSelectScene(idx)}
                      title={`${scene.badge}: ${scene.title}`}
                      className={cn(
                        "rounded border px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition-colors",
                        isCurrent
                          ? "border-indigo-400/50 bg-indigo-500/25 text-indigo-100"
                          : "border-[#334155] bg-[#1E293B]/60 text-[#94A3B8] hover:border-[#475569] hover:text-[#F8FAFC]"
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Toggle & Speed Cycle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                disabled={!speechSupported}
                title={
                  speechSupported
                    ? isMuted
                      ? "Unmute voice narration"
                      : "Mute voice narration"
                    : "Web Speech synthesis unavailable in this browser"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors",
                  !speechSupported
                    ? "cursor-not-allowed border-[#1E293B] bg-[#0F172A] text-[#64748B]"
                    : isMuted
                    ? "border-[#334155] bg-[#1E293B]/60 text-[#94A3B8] hover:text-[#F8FAFC]"
                    : "border-emerald-500/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                )}
              >
                {isMuted || !speechSupported ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
                <span>{isMuted || !speechSupported ? "Muted" : "Voice On"}</span>
              </button>

              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Cycle playback speed"
                className="inline-flex items-center gap-1 rounded-md border border-[#334155] bg-[#1E293B]/60 px-2.5 py-1.5 font-mono text-xs font-medium tabular-nums text-[#E2E8F0] transition-colors hover:border-[#475569] hover:bg-[#1E293B]"
              >
                <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                <span>{speed}x</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

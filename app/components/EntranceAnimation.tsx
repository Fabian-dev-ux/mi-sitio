import { useState, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from "@/lib/gsapInit";

// Utility to detect if we're in a browser (not in SSR)
const isBrowser = typeof window !== 'undefined';

export default function EntranceAnimation({ 
    devMode = false, 
    logoWidth = "w-[50rem]", // Este parámetro ahora será ignorado en favor de responsive
    onAnimationComplete = () => {} 
}) {
    // Consolidated states - reduces state complexity
    const [animationState, setAnimationState] = useState('initial'); // initial, ready, animating, complete
    const [progress, setProgress] = useState(0);
    
    // Required references
    const svgRef = useRef(null);
    const progressNumberStartRef = useRef(null);
    const progressNumberEndRef = useRef(null);
    const progressLineRef = useRef(null);
    const introTextRef = useRef(null);
    
    // Background strip references
    const bgStrip1Ref = useRef(null);
    const bgStrip2Ref = useRef(null);
    const bgStrip3Ref = useRef(null);
    const containerRef = useRef(null);

    // Cache for frequently used DOM elements
    const elementsCache = useRef({
        letters: null,
        letterHeight: 0,
        timeline: null
    });

    // Skip animation in dev mode immediately
    useEffect(() => {
        if (devMode && isBrowser) {
            setAnimationState('complete');
            onAnimationComplete();
        }
    }, [devMode, onAnimationComplete]);

    // Initial setup and main animation sequence
    useEffect(() => {
        if (!isBrowser || devMode || animationState !== 'initial') return;
        
        // Cleanup function to kill any GSAP animations on unmount
        const cleanupGSAP = () => {
            // Get all elements that might have will-change applied
            const allElements = [
                introTextRef.current,
                progressNumberStartRef.current,
                progressNumberEndRef.current,
                progressLineRef.current,
                bgStrip1Ref.current,
                bgStrip2Ref.current,
                bgStrip3Ref.current,
                svgRef.current
            ].filter(Boolean);
            
            if (elementsCache.current.letters) {
                allElements.push(...elementsCache.current.letters);
            }
            
            // Clean will-change and kill animations
            gsap.set(allElements, { willChange: "auto" });
            gsap.killTweensOf(allElements);
            
            // Kill timeline
            if (elementsCache.current.timeline) {
                elementsCache.current.timeline.kill();
            }
        };

        // Wait for all refs to be populated before proceeding
        const waitForRefs = () => {
            return new Promise((resolve) => {
                const checkRefs = () => {
                    if (svgRef.current && containerRef.current) {
                        // Check if the letter elements are available
                        const letters = svgRef.current.querySelectorAll('.letter');
                        if (letters && letters.length > 0) {
                            resolve();
                            return;
                        }
                    }
                    
                    // If not ready yet, check again in the next frame
                    requestAnimationFrame(checkRefs);
                };
                
                checkRefs();
            });
        };
        
        // Set up animation once refs are available
        const setupAnimation = async () => {
            try {
                await waitForRefs();
                
                const letters = svgRef.current.querySelectorAll('.letter');
                
                // Cache elements for future use
                elementsCache.current.letters = letters;
                elementsCache.current.letterHeight = letters[0]?.getBoundingClientRect().height || 0;
                
                // Initial setup of elements - NOT setting will-change yet (only during animation)
                gsap.set(letters, { 
                    y: 50, 
                    opacity: 0
                });
                
                if (svgRef.current) {
                    svgRef.current.style.opacity = "1";
                }
                
                if (introTextRef.current) {
                    gsap.set(introTextRef.current, { 
                        y: 50, 
                        opacity: 0
                    });
                    introTextRef.current.style.opacity = "1";
                }
                
                if (progressLineRef.current) {
                    // OPTIMIZED: Set full width but scale to 0 for hardware acceleration
                    gsap.set(progressLineRef.current, { 
                        width: "100%",
                        scaleX: 0,
                        transformOrigin: "left center"
                    });
                }
                
                // Advance to 'ready' state
                setAnimationState('ready');
                
            } catch (error) {
                console.error("Error during animation setup:", error);
            }
        };
        
        setupAnimation();
        
        // Cleanup on unmount
        return cleanupGSAP;
        
    }, [animationState, devMode]);

    // Effect that handles the complete animation sequence based on state
    useEffect(() => {
        if (!isBrowser || devMode || animationState !== 'ready') return;
        
        // Start animation sequence
        setAnimationState('animating');
        
        // Create a main timeline
        const timeline = gsap.timeline({
            paused: true,
            smoothChildTiming: true,
            onComplete: () => {
                // Clear the timeline reference when complete
                elementsCache.current.timeline = null;
            }
        });
        
        // Store the timeline in the cache for later reference
        elementsCache.current.timeline = timeline;
        
        // 1. Animate logo letters
        const letters = elementsCache.current.letters;
        if (letters && letters.length > 0) {
            // Apply will-change only during animation for better performance
            gsap.set(letters, { willChange: "transform, opacity" });
            
            timeline.to(letters, {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
                stagger: {
                    amount: 0.3,
                    from: "start",
                    ease: "none"
                },
                onComplete: function() {
                    // Clean will-change after animation completes
                    gsap.set(letters, { willChange: "auto" });
                }
            }, 0); // Start at the beginning of the timeline
        }
        
        // 2. Animate intro text (only if it exists)
        if (introTextRef.current) {
            gsap.set(introTextRef.current, { willChange: "transform, opacity" });
            
            timeline.to(introTextRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                onComplete: function() {
                    gsap.set(introTextRef.current, { willChange: "auto" });
                }
            }, "<0.1"); // Start 0.1s after the previous animation begins
        }
        
        // 3. Animate progress numbers (only if they exist)
        const progressNumbers = [
            progressNumberStartRef.current, 
            progressNumberEndRef.current
        ].filter(Boolean); // Filter null/undefined
        
        if (progressNumbers.length > 0) {
            gsap.set(progressNumbers, { willChange: "opacity" });
            
            timeline.to(progressNumbers, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                onComplete: function() {
                    gsap.set(progressNumbers, { willChange: "auto" });
                }
            }, "<0.1"); // Start 0.1s after the previous animation begins
        }
        
        // 4. OPTIMIZED: Animate progress bar using scaleX instead of width for hardware acceleration
        const progressDuration = 0.5; // 0.5 seconds
        if (progressLineRef.current) {
            gsap.set(progressLineRef.current, { willChange: "transform" });
            
            timeline.to(progressLineRef.current, {
                scaleX: 1, // Hardware accelerated transform instead of width
                duration: progressDuration,
                ease: "power2.out",
                onUpdate: function() {
                    // Only update the state when values change significantly (less React re-renders)
                    const newProgress = Math.floor(this.progress() * 100);
                    if (newProgress % 5 === 0 || newProgress === 100) { // Update every 5% or at completion
                        setProgress(newProgress);
                    }
                },
                onComplete: function() {
                    gsap.set(progressLineRef.current, { willChange: "auto" });
                }
            }, "<"); // Start at the same time as the previous animation
        }
        
        // 5. Wait and then initiate exit
        timeline.to({}, {
            duration: 0.3, // Time visible before exit
            onComplete: handleExitAnimation
        }, `>+${progressDuration * 0.7}`); // Start after the previous animation has progressed 70%
        
        // Start the timeline
        timeline.play();
        
    }, [animationState, devMode]);

    // Function to handle the entire exit animation sequence
    const handleExitAnimation = () => {
        // Check that elements exist before animating
        if (!containerRef.current) {
            console.warn("Container reference is null, can't execute exit animation");
            setAnimationState('complete');
            onAnimationComplete();
            return;
        }
        
        // Get all elements that will be animated
        const letters = elementsCache.current.letters;
        const progressNumbers = [
            progressNumberStartRef.current, 
            progressNumberEndRef.current
        ].filter(Boolean);
        
        const animatingElements = [
            introTextRef.current,
            progressLineRef.current,
            bgStrip1Ref.current,
            bgStrip2Ref.current,
            bgStrip3Ref.current,
            ...progressNumbers,
            ...(letters ? Array.from(letters) : [])
        ].filter(Boolean);
        
        // Apply will-change only to animating elements
        gsap.set(animatingElements, { willChange: "transform, opacity" });
        
        // Create a timeline for exit animations with force3D for better performance
        const timeline = gsap.timeline({
            defaults: {
                overwrite: "auto", // Ensure animations don't conflict
                force3D: true // Force 3D transforms for better GPU acceleration
            },
            onComplete: () => {
                // Clean will-change from all animated elements
                gsap.set(animatingElements, { willChange: "auto" });
                
                // Change to complete state and hide container
                if (containerRef.current) {
                    // Ensure everything is hidden and won't be visible again
                    gsap.set(containerRef.current, { 
                        visibility: 'hidden',
                        display: 'none'
                    });
                }
                
                // Set state to complete
                setAnimationState('complete');
                
                // Notify parent component that animation is complete
                onAnimationComplete();
            }
        });
        
        // 1. Animate exit of intro text (only if it exists)
        if (introTextRef.current) {
            timeline.to(introTextRef.current, {
                y: -50,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        }
        
        // 2. Animate exit of progress numbers (only if they exist)
        if (progressNumbers.length > 0) {
            timeline.to(progressNumbers, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            }, "<"); // At the same time as the previous animation
        }
        
        // 3. OPTIMIZED: Animate exit of progress bar using scaleX for hardware acceleration
        if (progressLineRef.current) {
            timeline.to(progressLineRef.current, {
                scaleX: 0,
                transformOrigin: "right center",
                duration: 0.5,
                ease: "power2.in"
            }, "<"); // At the same time as the previous animation
        }
        
        // 4. Animate exit of logo letters (only if they exist)
        const letterHeight = elementsCache.current.letterHeight;
        
        if (letters && letters.length > 0) {
            timeline.to(letters, {
                y: -letterHeight * 1.2,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                stagger: {
                    amount: 0.3,
                    from: "end", 
                    ease: "none"
                }
            }, "<0.1"); // Start 0.1s after the beginning of the previous animations
        }
        
        // 5. Animate exit of background strips (upward movement) - using yPercent for hardware acceleration
        if (bgStrip1Ref.current) {
            timeline.to(bgStrip1Ref.current, {
                yPercent: -100,
                duration: 0.3,
                ease: "power2.inOut"
            }, "-=0.1");
        }
        
        if (bgStrip2Ref.current) {
            timeline.to(bgStrip2Ref.current, {
                yPercent: -100,
                duration: 0.3,
                ease: "power2.inOut" 
            }, "-=0.2");
        }
        
        if (bgStrip3Ref.current) {
            timeline.to(bgStrip3Ref.current, {
                yPercent: -100,
                duration: 0.3,
                ease: "power2.inOut"
            }, "-=0.2");
        }
    };

    // Don't render if animation is complete
    if (animationState === 'complete') return null;

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden"
            style={{ 
                backgroundColor: 'transparent',
                visibility: animationState === 'complete' ? 'hidden' : 'visible'
            }}
        >
            {/* Background strip 1 (left) - Fixed positioning to prevent gaps */}
            <div 
                ref={bgStrip1Ref}
                className="absolute top-0 left-0 h-full" 
                style={{ 
                    backgroundColor: 'var(--entrance-bg-color, #FF5642)',
                    width: 'calc(33.333% + 1px)' // Slightly overlap to prevent gaps
                }}
            />
            
            {/* Background strip 2 (center) - Fixed positioning to prevent gaps */}
            <div 
                ref={bgStrip2Ref}
                className="absolute top-0 h-full" 
                style={{ 
                    backgroundColor: 'var(--entrance-bg-color, #FF5642)',
                    left: 'calc(33.333% - 1px)', // Start slightly overlapping strip 1
                    width: 'calc(33.334% + 2px)' // Overlap both sides to prevent gaps
                }}
            />
            
            {/* Background strip 3 (right) - Fixed positioning to prevent gaps */}
            <div 
                ref={bgStrip3Ref}
                className="absolute top-0 right-0 h-full" 
                style={{ 
                    backgroundColor: 'var(--entrance-bg-color, #FF5642)',
                    width: 'calc(33.333% + 1px)' // Slightly overlap to prevent gaps
                }}
            />

         <div className="relative z-10 p-4 sm:p-8">
                <div className="overflow-hidden text-right sm:text-left">
                    <p 
                        ref={introTextRef} 
                        className="text-dark font-archivo text-sm inline-block"
                        style={{
                            opacity: 0, // Initially invisible
                            transition: 'opacity 0.1s ease-in-out' // Smooth transition
                        }}
                    >
                        [INTRO]
                    </p>
                </div>
            </div>

            {/* Main bottom container */}
            <div className="relative z-10 flex flex-col items-stretch p-4 sm:p-8" style={{ marginTop: 'auto' }}>
                {/* Progress bar */}
                <div className="flex items-center justify-end w-full mb-4 sm:mb-6">
                    <span 
                        ref={progressNumberStartRef}
                        className="text-xs sm:text-sm font-archivo text-dark"
                        style={{ opacity: 0 }}
                    >
                        000
                    </span>

                    {/* Loading bar container - Responsive width */}
                    <div className="relative mx-2 w-32 sm:w-64 h-px">
                        {/* OPTIMIZED: Progress line using scaleX instead of width */}
                        <div
                            ref={progressLineRef}
                            className="absolute h-[1.5px] bg-dark"
                            style={{
                                width: "100%", // Always full width
                                transform: `scaleX(${progress / 100})`, // Visual feedback via React state
                                transformOrigin: "left center"
                            }}
                        ></div>
                    </div>

                    <span 
                        ref={progressNumberEndRef}
                        className="text-xs sm:text-sm text-dark font-archivo w-6 sm:w-8"
                        style={{ opacity: 0 }}
                    >
                        100
                    </span>
                </div>

                {/* Logo container */}
                <div className="flex justify-end w-full">
                    <div className="relative overflow-hidden">
                        {/* SVG Logo with responsive sizing */}
                        <svg
                            ref={svgRef}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 138.4 30.29"
                            className="w-full sm:w-64 md:w-80 lg:w-96 xl:w-[50rem] text-black"
                            style={{ 
                                opacity: 0,
                                transition: 'opacity 0.1s ease-in-out'
                            }}
                        >
                            {/* Letter a1 */}
                            <g className="letter">
                                <path
                                    d="M14.16 4.4h3.37v16.66h-3.37v-2.13c-1.44 1.67-3.35 2.5-5.73 2.5-1.47 0-2.85-.38-4.15-1.13a8.489 8.489 0 0 1-3.12-3.12c-.78-1.32-1.17-2.8-1.17-4.45S.38 9.6 1.16 8.28a8.64 8.64 0 0 1 3.12-3.12c1.3-.75 2.68-1.13 4.15-1.13 2.38 0 4.29.83 5.73 2.5V4.4Zm-2.57 13.08c.82-.48 1.47-1.13 1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78a5.215 5.215 0 0 0-1.93-1.97c-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47 1.13-1.93 1.97-.47.83-.7 1.76-.7 2.78s.23 1.95.7 2.78c.47.83 1.11 1.49 1.93 1.97.82.48 1.73.72 2.73.72s1.91-.24 2.73-.72Z"
                                    fill="currentColor"
                                />
                            </g>

                            {/* Letter n1 */}
                            <g className="letter">
                                <path
                                    d="M32.4 4.98c1.03.63 1.84 1.5 2.42 2.6.58 1.1.87 2.33.87 3.68v9.8h-3.47V11.7c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07 1.23-1.23 1.89-1.23 3.2v9.36h-3.46V4.4h3.37v1.97c.67-.75 1.43-1.33 2.3-1.73.87-.4 1.8-.6 2.8-.6 1.31 0 2.48.32 3.51.95Z"
                                    fill="currentColor"
                                />
                            </g>
                        
                            {/* Letter t */}
                            <g className="letter">
                                <path
                                    d="M38.17 0h3.46v4.4h4.1v3.2h-4.1v7.6c0 .82.23 1.47.7 1.93s1.11.7 1.93.7h1.47v3.23h-2.1c-1.67 0-2.99-.49-3.98-1.47-.99-.98-1.48-2.28-1.48-3.9V0Z"
                                    fill="currentColor"
                                />
                            </g>
                        
                            {/* Letter a2 */}
                            <g className="letter">
                                <path
                                    d="M60.77 4.4h3.37v16.66h-3.37v-2.13c-1.44 1.67-3.35 2.5-5.73 2.5-1.47 0-2.85-.38-4.15-1.13a8.489 8.489 0 0 1-3.12-3.12c-.78-1.32-1.17-2.8-1.17-4.45s.39-3.13 1.17-4.45a8.64 8.64 0 0 1 3.12-3.12c1.3-.75 2.68-1.13 4.15-1.13 2.38 0 4.29.83 5.73 2.5V4.4ZM58.2 17.48c.82-.48 1.47-1.13 1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78a5.215 5.215 0 0 0-1.93-1.97c-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47 1.13-1.93 1.97-.47.83-.7 1.76-.7 2.78s.23 1.95.7 2.78c.47.83 1.11 1.49 1.93 1.97.82.48 1.73.72 2.73.72s1.91-.24 2.73-.72Z"
                                    fill="currentColor"
                                />
                            </g>

                            {/* Letter g */}
                            <g className="letter">
                                <path
                                    d="M84.93 4.4h-4.1v1.82c-.46-.4-.96-.77-1.52-1.07-1.36-.74-2.82-1.12-4.4-1.12s-3.04.37-4.4 1.12a8.562 8.562 0 0 0-3.25 3.1c-.81 1.32-1.22 2.82-1.22 4.48s.41 3.16 1.22 4.48a8.638 8.638 0 0 0 3.25 3.1c1.35.74 2.82 1.12 4.4 1.12s3.04-.37 4.4-1.12a8.634 8.634 0 0 0 3.25-3.1c.81-1.32 1.22-2.82 1.22-4.48s-.41-3.16-1.22-4.48c-.14-.23-.3-.44-.46-.65h2.83V4.4Zm-5.38 11.11a5.248 5.248 0 0 1-4.63 2.69c-.98 0-1.91-.24-2.73-.72a5.075 5.075 0 0 1-1.93-1.97c-.47-.83-.7-1.76-.7-2.78s.23-1.95.7-2.78c.47-.83 1.11-1.49 1.93-1.97.82-.48 1.73-.72 2.73-.72s1.88.24 2.7.72c.82.48 1.47 1.13 1.93 1.97.47.83.7 1.76.7 2.78s-.23 1.95-.7 2.78Z"
                                    fill="currentColor"
                                />
                                {/* Tail of the g */}
                                <path
                                    d="M74.92 26.75v3.53c4.89 0 8.86-3.97 8.86-8.86h-3.53c0 2.94-2.39 5.33-5.33 5.33Z"
                                    fill="currentColor"
                                />
                            </g>
                        
                            {/* Letter o */}
                            <g className="letter">
                                <path
                                    d="M90.22 20.31a8.562 8.562 0 0 1-3.25-3.1c-.81-1.32-1.22-2.82-1.22-4.48s.41-3.16 1.22-4.48a8.638 8.638 0 0 1 3.25-3.1c1.35-.74 2.82-1.12 4.4-1.12s3.04.37 4.4 1.12c1.35.74 2.44 1.78 3.25 3.1s1.22 2.82 1.22 4.48-.41 3.16-1.22 4.48a8.638 8.638 0 0 1-3.25 3.1c-1.36.74-2.82 1.12-4.4 1.12s-3.04-.37-4.4-1.12Zm7.1-2.83c.82-.48 1.47-1.13 1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78a5.248 5.248 0 0 0-4.63-2.69c-.98 0-1.91.24-2.73.72-.82.48-1.47 1.13-1.93 1.97-.47.83-.7 1.76-.7 2.78s.23 1.95.7 2.78c.47.83 1.11 1.49 1.93 1.97.82.48 1.73.72 2.73.72s1.88-.24 2.7-.72Z"
                                    fill="currentColor"
                                />
                            </g>
                        
                            {/* Letter n2 */}
                            <g className="letter">
                                <path
                                    d="M117.27 4.98c1.03.63 1.84 1.5 2.42 2.6.58 1.1.87 2.33.87 3.68v9.8h-3.47V11.7c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07 1.23-1.23 1.89-1.23 3.2v9.36h-3.46V4.4h3.37v1.97c.67-.75 1.43-1.33 2.3-1.73.87-.4 1.8-.6 2.8-.6 1.31 0 2.48.32 3.51.95Z"
                                    fill="currentColor"
                                />
                            </g>
                        
                            {/* Letter k */}
                            <g className="letter">
                                <path
                                    d="M123.04 0h3.46v2.58h-3.46z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M123.14 4.4h3.47v16.66h-3.47z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M131.38 12.25l6.16-7.85h-3.93l-6.11 8.01 6.78 8.65h4.12l-7.02-8.81z"
                                    fill="currentColor"
                                />
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
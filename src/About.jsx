import { X } from 'lucide-react';

export default function About({ isOpen, onClose, theme, colorScheme, isLightMode }) {
    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8`}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

            {/* Modal Content */}
            <div
                className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border ${theme.border} backdrop-blur-2xl p-8 md:p-12`}
                style={{
                    backgroundColor: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 p-2 rounded-full ${theme.navHover} transition-all duration-300`}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Content Grid */}
                <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12">

                    {/* Left: Portrait */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2" style={{ borderColor: colorScheme.compString }}>
                            <img
                                src="/vinz-portrait.png"
                                alt="Vinz Tan"
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0 opacity-20 mix-blend-overlay"
                                style={{
                                    background: `linear-gradient(135deg, ${colorScheme.compString}, transparent)`
                                }}
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="font-kumbh font-bold text-2xl uppercase tracking-wide" style={{ color: colorScheme.base }}>
                                Vinz Tan
                            </h2>
                            <p className={`text-sm uppercase tracking-widest mt-1 ${theme.subText}`}>
                                AIGC Strategist
                            </p>
                        </div>
                    </div>

                    {/* Right: Bio */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className={`text-sm uppercase tracking-[0.2em] mb-4 ${theme.subText}`}>
                                About
                            </h3>
                            <div className={`space-y-4 leading-relaxed ${theme.text}`}>
                                <p>
                                    I'm a Malaysian creative technologist specializing in AI-Generated Content (AIGC) strategy and implementation. My work sits at the intersection of design, technology, and emerging AI systems.
                                </p>
                                <p>
                                    With a background in digital innovation and strategic consulting, I help organizations understand and leverage generative AI to transform their creative workflows. From concept to execution, I bridge the gap between cutting-edge AI capabilities and real-world business applications.
                                </p>
                                <p>
                                    Based in Kuala Lumpur, I work with clients across Southeast Asia and globally, focusing on ethical AI implementation, creative automation, and future-forward design systems.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-sm uppercase tracking-[0.2em] mb-4 ${theme.subText}`}>
                                Expertise
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    'Generative AI Strategy',
                                    'Creative Automation',
                                    'Design Systems',
                                    'AI Ethics & Governance',
                                    'Prompt Engineering',
                                    'Workflow Optimization',
                                    'Digital Innovation',
                                    'Strategic Consulting'
                                ].map((skill, i) => (
                                    <div
                                        key={i}
                                        className={`px-3 py-2 rounded-lg border ${theme.border} text-xs uppercase tracking-wider transition-all duration-300 hover:border-current`}
                                        style={{
                                            borderColor: theme.border,
                                            color: theme.text
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = colorScheme.compString;
                                            e.currentTarget.style.color = colorScheme.compString;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.color = '';
                                        }}
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-sm uppercase tracking-[0.2em] mb-4 ${theme.subText}`}>
                                Philosophy
                            </h3>
                            <blockquote className={`border-l-2 pl-4 italic ${theme.text}`} style={{ borderColor: colorScheme.compString }}>
                                "AI didn't kill design—it's part of the future design. By understanding both the creative process and the technology, we can build tools that amplify human creativity rather than replace it."
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
